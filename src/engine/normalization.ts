import type { WordEntry, NormalizedWord } from "./types";

// ============================================================
// Accent / diacritic transliteration map
// ============================================================

const TRANSLITERATION_MAP: Record<string, string> = {
  À: "A",
  Á: "A",
  Â: "A",
  Ã: "A",
  Ä: "A",
  Å: "A",
  Æ: "AE",
  Ç: "C",
  Ć: "C",
  È: "E",
  É: "E",
  Ê: "E",
  Ë: "E",
  Ì: "I",
  Í: "I",
  Î: "I",
  Ï: "I",
  Ð: "D",
  Ñ: "N",
  Ò: "O",
  Ó: "O",
  Ô: "O",
  Õ: "O",
  Ö: "O",
  Ø: "O",
  Ù: "U",
  Ú: "U",
  Û: "U",
  Ü: "U",
  Ý: "Y",
  Þ: "TH",
  ß: "SS",
  à: "A",
  á: "A",
  â: "A",
  ã: "A",
  ä: "A",
  å: "A",
  æ: "AE",
  ç: "C",
  ć: "C",
  è: "E",
  é: "E",
  ê: "E",
  ë: "E",
  ì: "I",
  í: "I",
  î: "I",
  ï: "I",
  ð: "D",
  ñ: "N",
  ò: "O",
  ó: "O",
  ô: "O",
  õ: "O",
  ö: "O",
  ø: "O",
  ù: "U",
  ú: "U",
  û: "U",
  ü: "U",
  ý: "Y",
  ÿ: "Y",
  þ: "TH",
};

// ============================================================
// Core normalization functions
// ============================================================

/**
 * Transliterates accented characters and converts to uppercase
 * Replaces hyphens with spaces
 * Strips any remaining non-alpha, non-space characters
 */
export function normalizeString(input: string): string {
  let result = "";

  for (const char of input) {
    if (TRANSLITERATION_MAP[char] !== undefined) {
      result += TRANSLITERATION_MAP[char];
    } else {
      result += char;
    }
  }

  result = result.toUpperCase();
  result = result.replace(/-/g, " ");
  result = result.replace(/[^A-Z ]/g, "");
  result = result.replace(/ +/g, " ").trim();

  return result;
}

/**
 * Extracts letter-only string (spaces removed)
 * This is the string used for feedback evaluation
 */
export function extractLetters(normalized: string): string {
  return normalized.replace(/ /g, "");
}

/**
 * Extract segment lengths from the normalized string
 * e.g. "THIERRY HENRY" → [7, 5]
 */
export function extractSegments(normalized: string): number[] {
  return normalized.split(" ").map((segment) => segment.length);
}

// ============================================================
// Main normalization function
// ============================================================

/**
 * Converts a raw WordEntry into a NormalizedWord
 * Called once per entry at load time
 */
export function normalizeWordEntry(
  entry: WordEntry,
  index: number,
): NormalizedWord {
  const normalized = normalizeString(entry.word);
  const letters = extractLetters(normalized);
  const segments = extractSegments(normalized);

  return {
    id: String(index),
    original: entry.word,
    normalized,
    letters,
    segments,
    totalLetters: letters.length,
    categories: entry.categories,
    hints: entry.hints,
  };
}

/**
 * Normalizes an entire dataset
 * Returns an array of NormalizedWord objects
 */
export function normalizeDataset(dataset: WordEntry[]): NormalizedWord[] {
  return dataset.map((entry, index) => normalizeWordEntry(entry, index));
}
