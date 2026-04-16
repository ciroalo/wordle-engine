import { describe, it, expect } from "vitest";
import { computeKeyboardState } from "../../src/engine/keyboard-state";
import type { Guess } from "../../src/engine/types";

// ============================================================
// Helper
// ============================================================

function makeGuess(letters: string, feedback: string): Guess {
  // Shorthand: 'c' = correct, 'p' = present, 'a' = absent
  const feedbackMap: Record<string, "correct" | "present" | "absent"> = {
    c: "correct",
    p: "present",
    a: "absent",
  };

  return {
    letters: letters.split(""),
    feedback: feedback.split("").map((f) => feedbackMap[f]),
  };
}

// ============================================================
// Tests
// ============================================================

describe("computeKeyboardState", () => {
  it("returns all unknown when no guesses", () => {
    const state = computeKeyboardState([]);

    expect(state["A"]).toBe("unknown");
    expect(state["Z"]).toBe("unknown");

    // Verify all 26 letters are present
    expect(Object.keys(state)).toHaveLength(26);
  });

  it("marks letters from a single guess", () => {
    // Guess: HEART, feedback: correct, absent, present, absent, correct
    const guesses = [makeGuess("HEART", "capac")];
    const state = computeKeyboardState(guesses);

    expect(state["H"]).toBe("correct");
    expect(state["E"]).toBe("absent");
    expect(state["A"]).toBe("present");
    expect(state["R"]).toBe("absent");
    expect(state["T"]).toBe("correct");
    // Unguessed letter
    expect(state["X"]).toBe("unknown");
  });

  it("green overrides yellow from a previous guess", () => {
    const guesses = [
      makeGuess("ABCDE", "apaaa"), // B is present (yellow)
      makeGuess("XBXXX", "acaaa"), // B is correct (green) — should override
    ];
    const state = computeKeyboardState(guesses);

    expect(state["B"]).toBe("correct");
  });

  it("yellow overrides gray from a previous guess", () => {
    const guesses = [
      makeGuess("ABCDE", "aaaaa"), // all absent, including A
      makeGuess("AXYYY", "paaaa"), // A is present — should override absent
    ];
    const state = computeKeyboardState(guesses);

    expect(state["A"]).toBe("present");
  });

  it("green is never downgraded by later gray", () => {
    const guesses = [
      makeGuess("ABCDE", "caaaa"), // A is correct (green)
      makeGuess("AXXXX", "aaaaa"), // A is absent — should NOT override green
    ];
    const state = computeKeyboardState(guesses);

    expect(state["A"]).toBe("correct");
  });

  it("yellow is never downgraded by later gray", () => {
    const guesses = [
      makeGuess("ABCDE", "paaaa"), // A is present (yellow)
      makeGuess("AXXXX", "aaaaa"), // A is absent — should NOT override yellow
    ];
    const state = computeKeyboardState(guesses);

    expect(state["A"]).toBe("present");
  });

  it("handles multiple guesses accumulating state", () => {
    const guesses = [
      makeGuess("HEART", "aapaa"), // A present, others absent
      makeGuess("BLAST", "aacac"), // A correct, S absent, T correct
      makeGuess("PIANO", "aaaca"), // N correct
    ];
    const state = computeKeyboardState(guesses);

    expect(state["A"]).toBe("correct"); // promoted from present to correct
    expect(state["H"]).toBe("absent");
    expect(state["T"]).toBe("correct");
    expect(state["N"]).toBe("correct");
    expect(state["B"]).toBe("absent");
    expect(state["L"]).toBe("absent");
    expect(state["X"]).toBe("unknown"); // never guessed
  });

  it("handles same letter appearing multiple times in one guess", () => {
    // Guess: AABBA, feedback: correct, absent, present, absent, absent
    // A appears at pos 0 (correct), pos 1 (absent), pos 4 (absent)
    // Highest priority for A = correct
    // B appears at pos 2 (present), pos 3 (absent)
    // Highest priority for B = present
    const guesses = [makeGuess("AABBA", "capaa")];
    const state = computeKeyboardState(guesses);

    expect(state["A"]).toBe("correct");
    expect(state["B"]).toBe("present");
  });
});
