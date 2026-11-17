import { EmptyState } from "../components/EmptyState";

export function PlaybackPage() {
  return (
    <>
      <span className="eyebrow">REPRODUÇÃO</span>
      <h1>Sessão de reprodução</h1>
      <p className="subtitle">Estado real da obra, análise e sincronização.</p>
      <section className="card">
        <EmptyState title="Nenhuma reprodução detectada" description="Quando a extensão identificar um player compatível, o status aparecerá aqui." />
      </section>
    </>
  );
}
