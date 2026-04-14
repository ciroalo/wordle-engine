import { describe, it, expect } from "vitest";
import {
  createRound,
  addLetter,
  deleteLetter,
  submitGuess,
  toggleHint,
} from "../../src/engine/round";
import {
  NormalizedWord,
  RoundState,
  MAX_ATTEMPTS,
} from "../../src/engine/types";

// ============================================================
// Helpers
// ============================================================

function makeTarget(letters: string, segments?: number[]): NormalizedWord {
  const segs = segments ?? [letters.length];
  return {
    id: "0",
    original: letters,
    normalized: letters,
    letters,
    segments: segs,
    totalLetters: letters.length,
    categories: {},
    hints: ["Hint 1", "Hint 2", "Hint 3", "Hint 4", "Hint 5"],
  };
}

function typeWord(round: RoundState, word: string): RoundState {
  let state = round;
  for (const char of word) {
    state = addLetter(state, char);
  }
  return state;
}

function playGuess(round: RoundState, word: string): RoundState {
  return submitGuess(typeWord(round, word));
}

// ============================================================
// createRound
// ============================================================

describe("createRound", () => {
  it("initializes a fresh round", () => {
    const target = makeTarget("HELLO");
    const round = createRound(target);

    expect(round.status).toBe("playing");
    expect(round.targetWord).toBe(target);
    expect(round.guesses).toEqual([]);
    expect(round.currentInput).toEqual([]);
    expect(round.revealedHints.size).toBe(0);
    expect(round.attemptNumber).toBe(0);
  });
});

// ============================================================
// addLetter
// ============================================================

describe("addLetter", () => {
  it("adds a letter to empty input", () => {
    const round = createRound(makeTarget("HELLO"));
    const result = addLetter(round, "H");
    expect(result.currentInput).toEqual(["H"]);
  });

  it("normalizes lowercase to uppercase", () => {
    const round = createRound(makeTarget("HELLO"));
    const result = addLetter(round, "h");
    expect(result.currentInput).toEqual(["H"]);
  });

  it("ignores non-alpha characters", () => {
    const round = createRound(makeTarget("HELLO"));
    let result = addLetter(round, "1");
    expect(result.currentInput).toEqual([]);
    result = addLetter(round, " ");
    expect(result.currentInput).toEqual([]);
    result = addLetter(round, "!");
    expect(result.currentInput).toEqual([]);
  });

  it("stops at the total letter count", () => {
    const round = createRound(makeTarget("CAT"));
    const result = typeWord(round, "CATS");
    expect(result.currentInput).toEqual(["C", "A", "T"]);
  });

  it("does nothing if round is not playing", () => {
    const round = createRound(makeTarget("HELLO"));
    const won = { ...round, status: "won" as const };
    const result = addLetter(won, "A");
    expect(result.currentInput).toEqual([]);
  });
});

// ============================================================
// deleteLetter
// ============================================================

describe("deleteLetter", () => {
  it("deletes the last letter", () => {
    const round = typeWord(createRound(makeTarget("CAT")), "CATS");
    const result = deleteLetter(round);
    expect(result.currentInput).toEqual(["C", "A"]);
  });

  it("does nothing on empty input", () => {
    const round = createRound(makeTarget("HELLO"));
    const result = deleteLetter(round);
    expect(result.currentInput).toEqual([]);
  });

  it("does nothing if round is not playing", () => {
    const round = typeWord(createRound(makeTarget("HELLO")), "HE");
    const lost = { ...round, status: "lost" as const };
    const result = deleteLetter(lost);
    expect(result.currentInput).toEqual(["H", "E"]);
  });
});

// ============================================================
// submitGuess
// ============================================================

describe("submitGuess", () => {
  it("rejects incomplete guess", () => {
    const round = typeWord(createRound(makeTarget("HELLO")), "HEL");
    const result = submitGuess(round);

    expect(result.attemptNumber).toBe(0);
    expect(result.guesses).toHaveLength(0);
    expect(result.currentInput).toEqual(["H", "E", "L"]);
  });

  it("accepts correct guess and wins", () => {
    const round = playGuess(createRound(makeTarget("CAT")), "CAT");

    expect(round.status).toBe("won");
    expect(round.guesses).toHaveLength(1);
    expect(round.guesses[0].feedback).toEqual([
      "correct",
      "correct",
      "correct",
    ]);
    expect(round.currentInput).toEqual([]);
    expect(round.attemptNumber).toBe(1);
  });

  it("accepts wrong guess and continues playing", () => {
    const round = playGuess(createRound(makeTarget("CAT")), "DOG");

    expect(round.status).toBe("playing");
    expect(round.guesses).toHaveLength(1);
    expect(round.attemptNumber).toBe(1);
    expect(round.currentInput).toEqual([]);
  });

  it("loses after 6 wrong guesses", () => {
    let round = createRound(makeTarget("CAT"));

    round = playGuess(round, "DOG");
    expect(round.status).toBe("playing");

    round = playGuess(round, "PIG");
    round = playGuess(round, "HEN");
    round = playGuess(round, "BAT");
    round = playGuess(round, "RAT");

    expect(round.status).toBe("playing");
    expect(round.attemptNumber).toBe(5);

    round = playGuess(round, "FOX");
    expect(round.status).toBe("lost");
    expect(round.attemptNumber).toBe(MAX_ATTEMPTS);
    expect(round.guesses).toHaveLength(6);
  });

  it("wins on the last attempt", () => {
    let round = createRound(makeTarget("CAT"));

    round = playGuess(round, "DOG");
    round = playGuess(round, "PIG");
    round = playGuess(round, "HEN");
    round = playGuess(round, "BAT");
    round = playGuess(round, "RAT");
    round = playGuess(round, "CAT");

    expect(round.status).toBe("won");
    expect(round.guesses).toHaveLength(6);
  });

  it("does nothing if round is already won", () => {
    let round = playGuess(createRound(makeTarget("CAT")), "CAT");
    expect(round.status).toBe("won");

    round = typeWord(round, "DOG"); // should be ignored
    round = submitGuess(round);
    expect(round.guesses).toHaveLength(1); // still just the winning guess
  });

  it("clears current input after submission", () => {
    const round = playGuess(createRound(makeTarget("CAT")), "DOG");
    expect(round.currentInput).toEqual([]);
  });

  it("produces correct feedback for partial match", () => {
    const round = playGuess(createRound(makeTarget("CAT")), "CXA");

    expect(round.guesses[0].feedback).toEqual(["correct", "absent", "present"]);
  });
});

// ============================================================
// toggleHint
// ============================================================

describe("toggleHint", () => {
  function roundWithFailedGuesses(count: number): RoundState {
    let round = createRound(makeTarget("CAT"));
    const wrongGuesses = ["DOG", "PIG", "HEN", "BAT", "RAT"];

    for (let i = 0; i < count; i++) {
      round = playGuess(round, wrongGuesses[i]);
    }

    return round;
  }

  it("reveals a hint for a failed guess", () => {
    const round = roundWithFailedGuesses(1);
    const result = toggleHint(round, 0);

    expect(result.revealedHints.has(0));
  });

  it("toggles hint off on second click", () => {
    const round = roundWithFailedGuesses(1);
    const shown = toggleHint(round, 0);
    const hidden = toggleHint(shown, 0);
    expect(hidden.revealedHints.has(0)).toBe(false);
  });

  it("allows multiple hints open simultaneously", () => {
    const round = roundWithFailedGuesses(3);
    let result = toggleHint(round, 0);
    result = toggleHint(result, 1);
    result = toggleHint(result, 2);
    expect(result.revealedHints.size).toBe(3);
  });

  it("ignores hint for index that has no guess yet", () => {
    const round = roundWithFailedGuesses(1);
    const result = toggleHint(round, 3); // no guess at index 3
    expect(result.revealedHints.size).toBe(0);
  });

  it("ignores hint for a correct guess", () => {
    const round = playGuess(createRound(makeTarget("CAT")), "CAT");
    const result = toggleHint(round, 0);
    expect(result.revealedHints.size).toBe(0);
  });

  it("ignores hint for index 5 (6th row — no hint available)", () => {
    const round = roundWithFailedGuesses(5);
    // Simulate a 6th failed guess
    const finalRound = playGuess(round, "FOX");
    expect(finalRound.status).toBe("lost");

    const result = toggleHint(finalRound, 5);
    expect(result.revealedHints.size).toBe(0);
  });

  it("ignores negative index", () => {
    const round = roundWithFailedGuesses(1);
    const result = toggleHint(round, -1);
    expect(result.revealedHints.size).toBe(0);
  });
});
