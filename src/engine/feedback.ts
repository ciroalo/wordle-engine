import type { LetterFeedback } from "./types";

/**
 * Evaluates a guess against the target word and returns per-letter feedback
 *
 * Both inputs must be uppercase letter-only strings of equal length
 * (Separators are excluded before calling this function)
 *
 * @param target - the answer's letters (e.g. 'THIERRYHENRY')
 * @param guess - the players guess letters
 * @returns Array of LetterFeedback, same length as inputs
 */
export function evaluateGuess(target: string, guess: string): LetterFeedback[] {
  const length = target.length;
  const feedback: LetterFeedback[] = new Array(length).fill("absent");

  // track which target letters are still available for matching
  // we use an array (not the string) so we can consume individual ocurrences
  const targetRemaining: (string | null)[] = target.split("");

  // pass 1: mark greens
  for (let i = 0; i < length; i++) {
    if (guess[i] === targetRemaining[i]) {
      feedback[i] = "correct";
      targetRemaining[i] = null; // consumed - not available
    }
  }

  // pass 2: mark yellow and gray
  for (let i = 0; i < length; i++) {
    // skip positions already marked as green
    if (feedback[i] === "correct") {
      continue;
    }

    // look for this letter in the remaining (unconsumed) target letters
    const matchIndex = targetRemaining.indexOf(guess[i]);
    if (matchIndex !== -1) {
      feedback[i] = "present";
      targetRemaining[matchIndex] = null;
    }
  }

  return feedback;
}
