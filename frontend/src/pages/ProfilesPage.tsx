import { EmptyState } from "../components/EmptyState";

export function ProfilesPage() {
  return (
    <>
      <span className="eyebrow">PERSONALIZAÇÃO</span>
      <h1>Perfis de filtragem</h1>
      <p className="subtitle">Cada perfil terá categorias e intensidade independentes.</p>
      <section className="card">
        <EmptyState title="Nenhum perfil criado" description="A criação de perfis será habilitada após a autenticação e o banco estarem conectados." />
      </section>
    </>
  );
}
