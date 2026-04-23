import { useGame } from "../../context/GameContext";
import { getAvailableWords } from "@engine/filtering";
import { DiceIcon } from "../Icons";
import CategoryFilter from "./CategoryFilter";
import styles from "./FilterPanel.module.css";

export default function FilterPanel() {
  const { state, dispatch } = useGame();

  const availableWords = getAvailableWords(
    state.normalizedWords,
    state.session.activeFilters,
    state.session.playedWordIds,
  );

  const availableCount = availableWords.length;
  const isDisabled = availableCount === 0;
  const anySelected = state.categoryIndex.some(
    (cat) => (state.session.activeFilters[cat.name]?.size ?? 0) > 0,
  );

  const handleNextWord = () => {
    dispatch({ type: "NEXT_WORD" });
  };

  const handleClearAll = () => {
    for (const cat of state.categoryIndex) {
      dispatch({ type: "CLEAR_FILTER", category: cat.name });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Filters</h3>
        <button
          className={styles.clearAll}
          onClick={handleClearAll}
          disabled={!anySelected}
        >
          Clear all
        </button>
      </div>

      <div className={styles.filterList}>
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

      <div className={styles.footer}>
        <div className={styles.wordCount}>
          <span className={styles.wordCountNumber}>{availableCount}</span>{" "}
          {availableCount === 1 ? "word" : "words"} available
        </div>
        <button
          className={styles.nextButton}
          onClick={handleNextWord}
          disabled={isDisabled}
        >
          <DiceIcon />
          Next Word
        </button>
      </div>
    </div>
  );
}
