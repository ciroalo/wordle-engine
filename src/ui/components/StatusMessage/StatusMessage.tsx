import { useEffect, useRef, useState } from "react";
import { useGame } from "../../context/GameContext";
import styles from "./StatusMessage.module.css";

export default function StatusMessage() {
  const { state, dispatch } = useGame();
  const [isDismissed, setIsDismissed] = useState(false);
  const lastTargetIdRef = useRef<string | null>(null);

  // Reset dismissal when the round changes (new word)
  const currentTargetId = state.round?.targetWord.id ?? null;
  if (currentTargetId !== lastTargetIdRef.current) {
    lastTargetIdRef.current = currentTargetId;
    if (isDismissed) {
      setIsDismissed(false);
    }
  }

  const round = state.round;
  const isRoundOver = round?.status === "won" || round?.status === "lost";
  const shouldShow = isRoundOver && !isDismissed;

  // Escape key closes the modal
  useEffect(() => {
    if (!shouldShow) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDismissed(true);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [shouldShow]);

  if (!shouldShow || !round) {
    return null;
  }

  // Determine if this was the final word in the dataset
  const totalWords = state.normalizedWords.length;
  const playedCount = state.session.playedWordIds.size;
  const isGameComplete = totalWords > 0 && playedCount >= totalWords;

  const isWin = round.status === "won";

  const handleClose = () => {
    setIsDismissed(true);
  };

  const handleNextWord = () => {
    setIsDismissed(true);
    dispatch({ type: "NEXT_WORD" });
  };

  const handleStartOver = () => {
    setIsDismissed(true);
    dispatch({ type: "RESET_SESSION" });
  };

  // Backdrop click closes
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDismissed(true);
    }
  };

  // ============================================================
  // Content per state
  // ============================================================

  let title: string;
  let body: React.ReactNode;
  let actionButton: React.ReactNode;
  let modalClass = styles.modal;

  if (isGameComplete) {
    modalClass = `${styles.modal} ${styles.modalComplete}`;
    title = "🎉 You finished the game!";
    body = (
      <>
        {isWin ? (
          <p className={styles.bodyText}>
            Solved in {round.guesses.length}{" "}
            {round.guesses.length === 1 ? "guess" : "guesses"}.
          </p>
        ) : (
          <p className={styles.bodyText}>
            The answer was{" "}
            <strong className={styles.answer}>
              {round.targetWord.normalized}
            </strong>
            .
          </p>
        )}
        <p className={styles.bodyText}>
          You've played every word in <strong>{state.config?.title}</strong>.
          Nice work!
        </p>
      </>
    );
    actionButton = (
      <button
        className={styles.primaryButton}
        onClick={handleStartOver}
        autoFocus
      >
        Start Over
      </button>
    );
  } else if (isWin) {
    modalClass = `${styles.modal} ${styles.modalWin}`;
    title = "Correct!";
    body = (
      <p className={styles.bodyText}>
        Solved in {round.guesses.length}{" "}
        {round.guesses.length === 1 ? "guess" : "guesses"}.
      </p>
    );
    actionButton = (
      <button
        className={styles.primaryButton}
        onClick={handleNextWord}
        autoFocus
      >
        Next Word
      </button>
    );
  } else {
    modalClass = `${styles.modal} ${styles.modalLoss}`;
    title = "You lose!";
    body = (
      <p className={styles.bodyText}>
        The answer was{" "}
        <strong className={styles.answer}>{round.targetWord.normalized}</strong>
        .
      </p>
    );
    actionButton = (
      <button
        className={styles.primaryButton}
        onClick={handleNextWord}
        autoFocus
      >
        Next Word
      </button>
    );
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-title"
    >
      <div className={modalClass}>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="status-title" className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{body}</div>
        <div className={styles.actions}>{actionButton}</div>
      </div>
    </div>
  );
}
