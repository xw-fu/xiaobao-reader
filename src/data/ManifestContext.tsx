import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Manifest } from "../types";
import { loadManifest, ManifestLoadError } from "./manifest";

type Status =
  | { kind: "loading" }
  | { kind: "ready"; manifest: Manifest }
  | { kind: "error"; message: string };

interface ContextValue {
  status: Status;
  retry: () => void;
}

const ManifestContext = createContext<ContextValue | null>(null);

export function ManifestProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus({ kind: "loading" });
    loadManifest()
      .then((m) => { if (!cancelled) setStatus({ kind: "ready", manifest: m }); })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof ManifestLoadError ? err.message : String(err);
        setStatus({ kind: "error", message });
      });
    return () => { cancelled = true; };
  }, [nonce]);

  return (
    <ManifestContext.Provider value={{ status, retry: () => setNonce((n) => n + 1) }}>
      {children}
    </ManifestContext.Provider>
  );
}

export function useManifest(): ContextValue {
  const ctx = useContext(ManifestContext);
  if (!ctx) throw new Error("useManifest must be used inside <ManifestProvider>");
  return ctx;
}
