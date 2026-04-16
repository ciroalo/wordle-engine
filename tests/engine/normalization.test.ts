import { describe, it, expect } from "vitest";
import {
  normalizeString,
  extractLetters,
  extractSegments,
  normalizeWordEntry,
  normalizeDataset,
} from "../../src/engine/normalization";
import type { WordEntry } from "../../src/engine/types";

// ============================================================
// Helper
// ============================================================

function makeEntry(word: string): WordEntry {
  return {
    word,
    categories: { position: ["Striker"] },
    hints: ["Hint 1", "Hint 2", "Hint 3", "Hint 4", "Hint 5"],
  };
}

// ============================================================
// normalizeString
// ============================================================

describe("normalizeString", () => {
  it("converts to uppercase", () => {
    expect(normalizeString("hello")).toBe("HELLO");
  });

  it("preserves spaces", () => {
    expect(normalizeString("Thierry Henry")).toBe("THIERRY HENRY");
  });

  it("replaces hyphens with spaces", () => {
    expect(normalizeString("Jean-Pierre Papin")).toBe("JEAN PIERRE PAPIN");
  });

  it("translieterates accented characters", () => {
    expect(normalizeString("José")).toBe("JOSE");
    expect(normalizeString("Müller")).toBe("MULLER");
    expect(normalizeString("Ibrahimović")).toBe("IBRAHIMOVIC");
  });

  it("transliterates ñ", () => {
    expect(normalizeString("Señor")).toBe("SENOR");
  });

  it("transliterates æ and ø", () => {
    expect(normalizeString("Ærø")).toBe("AERO");
  });

  it("strips non-alpha non-space characters", () => {
    expect(normalizeString("O'Brien")).toBe("OBRIEN");
  });

  it("collapses multiple spaces into one", () => {
    expect(normalizeString("a  -  b")).toBe("A B");
  });

  it("trims leading and trailing spaces", () => {
    expect(normalizeString(" hello ")).toBe("HELLO");
  });

  it("handles ß as SS", () => {
    expect(normalizeString("Straße")).toBe("STRASSE");
  });
});

// ============================================================
// extractLetters
// ============================================================

describe("extractLetters", () => {
  it("removes spaces", () => {
    expect(extractLetters("THIERRY HENRY")).toBe("THIERRYHENRY");
  });

  it("works with single word", () => {
    expect(extractLetters("RONALDO")).toBe("RONALDO");
  });

  it("works with three segments", () => {
    expect(extractLetters("JEAN PIERRE PAPIN")).toBe("JEANPIERREPAPIN");
  });
});

// ============================================================
// extractSegments
// ============================================================

describe("extractSegments", () => {
  it("returns single segment for signle word", () => {
    expect(extractSegments("RONALDO")).toEqual([7]);
  });

  it("returns two segments for two-word name", () => {
    expect(extractSegments("THIERRY HENRY")).toEqual([7, 5]);
  });

  it("returns three segments for three-word name", () => {
    expect(extractSegments("JEAN PIERRE PAPIN")).toEqual([4, 6, 5]);
  });
});

// ============================================================
// normalizeWordEntry
// ============================================================

describe("normalizeWordEntry", () => {
  it("produces a correct NormalizedWord", () => {
    const entry = makeEntry("Thierry Henry");
    const result = normalizeWordEntry(entry, 0);

    expect(result.id).toBe("0");
    expect(result.original).toBe("Thierry Henry");
    expect(result.normalized).toBe("THIERRY HENRY");
    expect(result.letters).toBe("THIERRYHENRY");
    expect(result.segments).toEqual([7, 5]);
    expect(result.totalLetters).toBe(12);
    expect(result.categories).toBe(entry.categories);
    expect(result.hints).toBe(entry.hints);
  });

  it("handles accented compound names", () => {
    const entry = makeEntry("Jean-Pierre Papin");
    const result = normalizeWordEntry(entry, 3);

    expect(result.id).toBe("3");
    expect(result.normalized).toBe("JEAN PIERRE PAPIN");
    expect(result.letters).toBe("JEANPIERREPAPIN");
    expect(result.segments).toEqual([4, 6, 5]);
    expect(result.totalLetters).toBe(15);
  });
});

// ============================================================
// normalizeDataset
// ============================================================

describe("normalizeDataset", () => {
  it("normalizes all entries with correct indices", () => {
    const dataset = [makeEntry("Ronaldo"), makeEntry("Thierry Henry")];
    const result = normalizeDataset(dataset);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("0");
    expect(result[0].normalized).toBe("RONALDO");
    expect(result[1].id).toBe("1");
    expect(result[1].normalized).toBe("THIERRY HENRY");
  });

  it("returns empty array for empty dataset", () => {
    expect(normalizeDataset([])).toEqual([]);
  });
});
