import type { ReportItem } from "../types";
import { InlineMarkdown } from "./InlineMarkdown";
import styles from "./ItemCard.module.css";

export function ItemCard({ item }: { item: ReportItem }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
        </h3>
      </div>
      <div className={styles.meta}>
        <span className={styles.source}>{item.source}</span>
        <span className={styles.dot}>·</span>
        <span>{item.dateLabel}</span>
      </div>
      <div className={styles.body}>
        <div className={`${styles.label} ${styles.what}`}>概要</div>
        <p><InlineMarkdown source={item.what} /></p>
        <div className={`${styles.label} ${styles.so}`}>影响</div>
        <p><InlineMarkdown source={item.soWhat} /></p>
      </div>
    </article>
  );
}
