import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "../services/api";
import { EmptyState } from "../components/EmptyState";

export function DashboardPage() {
  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth });
  const apiOk = health.data?.status === "ok";
  return (
    <>
      <span className="eyebrow">SEU ESPAÇO DE TRABALHO</span>
      <h1>Bem-vindo ao ClearPlay AI</h1>
      <p className="subtitle">Assista ao que você ama. Do seu jeito.</p>
      <div className="grid grid-stats">
        <div className="card"><div className="label">Backend</div><div className="value" style={{ fontSize: 15 }}>{health.isLoading ? "Verificando…" : <span className={`badge ${apiOk ? "ok" : "error"}`}>{apiOk ? "Online" : "Offline"}</span>}</div></div>
        <div className="card"><div className="label">Extensão</div><div className="value" style={{ fontSize: 15 }}><span className="badge error">Não instalada</span></div><a className="muted" style={{ display: "inline-block", marginTop: 8, color: "#80A8FF" }} href="https://github.com/tglblackbear-dot/clearplay-ai/blob/main/docs/user-guide.md" target="_blank" rel="noreferrer">Como instalar →</a></div>
        <div className="card"><div className="label">Conteúdo identificado</div><div className="value">—</div></div>
        <div className="card"><div className="label">Cenas filtradas</div><div className="value">—</div></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <section className="card">
          <h2>Últimos conteúdos analisados</h2>
          <EmptyState title="Nenhum conteúdo analisado" description="A análise aparecerá aqui após a extensão identificar uma obra compatível." />
        </section>
        <section className="card">
          <h2>Perfis ativos</h2>
          <EmptyState title="Nenhum perfil criado" description="Crie um perfil de filtragem para começar." />
        </section>
      </div>
    </>
  );
}
