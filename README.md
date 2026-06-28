# System Design Quiz

A single-player study game: deterministic multiple-choice questions on **system design**,
**architecture archetypes**, and **MCP (Model Context Protocol)**, with an authored
explanation for every choice. No backend, no AI at runtime — content is data, progress lives
in `localStorage`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run validate # check all question JSON against the schema
npm run build    # validate, then produce a production build in dist/
npm run preview  # serve the production build locally
```

## Deploy (GitHub Pages)

CI is configured in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): every push to
`main` validates the content, builds, and publishes `dist/` to GitHub Pages. The Vite `base` is
`./` (relative paths), so it works under `https://<user>.github.io/<repo>/` without hardcoding the
repo name.

One-time setup:

1. Create a GitHub repo and push this project to its `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The push triggers the workflow; the live URL appears in the Actions run (and in Settings → Pages).

## How it works

- **Pick domains** → a session is a **shuffled deck** of the eligible questions; you go through
  each exactly once (no repeats) and end on a session summary. Answer a question, get immediate
  explained feedback, advance to the next.
- Technical terms are auto-highlighted with **glossary tooltips**; some questions include a
  **Mermaid diagram** (lazy-loaded).
- **Progress** (answered / correct / accuracy) is saved per-device in `localStorage` under a
  versioned object (`sdq:progress`), and survives reloads.
- **Installable PWA:** a web app manifest + service worker make it installable and fully
  **offline** after the first load (content is static). Test it via `npm run preview` (the
  service worker only runs on a production build).

## Adding questions (content-as-data)

Questions live in `src/content/<domain>.json` — one object per question. Add or edit an entry
and it shows up; no component changes needed. Every choice must have an explanation and the
`answer` must match a choice id. `npm run validate` (also run automatically before `build`)
enforces this.

```json
{
  "id": "sd-caching-001",
  "domain": "system-design",
  "topic": "caching",
  "difficulty": "easy",
  "question": "…",
  "choices": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "answer": "b",
  "explanations": { "a": "why it's a trap…", "b": "why it's right…" }
}
```

Valid domains: `system-design`, `architecture-archetypes`, `mcp`.

## Layout

```
src/
  content/      question JSON per domain + loader
  lib/          validate · storage (localStorage) · selection (random)
  components/   DomainSelect · QuestionCard · Scoreboard
  App.jsx       screen state + wiring
scripts/
  validate-content.mjs   build-time content guard
```

## Not in this MVP

AI roleplay feedback (Increment 2 — needs the Anthropic API + a serverless proxy), accounts /
sync, an authoring UI, a fixed-length quiz mode, progression-aware selection, difficulty
filtering, and deployment to GitHub Pages (planned as the final step).
