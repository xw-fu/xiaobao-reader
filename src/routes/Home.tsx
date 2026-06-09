import { Link } from "react-router-dom";
import { useManifest } from "../data/ManifestContext";
import type { ManifestEntry } from "../types";
import styles from "./Home.module.css";

const EDITION_LABEL = { morning: "早报", evening: "晚报" } as const;
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fullDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  return `${y}年${m}月${d}日 星期${WEEKDAYS[wd]}`;
}

function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}月${d}日`;
}

function reportPath(e: ManifestEntry): string {
  return `/r/${e.date}/${e.edition}`;
}

export default function Home() {
  const { status } = useManifest();
  if (status.kind !== "ready") return null;

  const entries = status.manifest.entries;
  if (entries.length === 0) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>还没有任何报告。</p>
      </div>
    );
  }

  const latest = entries[0];
  const recent = entries.slice(1, 9);
  const isToday = latest.date === ymd(new Date());

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.chip}>{isToday ? "今日" : "最新"}</span>
          <span>
            {EDITION_LABEL[latest.edition]} · {fullDate(latest.date)}
          </span>
        </div>
        <h1 className={styles.headline}>{latest.takeaway}</h1>
        <div className={styles.meta}>
          {isToday ? "今日" : "本期"}精选 <b>{latest.sourceCount}</b> 篇
        </div>
        <Link to={reportPath(latest)} className={styles.cta}>
          {isToday ? "阅读今日" : "阅读本期"} <span className={styles.arrow}>→</span>
        </Link>
      </section>

      <hr className={styles.rule} />

      <div className={styles.sectionLabel}>近期 · Recent Editions</div>
      <ul className={styles.list}>
        {recent.map((e) => (
          <li key={e.path} className={styles.row}>
            <Link to={reportPath(e)} className={styles.rowLink}>
              <span className={styles.rowDate}>{shortDate(e.date)}</span>
              <span className={styles.rowMain}>
                <span
                  className={`${styles.kicker} ${
                    e.edition === "morning" ? styles.kMorning : styles.kEvening
                  }`}
                >
                  {EDITION_LABEL[e.edition]}
                </span>
                <span className={styles.rowTitle}>{e.takeaway}</span>
              </span>
              <span className={styles.rowCount}>{e.sourceCount} 篇</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className={styles.archive}>
        <div>
          <h3 className={styles.archiveTitle}>按日期回看</h3>
          <p className={styles.archiveText}>
            需要找某一天的内容？打开归档日历，浏览全部 {entries.length} 期。
          </p>
        </div>
        <Link to="/calendar" className={styles.ghost}>
          打开日历 →
        </Link>
      </section>
    </div>
  );
}
