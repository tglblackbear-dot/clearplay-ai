import { EmptyState } from "../components/EmptyState";

export function SettingsPage() {
  return (
    <>
      <span className="eyebrow">CONFIGURAÇÕES</span>
      <h1>Configurações</h1>
      <p className="subtitle">Reprodução, filtragem, sincronização, privacidade e extensão.</p>
      <section className="card">
        <EmptyState title="Configurações serão exibidas aqui" description="As opções aparecerão quando a persistência de preferências estiver implementada." />
      </section>
    </>
  );
}
