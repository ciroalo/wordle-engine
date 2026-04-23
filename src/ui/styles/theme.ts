import type { ThemeConfig } from "@engine/types";

/**
 * Applies the game config theme to CSS custom properties.
 * Sets accent color and derives the RGB variant for rgba() usage.
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Set accent from config
  root.style.setProperty("--accent", theme.accentColor);

  // Derive RGB values from hex for rgba() usage in box-shadows etc.
  const rgb = hexToRgb(theme.accentColor);
  if (rgb) {
    root.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }

  // Set feedback colors from config
  if (theme.greenColor) {
    root.style.setProperty("--fb-correct", theme.greenColor);
  }
  if (theme.yellowColor) {
    root.style.setProperty("--fb-present", theme.yellowColor);
  }
  if (theme.grayColor) {
    root.style.setProperty("--fb-absent", theme.grayColor);
  }
}

/**
 * Sets the theme mode (dark/light) on the document.
 */
export function setThemeMode(mode: "dark" | "light"): void {
  document.documentElement.setAttribute("data-theme", mode);
}

/**
 * Gets the current theme mode.
 */
export function getThemeMode(): "dark" | "light" {
  return (
    (document.documentElement.getAttribute("data-theme") as "dark" | "light") ||
    "dark"
  );
}

/**
 * Converts a hex color string to RGB components.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return { r, g, b };
}
