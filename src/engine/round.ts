import {
  type RoundState,
  type NormalizedWord,
  type Guess,
  type LetterFeedback,
  MAX_ATTEMPTS,
} from "./types";
import { evaluateGuess } from "./feedback";

/**
 * Creates a fresh round state for a new word
 */
export function createRound(targetWord: NormalizedWord): RoundState {
  return {
    status: "playing",
    targetWord,
    guesses: [],
    currentInput: [],
    revealedHints: new Set<number>(),
    attemptNumber: 0,
  };
}

/**
 * Adds a letter to the current input buffer
 */
export function addLetter(round: RoundState, letter: string): RoundState {
  if (round.status !== "playing") {
    return round;
  }

  // ignore if not a single uppercase letter
  const normalized = letter.toUpperCase();
  if (!/^[A-Z]$/.test(normalized)) {
    return round;
  }

  // ignore if input is already full
  if (round.currentInput.length >= round.targetWord.totalLetters) {
    return round;
  }

  return {
    ...round,
    currentInput: [...round.currentInput, normalized],
  };
}

/**
 * Removes the last letter from the current input buffer
 */
export function deleteLetter(round: RoundState): RoundState {
  if (round.status !== "playing") {
    return round;
  }

  if (round.currentInput.length === 0) {
    return round;
  }

  return { ...round, currentInput: round.currentInput.slice(0, -1) };
}

/**
 * Submits the current input as a guess and evaluates feedback
 *
 * Returns the updated round state, or the same state fi submission is invalid
 */
export function submitGuess(round: RoundState): RoundState {
  if (round.status !== "playing") {
    return round;
  }

  if (round.currentInput.length !== round.targetWord.totalLetters) {
    return round;
  }

  const guessLetters = round.currentInput;
  const targetLetters = round.targetWord.letters;

  // evaluate feedback
  const feedback: LetterFeedback[] = evaluateGuess(
    targetLetters,
    guessLetters.join(""),
  );

  const guess: Guess = { letters: [...guessLetters], feedback };

  const newGuesses = [...round.guesses, guess];
  const isCorrect = feedback.every((f) => f === "correct");
  const newAttemptNumber = round.attemptNumber + 1;

  // determine new status
  let status: RoundState["status"] = "playing";

  if (isCorrect) {
    status = "won";
  } else if (newAttemptNumber >= MAX_ATTEMPTS) {
    status = "lost";
  }

  return {
    ...round,
    status,
    guesses: newGuesses,
    currentInput: [],
    attemptNumber: newAttemptNumber,
  };
}

/**
 * toggles the visibility of a hint for a specific attempt
 */
export function toggleHint(round: RoundState, hintIndex: number): RoundState {
  // hint must correspond to a submitted guess
  if (hintIndex < 0 || hintIndex >= round.guesses.length) {
    return round;
  }

  if (hintIndex >= 5) {
    return round;
  }

  const guess = round.guesses[hintIndex];
  if (guess.feedback.every((f) => f === "correct")) {
    return round;
  }

  const newRevealedHints = new Set(round.revealedHints);

  if (newRevealedHints.has(hintIndex)) {
    newRevealedHints.delete(hintIndex);
  } else {
    newRevealedHints.add(hintIndex);
  }

  return {
    ...round,
    revealedHints: newRevealedHints,
  };
}
