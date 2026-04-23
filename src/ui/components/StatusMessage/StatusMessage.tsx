import { useEffect, useRef, useState } from "react";
import { useGame } from "../../context/GameContext";
import { CloseIcon } from "../Icons";
import styles from "./StatusMessage.module.css";

export default function StatusMessage() {
  const { state, dispatch } = useGame();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastTargetIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = state.round;
  const currentTargetId = round?.targetWord.id ?? null;
  const isRoundOver = round?.status === "won" || round?.status === "lost";

  // Reset when round changes
  useEffect(() => {
    if (currentTargetId !== lastTargetIdRef.current) {
      lastTargetIdRef.current = currentTargetId;
      setIsDismissed(false);
      setIsVisible(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [currentTargetId]);

  // Delay modal appearance to let animations play
  useEffect(() => {
    if (!isRoundOver || isDismissed || isVisible) return;
    if (!round) return;

    const totalLetters = round.targetWord.totalLetters;
    const revealDuration = totalLetters * 90 + 600;

    let totalDelay: number;
    if (round.status === "won") {
      // Wait for reveal + win bounce
      const winDuration = totalLetters * 80 + 700;
      totalDelay = revealDuration + winDuration + 100;
    } else {
      // Wait for reveal only + small pause
      totalDelay = revealDuration + 300;
    }

    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      timerRef.current = null;
    }, totalDelay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isRoundOver,
    isDismissed,
    isVisible,
    round?.status,
    round?.targetWord.totalLetters,
  ]);

  // Escape key closes
  useEffect(() => {
    if (!isVisible) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDismissed(true);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isVisible]);

  if (!isVisible || isDismissed || !round) {
    return null;
  }

  const totalWords = state.normalizedWords.length;
  const playedCount = state.session.playedWordIds.size;
  const isGameComplete = totalWords > 0 && playedCount >= totalWords;
  const isWin = round.status === "won";

  const handleClose = () => {
    setIsDismissed(true);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDismissed(true);
    }
  };

  const handleNextWord = () => {
    setIsDismissed(true);
    dispatch({ type: "NEXT_WORD" });
  };

  const handleStartOver = () => {
    setIsDismissed(true);
    dispatch({ type: "RESET_SESSION" });
  };

  let title: string;
  let body: React.ReactNode;
  let actionLabel: string;
  let actionHandler: () => void;
  let accentClass = "";

  if (isGameComplete) {
    title = "🎉 You finished the game!";
    accentClass = styles.accentComplete;
    actionLabel = "Start Over";
    actionHandler = handleStartOver;
    body = (
      <>
        {isWin ? (
          <p className={styles.bodyText}>
            Solved in <strong>{round.guesses.length}</strong>{" "}
            {round.guesses.length === 1 ? "guess" : "guesses"}.
          </p>
        ) : (
          <p className={styles.bodyText}>
            The answer was{" "}
            <span className={styles.answer}>{round.targetWord.normalized}</span>
            .
          </p>
        )}
        <p className={styles.bodyText}>
          You've played every word in <strong>{state.config?.title}</strong>.
          Nice work!
        </p>
      </>
    );
  } else if (isWin) {
    title = "Correct!";
    accentClass = styles.accentWin;
    actionLabel = "Next Word";
    actionHandler = handleNextWord;
    body = (
      <p className={styles.bodyText}>
        Solved in <strong>{round.guesses.length}</strong>{" "}
        {round.guesses.length === 1 ? "guess" : "guesses"}.
      </p>
    );
  } else {
    title = "You lose!";
    accentClass = styles.accentLoss;
    actionLabel = "Next Word";
    actionHandler = handleNextWord;
    body = (
      <p className={styles.bodyText}>
        The answer was{" "}
        <span className={styles.answer}>{round.targetWord.normalized}</span>.
      </p>
    );
  }

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-title"
    >
      <div className={`${styles.modal} ${accentClass}`}>
        <button
          className={`icon-btn ${styles.closeButton}`}
          onClick={handleClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <h2 id="status-title" className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{body}</div>

        <button
          className={styles.actionButton}
          onClick={actionHandler}
          autoFocus
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
