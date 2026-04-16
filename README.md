# Wordle Engine

![banner](docs/imgs/wordle_engine_github_banner.svg)

A reusable, client-side game engine for themed Wordle-style guessing games. Build a football Wordle, a celebrity Wordle, a historical figures Wordle — swap the JSON, keep the engine.

## What Makes This Different

This is not a Wordle clone. It is a **game engine** designed to power many themed guessing games from a single codebase. The engine is fully generic — it discovers categories, values, and word shapes from the dataset at load time. Variable-length words, compound names, and custom attribute systems are all handled automatically.

The engine logic is written as pure TypeScript with zero framework dependencies. React is used only as a thin rendering layer on top.

## Features

- **Variable-length words and compound names** — "Thierry Henry", "Jean-Pierre Papin", or single-word entries all work.
- **Category-based filtering** — OR logic within a category, AND logic across categories. Categories are derived automatically from the dataset.
- **Progressive hint system** — Five pre-authored hints per word, revealed one per failed attempt.
- **Full Wordle feedback logic** — Including correct duplicate-letter handling (greens first, yellows left-to-right).
- **Themed deployments** — Site title and color scheme defined per deployment via a single JSON config file.
- **Zero backend** — Fully client-side, deploys to any static host.

## Tech Stack

- **Language:** TypeScript
- **UI:** React 18
- **Build:** Vite
- **Styling:** CSS Modules + CSS custom properties for theming
- **State:** React Context + useReducer (no external state library)
- **Testing:** Vitest + React Testing Library

## Architecture

The codebase separates game logic from rendering:

```
src/
├── engine/     Pure TypeScript — all game mechanics, zero React
│   ├── validation.ts       JSON config validation
│   ├── normalization.ts    Word normalization (uppercasing, accent transliteration)
│   ├── categories.ts       Auto-derivation of filter categories
│   ├── filtering.ts        OR/AND filter logic
│   ├── feedback.ts         Green/yellow/gray evaluation with duplicate handling
│   ├── word-selection.ts   Random word selection with session exclusion
│   ├── keyboard-state.ts   On-screen keyboard color aggregation
│   └── round.ts            Round state machine
└── ui/         React components — rendering layer only
    ├── components/         Grid, Keyboard, FilterPanel, StatusMessage
    ├── context/            GameContext (reducer + provider)
    └── hooks/              Physical keyboard event handling
```

Architecture Decision Records live in [`docs/adr/`](./docs/adr/).

## Running Locally

Requires Node 18 or later.

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Running Tests

```bash
npm run test         # Run all tests once
npm run test:watch   # Run in watch mode during development
```

## Building for Production

```bash
npm run build
```

The build output goes to `dist/` and can be deployed to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).

## Configuring a Themed Deployment

The engine loads a single JSON config from `public/data/config.json` at startup. To create a new themed game, replace this file with your own dataset:

```json
{
  "title": "Your Themed Wordle",
  "theme": {
    "primaryColor": "#1a1a2e",
    "accentColor": "#e94560",
    "greenColor": "#538d4e",
    "yellowColor": "#b59f3b",
    "grayColor": "#3a3a3c"
  },
  "dataset": [
    {
      "word": "Thierry Henry",
      "categories": {
        "position": ["Striker"],
        "league": ["Premier League", "La Liga"]
      },
      "hints": [
        "Born in 1977",
        "Born in Les Ulis, France",
        "All-time top scorer for the French national team",
        "Won the Premier League unbeaten",
        "World Cup winner in 1998"
      ]
    }
  ]
}
```

Each entry requires a `word`, a `categories` object (any keys you like), and exactly 5 hints.

## Documentation

- [Product Concept](./docs/product-concept.md)
- [Requirements](./docs/requirements.md)
- [Architecture Overview](./docs/architecture-overview.md)
- [Architecture Decision Records](./docs/adr/)

## License

MIT