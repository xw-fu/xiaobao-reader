import { useManifest } from "../data/ManifestContext";
import styles from "./Footer.module.css";

export function Footer() {
  const { status } = useManifest();
  const generatedAt =
    status.kind === "ready" ? new Date(status.manifest.generatedAt).toLocaleString("zh-CN") : "—";
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>清单生成时间：{generatedAt}</div>
    </footer>
  );
}
