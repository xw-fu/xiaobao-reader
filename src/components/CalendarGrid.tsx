import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ManifestEntry } from "../types";
import styles from "./CalendarGrid.module.css";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

interface Props { entries: ManifestEntry[] }

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function firstOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function CalendarGrid({ entries }: Props) {
  const navigate = useNavigate();
  const byDate = useMemo(() => {
    const map = new Map<string, ManifestEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [entries]);

  const newestDate = entries.length > 0 ? entries[0].date : ymd(new Date());
  const [year, setYear] = useState(() => Number(newestDate.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(newestDate.slice(5, 7)) - 1); // 0-indexed

  const todayStr = ymd(new Date());
  const newestY = Number(newestDate.slice(0, 4));
  const newestM = Number(newestDate.slice(5, 7)) - 1;
  const canGoNext = year < newestY || (year === newestY && month < newestM);

  const first = firstOfMonth(year, month);
  const offset = first.getDay();
  const total = daysInMonth(year, month);
  const cells: { dateStr: string | null }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ dateStr: null });
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ dateStr });
  }
  while (cells.length % 7 !== 0) cells.push({ dateStr: null });

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
  }
  function nextMonth() {
    if (!canGoNext) return;
    if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
  }
  function jumpToday() {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <Link to="/" className={styles.back}>← 返回今日</Link>
          <div className={styles.kicker}>归档 · Archive</div>
          <h1 className={styles.title}>{year}年 {month + 1}月</h1>
          <div className={styles.sub}>共 {entries.length} 期 · 点击任意一天回看当日精选</div>
        </div>
        <div className={styles.nav}>
          <button type="button" className={`${styles.navbtn} ${styles.sq}`} onClick={prevMonth} aria-label="上个月">‹</button>
          <button type="button" className={styles.navbtn} onClick={jumpToday}>今日</button>
          <button type="button" className={`${styles.navbtn} ${styles.sq}`} onClick={nextMonth} disabled={!canGoNext} aria-label="下个月">›</button>
        </div>
      </div>

      <div className={styles.cal}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((w) => <div key={w} className={styles.weekday}>{w}</div>)}
        </div>
        <div className={styles.grid}>
          {cells.map((c, i) => {
            if (!c.dateStr) return <div key={i} className={`${styles.cell} ${styles.outside}`} aria-hidden />;
            const dayEntries = byDate.get(c.dateStr) ?? [];
            const has = dayEntries.length > 0;
            const isToday = c.dateStr === todayStr;
            const dayNum = Number(c.dateStr.slice(8));
            const className = [
              styles.cell,
              has ? styles.has : styles.empty,
              isToday ? styles.today : "",
            ].filter(Boolean).join(" ");

            if (!has) {
              return (
                <div key={i} className={className} aria-label={`${year}年${month + 1}月${dayNum}日`}>
                  <span className={styles.daynum}>{dayNum}</span>
                </div>
              );
            }

            const hasMorning = dayEntries.some((e) => e.edition === "morning");
            const hasEvening = dayEntries.some((e) => e.edition === "evening");
            const lead = dayEntries.find((e) => e.edition === "morning") ?? dayEntries[0];
            const ariaLabel = `${year}年${month + 1}月${dayNum}日 · ${lead.takeaway.slice(0, 30)}`;
            const tooltip = `${lead.title}\n${lead.takeaway}`;

            return (
              <button
                key={i}
                type="button"
                className={className}
                title={tooltip}
                aria-label={ariaLabel}
                onClick={() => navigate(`/r/${c.dateStr}`)}
              >
                <span className={styles.daynum}>{dayNum}</span>
                {isToday && <span className={styles.todayPill}>今日</span>}
                <span className={styles.dots}>
                  {hasMorning && <span className={`${styles.dot} ${styles.dotMorning}`} />}
                  {hasEvening && <span className={`${styles.dot} ${styles.dotEvening}`} />}
                </span>
                <span className={styles.snip}>{lead.takeaway}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotMorning} ${styles.dotLg}`} /> 早报</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotEvening} ${styles.dotLg}`} /> 晚报</span>
        <span className={styles.legendItem}><span className={styles.legendToday} /> 今日</span>
      </div>
    </div>
  );
}
