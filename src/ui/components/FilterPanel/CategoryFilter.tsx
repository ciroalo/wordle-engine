import type { CategoryIndex } from "@engine/types";
import { useGame } from "../../context/GameContext";
import styles from "./FilterPanel.module.css";

interface CategoryFilterProps {
  category: CategoryIndex;
  selectedValues: Set<string>;
}

export default function CategoryFilter({
  category,
  selectedValues,
}: CategoryFilterProps) {
  const { dispatch } = useGame();

  const handleToggle = (value: string, checked: boolean) => {
    dispatch({
      type: "SET_FILTER",
      category: category.name,
      value,
      selected: checked,
    });
  };

  const handleClear = () => {
    dispatch({ type: "CLEAR_FILTER", category: category.name });
  };

  const hasSelections = selectedValues.size > 0;

  return (
    <div className={styles.category}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryName}>{category.name}</h3>
        {hasSelections && (
          <button className={styles.clearButton} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      <div className={styles.values}>
        {category.values.map((value) => (
          <label key={value} className={styles.valueLabel}>
            <input
              type="checkbox"
              checked={selectedValues.has(value)}
              onChange={(e) => handleToggle(value, e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.valueName}>{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
