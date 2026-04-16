import {
  type GameConfig,
  type WordEntry,
  type ThemeConfig,
  HINTS_PER_WORD,
} from "./types";

// ============================================================
// Validation Result Type
// ============================================================

export type ValidationResult =
  | { success: true; config: GameConfig }
  | { success: false; errors: string[] };

// ============================================================
// Main Validation Function
// ============================================================

export function validateConfig(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { success: false, errors: ["Configuration must be a JSON object."] };
  }

  const obj = data as Record<string, unknown>;

  // validate title
  if (typeof obj.title !== "string" || obj.title.trim() === "") {
    errors.push('Configuration must have a non-empty "title" string.');
  }

  // validate theme
  const themeErrors = validateTheme(obj.theme);
  errors.push(...themeErrors);

  // validate dataset
  const datasetErrors = validateDataset(obj.dataset);
  errors.push(...datasetErrors);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    config: {
      title: obj.title as string,
      theme: obj.theme as ThemeConfig,
      dataset: obj.dataset as WordEntry[],
    },
  };
}

// ============================================================
// Theme Validation
// ============================================================

const REQUIRED_THEME_KEYS: (keyof ThemeConfig)[] = [
  "primaryColor",
  "accentColor",
  "greenColor",
  "yellowColor",
  "grayColor",
];

function validateTheme(theme: unknown): string[] {
  const errors: string[] = [];

  if (typeof theme !== "object" || theme === null || Array.isArray(theme)) {
    return ['"theme" must be an object with color properties.'];
  }

  const themeObj = theme as Record<string, unknown>;

  for (const key of REQUIRED_THEME_KEYS) {
    if (
      typeof themeObj[key] !== "string" ||
      (themeObj[key] as string).trim() === ""
    ) {
      errors.push(`"theme.${key}" must be a non-empty string.`);
    }
  }

  return errors;
}

// ============================================================
// Dataset Validation
// ============================================================

function validateDataset(dataset: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(dataset)) {
    return ['"dataset" must be an array'];
  }

  if (dataset.length == 0) {
    return ['"dataset" must contain at least one word per entry'];
  }

  dataset.forEach((entry, index) => {
    const entryErrors = validateWordEntry(entry, index);
    errors.push(...entryErrors);
  });

  return errors;
}

function validateWordEntry(entry: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `dataset[${index}]`;

  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    return [`${prefix} must be an object.`];
  }

  const obj = entry as Record<string, unknown>;

  // validate word
  if (typeof obj.word !== "string" || obj.word.trim() === "") {
    errors.push(`${prefix}.word must be a non-empty string.`);
  }

  // validate categories
  const catErrors = validateCategories(obj.categories, prefix);
  errors.push(...catErrors);

  // validate hints
  const hintErrors = validateHints(obj.hints, prefix);
  errors.push(...hintErrors);

  return errors;
}

function validateCategories(categories: unknown, prefix: string): string[] {
  const errors: string[] = [];

  if (
    typeof categories !== "object" ||
    categories === null ||
    Array.isArray(categories)
  ) {
    return [`${prefix}.categories must be an object.`];
  }

  const catObj = categories as Record<string, unknown>;

  for (const [key, value] of Object.entries(catObj)) {
    if (!Array.isArray(value)) {
      errors.push(`${prefix}.categories.${key} must be an array of strings.`);
      continue;
    }

    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== "string" || (value[i] as string).trim() === "") {
        errors.push(
          `${prefix}.categories.${key}[${i}] must be a non-empty string.`,
        );
      }
    }
  }

  return errors;
}

function validateHints(hints: unknown, prefix: string): string[] {
  if (!Array.isArray(hints)) {
    return [
      `${prefix}.hints must be an array of exactly ${HINTS_PER_WORD} strings.`,
    ];
  }

  if (hints.length !== HINTS_PER_WORD) {
    return [
      `${prefix}.hints must contain exactly ${HINTS_PER_WORD} hints, but found ${hints.length}.`,
    ];
  }

  const errors: string[] = [];

  hints.forEach((hint, i) => {
    if (typeof hint !== "string" || hint.trim() === "") {
      errors.push(`${prefix}.hints[${i}] must be a non-empty string.`);
    }
  });

  return errors;
}
