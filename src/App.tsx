import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useManifest } from "./data/ManifestContext";

export default function App() {
  const { status, retry } = useManifest();
  return (
    <>
      <Header />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 0" }}>
        {status.kind === "loading" && <p>加载中…</p>}
        {status.kind === "error" && (
          <div role="alert">
            <p>无法加载清单：{status.message}</p>
            <button type="button" onClick={retry}>重试</button>
          </div>
        )}
        {status.kind === "ready" && <Outlet />}
      </main>
      <Footer />
    </>
  );
}
