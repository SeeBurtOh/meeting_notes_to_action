import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const samplePath = path.join(__dirname, "data", "sample-notes.txt");
const envPath = path.join(__dirname, ".env");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function loadEnvFile() {
  if (!existsSync(envPath)) {
    return;
  }

  const file = readFileSync(envPath, "utf8");
  const lines = file.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function parseStructuredResult(data) {
  if (data.output_parsed && typeof data.output_parsed === "object") {
    return data.output_parsed;
  }

  const outputs = Array.isArray(data.output) ? data.output : [];

  for (const item of outputs) {
    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content.type === "refusal" && content.refusal) {
        throw new Error(`OpenAI refused the request: ${content.refusal}`);
      }

      if (content.parsed && typeof content.parsed === "object") {
        return content.parsed;
      }

      if (content.json && typeof content.json === "object") {
        return content.json;
      }

      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) {
        return JSON.parse(content.text);
      }
    }
  }

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return JSON.parse(data.output_text);
  }

  const contentTypes = outputs.flatMap((item) =>
    Array.isArray(item.content) ? item.content.map((content) => content.type || "unknown") : ["no-content"]
  );

  throw new Error(
    `OpenAI returned no parseable structured content. Content types seen: ${contentTypes.join(", ") || "none"}.`
  );
}

async function serveStatic(requestPath, response) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

function extractNames(text) {
  const matches = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g) || [];
  const filtered = matches.filter(
    (value) =>
      ![
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
        "Q2",
      ].includes(value)
  );
  return [...new Set(filtered)];
}

function inferDeadline(line) {
  const patterns = [
    /\bby\s+([A-Za-z]+\s+\d{1,2})\b/i,
    /\bby\s+(Friday|Monday|Tuesday|Wednesday|Thursday)\b/i,
    /\bnext\s+(week|month)\b/i,
    /\bthis\s+(week|month)\b/i,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return "No explicit deadline captured";
}

function inferOwner(line, names) {
  const explicit = names.find((name) => line.includes(name) && name !== "We");
  if (explicit) {
    return explicit;
  }

  if (/\bwe\b/i.test(line)) {
    return "Team";
  }

  return "Owner not specified";
}

export function buildDemoAnalysis(notes) {
  const lines = notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const joined = lines.join(" ");
  const names = extractNames(notes);
  const actionHints = ["will", "needs to", "follow up", "send", "update", "review", "share", "draft", "confirm"];
  const riskHints = ["blocked", "delay", "risk", "issue", "concern", "waiting", "budget", "unclear"];

  const actionItems = lines
    .filter((line) => actionHints.some((hint) => line.toLowerCase().includes(hint)))
    .slice(0, 5)
    .map((line) => ({
      task: line.replace(/^[-*]\s*/, ""),
      owner: inferOwner(line, names),
      deadline: inferDeadline(line),
    }));

  const risks = lines
    .filter((line) => riskHints.some((hint) => line.toLowerCase().includes(hint)))
    .slice(0, 4);

  const decisions = lines
    .filter((line) => /^\s*(?:[-*]\s*)?(decision:|we agreed|agreed|decided)\b/i.test(line))
    .slice(0, 3);

  return {
    mode: "demo",
    summary:
      joined.length > 260
        ? `${joined.slice(0, 257)}...`
        : joined || "No meeting notes provided.",
    actionItems:
      actionItems.length > 0
        ? actionItems
        : [
            {
              task: "Review notes and identify concrete next steps",
              owner: names[0] || "Owner not specified",
              deadline: "No explicit deadline captured",
            },
          ],
    risks:
      risks.length > 0 ? risks : ["No obvious risks were detected in demo mode."],
    decisions:
      decisions.length > 0
        ? decisions
        : ["No explicit decisions were detected in demo mode."],
  };
}

export async function analyzeWithOpenAI(notes) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildDemoAnalysis(notes);
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

  const result = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "developer",
          content:
            "Extract structured meeting outputs. If information is missing, use 'Not specified'.",
        },
        {
          role: "user",
          content: `Analyze these meeting notes and return structured JSON.\n\n${notes}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "meeting_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              mode: {
                type: "string",
                const: "openai",
              },
              summary: {
                type: "string",
              },
              actionItems: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    task: { type: "string" },
                    owner: { type: "string" },
                    deadline: { type: "string" },
                  },
                  required: ["task", "owner", "deadline"],
                },
              },
              risks: {
                type: "array",
                items: { type: "string" },
              },
              decisions: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["mode", "summary", "actionItems", "risks", "decisions"],
          },
        },
      },
    }),
  });

  if (!result.ok) {
    const errorText = await result.text();
    throw new Error(`OpenAI request failed: ${result.status} ${errorText}`);
  }

  const data = await result.json();
  return parseStructuredResult(data);
}

async function handleAnalyze(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });

  request.on("end", async () => {
    try {
      const parsed = JSON.parse(body || "{}");
      const notes = String(parsed.notes || "").trim();

      if (!notes) {
        sendJson(response, 400, { error: "Meeting notes are required." });
        return;
      }

      const analysis = await analyzeWithOpenAI(notes);
      sendJson(response, 200, analysis);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected server error.";
      sendJson(response, 500, {
        error: message,
      });
    }
  });
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  const url = new URL(request.url, "http://localhost:3000");

  if (request.method === "GET" && url.pathname === "/api/sample-notes") {
    const sample = await readFile(samplePath, "utf8");
    sendJson(response, 200, { notes: sample });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/analyze") {
    await handleAnalyze(request, response);
    return;
  }

  if (request.method === "GET") {
    await serveStatic(url.pathname, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

if (process.argv[1] === __filename) {
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || "127.0.0.1";

  server.listen(port, host, () => {
    console.log(`Meeting Notes app running at http://${host}:${port}`);
  });
}
