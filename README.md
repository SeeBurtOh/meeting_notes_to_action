# Meeting Notes to Action Items

Turn rough meeting notes into a clean summary, action items, risks, and decisions.

This is a small AI workflow project built for a professional portfolio. The goal is to show a practical business use case, a polished interface, and a clear example of structured LLM output without requiring a large or complicated codebase.

## Project overview

This app takes unstructured meeting notes and turns them into:

- A concise summary
- A list of action items
- A list of risks or blockers
- A list of decisions made during the meeting

It supports two modes:

- `Demo AI`: local rule-based parsing so the app works immediately
- `Live AI`: OpenAI-powered structured output using the Responses API

## Why this project is useful

- It solves a real problem that businesses understand immediately
- It demonstrates prompt design and structured outputs
- It shows how AI can turn messy input into organized workflow artifacts
- It is simple enough to run locally, review quickly, and discuss in interviews

## Concepts this project explores

- LLM-powered workflow automation
- Structured output generation with JSON schema
- Converting messy text into usable business deliverables
- Clear fallback behavior when an API key is not present
- Separating frontend display logic from backend AI orchestration

## Tech stack

- Node.js
- Vanilla HTML, CSS, and JavaScript
- OpenAI Responses API
- Local `.env` configuration

## Project structure

```text
meeting-notes-to-action-items/
  data/
    sample-notes.txt
  public/
    app.js
    index.html
    styles.css
  .env.example
  .gitignore
  package.json
  README.md
  server.js
```

## How to run the project

### 1. Open the project folder

```bash
cd "/Users/cburto/projects/My Website/meeting-notes-to-action-items"
```

### 2. Start the server

```bash
node server.js
```

### 3. Open the app in your browser

Visit:

[http://127.0.0.1:3000](http://127.0.0.1:3000)

### 4. Try the app

- Click `Load Sample` to insert example meeting notes
- Click `Analyze Notes` to generate results
- Or paste your own notes into the text area

## Demo mode vs Live AI mode

### Demo mode

If no OpenAI API key is configured, the app still works using a built-in demo parser.

This is useful because:

- the project is runnable right away
- reviewers can test the UX without extra setup
- the app still demonstrates the intended workflow

In demo mode, the badge in the output panel shows `Demo AI`.

### Live AI mode

If an OpenAI API key is configured, the app sends the notes to the OpenAI Responses API and requests structured output using a JSON schema.

In live mode, the badge in the output panel shows `Live AI`.

## How to enable live OpenAI output

### 1. Create a local `.env` file

In the project folder, run:

```bash
cp .env.example .env
```

### 2. Add your OpenAI API key

Open `.env` and update it to look like this:

```bash
OPENAI_API_KEY=your_real_api_key_here
OPENAI_MODEL=gpt-5.4-mini
PORT=3000
```

Notes:

- Do not leave `your_api_key_here` in place
- Do not add spaces around the `=`
- `.env` is ignored by Git and should not be committed

### 3. Restart the server

If the server is already running:

- Press `Control + C` in Terminal
- Run `node server.js` again

### 4. Analyze notes again

When live mode is working correctly, the app should use OpenAI and show `Live AI` in the mode badge.

## How someone else can use this repo

A visitor can use this repository in two ways:

### Review the code and project structure

This is useful for employers, clients, or collaborators who want to understand:

- the problem being solved
- the interface and user flow
- the backend request logic
- how structured AI output is handled

### Run the project locally

Anyone can clone the repo and run it:

```bash
git clone <repo-url>
cd meeting-notes-to-action-items
node server.js
```

If they want live AI output, they also need their own OpenAI API key in a local `.env` file.

## Key files

- [public/index.html](/Users/cburto/projects/My%20Website/meeting-notes-to-action-items/public/index.html): page structure and app layout
- [public/styles.css](/Users/cburto/projects/My%20Website/meeting-notes-to-action-items/public/styles.css): visual design and responsive layout
- [public/app.js](/Users/cburto/projects/My%20Website/meeting-notes-to-action-items/public/app.js): frontend behavior and result rendering
- [server.js](/Users/cburto/projects/My%20Website/meeting-notes-to-action-items/server.js): static server, demo parser, and OpenAI request logic
- [data/sample-notes.txt](/Users/cburto/projects/My%20Website/meeting-notes-to-action-items/data/sample-notes.txt): example notes for testing

## Troubleshooting

### The app says the API key is incorrect

Check that `.env` contains your real OpenAI key, not the placeholder value from `.env.example`.

### The app is still using demo mode

Make sure:

- `.env` exists
- `OPENAI_API_KEY` is set
- you restarted the server after editing `.env`

### I cannot find `.env`

`.env` is a hidden file. You can create it in Terminal with:

```bash
cp .env.example .env
open -e .env
```

### The server will not stop

Press `Control + C` in the Terminal window where `node server.js` is running.

## Future improvements

- Add export to Markdown or email-ready format
- Add copy-to-clipboard buttons for generated sections
- Add upload support for transcript files
- Add saved history for prior meeting analyses
- Add rate limiting and authentication if the project is later deployed

## Portfolio talking points

If you discuss this project with a client or employer, a few honest talking points are:

- “I built a tool that turns messy meeting notes into structured follow-up outputs.”
- “I used OpenAI’s Responses API with structured JSON output.”
- “I designed the app so it still works in demo mode without requiring API setup.”
- “I focused on a practical business workflow rather than a novelty AI demo.”
