import { describe, it, expect } from "vitest";
import { validateConfig } from "../../src/engine/validation";

// ============================================================
// Helper: builds a valid config for use as a baseline
// ============================================================

function validConfig() {
  return {
    title: "Football Wordle",
    theme: {
      primaryColor: "#1a1a2e",
      accentColor: "#e94560",
      greenColor: "#538d4e",
      yellowColor: "#b59f3b",
      grayColor: "#3a3a3c",
    },
    dataset: [
      {
        word: "Thierry Henry",
        categories: {
          position: ["Striker"],
          country: ["France"],
          league: ["Premier League", "La Liga"],
        },
        hints: [
          "Born in 1977",
          "Born in Les Ulis, France",
          "All-time top scorer for the French national team",
          "Won the Premier League unbeaten",
          "World Cup winner in 1998",
        ],
      },
    ],
  };
}

// ============================================================
// Tests
// ============================================================

describe("validateConfig", () => {
  // --- happy path ---

  it("accepts a valid configuration", () => {
    const result = validateConfig(validConfig());
    expect(result.success).toBe(true);
  });

  // --- top-level structure ---

  it("rejects null", () => {
    const result = validateConfig(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("Configuration must be a JSON object.");
    }
  });

  it("rejects an array", () => {
    const result = validateConfig([]);
    expect(result.success).toBe(false);
  });

  it("rejects a string", () => {
    const result = validateConfig("hello");
    expect(result.success).toBe(false);
  });

  // --- title ---

  it("rejects missing title", () => {
    const config = validConfig();
    delete (config as Record<string, unknown>).title;
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("title");
    }
  });

  it("rejects empty title", () => {
    const config = validConfig();
    config.title = "   ";
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("title");
    }
  });

  // --- theme ---

  it("rejects missing theme", () => {
    const config = validConfig();
    delete (config as Record<string, unknown>).theme;
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("theme");
    }
  });

  it("rejects theme with missing color", () => {
    const config = validConfig();
    delete (config.theme as Record<string, unknown>).greenColor;
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("greenColor"))).toBe(true);
    }
  });

  // --- dataset ---

  it("rejects missing dataset", () => {
    const config = validConfig();
    delete (config as Record<string, unknown>).dataset;
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("dataset");
    }
  });

  it("rejects empty dataset", () => {
    const config = validConfig();
    config.dataset = [];
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("at least one");
    }
  });

  // --- word entries ---
  it('rejects entry with missing word', () => {
    const config = validConfig();
    delete (config.dataset[0] as Record<string, unknown>).word;
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('dataset[0].word'))).toBe(true);
    }
  });

  it('rejects entry with non-object categories', () => {
    const config = validConfig();
    (config.dataset[0] as Record<string, unknown>).categories = 'not an object';
    const result = validateConfig(config);
    expect(result.success).toBe(false);
  });

  it('rejects entry with non-array category values', () => {
    const config = validConfig();
    config.dataset[0].categories.position = 'striker' as unknown as string[];
    const result = validateConfig(config);
    expect(result.success).toBe(false);
  });

  // --- hints --- 

  it('rejects entry with wrong number of hints', () => {
    const config = validConfig();
    config.dataset[0].hints = ['one', 'two', 'three'] as unknown as [
      string,
      string,
      string,
      string,
      string,
    ];
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('exactly 5'))).toBe(true);
    }
  });

  it('rejects entry with empty hint string', () => {
    const config = validConfig();
    config.dataset[0].hints[2] = '  ';
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if(!result.success) {
      expect(result.errors.some((e) => e.includes('hints[2]'))).toBe(true);
    }
  });

  // --- multiple errors ---

  it('collects multiple errors in one pass', () => {
    const config = {
      title: '',
      theme: {},
      dataset: [{ word: '', categories: null, hints: [] }],
    };
    const result = validateConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(3);
    }
  });
});
