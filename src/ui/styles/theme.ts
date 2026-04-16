import type { ThemeConfig } from "@engine/types";

/**
 * Applies the theme from the game config to CSS custom properties on :root.
 * These variables are consumed by component stylesheets via var(--name).
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primaryColor);
  root.style.setProperty("--color-accent", theme.accentColor);
  root.style.setProperty("--color-correct", theme.greenColor);
  root.style.setProperty("--color-present", theme.yellowColor);
  root.style.setProperty("--color-absent", theme.grayColor);
}
