import { useState } from "react";
import type { CategoryIndex } from "@engine/types";
import { useGame } from "../../context/GameContext";
import { ChevIcon, CheckIcon } from "../Icons";
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
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = (value: string) => {
    const isSelected = selectedValues.has(value);
    dispatch({
      type: "SET_FILTER",
      category: category.name,
      value,
      selected: !isSelected,
    });
  };

  const activeCount = selectedValues.size;
  const hasSelections = activeCount > 0;

  return (
    <div
      className={styles.category}
      data-open={isOpen}
      data-active={hasSelections}
    >
      <button
        className={styles.categoryHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevIcon className={styles.chevron} />
        <span className={styles.categoryName}>{category.name}</span>
        <span className={styles.categoryCount}>
          {hasSelections ? activeCount : category.values.length}
        </span>
      </button>
      <div className={styles.categoryBody}>
        <div>
          <div className={styles.options}>
            {category.values.map((value) => {
              const checked = selectedValues.has(value);
              return (
                <label key={value} className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(value)}
                    className={styles.hiddenCheckbox}
                  />
                  <span className={styles.checkBox}>
                    <CheckIcon />
                  </span>
                  <span className={styles.checkLabel}>{value}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
