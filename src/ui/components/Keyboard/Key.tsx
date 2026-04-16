import type { KeyState } from "@engine/types";
import styles from "./Keyboard.module.css";

interface KeyProps {
  label: string;
  state: KeyState;
  isWide?: boolean;
  onClick: () => void;
}

export default function Key({
  label,
  state,
  isWide = false,
  onClick,
}: KeyProps) {
  const classes = [
    styles.key,
    state !== "unknown" ? styles[state] : "",
    isWide ? styles.wide : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} onClick={onClick} aria-label={label}>
      {label}
    </button>
  );
}
