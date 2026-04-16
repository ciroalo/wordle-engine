import { useState } from 'react';
import type { CategoryIndex } from '@engine/types';
import { useGame } from '../../context/GameContext';
import styles from './FilterPanel.module.css';

interface CategoryFilterProps {
  category: CategoryIndex;
  selectedValues: Set<string>;
}

export default function CategoryFilter({ category, selectedValues }: CategoryFilterProps) {
  const { dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: string, checked: boolean) => {
    dispatch({
      type: 'SET_FILTER',
      category: category.name,
      value,
      selected: checked,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLEAR_FILTER', category: category.name });
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
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
            ▸
          </span>
          <span className={styles.categoryName}>{category.name}</span>
          {hasSelections && (
            <span className={styles.selectionCount}>{selectedValues.size}</span>
          )}
        </div>
        {hasSelections && (
          <span className={styles.clearButton} onClick={handleClear} role="button" tabIndex={0}>
            Clear
          </span>
        )}
      </button>
      {isOpen && (
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
      )}
    </div>
  );
}