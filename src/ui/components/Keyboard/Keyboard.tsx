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

export default function Keyboard() {
  const { state, dispatch } = useGame();

  // activate physical keyboard listener
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
      {/* Row 1 */}
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

      {/* Row 2 */}
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

      {/* Row 3 — with Enter and Backspace */}
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
        <Key label="⌫" state="unknown" isWide onClick={handleBackspace} />
      </div>
    </div>
  );
}
