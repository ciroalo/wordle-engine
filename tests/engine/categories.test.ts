import { describe, it, expect } from "vitest";
import { deriveCategories } from "../../src/engine/categories";
import type { NormalizedWord } from "../../src/engine/types";

// ============================================================
// Helper
// ============================================================

function makeWord(categories: Record<string, string[]>): NormalizedWord {
  return {
    id: "0",
    original: "Test",
    normalized: "TEST",
    letters: "TEST",
    segments: [4],
    totalLetters: 4,
    categories,
    hints: ["H1", "H2", "H3", "H4", "H5"],
  };
}

// ============================================================
// Tests
// ============================================================

describe("deriveCategories", () => {
  it("returns empty array for empty dataset", () => {
    expect(deriveCategories([])).toEqual([]);
  });

  it("derives a single category with its values", () => {
    const words = [makeWord({ position: ["Striker", "Winger"] })];
    const result = deriveCategories(words);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("position");
    expect(result[0].values).toEqual(["Striker", "Winger"]);
  });

  it("derives multiple categories", () => {
    const words = [
      makeWord({
        position: ["Striker"],
        country: ["France"],
      }),
    ];
    const result = deriveCategories(words);

    expect(result).toHaveLength(2);
    // Sorted alphabetically by category name
    expect(result[0].name).toBe("country");
    expect(result[1].name).toBe("position");
  });

  it("collects unique values across multiple words", () => {
    const words = [
      makeWord({ league: ["Premier League", "La Liga"] }),
      makeWord({ league: ["Premier League", "Serie A"] }),
      makeWord({ league: ["Bundesliga"] }),
    ];
    const result = deriveCategories(words);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("league");
    expect(result[0].values).toEqual([
      "Bundesliga",
      "La Liga",
      "Premier League",
      "Serie A",
    ]);
  });

  it("deduplicates values", () => {
    const words = [
      makeWord({ country: ["France"] }),
      makeWord({ country: ["France"] }),
      makeWord({ country: ["France"] }),
    ];
    const result = deriveCategories(words);

    expect(result[0].values).toEqual(["France"]);
  });

  it("handles words with different category sets", () => {
    const words = [
      makeWord({ position: ["Striker"] }),
      makeWord({ league: ["Premier League"] }),
    ];
    const result = deriveCategories(words);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.name)).toEqual(["league", "position"]);
  });

  it("sorts values alphabetically within each category", () => {
    const words = [makeWord({ club: ["Monaco", "Arsenal", "Barcelona"] })];
    const result = deriveCategories(words);

    expect(result[0].values).toEqual(["Arsenal", "Barcelona", "Monaco"]);
  });

  it("sorts categories alphabetically by name", () => {
    const words = [
      makeWord({
        position: ["Striker"],
        country: ["France"],
        league: ["Premier League"],
        era: ["2000s"],
        club: ["Arsenal"],
      }),
    ];
    const result = deriveCategories(words);

    expect(result.map((c) => c.name)).toEqual([
      "club",
      "country",
      "era",
      "league",
      "position",
    ]);
  });
});
