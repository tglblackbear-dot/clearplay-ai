export const CATEGORIES = [
  { key: "nudity", label: "Nudez", color: "#f472b6" },
  { key: "sex", label: "Conteúdo sexual", color: "#fb7185" },
  { key: "violence", label: "Violência", color: "#fb923c" },
  { key: "graphic_violence", label: "Violência gráfica", color: "#ef4444" },
  { key: "language", label: "Linguagem imprópria", color: "#facc15" },
  { key: "drugs", label: "Drogas", color: "#a78bfa" },
  { key: "alcohol", label: "Álcool", color: "#60a5fa" },
  { key: "disturbing", label: "Conteúdo perturbador", color: "#94a3b8" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const FILTER_MODES = {
  off: "Não filtrar",
  partial: "Filtrar parcialmente",
  full: "Filtrar tudo identificado",
} as const;

export type FilterMode = keyof typeof FILTER_MODES;
