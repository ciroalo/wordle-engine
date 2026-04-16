import type { Guess } from "@engine/types";
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
  isHintPinned: boolean;
  onToggleHint: () => void;
}

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
    if (segIndex > 0) {
      cells.push({ letter: "", feedback: null, isSeparator: true });
    }

    for (let i = 0; i < segmentLength; i++) {
      if (guess) {
        cells.push({
          letter: guess.letters[letterIndex],
          feedback: guess.feedback[letterIndex],
          isSeparator: false,
        });
      } else if (isActive) {
        cells.push({
          letter: currentInput[letterIndex] ?? "",
          feedback: null,
          isSeparator: false,
        });
      } else {
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
  isHintPinned,
  onToggleHint,
}: GridRowProps) {
  const cells = buildRowCells(segments, guess, currentInput, isActive);

  return (
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
      <div className={styles.hintSlot}>
        <div
          className={`${styles.hintWrapper} ${isHintPinned ? styles.pinned : ""} ${
            !isHintAvailable ? styles.hintHidden : ""
          }`}
        >
          <button
            className={styles.hintButton}
            onClick={onToggleHint}
            disabled={!isHintAvailable}
            aria-label={`Toggle hint ${rowIndex + 1}`}
            aria-expanded={isHintPinned}
            aria-hidden={!isHintAvailable}
            tabIndex={isHintAvailable ? 0 : -1}
          >
            ?
          </button>
          {hintText && (
            <div className={styles.tooltip} role="tooltip">
              <span className={styles.tooltipArrow} aria-hidden="true" />
              <span className={styles.tooltipText}>{hintText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
