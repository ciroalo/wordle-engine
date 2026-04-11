// ============================================================
// Configuration Types — represent the JSON file structure
// ============================================================

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  greenColor: string;
  yellowColor: string;
  grayColor: string;
}

export interface WordEntry {
  word: string;
  categories: Record<string, string[]>;
  hints: HintTuple;
}

export interface GameConfig {
  title: string;
  theme: ThemeConfig;
  dataset: WordEntry[];
}

// ============================================================
// Normalized Types — derived from config at load time
// ============================================================

export interface NormalizedWord {
  id: string;
  original: string;
  normalized: string;
  letters: string;
  segments: number[];
  totalLetters: number;
  categories: Record<string, string[]>;
  hints: HintTuple;
}

export interface CategoryIndex {
  name: string;
  values: string[];
}

// ============================================================
// Game State Types
// ============================================================

export type LetterFeedback = "correct" | "present" | "absent";

export type KeyState = LetterFeedback | "unknown";

export interface Guess {
  letters: string[];
  feedback: LetterFeedback[];
}

export type RoundStatus = "playing" | "won" | "lost";

export interface RoundState {
  status: RoundStatus;
  targetWord: NormalizedWord;
  guesses: Guess[];
  currentInput: string[];
  revealedHints: Set<number>;
  attemptNumber: number;
}

export interface SessionState {
  playedWordIds: Set<string>;
  activeFilters: Record<string, Set<string>>;
}

export interface AppState {
  config: GameConfig | null;
  normalizedWords: NormalizedWord[];
  categoryIndex: CategoryIndex[];
  session: SessionState;
  round: RoundState | null;
  keyboardState: Record<string, KeyState>;
}

// ============================================================
// Shared Constants
// ============================================================

export const MAX_ATTEMPTS = 6;
export const HINTS_PER_WORD = 5;
export const SEPARATOR_CHAR = "/";

// ============================================================
// Utility Types
// ============================================================

export type HintTuple = [string, string, string, string, string];
