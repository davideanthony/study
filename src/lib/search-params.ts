export type NoteSort = "recent" | "downloads" | "likes";

export type SearchFilters = {
  q?: string;
  universita?: string;
  corso?: string;
  anno?: string;
  semestre?: string;
  facolta?: string;
  tag?: string;
  sort?: NoteSort;
  page?: string;
};

const SORTS: NoteSort[] = ["recent", "downloads", "likes"];

export function parseSort(raw: string | undefined): NoteSort {
  if (raw && SORTS.includes(raw as NoteSort)) return raw as NoteSort;
  return "recent";
}

export function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export const NOTES_PER_PAGE = 24;

export function buildCercaUrl(filters: SearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.universita?.trim()) params.set("universita", filters.universita.trim());
  if (filters.corso?.trim()) params.set("corso", filters.corso.trim());
  if (filters.anno?.trim()) params.set("anno", filters.anno.trim());
  if (filters.semestre?.trim()) params.set("semestre", filters.semestre.trim());
  if (filters.facolta?.trim()) params.set("facolta", filters.facolta.trim());
  if (filters.tag?.trim()) params.set("tag", filters.tag.trim());
  if (filters.sort && filters.sort !== "recent") params.set("sort", filters.sort);
  if (filters.page && filters.page !== "1") params.set("page", filters.page);
  const qs = params.toString();
  return qs ? `/cerca?${qs}` : "/cerca";
}
