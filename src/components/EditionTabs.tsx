import type { Edition } from "../types";
import styles from "./EditionTabs.module.css";

interface Props {
  available: Edition[];
  active: Edition;
  onChange: (e: Edition) => void;
}

const LABEL: Record<Edition, string> = { morning: "早报", evening: "晚报" };

export function EditionTabs({ available, active, onChange }: Props) {
  if (available.length <= 1) return null;
  return (
    <div className={styles.tabs} role="tablist">
      {available.map((e) => (
        <button
          key={e}
          type="button"
          role="tab"
          aria-selected={active === e}
          className={`${styles.tab} ${active === e ? styles.active : ""}`}
          onClick={() => onChange(e)}
        >
          {LABEL[e]}
        </button>
      ))}
    </div>
  );
}
