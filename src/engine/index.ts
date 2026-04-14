// ============================================================
// Engine Public API
// ============================================================
// This barrel export defines what the UI layer can import.
// Everything the React app needs from the engine comes through here.
// ============================================================

// --- Types ---
export type {
  GameConfig,
  ThemeConfig,
  WordEntry,
  NormalizedWord,
  CategoryIndex,
  LetterFeedback,
  KeyState,
  Guess,
  RoundStatus,
  RoundState,
  SessionState,
  AppState,
  HintTuple,
} from "./types";

// --- Constants ---
export { MAX_ATTEMPTS, HINTS_PER_WORD, SEPARATOR_CHAR } from "./types";

// --- Validation ---
export { validateConfig } from "./validation";
export type { ValidationResult } from "./validation";

// --- Normalization ---
export {
  normalizeString,
  normalizeWordEntry,
  normalizeDataset,
} from "./normalization";

// --- Categories ---
export { deriveCategories } from "./categories";

// --- Filtering ---
export {
  wordMatchesFilters,
  getFilteredWords,
  getAvailableWords,
} from "./filtering";

// --- Feedback ---
export { evaluateGuess } from "./feedback";

// --- Word Selection ---
export { selectRandomWord } from "./word-selection";

// --- Keyboard State ---
export { computeKeyboardState } from "./keyboard-state";

// --- Round ---
export {
  createRound,
  addLetter,
  deleteLetter,
  submitGuess,
  toggleHint,
} from "./round";
