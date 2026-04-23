import { useEffect, useRef } from "react";
import type { LetterFeedback } from "@engine/types";
import { SEPARATOR_CHAR } from "@engine/types";
import styles from "./Grid.module.css";

interface GridCellProps {
  letter: string;
  feedback: LetterFeedback | null;
  isSeparator: boolean;
  isActive: boolean;
  isCursor: boolean;
  revealDelay: number | null;
  isWin: boolean;
  winDelay: number | null;
}

export default function GridCell({
  letter,
  feedback,
  isSeparator,
  isActive: _isActive,
  isCursor,
  revealDelay,
  isWin,
  winDelay,
}: GridCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCursor && cellRef.current) {
      cellRef.current.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [isCursor, letter]);

  if (isSeparator) {
    return <div className={styles.separator}>{SEPARATOR_CHAR}</div>;
  }

  const isRevealing = feedback !== null && revealDelay !== null;
  const isRevealed = feedback !== null && revealDelay === null;

  const classes: string[] = [styles.cell];

  if (isRevealing) {
    classes.push(styles.revealing);
  } else if (isRevealed) {
    classes.push(styles[feedback]);
  } else if (isCursor) {
    classes.push(styles.active);
  } else if (letter) {
    classes.push(styles.filled);
  }

  if (isWin) {
    classes.push(styles.win);
  }

  const inlineStyle: Record<string, string> = {};
  if (revealDelay !== null) {
    inlineStyle["--delay"] = `${revealDelay}ms`;
  }
  if (winDelay !== null) {
    inlineStyle["--delay"] = `${winDelay}ms`;
  }

  return (
    <div
      className={classes.join(" ")}
      ref={isCursor ? cellRef : null}
      style={inlineStyle as React.CSSProperties}
      data-reveal={isRevealing ? feedback : undefined}
    >
      {letter}
    </div>
  );
}
