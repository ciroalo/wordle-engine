import type { Guess, NormalizedWord } from "@engine/types";
import { HINTS_PER_WORD } from "@engine/types";
import GridCell from "./GridCell";
import styles from "./Grid.module.css";

interface GridRowProps {
  segments: number[];
  guess: Guess | null;
  currentInput: string[];
  isActive: boolean;
  rowIndex: number;
  hintText: string | null;
  isHintAvailable: boolean;
  isHintRevealed: boolean;
  onToggleHint: () => void;
}

/**
 * Builds the cell data for one row, interleaving separator columns between segments
 */
function buildRowCells(
  segments: number[],
  guess: Guess | null,
  currentInput: string[],
  isActive: boolean,
) {
  const cells: {
    letter: string;
    feedback: "correct" | "present" | "absent" | null;
    isSeparator: boolean;
  }[] = [];

  let letterIndex = 0;

  segments.forEach((segmentLength, segIndex) => {
    // add separator before each segment except the first
    if (segIndex > 0) {
      cells.push({ letter: "", feedback: null, isSeparator: true });
    }

    for (let i = 0; i < segmentLength; i++) {
      if (guess) {
        // submitted row: show guess letters with feedback
        cells.push({
          letter: guess.letters[letterIndex],
          feedback: guess.feedback[letterIndex],
          isSeparator: false,
        });
      } else if (isActive) {
        // active row: show current input
        cells.push({
          letter: currentInput[letterIndex] ?? "",
          feedback: null,
          isSeparator: false,
        });
      } else {
        // empty future row
        cells.push({ letter: "", feedback: null, isSeparator: false });
      }

      letterIndex++;
    }
  });

  return cells;
}

export default function GridRow({
  segments,
  guess,
  currentInput,
  isActive,
  rowIndex,
  hintText,
  isHintAvailable,
  isHintRevealed,
  onToggleHint,
}: GridRowProps) {
  const cells = buildRowCells(segments, guess, currentInput, isActive);

  return (
    <div className={styles.rowWrapper}>
      <div className={styles.row}>
        {cells.map((cell, i) => (
          <GridCell
            key={i}
            letter={cell.letter}
            feedback={cell.feedback}
            isSeparator={cell.isSeparator}
            isActive={isActive}
          />
        ))}
      </div>
      <div className={styles.hintArea}>
        {isHintAvailable && (
          <button
            className={`${styles.hintButton} ${isHintRevealed ? styles.hintButtonActive : ""}`}
            onClick={onToggleHint}
            aria-label={`Hint ${rowIndex + 1}`}
          >
            ?
          </button>
        )}
      </div>
      {isHintRevealed && hintText && (
        <div className={styles.hintText}>{hintText}</div>
      )}
    </div>
  );
}
