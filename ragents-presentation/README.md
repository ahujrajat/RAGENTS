# RAGENTS Web Presentation

An interactive HTML slide deck showcasing the RAGENTS Library — a curated collection of Agents, Prompts, Instructions & Skills for VS Code and GitHub Copilot workflows.

## Slide Index

| # | Title | Type |
|---|-------|------|
| 1 | RAGENTS — Welcome | Title |
| 2 | What is RAGENTS? | Content |
| 3 | Asset Library Overview | Stats Grid |
| 4 | Assets by Role | Content (PM, Dev, Architect, QA, Data, DevOps) |
| 5 | Complete Asset Catalog | Catalog (all 134 assets) |
| 6 | Supported Technologies | Two-Column |
| 7 | How to Use | Process Flow |
| 8 | Custom vs Public Breakdown | Chart (stacked bar) |

## Run Locally

Open `index.html` directly in your browser, or serve it locally:

```bash
cd "ragents-presentation"
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Navigation

- **Arrow Right / Space** — Next slide
- **Arrow Left** — Previous slide
- **On-screen buttons** — Bottom-right ← → controls

## Data Sources

Counts based on the current catalog:

| Category | Custom | Public | Total |
|----------|--------|--------|-------|
| Agents | 22 | 32 | 54 |
| Instructions | 0 | 38 | 38 |
| Prompts | 5 | 21 | 26 |
| Skills | 0 | 16 | 16 |
| **Total** | **27** | **107** | **134** |

## Tech Stack

- **Fonts**: Inter (Google Fonts)
- **Icons**: Font Awesome 6.4
- **Charts**: Chart.js
- **Theme**: Purple & Gold gradient (`#4b0082` / `#d4a017`)

## Accessibility

- High-contrast color scheme (WCAG AA compliant body text)
- Keyboard-first navigation
- Clear focus targets on navigation buttons
- Scrollable slides for overflow content
