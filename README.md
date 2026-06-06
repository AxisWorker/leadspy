# LeadSpy 🔍

**Local Business Lead Intelligence — powered by real SerpApi Google Maps data.**

Find businesses without websites, score them as leads, generate AI-powered website pitches.

---

## Features

- 🗺️ **Real Google Maps data** via SerpApi — zero fake results
- 🔴🟢 **Website detection** — instantly see who has/lacks a site
- 📊 **Lead scoring** (0–100) based on reviews, rating, and web presence
- ✨ **AI Prompt Generator** — ready-to-use prompts for Lovable, Bolt, Claude, Cursor, V0
- ⬇️ **Export** — JSON and CSV
- 🌍 15 countries supported
- 📱 Fully responsive

## Setup

1. Clone this repo
2. Open `index.html` in your browser (no build step needed)
3. Click **Config** and paste your [SerpApi key](https://serpapi.com) (100 free searches/month, no credit card)
4. Search for any business category in any city

## Project Structure

```
leadspy/
├── index.html          # App shell & HTML
├── css/
│   └── style.css       # All styles
├── js/
│   ├── app.js          # Main controller, search, navigation
│   ├── api.js          # SerpApi + Pollinations AI calls
│   ├── config.js       # API key management (localStorage)
│   ├── score.js        # Lead scoring algorithm
│   ├── render.js       # DOM rendering, cards, pagination
│   ├── modals.js       # Detail + Prompt modals
│   └── export.js       # JSON / CSV export
└── README.md
```

## Lead Score Formula

| Factor | Points |
|--------|--------|
| No website | +40 |
| 200+ reviews | +20 |
| Rating ≥ 4.5★ | +20 |
| 100+ reviews | +15 |
| Rating ≥ 4.0★ | +15 |
| Popularity bonus | +10 |
| Has website | capped at 45 |

**Score ≥ 70** = 🔥 High priority lead  
**Score 40–69** = ⚡ Good opportunity  
**Score < 40** = Low priority

## AI Prompt Generator

Uses [Pollinations.ai](https://pollinations.ai) — completely free, no API key needed.  
Falls back to local template generation if the AI is unavailable.

Generated prompts are ready to paste into:
- [Lovable](https://lovable.dev)
- [Bolt](https://bolt.new)
- [Claude](https://claude.ai)
- [Cursor](https://cursor.so)
- [Replit](https://replit.com)
- [V0](https://v0.dev)

## License

MIT
