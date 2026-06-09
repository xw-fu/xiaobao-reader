import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>晓报</span>
        <span className={styles.tag}>每日为你精选 · 值得读的那几条</span>
      </div>
    </footer>
  );
}
