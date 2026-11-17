export type CategoryKey =
  | "nudity" | "sex" | "violence" | "graphic_violence"
  | "language" | "drugs" | "alcohol" | "disturbing";

export interface CutSegment {
  id: string;
  category: CategoryKey;
  start_ms: number;
  end_ms: number;
  confidence: number;
  verification_status: string;
}

export interface CutManifest {
  schema_version: string;
  episode_id: string;
  duration_ms: number;
  manifest_version: number;
  status: string;
  segments: CutSegment[];
}

export type FilterMode = "off" | "partial" | "full";

export function findActiveSegment(
  manifest: CutManifest,
  timeMs: number,
  categories: Set<CategoryKey>,
  mode: FilterMode,
): CutSegment | null {
  if (mode === "off" || manifest.status !== "verified") return null;
  return manifest.segments.find((segment) => {
    if (!categories.has(segment.category)) return false;
    if (mode === "partial" && segment.confidence < 0.8) return false;
    return timeMs >= segment.start_ms && timeMs < segment.end_ms;
  }) ?? null;
}

export function applyOffset(manifest: CutManifest, offsetMs: number): CutManifest {
  return {
    ...manifest,
    segments: manifest.segments.map((segment) => ({
      ...segment,
      start_ms: Math.max(0, segment.start_ms + offsetMs),
      end_ms: segment.end_ms + offsetMs,
    })),
  };
}

export function estimateSync(localDuration: number, manifestDuration: number): { offsetMs: number; confidence: number } {
  if (!localDuration || !manifestDuration) return { offsetMs: 0, confidence: 0 };
  const delta = Math.abs(localDuration - manifestDuration);
  const confidence = Math.max(0, 1 - delta / Math.max(localDuration, manifestDuration));
  return { offsetMs: 0, confidence: Math.round(confidence * 100) / 100 };
}
