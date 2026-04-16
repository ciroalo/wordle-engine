import { useGame } from "../../context/GameContext";
import styles from "./StatusMessage.module.css";

export default function StatusMessage() {
  const { state } = useGame();

  if (!state.round) {
    return null;
  }

  const { status, targetWord } = state.round;

  if (status === "won") {
    return <div className={`${styles.message} ${styles.won}`}>Correct!</div>;
  }

  if (status === "lost") {
    return (
      <div className={`${styles.message} ${styles.lost}`}>
        <span>The answer was</span>
        <strong className={styles.answer}>{targetWord.normalized}</strong>
      </div>
    );
  }

  return null;
}
