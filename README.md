# MAANG Designer Coach (MDC)

A self-contained AI training system that prepares product designers for MAANG-level roles in 6 months.

## What it does

- **Portfolio & resume analysis** — AI reads your actual work history and scores you honestly against the MAANG bar
- **Evidence-based skill graph** — 5 dimensions: Product Thinking, UX Execution, Systems Thinking, AI Understanding, Communication
- **Daily 60-min design tasks** — adaptive, calibrated to your weakest skills
- **MAANG-bar evaluations** — scored like a real Google/Meta/Amazon interviewer
- **6-month training calendar** — courses, weekly tasks, milestones per month
- **Submit any work** — upload PDFs, paste case studies, get instant feedback
- **Coach chat** — ask design questions, get mock interview practice
- **Downloadable PDF report** — your full profile, scores, and roadmap

## Setup (2 minutes)

### Option 1: Open directly in browser (simplest)

1. Download `index.html`
2. Open it in Chrome or Firefox
3. Enter your Anthropic API key when prompted on the welcome screen

### Option 2: Set API key in code (no prompt every time)

Create a file called `config.js` next to `index.html`:

```js
window.__ANTHROPIC_API_KEY__ = "sk-ant-api03-your-key-here";
```

Then add this line to `index.html` just before the closing `</body>` tag:

```html
<script src="config.js"></script>
```

> ⚠️ Never commit `config.js` to Git — it contains your API key. It's already in `.gitignore`.

### Option 3: Deploy to GitHub Pages

1. Fork this repo
2. Go to Settings → Pages → Source: main branch / root
3. Your app will be live at `https://yourusername.github.io/mdc/`
4. Users enter their own API key on the welcome screen

## Get an API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and add billing
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-`)

Typical cost: ~$0.01–0.05 per analysis session. Each daily task + evaluation costs ~$0.02.

## Tech stack

- **Zero build step** — pure HTML + React via CDN + Babel in-browser transpilation
- **No server** — runs entirely in the browser
- **Storage** — `localStorage` (data stays on your device)
- **AI** — Anthropic Claude API (direct browser calls with CORS header)
- **PDF parsing** — PDF.js via CDN

## File structure

```
mdc/
├── index.html     ← entire app (single file)
├── config.js      ← your API key (create this, don't commit it)
├── .gitignore
└── README.md
```

## Customization

All configuration is at the top of the `<script>` block in `index.html`:

- `API_KEY` — override the key lookup
- `SK` — skill color map
- `SL` — skill label map
- `ROLES` — target role options
- `SYS` — AI system prompt (coaching persona)

## Privacy

- Your resume and portfolio text are sent to the Anthropic API for analysis only
- No data is sent to any other server
- Everything is stored in your browser's `localStorage`
- Anthropic's data handling: [anthropic.com/privacy](https://www.anthropic.com/privacy)

## License

MIT — use freely, modify as needed.
