import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { validateConfig } from "@engine/validation";
import styles from "./App.module.css";

const CONFIG_URL = "/data/config.json";

type LoadingStatus = "loading" | "error" | "ready";

export default function App() {
  const { state, dispatch } = useGame();
  const [LoadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  if (LoadingStatus === "loading") {
    return (
      <div className={styles.container}>
        <p className={styles.message}>Loading game...</p>
      </div>
    );
  }

  if (LoadingStatus === "error") {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{errorMessage}</p>
      </div>
    );
  }

  // Temporary: proof that everything is wired up
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{state.config?.title}</h1>
      {state.round && (
        <div>
          <p>
            Target word: {state.round.targetWord.normalized} (will be hidden in
            real UI)
          </p>
          <p>Letters: {state.round.targetWord.totalLetters}</p>
          <p>Segments: {state.round.targetWord.segments.join(" / ")}</p>
          <p>Categories: {state.categoryIndex.map((c) => c.name).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
