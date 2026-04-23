import { useGame } from "../../context/GameContext";
import { useKeyboardInput } from "../../hooks/useKeyboardInput";
import type { KeyState } from "@engine/types";
import { BackspaceIcon } from "../Icons";
import styles from "./Keyboard.module.css";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function Keyboard() {
  const { state, dispatch } = useGame();

  useKeyboardInput();

  const getKeyState = (letter: string): KeyState => {
    return state.keyboardState[letter] ?? "unknown";
  };

  const handleLetterClick = (letter: string) => {
    dispatch({ type: "INPUT_LETTER", letter });
  };

  const handleEnter = () => {
    if (state.round && state.round.status === "playing") {
      if (
        state.round.currentInput.length < state.round.targetWord.totalLetters
      ) {
        const fn = (window as unknown as Record<string, unknown>)
          .__triggerShake;
        if (typeof fn === "function") (fn as () => void)();
        return;
      }
    }
    dispatch({ type: "SUBMIT_GUESS" });
  };

  const handleBackspace = () => {
    dispatch({ type: "DELETE_LETTER" });
  };

  return (
    <div className={styles.keyboard}>
      <div className={styles.row}>
        {ROWS[0].map((letter) => (
          <button
            key={letter}
            className={`${styles.key} ${getKeyState(letter) !== "unknown" ? styles[getKeyState(letter)] : ""}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        {ROWS[1].map((letter) => (
          <button
            key={letter}
            className={`${styles.key} ${getKeyState(letter) !== "unknown" ? styles[getKeyState(letter)] : ""}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        <button
          className={`${styles.key} ${styles.wide}`}
          onClick={handleEnter}
        >
          ENTER
        </button>
        {ROWS[2].map((letter) => (
          <button
            key={letter}
            className={`${styles.key} ${getKeyState(letter) !== "unknown" ? styles[getKeyState(letter)] : ""}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
        <button
          className={`${styles.key} ${styles.backspace}`}
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          <BackspaceIcon />
        </button>
      </div>
    </div>
  );
}
