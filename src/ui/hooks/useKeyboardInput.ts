import { useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";

/**
 * Listen for physical keyboard events and dispatches game actions
 */
export function useKeyboardInput() {
  const { dispatch } = useGame();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // ignore if modifier keys are held (let browser shortcuts work)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        dispatch({ type: "SUBMIT_GUESS" });
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "DELETE_LETTER" });
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        dispatch({ type: "INPUT_LETTER", letter: e.key.toUpperCase() });
        return;
      }
    },
    [dispatch],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
