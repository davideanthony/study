import Link from "next/link";
import { buildCercaUrl, type SearchFilters } from "@/lib/search-params";

type PaginationProps = {
  filters: SearchFilters;
  page: number;
  totalPages: number;
};

export function Pagination({ filters, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? buildCercaUrl({ ...filters, page: String(page - 1) }) : null;
  const next =
    page < totalPages ? buildCercaUrl({ ...filters, page: String(page + 1) }) : null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-4 text-sm" aria-label="Paginazione">
      {prev ? (
        <Link
          href={prev}
          className="rounded-xl border border-gray-light bg-surface px-4 py-2 font-medium text-sage shadow-[var(--shadow-soft)] hover:bg-mint-light/40"
        >
          ← Precedente
        </Link>
      ) : (
        <span className="rounded-xl px-4 py-2 text-muted opacity-50">← Precedente</span>
      )}
      <span className="text-muted">
        Pagina {page} di {totalPages}
      </span>
      {next ? (
        <Link
          href={next}
          className="rounded-xl border border-gray-light bg-surface px-4 py-2 font-medium text-sage shadow-[var(--shadow-soft)] hover:bg-mint-light/40"
        >
          Successiva →
        </Link>
      ) : (
        <span className="rounded-xl px-4 py-2 text-muted opacity-50">Successiva →</span>
      )}
    </nav>
  );
}
