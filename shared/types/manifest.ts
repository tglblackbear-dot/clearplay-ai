export type CategoryKey =
  | "nudity" | "sex" | "violence" | "graphic_violence"
  | "language" | "drugs" | "alcohol" | "disturbing";

export interface CutSegment {
  id: string;
  category: CategoryKey;
  start_ms: number;
  end_ms: number;
  confidence: number;
  description?: string;
  source?: string;
  verification_status: "unverified" | "reviewed" | "verified" | "rejected";
}

export interface CutManifest {
  schema_version: "1.0.0";
  content_id: string;
  episode_id: string;
  season_number?: number | null;
  episode_number?: number | null;
  duration_ms: number;
  manifest_version: number;
  confidence: number;
  source?: string;
  status: "draft" | "review" | "verified" | "rejected";
  updated_at?: string;
  segments: CutSegment[];
}

export function validateManifestShape(value: unknown): value is CutManifest {
  if (!value || typeof value !== "object") return false;
  const m = value as Partial<CutManifest>;
  if (m.schema_version !== "1.0.0") return false;
  if (typeof m.content_id !== "string" || !m.content_id) return false;
  if (typeof m.episode_id !== "string" || !m.episode_id) return false;
  if (!m.duration_ms || m.duration_ms < 1) return false;
  if (!m.manifest_version || m.manifest_version < 1) return false;
  if (typeof m.confidence !== "number" || m.confidence < 0 || m.confidence > 1) return false;
  if (!Array.isArray(m.segments)) return false;
  const ids = new Set<string>();
  for (const s of m.segments) {
    if (!s || typeof s.id !== "string" || ids.has(s.id)) return false;
    ids.add(s.id);
    if (!(s.start_ms >= 0 && s.end_ms > s.start_ms && s.end_ms <= m.duration_ms)) return false;
    if (typeof s.confidence !== "number" || s.confidence < 0 || s.confidence > 1) return false;
  }
  return true;
}
