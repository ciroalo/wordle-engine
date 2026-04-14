import type { NormalizedWord } from "./types";

/**
 * Selects a random word from the provided pool
 *
 * @param pool - available words (already filtered and with played words excluded)
 * @param random - random number generator (0 < n < 1), defaults to math.random
 *
 * @returns the selected word, or null if the pool is empty
 */
export function selectRandomWord(
  pool: NormalizedWord[],
  random: () => number = Math.random,
): NormalizedWord | null {
  if (pool.length === 0) {
    return null;
  }

  const index = Math.floor(random() * pool.length);
  return pool[index];
}
