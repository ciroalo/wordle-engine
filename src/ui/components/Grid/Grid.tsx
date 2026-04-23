import { useState, useEffect, useCallback } from "react";
import { useGame } from "../../context/GameContext";
import { MAX_ATTEMPTS, HINTS_PER_WORD } from "@engine/types";
import GridRow from "./GridRow";
import styles from "./Grid.module.css";

export default function Grid() {
  const { state, dispatch } = useGame();
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [winRow, setWinRow] = useState<number | null>(null);
  const [lastGuessCount, setLastGuessCount] = useState(0);

  const round = state.round;

  // Detect new guess → trigger reveal, then win bounce if won
  useEffect(() => {
    if (!round) {
      setLastGuessCount(0);
      setRevealingRow(null);
      setWinRow(null);
      return;
    }

    const count = round.guesses.length;

    if (count > lastGuessCount && count > 0) {
      const rowIndex = count - 1;
      setRevealingRow(rowIndex);

      const totalLetters = round.targetWord.totalLetters;
      const revealDuration = totalLetters * 90 + 600;

      const revealTimer = setTimeout(() => {
        setRevealingRow(null);

        // If won, trigger bounce after reveal finishes
        if (round.status === "won") {
          setWinRow(rowIndex);
          const winDuration = totalLetters * 80 + 700;
          setTimeout(() => setWinRow(null), winDuration);
        }
      }, revealDuration);

      setLastGuessCount(count);
      return () => clearTimeout(revealTimer);
    }

    if (count !== lastGuessCount) {
      setLastGuessCount(count);
    }
  }, [round?.guesses.length]);

  // Reset on new round
  useEffect(() => {
    if (!round) {
      setLastGuessCount(0);
      setRevealingRow(null);
      setWinRow(null);
      setShakeRow(null);
    }
  }, [round?.targetWord.id]);

  const triggerShake = useCallback(() => {
    if (!round) return;
    setShakeRow(round.attemptNumber);
    setTimeout(() => setShakeRow(null), 400);
  }, [round?.attemptNumber]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__triggerShake =
      triggerShake;
    return () => {
      delete (window as unknown as Record<string, unknown>).__triggerShake;
    };
  }, [triggerShake]);

  if (!round) {
    return null;
  }

  const {
    targetWord,
    guesses,
    currentInput,
    attemptNumber,
    revealedHints,
    status,
  } = round;
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
        isShaking={shakeRow === i}
        isRevealing={revealingRow === i}
        isWinRow={winRow === i}
        onToggleHint={() => dispatch({ type: "TOGGLE_HINT", hintIndex: i })}
      />,
    );
  }

  return <div className={styles.grid}>{rows}</div>;
}
