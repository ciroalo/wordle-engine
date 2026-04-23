import { useEffect } from "react";
import { CloseIcon } from "../Icons";
import styles from "./HelpModal.module.css";

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div className={styles.modal}>
        <button
          className={`icon-btn ${styles.closeButton}`}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <h2 id="help-title" className={styles.title}>
          How to play
        </h2>
        <p className={styles.subtitle}>
          Guess the hidden word in 6 tries. Each guess must match the letter
          count of the answer.
        </p>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Tile colors</h3>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={`${styles.miniTile} ${styles.miniCorrect}`}>
                A
              </span>
              Letter is in the word and in the right spot.
            </li>
            <li className={styles.listItem}>
              <span className={`${styles.miniTile} ${styles.miniPresent}`}>
                B
              </span>
              Letter is in the word but in the wrong spot.
            </li>
            <li className={styles.listItem}>
              <span className={`${styles.miniTile} ${styles.miniAbsent}`}>
                C
              </span>
              Letter is not in the word.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Hints</h3>
          <p className={styles.sectionText}>
            After each failed guess, a <strong>?</strong> appears beside that
            row. Click it to toggle a hint about the answer. There are up to 5
            hints, one per wrong row.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Filters</h3>
          <p className={styles.sectionText}>
            Narrow the pool from the left panel. Values within a category
            combine with <strong>OR</strong>; categories combine with{" "}
            <strong>AND</strong>. Empty = everything.
          </p>
        </section>
      </div>
    </div>
  );
}
