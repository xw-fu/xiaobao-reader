import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const cells: { dateStr: string | null; inMonth: boolean }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ dateStr: null, inMonth: false });
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ dateStr, inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push({ dateStr: null, inMonth: false });

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
      <div className={styles.bar}>
        <div className={styles.title}>{year}年 {month + 1}月</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className={styles.navbtn} onClick={prevMonth}>‹</button>
          <button type="button" className={styles.navbtn} onClick={jumpToday}>今日</button>
          <button type="button" className={styles.navbtn} onClick={nextMonth} disabled={!canGoNext}>›</button>
        </div>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((w) => <div key={w} className={styles.weekday}>{w}</div>)}
      </div>
      <div className={styles.grid}>
        {cells.map((c, i) => {
          if (!c.dateStr) return <div key={i} className={`${styles.cell} ${styles.outside}`} aria-hidden />;
          const dayEntries = byDate.get(c.dateStr) ?? [];
          const has = dayEntries.length > 0;
          const isToday = c.dateStr === todayStr;
          const className = [
            styles.cell,
            has ? styles.has : "",
            isToday ? styles.today : "",
          ].filter(Boolean).join(" ");
          const dayNum = Number(c.dateStr.slice(8));
          const ariaLabel = has
            ? `${year}年${month + 1}月${dayNum}日 · ${dayEntries[0].takeaway.slice(0, 30)}`
            : `${year}年${month + 1}月${dayNum}日`;
          const tooltip = has
            ? `${dayEntries[0].title}\n${dayEntries[0].takeaway}`
            : undefined;
          return has ? (
            <button
              key={i}
              type="button"
              className={className}
              title={tooltip}
              aria-label={ariaLabel}
              onClick={() => navigate(`/r/${c.dateStr}`)}
            >
              {dayNum}
            </button>
          ) : (
            <div key={i} className={className} aria-label={ariaLabel}>{dayNum}</div>
          );
        })}
      </div>
    </div>
  );
}
