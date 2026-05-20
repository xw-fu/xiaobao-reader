import styles from "./SourceFilter.module.css";

interface Props {
  sources: string[];
  active: string | null;          // null = all
  onChange: (s: string | null) => void;
}

export function SourceFilter({ sources, active, onChange }: Props) {
  if (sources.length === 0) return null;
  return (
    <div className={styles.row} role="group" aria-label="按来源筛选">
      <button
        type="button"
        className={`${styles.chip} ${active === null ? styles.active : ""}`}
        onClick={() => onChange(null)}
      >
        全部
      </button>
      {sources.map((s) => (
        <button
          key={s}
          type="button"
          className={`${styles.chip} ${active === s ? styles.active : ""}`}
          onClick={() => onChange(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
