const notesInput = document.querySelector("#notes-input");
const analyzeButton = document.querySelector("#analyze-button");
const loadSampleButton = document.querySelector("#load-sample");
const statusText = document.querySelector("#status-text");
const modeBadge = document.querySelector("#mode-badge");
const summaryOutput = document.querySelector("#summary-output");
const actionsOutput = document.querySelector("#actions-output");
const risksOutput = document.querySelector("#risks-output");
const decisionsOutput = document.querySelector("#decisions-output");

function renderList(container, items, formatter) {
  container.innerHTML = "";

  items.forEach((item) => {
    const block = document.createElement("div");
    block.className = "list-item";
    block.innerHTML = formatter(item);
    container.appendChild(block);
  });
}

function setLoadingState(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? "Analyzing..." : "Analyze Notes";
  statusText.textContent = isLoading
    ? "Processing notes and creating structured output..."
    : "Demo mode works immediately. Add an OpenAI API key to enable live AI output.";
}

async function analyzeNotes() {
  const notes = notesInput.value.trim();
  if (!notes) {
    statusText.textContent = "Paste some notes first so the app has something to analyze.";
    return;
  }

  setLoadingState(true);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze notes.");
    }

    modeBadge.textContent = data.mode === "openai" ? "Live AI" : "Demo AI";
    summaryOutput.textContent = data.summary;

    renderList(actionsOutput, data.actionItems, (item) => {
      return `
        <strong>${item.task}</strong>
        <div class="result-meta">Owner: ${item.owner}</div>
        <div class="result-meta">Deadline: ${item.deadline}</div>
      `;
    });

    renderList(risksOutput, data.risks, (item) => `<strong>${item}</strong>`);
    renderList(decisionsOutput, data.decisions, (item) => `<strong>${item}</strong>`);

    statusText.textContent =
      data.mode === "openai"
        ? "Live AI analysis complete."
        : "Demo analysis complete. Add OPENAI_API_KEY to switch to live AI output.";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    setLoadingState(false);
  }
}

async function loadSampleNotes() {
  const response = await fetch("/api/sample-notes");
  const data = await response.json();
  notesInput.value = data.notes;
  statusText.textContent = "Sample notes loaded. You can analyze them as-is or edit them first.";
}

analyzeButton.addEventListener("click", analyzeNotes);
loadSampleButton.addEventListener("click", loadSampleNotes);
