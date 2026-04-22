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
}

export default function GridCell({
  letter,
  feedback,
  isSeparator,
  isActive,
  isCursor,
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

  const cellClasses = [
    styles.cell,
    feedback ? styles[feedback] : "",
    isActive && !feedback ? styles.active : "",
    letter && !feedback ? styles.filled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cellClasses} ref={isCursor ? cellRef : null}>
      {letter}
    </div>
  );
}
