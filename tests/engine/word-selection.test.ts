import { describe, it, expect } from "vitest";
import { selectRandomWord } from "../../src/engine/word-selection";
import type { NormalizedWord } from "../../src/engine/types";

// ============================================================
// Helper
// ============================================================

function makeWord(id: string): NormalizedWord {
  return {
    id,
    original: `Word ${id}`,
    normalized: `WORD${id}`,
    letters: `WORD${id}`,
    segments: [4 + id.length],
    totalLetters: 4 + id.length,
    categories: {},
    hints: ["H1", "H2", "H3", "H4", "H5"],
  };
}

// ============================================================
// Tests
// ============================================================

describe("selectRandomWord", () => {
  it("returns null for empty pool", () => {
    expect(selectRandomWord([])).toBeNull();
  });

  it("returns the only word when pool has one item", () => {
    const words = [makeWord("0")];
    const result = selectRandomWord(words);
    expect(result).toBe(words[0]);
  });

  it("selects first word when random returns 0", () => {
    const words = [makeWord("0"), makeWord("1"), makeWord("2")];
    const result = selectRandomWord(words, () => 0);
    expect(result).toBe(words[0]);
  });

  it("selects last word when random returns 0.999", () => {
    const words = [makeWord("0"), makeWord("1"), makeWord("2")];
    const result = selectRandomWord(words, () => 0.999);
    expect(result).toBe(words[2]);
  });

  it("selects middle word with appropriate random value", () => {
    const words = [makeWord("0"), makeWord("1"), makeWord("2")];
    // Math.floor(0.5 * 3) = Math.floor(1.5) = 1
    const result = selectRandomWord(words, () => 0.5);
    expect(result).toBe(words[1]);
  });

  it("never returns null for non-empty pool regardless of random value", () => {
    const words = [makeWord("0"), makeWord("1")];
    const randomValues = [0, 0.1, 0.25, 0.49, 0.5, 0.75, 0.99, 0.999];

    for (const val of randomValues) {
      const result = selectRandomWord(words, () => val);
      expect(result).not.toBeNull();
    }
  });
});
