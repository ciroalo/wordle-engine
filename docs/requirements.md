# Requirements: Wordle Game Engine

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 7, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

This document compiles all the functionality of the project `wordle-engine`.

## 1. Funtional Requirements

### FR-1 Layout and Screen Structure

| ID | Requirement |
|---|-----|
| FR-1.1 | The application consists of a single screen with two main areas: a **left panel** (category filters + control) and a **main area** (game grid, hints, on-screen keyboard). |
| FR-1.2 | The left panel remains visible and interactive at all times, including during an active round |
| FR-1.3 | The left panel contains: category filter sections (one per category), and a "Next Word" button at the bottom |
| FR-1.4 | The main area contains: the game grid (top), hint indicators per row (adjacent to each used row), and the on-screen keyboard (bottom) |
| FR-1.5 | The layout must be responsive and usable on desktop and mobile browsers. |
| FR-1.6 | On mobile, the left panel may collapse into a toggleable drawer or overlay to preserve screen space |

### FR-2: Configuration and Dataset Loading

| ID | Requirement |
|---|-----|
| FR-2.1 | The engine loads a single JSON configuration file at startup |
| FR-2.2 | The configuration file contains: site title, color scheme and the dataset (array of word entries) |
| FR-2.3 | Each word entry in the dataset contains: word/name string, a categories object (key-value paris where values are arrays of strings), and an array of exactly 5 hint strings |
| FR-2.4 | The engine derives all category and their possible values by scanning the dataset at load time. It makes no assumptions about which categories exist or what values they contain |
| FR-2.5 | All word strings are normalized at load time: converted to uppercase, special characters stripped or transliterated to ASCII equivalents (e.g., é → E, ñ → N, ü → U). |
| FR-2.6 | The engine applies the site title and color scheme from the configuration to the UI at startup |

### FR-3 Category Filtering

| ID | Requirement |
|---|-----|
| FR-3.1 | The left panel displays one filter section per category discovered in the dataset |
| FR-3.2 | Each filter sections shows the category name and its possible values as selectable options (checkboxes, chips or similar multi-select UI) |
| FR-3.3 | The player can select zero, one or multiple values within any category |
| FR-3.4 | Multiple selections within the same category act as OR logic: a word matches if it has any of the selected values for that category |
| FR-3.5 | Selections across different categories act as AND logic: a word must match the filter in every category that has active selections |
| FR-3.6 | A word entry matches a category filter if any of the word's values for that category overlap with any of the selected values |
| FR-3.7 | If no values are selected in a given category, that category imposes no filter (all words pass) |
| FR-3.8 | If no values are selected in any category, the full dataset is available |
| FR-3.9 | The player can change the filter selections at any time, including during an active round |
| FR-3.10 | The engine must indicate how many words match the current filter selection (e.g. "12 words available") |
| FR-3.11 | If the current filter selection matches zero words (accounting for already played words in the session), the "Next Word button is disabled and a message is shown (e.g. "No words available for this selection") |

### FR-4: Word Selection and Session Tracking

| ID | Requirement |
|---|-----|
| FR-4.1 | When the player clicks "Next Word", the engine selects a random word from the set that matches the current filters and has not been played in the current session |
| FR-4.2 | The engine tracks all words played during the current browser session. No word may appear twice in the same session |
| FR-4.3 |  A session starts when the page loads and ends when the page is closed or refreshed |
| FR-4.4 | If all matching words for the current filters have been played, the "Next Word" button is disabled and a message is shown |
| FR-4.5 | Clicking "Next Word" during an active round abandons the current round and starts a new one immediately. No confirmation dialog is required |

### FR-5: Game Grid

| ID | Requirement |
|---|-----|
| FR-5.1 | The grid displays 6 rows (one per attempt) |
| FR-5.2 | The number of columns matches the number of characters in the target word, including one column per letter and one visual separator column per space in the original word |
| FR-5.3 | Separator columns are pre-revealed and visually distinct (e.g. displayed as `/`). They are not interactive - the player does not type into them |
| FR-5.4 | The grid structure reveals the word shape to the player: how many segments, and how many letters per segment |
| FR-5.5 | All letters are displayed in uppercase |
| FR-5.6 | Empty cells display as blank placeholder slots |
| FR-5.7 | The current active row accepts input. All other rows are read-only |
| FR-5.8 | The grid adapts its cell sizing to accomodate variable word lengths while remaining readable. For very long words, cell may shrink proportionally |

### FR-6: Guess Input

| ID | Requirement |
|---|-----|
| FR-6.1 | The player can input letters by typing on their physical keyboard or by tapping the on-screen keyboard |
| FR-6.2 | Input is restricted to alphabetic characters (A-Z). Numbers, symbols and other characters are ignored |
| FR-6.3 | The player's typed letters fill the active row left to right, automatically skipping over separator columns |
| FR-6.4 | Backspace removes the last entered character |
| FR-6.5 | Enter submits the current guess, but only if the player has filled all letter cells in the active row |
| FR-6.6 | If the player presses Enter with an incomplete row, nothing happens (or a subtle visual indicator shows the row is incomplete) |
| FR-6.7 | All input is case-insensitive. Lowercase input is normalized to uppercase internally and in display |

### FR-7: Guess Feedback

| ID | Requirement |
|---|-----|
| FR-7.1 | After a guess is submitted, each letter cell in that row receives one of three states: **Green** (correct letter, correct position), **Yellow** (correct letter, wrong position) or **Gray** (letter not in the target word) |
| FR-7.2 | The feedback logic treats the full word as a single string (excluding separator characters). Position evalutaion works across the entire word, not per segment |
| FR-7.3 | For duplicate letters, standartd Wordle rules apply: green matches are assigned first, then yellow matches are assigned left-to-right for remaining unmatched occurences in the target word. Excess duplicates are gray |
| FR-7.4 | Feedback is displayed with color and/or iconography. Colors must be distinguisable for colorbind players |
| FR-7.5 | After feedback is revealed, the row becomes read-only |

### FR-8: Hints

| ID | Requirement |
|---|-----|
| FR-8.1 | Each word in the dataset has exactly 5 hints, ordered 1 through 5 |
| FR-8.2 | After each failed guess, a `?` button appears adjacent to that row |
| FR-8.3 | The `?` button for row N reveals hint N (row 1 -> hint 1, row 2 -> hint 2, etc) |
| FR-8.4 | The `?` button is enabled only after the guess on that row has been confirmed wrong |
| FR-8.5 | Clicking an enabled `?` button toggles the hint visibility: first click shows the hint, second click hides it, and so on |
| FR-8.6 | Hints are displayed as text near or overlaying the corresponding row |
| FR-8.7 | Multiple hints can be toggled open simultaneously |
| FR-8.8 | If the guess is correct, no `?` button appears on that row |
| FR-8.9 | The 6th row (final attempt) does not have a `?` button since there are only 5 hints. If the 6th guess is wrong, the game ends in loss |

### FR-9: On-Screen Keyboard

| ID | Requirement |
|---|-----|
| FR-9.1 | The on-screen keyboard displays keys A-Z, Backspace, and Enter |
| FR-9.2 | Tapping a letter key inserts that letter into the active row at the next available position |
| FR-9.3 | Tapping Backspace removes the last entered letter from the active row |
| FR-9.4 | Tapping Enter submits the current guess (same behavior as a physical enter) |
| FR-9.5 | Each letter reflects the best known  state of that letter across all guesses in the current round: **Green** if confirmed in teh correct position of any guess, **Yellow** if confirmed in the word but now yet placed correctly (and not overridden by green), **Gray if confirmed absent |
| FR-9.6 | A letter's keyboard state updates immediately after each guess's feedback is revealed |
| FR-9.7 | Green takes priority over yellow, Yellow takes priority over gray, Unguessed letters have no color state |

### FR-10: Round Lifecycle

| ID | Requirement |
|---|-----|
| FR-10.1 | A round starts when the player clicks "Next Word" |
| FR-10.2 | During a round, the player submites guesses one at a time |
| FR-10.3 | A round ends when (a) the player guesses correctly (win), (b) the player exhausts all 6 attempts (loss), or (c) the player clicks "Next Word" to abandon the round |
| FR-10.4 | On win: a success message is displayed. The grid remains visible with all the feedback |
| FR-10.5 | On loss: the correct answer is revealed prominently. The grid remains visible with all feedback |
| FR-10.6 | On abandon: the round ends silently and a new round begins inmediately |
| FR-10.7 | After win or loss, the player starts a new round by clicking "Next Word" |
| FR-10.8 | At the start of each round, the grid is cleared, keyboard states are reset, and all hints are hidden |

### FR-11: Theming and Branding

| ID | Requirement |
|---|-----|
| FR-11.1 | The JSON configuration includes a site title string. The engine displays it as the page title |
| FR-11.2 | The JSON configuration includes a color scheme (primary color, accent color, the colors for all the UI it has) |
| FR-11.3 | The layout, component structure, and behavior are identical across all themed deployments. Only title, colors and data differ |

## 2. Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement |
|---|-----|
| NFR-1.1 | The application must load and become interactive within 3 seconds on a standard broadband connection |
| NFR-1.2 | All games interactions (key press, guess submission, feedback rendering) must feel instant (<100 ms perceived delay) |
| NFR-1.3 | The application must handle datasets of up to 2,000 word entries without noticeable performance degradation |
| NFR-1.4 | The total production bundle size (all assets excluding the dataset JSON) should be as small as possible, targeting under 100KB gzipped |
| NFR-1.5 | The engine must minimize runtime dependencies. Every third-party library must be justified against the cost of increased bundle size |

### NFR-2: Compatibility

| ID | Requirement |
|---|-----|
| NFR-2.1 | The application must work on the latest version of Chrome, Firefox, Safari and Edge |
| NFR-2.2 | The application must be usable on mobile browsers (iOS Safari, Android Chrome) with touch input |
| NFR-2.3 | No server-side runtime is required. The application runs entirely in the browser from static files |

### NFR-3: Maintainability

| ID | Requirement |
|---|-----|
| NFR-3.1 | The engine code must be cleanly separated from game configuration data |
| NFR-3.2 | Adding a new themed game requires only creating a new JSON configuration file and deploying it with the engine - no code changes |
| NFR-3.3 | The codebase must follow consistent standards and be structured for readibility |

### NFR-4: Deployability

| ID | Requirement |
|---|-----|
| NFR-4.1 | The application must be deployable as static files to any static hosting provider (Github Pages, Netlify, Vercel, etc) |
| NFR-4.2 | The build output must be a self-contained bundle with no external runtime dependencies |
| NFR-4.3 | The engine must favor native browser APIs and minimal or zero external libraries to keep the footprint as light as possible |

### NFR-5: Accessibility (Baseline)

| ID | Requirement |
|---|-----|
| NFR-5.1 | All interactive elements must be keyboard-navigable |
| NFR-5.2 | Text muyst be readable at default zoom levels |

### NFR-6: Data Integrity

| ID | Requirement |
|---|-----|
| NFR-6.1 | The engine must validate the JSON configuration at laod time and display a clear error if the structure is invalid (missing fields, wrong types, fewer than 5 hints, etc) |
| NFR-6.2 | If the dataset is empty, the engine muyst display a user-friendly message instead of crashing |

## 3. Assumptions

| ID | Requirement |
|---|-----|
| A-1 | The JSON dataset will be authored manually or by a separate tool - the engine does not provide a dataset editor |
| A-2 | All words in the dataset use only ASCII alphabetic characters after normalization |
| A-3 | Datasets will contain at most ~2000 entries for V1 |
| A-4 | The player has a moder browser with Javascript enabled |
| A-5 | Session tracking (played words) uses in-memory state only - no localStorage or persistence across page refreshes |

## 4. Constraints

| ID | Requirement |
|---|-----|
| C-1 | Fully client-side - no backend, no database, no API |
| C-2 | No authentication or user management |
| C-3 | No third-party analytics or tracking in V1 |
| C-4 | Configuration is a static JSON file - no dynamic content management |

## 5. Traceability to Product Concept
 
| Requirement Area | Product Concept Section |
|---|---|
| FR-1 (Layout) | Section 2 (Player Experience) |
| FR-2 (Config) | Section 3 (Engine vs. Configuration) |
| FR-3 (Filtering) | Section 2.1 (Category Selection) |
| FR-4 (Word Selection) | Section 2.2, 2.6 |
| FR-5 (Grid) | Section 2.2 (The Grid) |
| FR-6 (Input) | Section 2.3 (Guessing) |
| FR-7 (Feedback) | Section 2.3 (Guessing) |
| FR-8 (Hints) | Section 2.4 (Hints) |
| FR-9 (Keyboard) | Section 2.5 (On-Screen Keyboard) |
| FR-10 (Round) | Section 2.6 (End of Round) |
| FR-11 (Theming) | Section 3.2 (Game Configuration) |