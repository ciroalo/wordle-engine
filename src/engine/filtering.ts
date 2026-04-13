import type { NormalizedWord } from "./types";

/**
 * Checs whether a single word matches the active filters
 */
export function wordMatchesFilters(
  word: NormalizedWord,
  activeFilters: Record<string, Set<string>>,
): boolean {
  for (const [categoryName, selectedValues] of Object.entries(activeFilters)) {
    // skip categories with no selections
    if (selectedValues.size === 0) {
      continue;
    }

    const wordValues = word.categories[categoryName];

    // if the word has no values for this category, it cannot match
    if (!wordValues || wordValues.length === 0) {
      return false;
    }

    // OR within category - at least one overlap required
    const hasOverlap = wordValues.some((value) => selectedValues.has(value));

    if (!hasOverlap) {
      return false;
    }
  }

  // AND across categories - all checked categories
  return true;
}

/**
 * Returns all words that match the current filters.
 * Does NOT exclude played words - that is handled separately.
 */
export function getFilteredWords(
  words: NormalizedWord[],
  activeFilters: Record<string, Set<string>>,
): NormalizedWord[] {
  return words.filter((word) => wordMatchesFilters(word, activeFilters));
}

/**
 * Returns filtered words minus already-played words.
 * This is the pool from which the next word is selected.
 */
export function getAvailableWords(
  words: NormalizedWord[],
  activeFilters: Record<string, Set<string>>,
  playedWordIds: Set<string>,
): NormalizedWord[] {
  return getFilteredWords(words, activeFilters).filter(
    (word) => !playedWordIds.has(word.id),
  );
}
