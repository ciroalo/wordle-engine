import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { validateConfig } from "@engine/validation";
import { applyTheme } from "../../styles/theme";
import FilterPanel from "../FilterPanel/FilterPanel";
import Grid from "../Grid/Grid";
import Keyboard from "../Keyboard/Keyboard";
import StatusMessage from "../StatusMessage/StatusMessage";
import styles from "./App.module.css";

const CONFIG_URL = "/data/config.json";

type LoadingStatus = "loading" | "error" | "ready";

function SidebarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

export default function App() {
  const { state, dispatch } = useGame();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPanelOpen, setIsPanelOpen] = useState(
    () => window.innerWidth >= 1200,
  );

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

  if (loadingStatus === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.message}>Loading game...</p>
      </div>
    );
  }

  if (loadingStatus === "error") {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.error}>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button
          className={styles.sidebarToggle}
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          aria-label={isPanelOpen ? "Close filter panel" : "Open filter panel"}
        >
          <SidebarIcon />
        </button>
        <h1 className={styles.title}>{state.config?.title}</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.content}>
        <aside
          className={`${styles.sidebar} ${isPanelOpen ? styles.sidebarOpen : ""}`}
        >
          <FilterPanel />
        </aside>

        {isPanelOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsPanelOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className={styles.main}>
          <Grid />
          <Keyboard />
        </main>
      </div>

      <footer className={styles.footer}>
        <span>
          Powered by{" "}
          <a href="https://github.com/ciroalo/wordle-engine" target="_blank">
            {" "}
            Wordle Engine
          </a>{" "}
          © 2026
        </span>

        <span className={styles.footerDot}>·</span>
        <span>Built by Ciro Alonso</span>
      </footer>

      <StatusMessage />
    </div>
  );
}
