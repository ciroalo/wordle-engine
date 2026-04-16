import { useGame } from "../../context/GameContext";
import { getAvailableWords } from "@engine/filtering";
import CategoryFilter from "./CategoryFilter";
import styles from "./FilterPanel.module.css";

export default function FilterPanel() {
  const { state, dispatch } = useGame();

  // derive available word count from current state
  const availableWords = getAvailableWords(
    state.normalizedWords,
    state.session.activeFilters,
    state.session.playedWordIds,
  );

  const availableCount = availableWords.length;
  const isDisabled = availableCount === 0;

  const handleNextWord = () => {
    dispatch({ type: "NEXT_WORD" });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        {state.categoryIndex.map((category) => (
          <CategoryFilter
            key={category.name}
            category={category}
            selectedValues={
              state.session.activeFilters[category.name] ?? new Set()
            }
          />
        ))}
      </div>

      <div className={styles.controls}>
        <p className={styles.wordCount}>
          {isDisabled
            ? "No words available"
            : `${availableCount} words available`}
        </p>
        <button
          className={styles.nextWordButton}
          onClick={handleNextWord}
          disabled={isDisabled}
        >
          Next Word
        </button>
      </div>
    </div>
  );
}
