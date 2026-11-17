const base = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface AnalysisResult {
  cues_parsed: number;
  candidates: Array<{
    category: string;
    start_ms: number;
    end_ms: number;
    confidence: number;
    description: string;
    source: string;
    signals: number;
  }>;
  manifest: {
    schema_version: string;
    content_id: string;
    episode_id: string;
    duration_ms: number;
    manifest_version: number;
    confidence: number;
    status: string;
    segments: Array<{
      id: string;
      category: string;
      start_ms: number;
      end_ms: number;
      confidence: number;
      description?: string;
      verification_status: string;
    }>;
  };
}

export async function analyzeVideo(input: {
  video: File;
  subtitle?: File;
  duration_ms: number;
  content_id: string;
  episode_id: string;
}): Promise<AnalysisResult & { frames_analyzed: number; scene_cuts: number }> {
  const form = new FormData();
  form.append("video", input.video);
  if (input.subtitle) form.append("subtitle", input.subtitle);
  form.append("duration_ms", String(input.duration_ms));
  form.append("content_id", input.content_id);
  form.append("episode_id", input.episode_id);
  const response = await fetch(`${base}/api/v1/analysis/video`, { method: "POST", body: form });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`A análise de vídeo falhou (${response.status}): ${detail}`);
  }
  return response.json();
}

export async function analyzeSubtitles(input: {
  raw_subtitle: string;
  duration_ms: number;
  content_id: string;
  episode_id: string;
}): Promise<AnalysisResult> {
  const response = await fetch(`${base}/api/v1/analysis/subtitles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`A análise falhou (${response.status}): ${detail}`);
  }
  return response.json();
}
