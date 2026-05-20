import styles from "./TakeawayCard.module.css";

export function TakeawayCard({ text }: { text: string }) {
  return (
    <section className={styles.card} aria-label="今日要点">
      <div className={styles.label}>今日要点</div>
      <p className={styles.text}>{text}</p>
    </section>
  );
}
