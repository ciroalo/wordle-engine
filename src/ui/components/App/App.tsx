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

export default function App() {
  const { state, dispatch } = useGame();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
      <button
        className={styles.mobileToggle}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        aria-label="Toggle filter panel"
      >
        {isPanelOpen ? "✕" : "☰"} Filters
      </button>

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
        <h1 className={styles.title}>{state.config?.title}</h1>
        <StatusMessage />
        <Grid />
        <Keyboard />
      </main>
    </div>
  );
}
