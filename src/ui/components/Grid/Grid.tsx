import { useGame } from "../../context/GameContext";
import { MAX_ATTEMPTS, HINTS_PER_WORD } from "@engine/types";
import GridRow from "./GridRow";
import styles from "./Grid.module.css";

export default function Grid() {
  const { state, dispatch } = useGame();

  if (!state.round) {
    return null;
  }

  const {
    targetWord,
    guesses,
    currentInput,
    attemptNumber,
    revealedHints,
    status,
  } = state.round;
  const rows = [];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const guess = guesses[i] ?? null;
    const isActive = i === attemptNumber && status === "playing";

    const hasGuess = guess !== null;
    const isWrongGuess =
      hasGuess && !guess.feedback.every((f) => f === "correct");
    const hasHint = i < HINTS_PER_WORD;
    const isHintAvailable = isWrongGuess && hasHint;
    const isHintPinned = revealedHints.has(i);
    const hintText = isHintAvailable ? targetWord.hints[i] : null;

    rows.push(
      <GridRow
        key={i}
        segments={targetWord.segments}
        guess={guess}
        currentInput={isActive ? currentInput : []}
        isActive={isActive}
        rowIndex={i}
        hintText={hintText}
        isHintAvailable={isHintAvailable}
        isHintPinned={isHintPinned}
        onToggleHint={() => dispatch({ type: "TOGGLE_HINT", hintIndex: i })}
      />,
    );
  }

  return <div className={styles.grid}>{rows}</div>;
}
