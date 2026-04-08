# Architecture Overview: Wordle Game Engine

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 6, 2026  
> **Version:**  0.1.0  
> **Status:** Draft

## 1. Tech Stack

| Layer              | Choice                        | Rationale                                                                                      |
|--------------------|-------------------------------|------------------------------------------------------------------------------------------------|
| Language           | TypeScript 5.x               | Type safety for game logic correctness. Strong portfolio signal. Catches bugs at compile time.  |
| UI Framework       | React 18                      | Component model maps naturally to game UI. Largest ecosystem and learning resources.            |
| Build Tool         | Vite 5.x                     | Near-zero config, fast HMR, tiny production bundles. Built-in TS support.                      |
| Styling            | CSS Modules                   | Scoped styles per component, zero runtime cost, no extra dependency.                           |
| State Management   | React Context + useReducer    | Game state is well-bounded. No external library needed.                                        |
| Testing            | Vitest + React Testing Library| Native Vite integration. Pure logic tests + lightweight UI tests.                              |
| Linting/Formatting | ESLint + Prettier             | Industry standard. Enforces consistent code style.                                             |
| Deployment Target  | Static files (GitHub Pages, Netlify, Vercel) | Fully client-side, no server runtime required.                                  |

### Dependencies Policy (NFR-1.5, NFR-4.3)

The project uses zero runtime dependencies beyond Reach and ReactDOM. Eveyr potential addition must be justifed against the 100KB gzipped bundle target. The game logic layer has no dependencies at all - it is pure TypeScript

## 2. Architecture Principles

1. Engine Logic is pure TypeScript - all game mechanics (feedback algorithm, filtering, normalization, word selection, hint management, round state machine) live in plain `.ts` files with zero framework imports. This makes them independently testable, reusable, and framework-agnostic.

2. React is a Rendering Layer - react components consume engine functions and render state. They do not contain game logic. This enforces the clean separation required by NFR-3.1

3. Configuration Drives Everything - the engines makes zero assumptions about categories, themes or word structure. All game specific knowledge comes from the JSON configuration file

4. No external state - all state lives in memory. No localStorage, no cookies, no persistence. Session state resets on page refresh

5. Progressive complexity - the codebase is structured so that the pure logic layer can be build, tested, and verified before any UI work begins

## 3. Domain Model

These are the core types that represent the problem domain. They will become TypeScript interfaces/types

### 3.1 Configuration Types

```
GameConfig
├── title: string                          // Site title (FR-11.1)
├── theme: ThemeConfig                     // Color scheme (FR-11.2)
└── dataset: WordEntry[]                   // All word entries (FR-2.2)
 
ThemeConfig
├── primaryColor: string                   // Main brand color
├── accentColor: string                    // Secondary color
├── greenColor: string                     // Correct letter feedback
├── yellowColor: string                    // Misplaced letter feedback
└── grayColor: string                      // Absent letter feedback
 
WordEntry (raw, as authored in JSON)
├── word: string                           // Original word string, e.g. "Thierry Henry"
├── categories: Record<string, string[]>   // Flexible key-value pairs
└── hints: [string, string, string, string, string]  // Exactly 5 hints (FR-8.1)
```

### 3.2 Normalized Types (derived at load time)

```
NormalizedWord
├── id: string                             // Unique identifier (index or hash)
├── original: string                       // Original word for display on loss (FR-10.5)
├── normalized: string                     // Uppercased, ASCII-transliterated, spaces preserved
├── letters: string                        // Letters only (spaces removed) — used for feedback
├── segments: number[]                     // Length of each segment, e.g. [7, 5] for "THIERRY HENRY"
├── totalLetters: number                   // Total letter count (excluding spaces)
├── categories: Record<string, string[]>   // Passed through from WordEntry
└── hints: [string, string, string, string, string]
 
CategoryIndex
├── name: string                           // e.g. "league", "position"
└── values: string[]                       // All unique values found in dataset for this category
```

### 3.3 Game State Types

```
RoundState
├── status: "playing" | "won" | "lost"     // Current round status
├── targetWord: NormalizedWord             // The word to guess
├── guesses: Guess[]                       // Submitted guesses (0-6)
├── currentInput: string[]                 // Letters typed so far in active row
├── revealedHints: Set<number>             // Which hint indices are currently visible
└── attemptNumber: number                  // 0-5, index of the current active row
 
Guess
├── letters: string[]                      // The letters the player submitted
└── feedback: LetterFeedback[]             // Per-letter feedback result
 
LetterFeedback: "correct" | "present" | "absent"
   // "correct" = green, "present" = yellow, "absent" = gray
 
KeyboardState: Record<string, LetterFeedback | "unknown">
   // Tracks best-known state for each letter A-Z across all guesses
 
SessionState
├── playedWordIds: Set<string>             // Words already played this session (FR-4.2)
└── activeFilters: Record<string, Set<string>>  // Current filter selections per category
 
AppState
├── config: GameConfig                     // Loaded configuration
├── normalizedWords: NormalizedWord[]      // Processed dataset
├── categoryIndex: CategoryIndex[]         // Derived categories
├── session: SessionState                  // Session tracking
├── round: RoundState | null               // Current round (null before first word)
└── keyboardState: KeyboardState           // Derived from current round's guesses
```

### 3.4 Domain Model Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      GameConfig (JSON)                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  title   │  │ ThemeConfig  │  │   WordEntry[]         │ │
│  └──────────┘  └──────────────┘  │  ├── word             │ │
│                                   │  ├── categories       │ │
│                                   │  └── hints[5]         │ │
│                                   └───────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ load + normalize (FR-2.5)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Engine Runtime State                       │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ NormalizedWord[]  │  │CategoryIndex[]│  │ SessionState  │  │
│  │ (processed data)  │  │(auto-derived) │  │ (in-memory)   │  │
│  └────────┬─────────┘  └──────────────┘  └───────────────┘  │
│           │ select random (FR-4.1)                           │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    RoundState                         │    │
│  │  target ← NormalizedWord                              │    │
│  │  guesses[] ← Guess { letters[], feedback[] }          │    │
│  │  currentInput[] ← live typing buffer                  │    │
│  │  revealedHints ← Set<number>                          │    │
│  │  status: playing | won | lost                         │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## 4. Project Structure

```
wordle-engine/
├── public/
│   └── data/
│       └── football.json              # Example game config (proof of concept)
├── src/
│   ├── engine/                        # Pure TypeScript — ZERO React imports
│   │   ├── types.ts                   # All domain types/interfaces
│   │   ├── normalization.ts           # Word normalization (FR-2.5)
│   │   ├── validation.ts              # Config JSON validation (NFR-6.1)
│   │   ├── categories.ts              # Category derivation from dataset (FR-2.4)
│   │   ├── filtering.ts               # OR/AND filter logic (FR-3.4, FR-3.5)
│   │   ├── word-selection.ts          # Random word pick with session exclusion (FR-4.1)
│   │   ├── feedback.ts                # Green/yellow/gray algorithm (FR-7.1–7.3)
│   │   ├── keyboard-state.ts          # Aggregate letter states (FR-9.5–9.7)
│   │   ├── round.ts                   # Round state machine (FR-10)
│   │   └── index.ts                   # Public API barrel export
│   ├── ui/                            # React components
│   │   ├── components/
│   │   │   ├── App/
│   │   │   │   ├── App.tsx
│   │   │   │   └── App.module.css
│   │   │   ├── Grid/
│   │   │   │   ├── Grid.tsx
│   │   │   │   ├── GridRow.tsx
│   │   │   │   ├── GridCell.tsx
│   │   │   │   └── Grid.module.css
│   │   │   ├── Keyboard/
│   │   │   │   ├── Keyboard.tsx
│   │   │   │   ├── Key.tsx
│   │   │   │   └── Keyboard.module.css
│   │   │   ├── FilterPanel/
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   ├── CategoryFilter.tsx
│   │   │   │   └── FilterPanel.module.css
│   │   │   ├── HintButton/
│   │   │   │   ├── HintButton.tsx
│   │   │   │   └── HintButton.module.css
│   │   │   └── StatusMessage/
│   │   │       ├── StatusMessage.tsx
│   │   │       └── StatusMessage.module.css
│   │   ├── context/
│   │   │   └── GameContext.tsx         # React Context + useReducer for app state
│   │   ├── hooks/
│   │   │   ├── useKeyboardInput.ts    # Physical keyboard event handler
│   │   │   └── useGameConfig.ts       # Config loading hook
│   │   └── styles/
│   │       ├── variables.css           # CSS custom properties (theme tokens)
│   │       ├── reset.css               # Minimal CSS reset
│   │       └── global.css              # Base global styles
│   └── main.tsx                        # React entry point
├── tests/
│   ├── engine/                         # Pure logic tests (high coverage target)
│   │   ├── normalization.test.ts
│   │   ├── feedback.test.ts
│   │   ├── filtering.test.ts
│   │   ├── validation.test.ts
│   │   ├── word-selection.test.ts
│   │   ├── keyboard-state.test.ts
│   │   └── round.test.ts
│   └── ui/                             # Component tests (lighter coverage)
│       ├── Grid.test.tsx
│       └── Keyboard.test.tsx
├── index.html                          # Vite entry HTML
├── tsconfig.json
├── vite.config.ts
├── package.json
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

### Key Structural Decisions

- `src/engine` has no React imports. It can be tested, reasoned about, and potentially reused outside of React. This is the core intellectual property of the project.

- `src/ui/` is purely presentational. Components receive data and callbacks, they don't compute game logic

- `tests/` mirros `src/`. Engine tests will be exhaustive (there are pure functions - easy to test). UI tests will be selective

- `public/data/` holds the game configuration JSON. In a multi-theme deployment, you'd have `football.json`, `celebrities.json`, etc

## 5. Component Architecture

### 5.1 Data Flow

```
                    ┌────────────────────┐
                    │   football.json    │  (static file)
                    └─────────┬──────────┘
                              │ fetch at startup
                              ▼
                    ┌────────────────────┐
                    │  validation.ts     │  validates structure
                    │  normalization.ts  │  normalizes words
                    │  categories.ts     │  derives categories
                    └─────────┬──────────┘
                              │ produces
                              ▼
              ┌───────────────────────────────┐
              │        GameContext             │
              │  (React Context + useReducer)  │
              │                               │
              │  state: AppState              │
              │  dispatch: (action) => void   │
              └──────┬──────────────┬─────────┘
                     │              │
          ┌──────────┘              └──────────────┐
          ▼                                        ▼
┌──────────────────┐                    ┌──────────────────┐
│   FilterPanel    │                    │    Main Area     │
│  ├─CategoryFilter│                    │  ├── Grid        │
│  ├─CategoryFilter│                    │  │   ├─ GridRow  │
│  ├─WordCount     │                    │  │   │  ├─ Cell  │
│  └─NextWordBtn   │                    │  │   │  └─ Hint? │
│                  │                    │  │   └─ ...      │
│  dispatches:     │                    │  ├── StatusMsg   │
│  SET_FILTER      │                    │  └── Keyboard    │
│  NEXT_WORD       │                    │      └─ Key      │
└──────────────────┘                    │                  │
                                        │  dispatches:     │
                                        │  INPUT_LETTER    │
                                        │  DELETE_LETTER   │
                                        │  SUBMIT_GUESS    │
                                        │  TOGGLE_HINT     │
                                        └──────────────────┘
```

### 5.2 Action Types (useReducer)

These are the actions the reducer will handle

| Action            | Triggered By         | Description                                           |
|-------------------|----------------------|-------------------------------------------------------|
| CONFIG_LOADED     | Startup              | Config validated and normalized, initializes app state |
| SET_FILTER        | FilterPanel          | Updates active filters for a category                  |
| NEXT_WORD         | NextWord button      | Selects new word, resets round                         |
| INPUT_LETTER      | Keyboard / physical  | Adds letter to current input                           |
| DELETE_LETTER     | Backspace            | Removes last letter from current input                 |
| SUBMIT_GUESS      | Enter                | Evaluates guess, updates round state                   |
| TOGGLE_HINT       | HintButton           | Toggles visibility of a specific hint                  |

### 5.3 Where Logic Lives

| Concern                     | File                    | React Involved? |
|-----------------------------|-------------------------|-----------------|
| Normalize "Thierry Henry"   | `engine/normalization.ts` | No             |
| Validate JSON config        | `engine/validation.ts`    | No             |
| Derive categories from data | `engine/categories.ts`    | No             |
| Filter words by selections  | `engine/filtering.ts`     | No             |
| Pick random unplayed word   | `engine/word-selection.ts`| No             |
| Compute green/yellow/gray   | `engine/feedback.ts`      | No             |
| Track keyboard letter states| `engine/keyboard-state.ts`| No             |
| Round state transitions     | `engine/round.ts`         | No             |
| Render grid cells           | `ui/components/Grid/`     | Yes            |
| Handle key press events     | `ui/hooks/useKeyboardInput`| Yes           |
| Manage global state         | `ui/context/GameContext`  | Yes            |

## 6. Key Algorithms

### 6.1 Word Normalization

```
Input:  "Thierry Henry"
Step 1: Transliterate accented chars → "Thierry Henry"  (no change here)
Step 2: Uppercase → "THIERRY HENRY"
Step 3: Replace hyphens with spaces → "THIERRY HENRY"  (no change here)
Step 4: Extract segments → [7, 5]  (lengths of "THIERRY" and "HENRY")
Step 5: Extract letters only → "THIERRYHENRY"  (12 letters, used for feedback)
Output: NormalizedWord { normalized: "THIERRY HENRY", letters: "THIERRYHENRY", segments: [7, 5] }
 
Input:  "Jean-Pierre Papin"
Step 1: Transliterate → "Jean-Pierre Papin"
Step 2: Uppercase → "JEAN-PIERRE PAPIN"
Step 3: Replace hyphens with spaces → "JEAN PIERRE PAPIN"
Step 4: Extract segments → [4, 6, 5]
Step 5: Extract letters only → "JEANPIERREPAPIN"  (15 letters)
```

### 6.2 Feedback Algorithm

Standard Wordle feedback with proper duplicate handling:

```
Target letters: "THIERRYHENRY"  (as array)
Guess letters:  "HARRYHENRYYY"  (as array)
 
Pass 1 — Mark greens (exact position match):
  Position:  0  1  2  3  4  5  6  7  8  9  10 11
  Target:    T  H  I  E  R  R  Y  H  E  N  R  Y
  Guess:     H  A  R  R  Y  H  E  N  R  Y  Y  Y
  Green?     -  -  -  -  -  -  -  -  -  N  -  Y
  Remaining target: T  H  I  E  R  R  Y  H  E  _  R  _
  Remaining guess:  H  A  R  R  Y  H  E  N  R  _  Y  _
 
Pass 2 — Mark yellows (letter exists in remaining target, left to right):
  Position 0 (H): H in remaining target? Yes → Yellow, consume one H
  Position 1 (A): A in remaining target? No → Gray
  Position 2 (R): R in remaining target? Yes → Yellow, consume one R
  ... and so on
 
Final: [yellow, gray, yellow, yellow, yellow, yellow, yellow, gray, yellow, green, yellow, green]
```

### 6.3 Filter Logic

```
Given filters: { league: ["Premier League", "La Liga"], position: ["Striker"] }
 
For each word:
  1. For "league": does the word have ANY value that is "Premier League" OR "La Liga"?  (OR within category)
  2. For "position": does the word have ANY value that is "Striker"?  (OR within category)
  3. Word passes if BOTH checks are true.  (AND across categories)
  4. Categories with no selections are skipped (all words pass).
```

## 7. Grid Layout Model

The grid must adapt to variable word lengths and multi-word names

```
Target: "THIERRY HENRY" → segments [7, 5]
Grid columns: 7 (letters) + 1 (separator) + 5 (letters) = 13 columns
 
  ┌─┬─┬─┬─┬─┬─┬─┬───┬─┬─┬─┬─┬─┐
  │T│H│I│E│R│R│Y│ / │H│E│N│R│Y│  ← submitted guess with feedback colors
  ├─┼─┼─┼─┼─┼─┼─┼───┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │ │ / │ │ │ │ │ │  ← active input row
  ├─┼─┼─┼─┼─┼─┼─┼───┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │ │ / │ │ │ │ │ │  ← empty future row
  └─┴─┴─┴─┴─┴─┴─┴───┴─┴─┴─┴─┴─┘
 
Separator columns:
- Visually distinct (dimmed, different background, "/" character)
- Not interactive — cursor skips over them
- Pre-revealed from the start
 
For very long words (e.g. 20+ letters), cells shrink proportionally.
Minimum readable cell size to be determined during implementation.
```

## 8. JSON Configuration Schema

```json
{
  "title": "Football Wordle",
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
        "country": ["France"],
        "league": ["Premier League", "La Liga"],
        "club": ["Arsenal", "Barcelona", "Monaco"],
        "era": ["1990s", "2000s"]
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

## 9. Implementation Phases

This is the planned build order. Each phase produces working, testable code before moving to the next 

| Phase | Description                                      | Key Files                                    |
|-------|--------------------------------------------------|----------------------------------------------|
| 1     | Project setup (Vite + TS + React + tooling)      | Config files, empty structure                |
| 2     | Domain types                                     | `engine/types.ts`                            |
| 3     | Config validation                                | `engine/validation.ts` + tests               |
| 4     | Word normalization                               | `engine/normalization.ts` + tests            |
| 5     | Category derivation                              | `engine/categories.ts` + tests               |
| 6     | Filter logic                                     | `engine/filtering.ts` + tests                |
| 7     | Feedback algorithm                               | `engine/feedback.ts` + tests                 |
| 8     | Word selection                                   | `engine/word-selection.ts` + tests           |
| 9     | Keyboard state aggregation                       | `engine/keyboard-state.ts` + tests           |
| 10    | Round state machine                              | `engine/round.ts` + tests                    |
| 11    | React setup + GameContext + config loading        | Context, reducer, data loading               |
| 12    | Grid component                                   | Grid, GridRow, GridCell                      |
| 13    | Keyboard component                               | Keyboard, Key, physical input hook           |
| 14    | Filter panel component                           | FilterPanel, CategoryFilter                  |
| 15    | Hint system component                            | HintButton                                   |
| 16    | Status messages + round lifecycle UI              | StatusMessage, NextWord integration          |
| 17    | Theming + responsive layout                      | CSS variables, mobile layout                 |
| 18    | Integration testing + polish                     | End-to-end checks, edge cases                |
| 19    | Sample dataset + deployment                      | Football dataset, build, deploy              |

## 10. Risk Register (Architecture related)

| Risk                                             | Likelihood | Impact | Mitigation                                                        |
|--------------------------------------------------|------------|--------|-------------------------------------------------------------------|
| Long words break grid layout on mobile           | Medium     | Medium | Implement adaptive cell sizing early. Test with 20+ letter words. |
| Duplicate letter feedback algorithm has edge cases| Medium     | High   | Exhaustive unit tests. Reference known Wordle implementations.    |
| CSS custom property theming is insufficient      | Low        | Low    | Start minimal. Expand token set only when needed.                 |
| TypeScript learning curve slows progress         | Medium     | Medium | Start with simple types. Avoid advanced generics until needed.    |
| React learning curve slows UI phase              | Medium     | High   | Engine logic is complete first. UI is thin rendering layer.       |

## 11. Glossary
 
| Term             | Definition                                                                  |
|------------------|-----------------------------------------------------------------------------|
| Engine           | The reusable game logic and UI code, independent of any specific dataset.   |
| Game / Deployment| A specific themed instance (e.g. "Football Wordle") = engine + JSON config. |
| Word Entry       | A single item in the dataset (could be a name, phrase, or actual word).     |
| Segment          | A contiguous group of letters between separators (e.g. "THIERRY" is one segment). |
| Separator        | A visual divider in the grid representing a space in the original word.     |
| Round            | One complete play: word selected → guesses → win/loss/abandon.              |
| Session          | From page load to page close. Tracks played words in memory.               |
| Feedback         | The green/yellow/gray evaluation of a submitted guess.                      |
| Category         | A grouping dimension discovered from the dataset (e.g. "league", "position"). |
| Filter           | A player's selection of category values to narrow the word pool.            |