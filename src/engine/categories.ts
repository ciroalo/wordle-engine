import type { NormalizedWord, CategoryIndex } from "./types";

/**
 * Scans the dataset and derives all categories with their unique values.
 * Categories and values are sorted alphabetically for stable UI rendering.
 */
export function deriveCategories(words: NormalizedWord[]): CategoryIndex[] {
  const categoryMap = new Map<string, Set<string>>();

  for (const word of words) {
    for (const [categoryName, values] of Object.entries(word.categories)) {
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, new Set<string>());
      }

      const valueSet = categoryMap.get(categoryName)!;

      for (const value of values) {
        valueSet.add(value);
      }
    }
  }

  const categories: CategoryIndex[] = [];

  for (const [name, valueSet] of categoryMap) {
    categories.push({
      name,
      values: Array.from(valueSet).sort(),
    });
  }

  categories.sort((a, b) => a.name.localeCompare(b.name));

  return categories;
}
