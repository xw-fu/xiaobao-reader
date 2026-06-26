import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useManifest } from "../data/ManifestContext";
import { loadReport, ReportNotFoundError } from "../data/report";
import { ReportParseError } from "../types";
import type { Edition, ManifestEntry, Report as ReportT } from "../types";
import { ReportView } from "../components/ReportView";
import styles from "./Report.module.css";

function pickEntries(entries: ManifestEntry[], date: string): ManifestEntry[] {
  return entries.filter((e) => e.date === date);
}

const EDITION_PRIORITY: Record<Edition, number> = { morning: 0, evening: 1, health: 2 };

function pickActive(entriesForDate: ManifestEntry[], requested?: string): ManifestEntry | null {
  if (entriesForDate.length === 0) return null;
  if (requested === "morning" || requested === "evening" || requested === "health") {
    const found = entriesForDate.find((e) => e.edition === requested);
    if (found) return found;
  }
  // Default landing for a day: prefer morning, then any other edition in priority order.
  return [...entriesForDate].sort(
    (a, b) => EDITION_PRIORITY[a.edition] - EDITION_PRIORITY[b.edition],
  )[0];
}

type State =
  | { kind: "loading" }
  | { kind: "ready"; report: ReportT }
  | { kind: "notfound" }
  | { kind: "error"; message: string };

export default function Report() {
  const { date = "", edition } = useParams();
  const { status } = useManifest();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });

  const entriesForDate = useMemo(
    () => (status.kind === "ready" ? pickEntries(status.manifest.entries, date) : []),
    [status, date],
  );
  const active = useMemo(() => pickActive(entriesForDate, edition), [entriesForDate, edition]);
  const availableEditions: Edition[] = useMemo(
    () =>
      [...entriesForDate.map((e) => e.edition)].sort(
        (a, b) => EDITION_PRIORITY[a] - EDITION_PRIORITY[b],
      ),
    [entriesForDate],
  );

  useEffect(() => {
    if (status.kind !== "ready") return;
    if (!active) { setState({ kind: "notfound" }); return; }
    let cancelled = false;
    setState({ kind: "loading" });
    loadReport(active.path)
      .then((r) => { if (!cancelled) setState({ kind: "ready", report: r }); })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ReportNotFoundError) setState({ kind: "notfound" });
        else if (err instanceof ReportParseError) setState({ kind: "error", message: err.message });
        else setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => { cancelled = true; };
  }, [status, active]);

  if (status.kind !== "ready") return null;

  if (state.kind === "loading") return <div className={styles.alert}><p>加载报告中…</p></div>;
  if (state.kind === "notfound") {
    return (
      <div className={styles.alert} role="alert">
        <p>找不到这份报告。</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className={styles.alert} role="alert">
        <p>读取报告时发生错误：{state.message}</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>← 返回首页</Link>
      <ReportView
        report={state.report}
        availableEditions={availableEditions}
        onEditionChange={(e) => navigate(`/r/${date}/${e}`)}
      />
    </div>
  );
}
