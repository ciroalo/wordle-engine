import { useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";

export function useKeyboardInput() {
  const { state, dispatch } = useGame();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const round = state.round;
        if (round && round.status === "playing") {
          if (round.currentInput.length < round.targetWord.totalLetters) {
            const fn = (window as unknown as Record<string, unknown>)
              .__triggerShake;
            if (typeof fn === "function") (fn as () => void)();
            return;
          }
        }
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
      }
    },
    [
      dispatch,
      state.round?.currentInput.length,
      state.round?.targetWord.totalLetters,
      state.round?.status,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
