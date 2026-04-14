import { describe, it, expect } from "vitest";
import {
  wordMatchesFilters,
  getFilteredWords,
  getAvailableWords,
} from "../../src/engine/filtering";
import { NormalizedWord } from "../../src/engine/types";

// ============================================================
// Helper
// ============================================================

function makeWord(
  id: string,
  categories: Record<string, string[]>,
): NormalizedWord {
  return {
    id,
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
// wordMatchesFilters
// ============================================================

describe("wordMatchesFilters", () => {
  it("matches when no filters are active", () => {
    const word = makeWord("0", { league: ["Premier League"] });
    expect(wordMatchesFilters(word, {})).toBe(true);
  });

  it("matches when all filter categories have empty selections", () => {
    const word = makeWord("0", { league: ["Premier League"] });
    const filters = { league: new Set<string>(), position: new Set<string>() };
    expect(wordMatchesFilters(word, filters)).toBe(true);
  });

  it("matches with single value in single category (OR within)", () => {
    const word = makeWord("0", { league: ["Premier League", "La Liga"] });
    const filters = { league: new Set(["La Liga"]) };
    expect(wordMatchesFilters(word, filters)).toBe(true);
  });

  it("matches with multiple selected values in one category (OR)", () => {
    const word = makeWord("0", { league: ["Serie A"] });
    const filters = { league: new Set(["Premier League", "Serie A"]) };
    expect(wordMatchesFilters(word, filters)).toBe(true);
  });

  it("does not match when no overlap in a category", () => {
    const word = makeWord("0", { league: ["Bundesliga"] });
    const filters = { league: new Set(["Premier League", "La Liga"]) };
    expect(wordMatchesFilters(word, filters)).toBe(false);
  });

  it("applies AND across categories — both must match", () => {
    const word = makeWord("0", {
      league: ["Premier League"],
      position: ["Goalkeeper"],
    });
    const filters = {
      league: new Set(["Premier League"]),
      position: new Set(["Striker"]),
    };
    expect(wordMatchesFilters(word, filters)).toBe(false);
  });

  it("applies AND across categories — passes when both match", () => {
    const word = makeWord("0", {
      league: ["Premier League"],
      position: ["Striker"],
    });
    const filters = {
      league: new Set(["Premier League"]),
      position: new Set(["Striker"]),
    };
    expect(wordMatchesFilters(word, filters)).toBe(true);
  });

  it("skips categories with empty selections in AND logic", () => {
    const word = makeWord("0", {
      league: ["Premier League"],
      position: ["Striker"],
    });
    const filters = {
      league: new Set(["Premier League"]),
      position: new Set<string>(), // no selection — should not filter
    };
    expect(wordMatchesFilters(word, filters)).toBe(true);
  });

  it("does not match if word lacks a filtered category entirely", () => {
    const word = makeWord("0", { league: ["Premier League"] });
    const filters = { position: new Set(["Striker"]) };
    expect(wordMatchesFilters(word, filters)).toBe(false);
  });
});

// ============================================================
// getFilteredWords
// ============================================================

describe("getFilteredWords", () => {
  const words = [
    makeWord("0", { league: ["Premier League"], position: ["Striker"] }),
    makeWord("1", { league: ["La Liga"], position: ["Midfielder"] }),
    makeWord("2", { league: ["Premier League"], position: ["Midfielder"] }),
    makeWord("3", { league: ["Bundesliga"], position: ["Striker"] }),
  ];

  it("returns all words when no filters are active", () => {
    expect(getFilteredWords(words, {})).toHaveLength(4);
  });

  it("filters by single category", () => {
    const filters = { league: new Set(["Premier League"]) };
    const result = getFilteredWords(words, filters);
    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(["0", "2"]);
  });

  it("filters with OR within category", () => {
    const filters = { league: new Set(["Premier League", "La Liga"]) };
    const result = getFilteredWords(words, filters);
    expect(result).toHaveLength(3);
    expect(result.map((w) => w.id)).toEqual(["0", "1", "2"]);
  });

  it("filters with AND across categories", () => {
    const filters = {
      league: new Set(["Premier League"]),
      position: new Set(["Midfielder"]),
    };
    const result = getFilteredWords(words, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns empty when nothing matches", () => {
    const filters = {
      league: new Set(["Serie A"]),
    };
    expect(getFilteredWords(words, filters)).toHaveLength(0);
  });
});

// ============================================================
// getAvailableWords
// ============================================================

describe("getAvailableWords", () => {
  const words = [
    makeWord("0", { league: ["Premier League"] }),
    makeWord("1", { league: ["Premier League"] }),
    makeWord("2", { league: ["La Liga"] }),
  ];

  it("excluded played words", () => {
    const filters = { league: new Set(["Premier League"]) };
    const played = new Set(["0"]);
    const result = getAvailableWords(words, filters, played);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty when all matching wods have been played", () => {
    const filters = { league: new Set(["Premier League"]) };
    const played = new Set(["0", "1"]);
    const result = getAvailableWords(words, filters, played);

    expect(result).toHaveLength(0);
  });

  it("does not exclude words that were played but do not match filters", () => {
    const filters = { league: new Set(["La Liga"]) };
    const played = new Set(["0"]);
    const result = getAvailableWords(words, filters, played);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("works with no played words", () => {
    const result = getAvailableWords(words, {}, new Set());
    expect(result).toHaveLength(3);
  });
});
