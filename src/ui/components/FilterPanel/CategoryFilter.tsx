import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: string, checked: boolean) => {
    dispatch({
      type: "SET_FILTER",
      category: category.name,
      value,
      selected: checked,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "CLEAR_FILTER", category: category.name });
  };

  const hasSelections = selectedValues.size > 0;

  return (
    <div className={styles.category}>
      <button
        className={styles.categoryHeader}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.categoryHeaderLeft}>
          <span
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          >
            ▸
          </span>
          <span className={styles.categoryName}>{category.name}</span>
          {hasSelections && (
            <span className={styles.selectionCount}>{selectedValues.size}</span>
          )}
        </div>
        {hasSelections && (
          <span
            className={styles.clearButton}
            onClick={handleClear}
            role="button"
            tabIndex={0}
          >
            Clear
          </span>
        )}
      </button>
      {isOpen && (
        <div className={styles.values}>
          {category.values.map((value) => {
            const isChecked = selectedValues.has(value);
            return (
              <label
                key={value}
                className={`${styles.valueLabel} ${isChecked ? styles.valueLabelChecked : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleToggle(value, e.target.checked)}
                  className={styles.hiddenCheckbox}
                />
                <span className={styles.valueName}>{value}</span>
                <span className={styles.customCheckbox}>
                  {isChecked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.checkIcon}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
