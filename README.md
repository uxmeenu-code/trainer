# MAANG Designer Coach

AI training system that prepares product designers for MAANG-level roles in 6 months.

## Features

- **Resume & portfolio analysis** — AI scores you against the real MAANG bar
- **Evidence-based skill graph** — 5 dimensions, scored from your actual work
- **Daily 60-min design tasks** — adaptive, calibrated to your weakest skills
- **MAANG-bar evaluations** — scored like a real Google/Meta/Amazon interviewer
- **6-month training calendar** — courses, weekly tasks, milestones
- **Submit any work** — upload PDFs, paste case studies, get scored
- **Coach chat** — ask anything, get mock interview practice
- **Downloadable HTML report** — full profile, scores, and roadmap

---

## Quick Start

### Prerequisites

- Node.js 18+
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/maang-designer-coach.git
cd maang-designer-coach

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# Edit .env and set VITE_ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deploy

### Build for production

```bash
npm run build
# Output is in the /dist folder — deploy to any static host
```

### GitHub Pages

```bash
# In vite.config.js, set base to your repo name:
# base: '/maang-designer-coach/'

npm run build
# Then push /dist to the gh-pages branch
```

### Netlify / Vercel

1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_ANTHROPIC_API_KEY = sk-ant-...`

---

## Project Structure

```
src/
├── main.jsx          — Entry point
├── App.jsx           — Root router
├── index.css         — Global styles and CSS variables
├── constants.js      — Skill maps, roles, AI system prompt
├── api.js            — All Anthropic API calls
├── storage.js        — localStorage helpers
├── pdf.js            — PDF text extraction (PDF.js)
├── report.js         — HTML report generator
├── components/
│   ├── ui.jsx        — Card, Badge, Btn, Input, SkillBar, FileDropZone
│   └── Nav.jsx       — Top navigation bar
└── pages/
    ├── Onboarding.jsx — 4-step onboarding with resume/portfolio upload
    ├── Dashboard.jsx  — Home screen with stats and skill graph
    ├── Task.jsx       — Daily 60-min design task + evaluation
    ├── Submit.jsx     — Upload/paste work for evaluation
    ├── Calendar.jsx   — 6-month training calendar
    ├── History.jsx    — Past evaluation results
    ├── Profile.jsx    — Full skill profile + download report
    └── Chat.jsx       — AI coach chat
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Yes (or set in UI) | Your Anthropic API key |

If `VITE_ANTHROPIC_API_KEY` is not set, users are prompted to enter their key on the welcome screen. The key is saved to `localStorage`.

---

## API Cost

Uses `claude-haiku-4-5` for cost efficiency.

| Action | Approx. cost |
|---|---|
| Profile analysis | ~$0.02 |
| 6-month plan generation | ~$0.01 |
| Daily task generation | ~$0.005 |
| Task evaluation | ~$0.01 |
| Chat message | ~$0.002 |

**Typical session:** ~$0.05–0.10 total for full onboarding + 1 task.

---

## License

MIT
