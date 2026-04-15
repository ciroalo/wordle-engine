import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { validateConfig } from "@engine/validation";
import Grid from "../Grid/Grid";
import Keyboard from "../Keyboard/Keyboard";
import styles from "./App.module.css";

const CONFIG_URL = "/data/config.json";

type LoadingStatus = "loading" | "error" | "ready";

export default function App() {
  const { state, dispatch } = useGame();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("loading");
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

  if (loadingStatus === "loading") {
    return (
      <div className={styles.container}>
        <p className={styles.message}>Loading game...</p>
      </div>
    );
  }

  if (loadingStatus === "error") {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{state.config?.title}</h1>
      <Grid />
      <Keyboard />
    </div>
  );
}
