import { useManifest } from "../data/ManifestContext";
import { CalendarGrid } from "../components/CalendarGrid";

export default function Calendar() {
  const { status } = useManifest();
  if (status.kind !== "ready") return null;
  return <CalendarGrid entries={status.manifest.entries} />;
}
