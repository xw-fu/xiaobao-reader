import { useMemo, useState } from "react";
import type { Edition, Report } from "../types";
import { TakeawayCard } from "./TakeawayCard";
import { EditionTabs } from "./EditionTabs";
import { SourceFilter } from "./SourceFilter";
import { ItemCard } from "./ItemCard";
import { FunnelPanel } from "./FunnelPanel";
import styles from "./ReportView.module.css";

interface Props {
  report: Report;
  availableEditions: Edition[];
  onEditionChange: (e: Edition) => void;
}

const EDITION_LABEL: Record<Edition, string> = { morning: "早报", evening: "晚报", health: "午报" };

export function ReportView({ report, availableEditions, onEditionChange }: Props) {
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const allSources = useMemo(() => {
    const s = new Set<string>();
    for (const sec of report.sections) for (const it of sec.items) s.add(it.source);
    return Array.from(s).sort();
  }, [report]);

  return (
    <article>
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.chip}>{EDITION_LABEL[report.meta.edition]}</span>
          <span>{report.meta.date}</span>
        </div>
        <h1 className={styles.title}>{report.meta.title}</h1>
      </header>

      <EditionTabs
        available={availableEditions}
        active={report.meta.edition}
        onChange={onEditionChange}
      />

      <TakeawayCard text={report.takeaway} />

      <SourceFilter
        sources={allSources}
        active={activeSource}
        onChange={setActiveSource}
      />

      {report.sections.map((section) => {
        const items = activeSource
          ? section.items.filter((i) => i.source === activeSource)
          : section.items;
        return (
          <section key={section.title} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <div className={styles.sectionRule} aria-hidden />
              <span className={styles.sectionCount}>{items.length} 条</span>
            </div>
            {items.map((item, i) => <ItemCard key={`${item.url}-${i}`} item={item} />)}
          </section>
        );
      })}

      <FunnelPanel funnel={report.funnel} />

      <div className={styles.footerStrip} role="contentinfo">
        <span>模型：<span className={styles.val}>{report.footer.model}</span></span>
        <span className={styles.divider} aria-hidden />
        <span>条目：<span className={styles.val}>{report.footer.itemCount}</span></span>
        <span className={styles.divider} aria-hidden />
        <span>治理：<span className={styles.val}>{report.footer.governanceFiltered}</span></span>
        <span className={styles.divider} aria-hidden />
        <span>AI：<span className={styles.val}>{report.footer.enrichmentAi}</span></span>
        <span className={styles.divider} aria-hidden />
        <span>规则：<span className={styles.val}>{report.footer.enrichmentDeterministic}</span></span>
        <span className={styles.divider} aria-hidden />
        <time dateTime={report.footer.generatedAt}>
          生成：{new Date(report.footer.generatedAt).toLocaleString("zh-CN")}
        </time>
      </div>
    </article>
  );
}
