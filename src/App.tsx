import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useManifest } from "./data/ManifestContext";
import styles from "./App.module.css";

export default function App() {
  const { status, retry } = useManifest();
  return (
    <>
      <Header />
      <main className={styles.main}>
        {status.kind === "loading" && (
          <div className={styles.status}>
            <p>加载中…</p>
          </div>
        )}
        {status.kind === "error" && (
          <div className={styles.status} role="alert">
            <p>无法加载清单：{status.message}</p>
            <button type="button" onClick={retry}>
              重试
            </button>
          </div>
        )}
        {status.kind === "ready" && <Outlet />}
      </main>
      <Footer />
    </>
  );
}
