import { createContext, useContext, useReducer, type ReactNode } from "react";
import type {
  AppState,
  GameConfig,
  NormalizedWord,
  SessionState,
  KeyState,
  RoundState,
} from "@engine/types";
import { normalizeDataset } from "@engine/normalization";
import { deriveCategories } from "@engine/categories";
import { getAvailableWords } from "@engine/filtering";
import { selectRandomWord } from "@engine/word-selection";
import { computeKeyboardState } from "@engine/keyboard-state";
import {
  createRound,
  addLetter,
  deleteLetter,
  submitGuess,
  toggleHint,
} from "@engine/round";

// ============================================================
// Actions
// ============================================================

export type GameAction =
  | { type: "CONFIG_LOADED"; config: GameConfig }
  | { type: "SET_FILTER"; category: string; value: string; selected: boolean }
  | { type: "CLEAR_FILTER"; category: string }
  | { type: "NEXT_WORD" }
  | { type: "INPUT_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "SUBMIT_GUESS" }
  | { type: "TOGGLE_HINT"; hintIndex: number }
  | { type: "RESET_SESSION" };

// ============================================================
// Initial State
// ============================================================

function createInitialSession(): SessionState {
  return {
    playedWordIds: new Set<string>(),
    activeFilters: {},
  };
}

function createInitialKeyboardState(): Record<string, KeyState> {
  const state: Record<string, KeyState> = {};
  for (let code = 65; code <= 95; code++) {
    state[String.fromCharCode(code)] = "unknown";
  }
  return state;
}

const initialState: AppState = {
  config: null,
  normalizedWords: [],
  categoryIndex: [],
  session: createInitialSession(),
  round: null,
  keyboardState: createInitialKeyboardState(),
};

// ============================================================
// Helper: start a new round from current state
// ============================================================

function startNewRound(
  normalizedWords: NormalizedWord[],
  session: SessionState,
): { round: RoundState | null; session: SessionState } {
  const available = getAvailableWords(
    normalizedWords,
    session.activeFilters,
    session.playedWordIds,
  );

  const selected = selectRandomWord(available);

  if (!selected) {
    return { round: null, session };
  }

  const newPlayedIds = new Set(session.playedWordIds);
  newPlayedIds.add(selected.id);

  return {
    round: createRound(selected),
    session: { ...session, playedWordIds: newPlayedIds },
  };
}

// ============================================================
// Reducer
// ============================================================

function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case "CONFIG_LOADED": {
      const normalizedWords = normalizeDataset(action.config.dataset);
      const categoryIndex = deriveCategories(normalizedWords);

      // initialize filters with empty sets for each category
      const activeFilters: Record<string, Set<string>> = {};
      for (const cat of categoryIndex) {
        activeFilters[cat.name] = new Set<string>();
      }

      const session: SessionState = {
        playedWordIds: new Set<string>(),
        activeFilters,
      };

      // auto pick on first round
      const { round, session: updatedSession } = startNewRound(
        normalizedWords,
        session,
      );

      return {
        ...state,
        config: action.config,
        normalizedWords,
        categoryIndex,
        session: updatedSession,
        round,
        keyboardState: createInitialKeyboardState(),
      };
    }

    case "SET_FILTER": {
      const currentFilters = state.session.activeFilters;
      const categorySet = new Set(currentFilters[action.category] ?? []);

      if (action.selected) {
        categorySet.add(action.value);
      } else {
        categorySet.delete(action.value);
      }

      return {
        ...state,
        session: {
          ...state.session,
          activeFilters: {
            ...currentFilters,
            [action.category]: categorySet,
          },
        },
      };
    }

    case "CLEAR_FILTER": {
      return {
        ...state,
        session: {
          ...state.session,
          activeFilters: {
            ...state.session.activeFilters,
            [action.category]: new Set<string>(),
          },
        },
      };
    }

    case "NEXT_WORD": {
      const { round, session } = startNewRound(
        state.normalizedWords,
        state.session,
      );

      return {
        ...state,
        session,
        round,
        keyboardState: createInitialKeyboardState(),
      };
    }

    case "INPUT_LETTER": {
      if (!state.round) return state;

      const newRound = addLetter(state.round, action.letter);
      if (newRound === state.round) return state;

      return { ...state, round: newRound };
    }

    case "DELETE_LETTER": {
      if (!state.round) return state;

      const newRound = deleteLetter(state.round);
      if (newRound === state.round) return state;

      return { ...state, round: newRound };
    }

    case "SUBMIT_GUESS": {
      if (!state.round) return state;

      const newRound = submitGuess(state.round);
      if (newRound === state.round) return state;

      return {
        ...state,
        round: newRound,
        keyboardState: computeKeyboardState(newRound.guesses),
      };
    }

    case "TOGGLE_HINT": {
      if (!state.round) return state;

      const newRound = toggleHint(state.round, action.hintIndex);
      if (newRound === state.round) return state;

      return { ...state, round: newRound };
    }

    case "RESET_SESSION": {
      // clears played words but preserve active filters and config
      // immediately starts a fresh round
      const freshSession: SessionState = {
        playedWordIds: new Set<string>(),
        activeFilters: state.session.activeFilters,
      };

      const { round, session } = startNewRound(
        state.normalizedWords,
        freshSession,
      );

      return {
        ...state,
        session,
        round,
        keyboardState: createInitialKeyboardState(),
      };
    }

    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================

interface GameContextValue {
  state: AppState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// ============================================================
// Provider Component
// ============================================================

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// ============================================================
// Custom Hook for consuming the context
// ============================================================

export function useGame(): GameContextValue {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}
