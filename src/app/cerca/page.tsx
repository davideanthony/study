import { SearchBar } from "@/components/SearchBar";
import { NoteCard } from "@/components/NoteCard";
import { Pagination } from "@/components/Pagination";
import { createClient } from "@/lib/supabase/server";
import { attachListStats } from "@/lib/notes";
import { searchNotes } from "@/lib/search-notes";
import { getBlockedUserIds } from "@/lib/blocks";
import { getNoteIdsByTag } from "@/lib/tags";
import {
  NOTES_PER_PAGE,
  parsePage,
  parseSort,
  type SearchFilters,
} from "@/lib/search-params";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    universita?: string;
    corso?: string;
    anno?: string;
    semestre?: string;
    facolta?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

export const metadata = { title: "Cerca appunti" };

export default async function CercaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Cerca appunti</h1>
      <p className="mt-1 text-sm text-muted">
        La ricerca include titolo, descrizione, tag e testo estratto dai PDF.
      </p>
      <div className="mt-6">
        <SearchBar
          defaultQuery={q ?? ""}
          defaultUniversity={universita ?? ""}
          defaultCourse={corso ?? ""}
          defaultYear={anno ?? ""}
          defaultSemester={semestre ?? ""}
          defaultFaculty={facolta ?? ""}
          defaultTag={tag ?? ""}
          defaultSort={sort}
        />
      </div>

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
            <a href="/carica" className="font-medium text-sage hover:underline">
              carica il primo
            </a>
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
    </div>
  );
}
