import type { ReportFunnel } from "../types";
import styles from "./FunnelPanel.module.css";

export function FunnelPanel({ funnel }: { funnel: ReportFunnel }) {
  return (
    <section className={styles.section} aria-label="数据漏斗">
      <div className={styles.title}>数据漏斗 · Funnel</div>
      <div className={styles.stages}>
        <div className={styles.collected} style={{ flex: funnel.collected || 0.0001 }} />
        <div className={styles.rejected}  style={{ flex: funnel.rejected || 0.0001 }} />
        <div className={styles.dedup}     style={{ flex: funnel.dedup || 0.0001 }} />
        <div className={styles.governed}  style={{ flex: funnel.governed || 0.0001 }} />
        <div className={styles.final}     style={{ flex: funnel.final || 0.0001 }} />
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.collected}`} />收集 {funnel.collected}</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.rejected}`} />过滤 {funnel.rejected}</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dedup}`} />去重 {funnel.dedup}</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.governed}`} />治理 {funnel.governed}</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.final}`} />最终 {funnel.final}</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>数据源</th><th>收集</th><th>过滤</th><th>治理</th><th>最终</th>
          </tr>
        </thead>
        <tbody>
          {funnel.buckets.map((b) => (
            <tr key={b.name}>
              <td className={styles.bucketName}>{b.name}</td>
              <td>{b.collected}</td>
              <td>{b.rejected}</td>
              <td>{b.governed}</td>
              <td>{b.final}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
