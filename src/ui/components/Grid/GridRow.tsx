import { useEffect, useRef } from "react";
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
  isShaking: boolean;
  isRevealing: boolean;
  isWinRow: boolean;
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
    letterIndex: number;
  }[] = [];

  let letterIndex = 0;

  segments.forEach((segmentLength, segIndex) => {
    if (segIndex > 0) {
      cells.push({
        letter: "",
        feedback: null,
        isSeparator: true,
        letterIndex: -1,
      });
    }

    for (let i = 0; i < segmentLength; i++) {
      if (guess) {
        cells.push({
          letter: guess.letters[letterIndex],
          feedback: guess.feedback[letterIndex],
          isSeparator: false,
          letterIndex,
        });
      } else if (isActive) {
        cells.push({
          letter: currentInput[letterIndex] ?? "",
          feedback: null,
          isSeparator: false,
          letterIndex,
        });
      } else {
        cells.push({
          letter: "",
          feedback: null,
          isSeparator: false,
          letterIndex,
        });
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
  isShaking,
  isRevealing,
  isWinRow,
  onToggleHint,
}: GridRowProps) {
  const cells = buildRowCells(segments, guess, currentInput, isActive);
  const rowRef = useRef<HTMLDivElement>(null);

  const cursorIndex = isActive ? currentInput.length : -1;

  useEffect(() => {
    if (!guess && currentInput.length === 0 && rowRef.current) {
      rowRef.current.scrollLeft = 0;
    }
  }, [guess, currentInput.length]);

  return (
    <div
      className={`${styles.row} ${isShaking ? styles.shake : ""}`}
      ref={rowRef}
    >
      {cells.map((cell, i) => (
        <GridCell
          key={i}
          letter={cell.letter}
          feedback={cell.feedback}
          isSeparator={cell.isSeparator}
          isActive={isActive}
          isCursor={cell.letterIndex === cursorIndex}
          revealDelay={
            isRevealing && cell.feedback ? cell.letterIndex * 90 : null
          }
          isWin={isWinRow && !cell.isSeparator}
          winDelay={
            isWinRow && !cell.isSeparator ? cell.letterIndex * 80 : null
          }
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
              <span className={styles.tooltipArrow}>Hint {rowIndex + 1}</span>
              <span className={styles.tooltipText}>{hintText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
