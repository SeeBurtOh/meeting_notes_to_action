# Meeting Notes to Action Items

Turn rough meeting notes into a clean summary, action items, decisions, and risks.

This project is designed to be simple enough for a beginner to understand while still showing real AI workflow thinking in a portfolio.

## What it does

- Accepts raw meeting notes
- Generates a concise summary
- Pulls out action items
- Highlights risks or blockers
- Captures decisions made during the meeting

## Why this is a strong portfolio project

- It solves a real business problem
- It demonstrates structured AI output
- It is easy for recruiters, hiring managers, and clients to understand
- It gives you something concrete to talk about in interviews

## Tech stack

- Node.js
- Vanilla HTML, CSS, and JavaScript
- OpenAI Responses API when `OPENAI_API_KEY` is configured
- Demo analysis mode when no API key is present

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

## How to run locally

1. Open a terminal in the project folder.
2. Run `node server.js`
3. Visit `http://localhost:3000`

## How to enable live OpenAI output

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Run the app with the environment variable loaded

Example:

```bash
export OPENAI_API_KEY="your_api_key_here"
node server.js
```

## Beginner Git steps

When you are ready to turn this into your first GitHub repo:

1. Open a terminal in `meeting-notes-to-action-items`
2. Run `git init`
3. Run `git add .`
4. Run `git commit -m "Initial commit"`
5. Create a new empty GitHub repository named `meeting-notes-to-action-items`
6. Run `git remote add origin <your-repo-url>`
7. Run `git branch -M main`
8. Run `git push -u origin main`

## Good future improvements

- Add downloadable meeting summaries
- Add editable action-item owners and deadlines
- Save note history locally
- Add copy-to-clipboard export
- Add file upload for text meeting transcripts
