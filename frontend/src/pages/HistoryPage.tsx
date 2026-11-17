import { EmptyState } from "../components/EmptyState";

export function HistoryPage() {
  return (
    <>
      <span className="eyebrow">HISTÓRICO</span>
      <h1>Histórico de filtragem</h1>
      <p className="subtitle">Obras identificadas, categorias e tempo economizado.</p>
      <section className="card">
        <EmptyState title="Histórico vazio" description="Nenhuma sessão registrada neste dispositivo." />
      </section>
    </>
  );
}
