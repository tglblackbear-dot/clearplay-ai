import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { analyzeSubtitles, type AnalysisResult } from "../services/analysis";
import { formatClock } from "../utils/format";
import { EmptyState } from "../components/EmptyState";

const categoryLabels: Record<string, string> = {
  nudity: "Nudez", sex: "Conteúdo sexual", violence: "Violência",
  graphic_violence: "Violência gráfica", language: "Linguagem imprópria",
  drugs: "Drogas", alcohol: "Álcool", disturbing: "Conteúdo perturbador",
};

export function AnalysisPage() {
  const [contentId, setContentId] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [duration, setDuration] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const analysis = useMutation({
    mutationFn: () => analyzeSubtitles({
      raw_subtitle: subtitle,
      duration_ms: Number(duration) * 1000,
      content_id: contentId.trim(),
      episode_id: episodeId.trim(),
    }),
    onSuccess: () => setError(""),
    onError: (err: Error) => setError(err.message),
  });

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setSubtitle(await file.text());
  }

  const ready = Boolean(subtitle.trim() && contentId.trim() && episodeId.trim() && Number(duration) > 0);
  const result: AnalysisResult | undefined = analysis.data;

  return (
    <>
      <span className="eyebrow">ANÁLISE DE LEGENDAS · FASE 2</span>
      <h1>Gerador de mapas</h1>
      <p className="subtitle">O mapa é gerado somente com timestamps reais extraídos da legenda.</p>

      <div className="grid" style={{ gridTemplateColumns: "minmax(320px, 420px) 1fr" }}>
        <section className="card">
          <h2>Nova análise</h2>
          <div className="field">
            <label>ID da obra</label>
            <input value={contentId} onChange={(e) => setContentId(e.target.value)} placeholder="content_123" />
          </div>
          <div className="field">
            <label>ID do episódio</label>
            <input value={episodeId} onChange={(e) => setEpisodeId(e.target.value)} placeholder="episode_456" />
          </div>
          <div className="field">
            <label>Duração (segundos)</label>
            <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3600" />
          </div>
          <div className="field">
            <label>Arquivo SRT / VTT</label>
            <input type="file" accept=".srt,.vtt,text/plain" onChange={(e) => void onFile(e.target.files?.[0])} />
            {fileName && <span className="muted">Arquivo: {fileName}</span>}
          </div>
          <button className="btn" disabled={!ready || analysis.isPending} onClick={() => analysis.mutate()}>
            {analysis.isPending ? "Analisando…" : "Gerar mapa"}
          </button>
          {error && <p className="badge error" style={{ marginTop: 12 }}>{error}</p>}
        </section>

        <section className="card">
          <h2>Resultado</h2>
          {!result ? (
            <EmptyState title="Nenhum mapa gerado" description="Carregue uma legenda e informe os dados da obra para gerar um rascunho validado." />
          ) : (
            <>
              <div className="row" style={{ marginBottom: 14 }}>
                <span className="muted">{result.cues_parsed} blocos lidos · {result.manifest.segments.length} segmentos</span>
                <span className="badge ok">Confiança {(result.manifest.confidence * 100).toFixed(0)}%</span>
              </div>
              {result.manifest.segments.length === 0 ? (
                <EmptyState title="Nenhum intervalo candidato" description="A análise não encontrou sinais suficientes. Nenhum tempo foi inventado." />
              ) : (
                <div className="grid">
                  {result.manifest.segments.map((segment) => (
                    <div className="row" key={segment.id} style={{ borderBottom: "1px solid #1F2A44", paddingBottom: 10 }}>
                      <div>
                        <strong>{categoryLabels[segment.category] ?? segment.category}</strong>
                        <div className="muted">{segment.description}</div>
                      </div>
                      <span className="badge ok">{formatClock(segment.start_ms / 1000)} → {formatClock(segment.end_ms / 1000)}</span>
                    </div>
                  ))}
                </div>
              )}
              <details style={{ marginTop: 16 }}>
                <summary className="muted">Ver JSON do mapa</summary>
                <pre style={{ overflow: "auto", fontSize: 11, color: "#A6B1C5" }}>{JSON.stringify(result.manifest, null, 2)}</pre>
              </details>
            </>
          )}
        </section>
      </div>
    </>
  );
}
