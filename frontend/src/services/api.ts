const base = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function fetchHealth(): Promise<{ status: string; env: string }> {
  const response = await fetch(`${base}/health`);
  if (!response.ok) throw new Error(`API indisponível (${response.status})`);
  return response.json();
}
