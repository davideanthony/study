import { SearchBar } from "@/components/SearchBar";
import { NoteCard } from "@/components/NoteCard";
import { createClient } from "@/lib/supabase/server";
import { getNoteStats } from "@/lib/notes";
import type { NoteWithAuthor } from "@/types/database";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    universita?: string;
    corso?: string;
  }>;
};

export const metadata = { title: "Cerca appunti" };

export default async function CercaPage({ searchParams }: PageProps) {
  const { q, universita, corso } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select("*, profiles(username, full_name)")
    .order("created_at", { ascending: false });

  if (universita?.trim()) {
    query = query.ilike("university", `%${universita.trim()}%`);
  }
  if (corso?.trim()) {
    query = query.ilike("course", `%${corso.trim()}%`);
  }
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  const { data: notes } = await query.limit(48);

  const notesWithStats = await Promise.all(
    ((notes ?? []) as NoteWithAuthor[]).map(async (note) => {
      const stats = await getNoteStats(supabase, note.id);
      return { note, stats };
    }),
  );

  const hasFilters = !!(q || universita || corso);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Cerca appunti</h1>
      <div className="mt-6">
        <SearchBar
          defaultQuery={q ?? ""}
          defaultUniversity={universita ?? ""}
          defaultCourse={corso ?? ""}
        />
      </div>

      <p className="mt-8 text-sm text-muted">
        {notesWithStats.length} risultat{notesWithStats.length === 1 ? "o" : "i"}
        {hasFilters ? " per la tua ricerca" : ""}
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
            <NoteCard
              key={note.id}
              note={note}
              likeCount={stats.likeCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
