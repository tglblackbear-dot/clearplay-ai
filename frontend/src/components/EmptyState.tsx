export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty">
      <strong style={{ display: "block", color: "#F5F7FC", marginBottom: 6 }}>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
