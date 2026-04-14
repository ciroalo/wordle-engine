import { describe, it, expect } from "vitest";
import { evaluateGuess } from "../../src/engine/feedback";

describe("evaluateGuess", () => {
  // basic cases

  it("all correct (exact match)", () => {
    expect(evaluateGuess("HELLO", "HELLO")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("all absent (no matching letters)", () => {
    expect(evaluateGuess("ABCDE", "FGHIJ")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("all absent (no matching letters)", () => {
    expect(evaluateGuess("ABCDE", "BAECD")).toEqual([
      "present",
      "present",
      "present",
      "present",
      "present",
    ]);
  });

  it("mix of correct, present, and absent", () => {
    // Target: HEART, Guess: HASTE
    // H → correct (pos 0)
    // A → present (A is in target pos 2, not pos 1)
    // S → absent
    // T → present (T is in target pos 4, not pos 3)
    // E → present (E is in target pos 1, not pos 4)
    expect(evaluateGuess("HEART", "HASTE")).toEqual([
      "correct",
      "present",
      "absent",
      "present",
      "present",
    ]);
  });

  // --- Duplicate letter handling

  it("single letter in target, guessed twice — green wins", () => {
    // Target: ABCDE, Guess: AACDE
    // A at pos 0 → correct (green)
    // A at pos 1 → absent (only one A in target, already consumed by green)
    expect(evaluateGuess("ABCDE", "AACDE")).toEqual([
      "correct",
      "absent",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("single letter in target, guessed twice — yellow then gray", () => {
    // Target: ABCDE, Guess: XAAAA
    // X → absent
    // A at pos 1 → present (A exists in target at pos 0)
    // A at pos 2 → absent (A already consumed)
    // A at pos 3 → absent
    // A at pos 4 → absent
    expect(evaluateGuess("ABCDE", "XAAAA")).toEqual([
      "absent",
      "present",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("two of same letter in target, guessed three times", () => {
    // Target: AABCD, Guess: AAAXX
    // A pos 0 → correct (matches target pos 0)
    // A pos 1 → correct (matches target pos 1)
    // A pos 2 → absent (no more A's in target)
    // X pos 3 → absent
    // X pos 4 → absent
    expect(evaluateGuess("AABCD", "AAAXX")).toEqual([
      "correct",
      "correct",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("duplicate in guess — green takes priority over earlier yellow", () => {
    // Target: XYZAX, Guess: AXXXA
    // A pos 0 → present (A in target at pos 3)
    // X pos 1 → absent? Let's trace:
    //   Pass 1: pos 0 A≠X, pos 1 X≠Y, pos 2 X≠Z, pos 3 X≠A, pos 4 A≠X → no greens
    //   remaining: [X, Y, Z, A, X]
    //   Pass 2: pos 0 A → found at index 3 → present, remaining: [X, Y, Z, null, X]
    //   pos 1 X → found at index 0 → present, remaining: [null, Y, Z, null, X]
    //   pos 2 X → found at index 4 → present, remaining: [null, Y, Z, null, null]
    //   pos 3 X → not found → absent
    //   pos 4 A → not found → absent
    expect(evaluateGuess("XYZAX", "AXXXA")).toEqual([
      "present",
      "present",
      "present",
      "absent",
      "absent",
    ]);
  });

  it("green steals a letter that would otherwise be yellow", () => {
    // Target: ROBOT, Guess: DONOR
    // Pass 1: pos 0 D≠R, pos 1 O=O → green, pos 2 N≠B, pos 3 O=O → green, pos 4 R≠T
    //   remaining: [R, null, B, null, T]
    // Pass 2: pos 0 D → not in remaining → absent
    //   pos 2 N → not in remaining → absent
    //   pos 4 R → found at index 0 → present
    expect(evaluateGuess("ROBOT", "DONOR")).toEqual([
      "absent",
      "correct",
      "absent",
      "correct",
      "present",
    ]);
  });

  // --- Variable length words (engine supports non-5-letter words) ---

  it("works with 3-letter word", () => {
    expect(evaluateGuess("CAT", "CAR")).toEqual([
      "correct",
      "correct",
      "absent",
    ]);
  });

  it("works with long word (12 letters)", () => {
    // THIERRYHENRY vs THIERRYHENRY — exact match
    expect(evaluateGuess("THIERRYHENRY", "THIERRYHENRY")).toEqual(
      new Array(12).fill("correct"),
    );
  });

  it("works with long word — partial match", () => {
    // Target: THIERRYHENRY (12 letters)
    // Guess:  HENRYTHIERRY (12 letters) — anagram-ish
    // Pass 1: no exact position matches
    // Pass 2: all letters present (it's a rearrangement)
    const guess = new Array(12).fill("present");
    guess[11] = "correct";
    guess[10] = "correct";
    guess[8] = "correct";
    expect(evaluateGuess("THIERRYHENRY", "HENRYTHIERRY")).toEqual(guess);
  });

  // --- Edge case: single letter word ---

  it("works with single letter — correct", () => {
    expect(evaluateGuess("A", "A")).toEqual(["correct"]);
  });

  it("works with single letter — absent", () => {
    expect(evaluateGuess("A", "B")).toEqual(["absent"]);
  });
});
