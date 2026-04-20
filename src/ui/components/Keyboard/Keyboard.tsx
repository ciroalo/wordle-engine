import { useGame } from "../../context/GameContext";
import { useKeyboardInput } from "../../hooks/useKeyboardInput";
import type { KeyState } from "@engine/types";
import Key from "./Key";
import styles from "./Keyboard.module.css";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

function BackspaceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.backspaceIcon}
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );
}

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
    dispatch({ type: "SUBMIT_GUESS" });
  };

  const handleBackspace = () => {
    dispatch({ type: "DELETE_LETTER" });
  };

  return (
    <div className={styles.keyboard}>
      <div className={styles.row}>
        {ROWS[0].map((letter) => (
          <Key
            key={letter}
            label={letter}
            state={getKeyState(letter)}
            onClick={() => handleLetterClick(letter)}
          />
        ))}
      </div>

      <div className={styles.row}>
        <div className={styles.halfSpacer} />
        {ROWS[1].map((letter) => (
          <Key
            key={letter}
            label={letter}
            state={getKeyState(letter)}
            onClick={() => handleLetterClick(letter)}
          />
        ))}
        <div className={styles.halfSpacer} />
      </div>

      <div className={styles.row}>
        <Key label="ENTER" state="unknown" isWide onClick={handleEnter} />
        {ROWS[2].map((letter) => (
          <Key
            key={letter}
            label={letter}
            state={getKeyState(letter)}
            onClick={() => handleLetterClick(letter)}
          />
        ))}
        <button
          className={`${styles.key} ${styles.wide}`}
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          <BackspaceIcon />
        </button>
      </div>
    </div>
  );
}
