import type { LetterFeedback } from '@engine/types';
import { SEPARATOR_CHAR } from '@engine/types';
import styles from "./Grid.module.css";

interface GridCellProps {
  letter: string;
  feedback: LetterFeedback | null;
  isSeparator: boolean;
  isActive: boolean;
}

export default function GridCell({
  letter,
  feedback,
  isSeparator,
  isActive,
}: GridCellProps) {
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

  return <div className={cellClasses}>{letter}</div>;
}
