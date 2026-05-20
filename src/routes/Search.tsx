import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useManifest } from "../data/ManifestContext";
import styles from "./Search.module.css";

const LABEL = { morning: "早报", evening: "晚报" } as const;

export default function Search() {
  const { status } = useManifest();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    if (status.kind !== "ready") return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return status.manifest.entries;
    return status.manifest.entries.filter(
      (e) =>
        e.title.toLowerCase().includes(needle) ||
        e.takeaway.toLowerCase().includes(needle),
    );
  }, [status, q]);

  if (status.kind !== "ready") return null;

  return (
    <div>
      <input
        type="text"
        className={styles.input}
        placeholder="搜索标题或要点…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {results.length === 0 ? (
        <p className={styles.empty}>没有匹配的报告。</p>
      ) : (
        <div className={styles.list}>
          {results.map((e) => (
            <Link key={e.path} to={`/r/${e.date}/${e.edition}`} className={styles.result}>
              <div className={styles.meta}>{e.date} · {LABEL[e.edition]}</div>
              <div className={styles.title}>{e.title}</div>
              <div className={styles.snippet}>{e.takeaway}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
