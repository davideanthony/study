import Link from "next/link";
import { NoteCard } from "@/components/NoteCard";
import { Pagination } from "@/components/Pagination";
import { createClient } from "@/lib/supabase/server";
import { attachListStats } from "@/lib/notes";
import { searchNotes } from "@/lib/search-notes";
import { getBlockedUserIds } from "@/lib/blocks";
import { getNoteIdsByTag } from "@/lib/tags";
import { getCachedUser } from "@/lib/auth";
import {
  NOTES_PER_PAGE,
  parsePage,
  parseSort,
  type SearchFilters,
} from "@/lib/search-params";

type CercaResultsProps = {
  searchParams: {
    q?: string;
    universita?: string;
    corso?: string;
    anno?: string;
    semestre?: string;
    facolta?: string;
    tag?: string;
    sort?: string;
    page?: string;
  };
};

export async function CercaResults({ searchParams: sp }: CercaResultsProps) {
  const q = sp.q;
  const universita = sp.universita;
  const corso = sp.corso;
  const anno = sp.anno;
  const semestre = sp.semestre;
  const facolta = sp.facolta;
  const tag = sp.tag;
  const sort = parseSort(sp.sort);
  const page = parsePage(sp.page);

  const filters: SearchFilters = {
    q,
    universita,
    corso,
    anno,
    semestre,
    facolta,
    tag,
    sort,
    page: String(page),
  };

  const supabase = await createClient();
  const user = await getCachedUser();

  const blocked = user ? await getBlockedUserIds(supabase, user.id) : new Set<string>();
  const excludeUserIds = [...blocked];

  let noteIdsFilter: string[] | undefined;
  if (tag?.trim()) {
    const ids = await getNoteIdsByTag(supabase, tag);
    noteIdsFilter = ids ?? [];
  }

  const from = (page - 1) * NOTES_PER_PAGE;
  const to = from + NOTES_PER_PAGE - 1;

  const { notes, total } = await searchNotes(supabase, {
    q,
    universita,
    corso,
    anno,
    semestre,
    facolta,
    tag,
    sort,
    from,
    to,
    excludeUserIds,
    noteIdsFilter,
  });

  const totalPages = Math.max(1, Math.ceil(total / NOTES_PER_PAGE));
  const notesWithStats = await attachListStats(supabase, notes, user?.id);
  const hasFilters = !!(q || universita || corso || anno || semestre || facolta || tag);

  return (
    <>
      <p className="mt-8 text-sm text-muted">
        {total} risultat{total === 1 ? "o" : "i"}
        {hasFilters ? " per la tua ricerca" : ""}
        {totalPages > 1 ? ` · pagina ${page} di ${totalPages}` : ""}
      </p>

      {notesWithStats.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-sage/30 bg-surface p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-muted">Nessun appunto trovato.</p>
          <p className="mt-2 text-sm text-muted">
            Prova altri filtri o{" "}
            <Link href="/carica" className="font-medium text-sage hover:underline">
              carica il primo
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notesWithStats.map(({ note, stats }) => (
            <NoteCard key={note.id} note={note} likeCount={stats.likeCount} />
          ))}
        </div>
      )}

      <Pagination filters={filters} page={page} totalPages={totalPages} />
    </>
  );
}
