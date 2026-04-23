import { useEffect, useState, useRef, useCallback } from "react";
import { useGame } from "../../context/GameContext";
import { validateConfig } from "@engine/validation";
import { applyTheme, setThemeMode } from "../../styles/theme";
import { SidebarIcon, SunIcon, MoonIcon, HelpIcon } from "../Icons";
import FilterPanel from "../FilterPanel/FilterPanel";
import Grid from "../Grid/Grid";
import Keyboard from "../Keyboard/Keyboard";
import StatusMessage from "../StatusMessage/StatusMessage";
import HelpModal from "../HelpModal/HelpModal";
import styles from "./App.module.css";

const CONFIG_URL = `${import.meta.env.BASE_URL}data/config.json`;

type LoadingStatus = "loading" | "error" | "ready";

export default function App() {
  const { state, dispatch } = useGame();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1200,
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [helpOpen, setHelpOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Load config
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(CONFIG_URL);

        if (!response.ok) {
          throw new Error(
            `Failed to load config: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        const result = validateConfig(data);

        if (!result.success) {
          throw new Error(
            `Invalid configuration:\n${result.errors.join("\n")}`,
          );
        }

        applyTheme(result.config.theme);
        document.title = result.config.title;

        dispatch({ type: "CONFIG_LOADED", config: result.config });
        setLoadingStatus("ready");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unknown error loading configuration.";
        setErrorMessage(message);
        setLoadingStatus("error");
      }
    }

    loadConfig();
  }, [dispatch]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeMode(next);
  }, [theme]);

  // Responsive tile sizing via ResizeObserver
  useEffect(() => {
    const el = mainRef.current;
    if (!el || !state.round) return;

    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;

      const segments = state.round!.targetWord.segments;
      const totalLetters = state.round!.targetWord.totalLetters;
      const segCount = segments.length;
      const sepCount = Math.max(0, segCount - 1);
      const colCount = totalLetters + sepCount;

      const gap = 6;
      const maxTile = 58;
      const maxFont = 26;
      const minFont = 14;

      // Horizontal budget: reserve space for hint button + side padding
      const reserveRight = 56;
      const sidePad = 40;
      const available = Math.max(120, w - reserveRight - sidePad);
      const sepW = 12;
      const totalGaps = (colCount - 1) * gap;
      const remaining = available - sepCount * sepW - totalGaps;
      const perWidth = remaining / totalLetters;

      // Vertical budget: reserve for keyboard + status + footer + padding
      const vBudget = Math.max(h - 200, 200);
      const perHeight = vBudget / 6 - gap;

      const tile = Math.max(
        35,
        Math.min(maxTile, Math.floor(Math.min(perWidth, perHeight + 10))),
      );
      const font = Math.max(
        minFont,
        Math.min(maxFont, Math.floor(tile * 0.45)),
      );

      const root = document.documentElement.style;
      root.setProperty("--tile", tile + "px");
      root.setProperty("--tile-gap", gap + "px");
      root.setProperty("--tile-font", font + "px");
      root.setProperty("--sep-w", sepW + "px");

      // Scale keyboard proportionally
      const keyH = Math.max(32, Math.min(40, Math.round(tile * 0.7)));
      const keyW = Math.max(28, Math.min(44, Math.round(tile * 0.75)));
      root.setProperty("--key", keyH + "px");
      root.setProperty("--key-w", keyW + "px");
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [state.round, sidebarOpen]);

  // Loading state
  if (loadingStatus === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.message}>Loading game...</p>
      </div>
    );
  }

  // Error state
  if (loadingStatus === "error") {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.error}>{errorMessage}</p>
      </div>
    );
  }

  const title = state.config?.title ?? "Wordle Engine";
  const subtitle = state.config?.subtitle ?? "Wordle Engine";

  return (
    <div className={styles.shell}>
      {/* ======== HEADER ======== */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className="icon-btn"
            aria-pressed={sidebarOpen}
            aria-label="Toggle filter panel"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <SidebarIcon />
          </button>
        </div>
        <div className={styles.headerCenter}>
          <span className={styles.brandDot} />
          <span className={styles.brandTitle}>{title}</span>
          <span className={styles.brandSep} />
          <span className={styles.brandSub}>{subtitle}</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="icon-btn"
            aria-label="Help"
            onClick={() => {
              setHelpOpen(true);
            }}
          >
            <HelpIcon />
          </button>
        </div>
      </header>

      {/* ======== BODY ======== */}
      <div
        className={styles.bodyGrid}
        data-sidebar={sidebarOpen ? "open" : "hidden"}
      >
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <FilterPanel />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main area */}
        <main className={styles.mainArea} ref={mainRef}>
          <div className={styles.ambient} />
          <div className={styles.mainStack}>
            <Grid />
            <Keyboard />
          </div>
          <footer className={styles.mainFooter}>
            <span>
              Powered by{" "}
              <a href="https://github.com/ciroalo/wordle-engine">
                Wordle Engine
              </a>
            </span>
            <span>© 2026</span>
            <span>Built by @ciroalo</span>
          </footer>
        </main>
      </div>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      <StatusMessage />
    </div>
  );
}
