import type { Guess, KeyState } from "./types";

/**
 * Priority ranking for keyboard states
 * Higher number = higher priority = wins when merging
 */
const STATE_PRIORITY: Record<KeyState, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  unknown: 0,
};

/**
 * Computes the keyboard state for all letters A-Z based on submitted guesses
 *
 * @param guesses - all guesses submitted so far in the current round
 * @returns a record mapping each letter (A-Z) to its keyboard state
 */
export function computeKeyboardState(
  guesses: Guess[],
): Record<string, KeyState> {
  const state: Record<string, KeyState> = {};

  // Initialize all letters as unknown
  for (let code = 65; code <= 90; code++) {
    state[String.fromCharCode(code)] = "unknown";
  }

  // scan all guesses and promote each letter to its highest priority state
  for (const guess of guesses) {
    for (let i = 0; i < guess.letters.length; i++) {
      const letter = guess.letters[i];
      const feedback = guess.feedback[i];
      const currentState = state[letter];

      if (currentState === undefined) {
        continue;
      }

      if (STATE_PRIORITY[feedback] > STATE_PRIORITY[currentState]) {
        state[letter] = feedback;
      }
    }
  }

  return state;
}
