import { NoteCard } from "@/components/NoteCard";
import { createClient } from "@/lib/supabase/server";
import { getCachedRecentNotes } from "@/lib/cached-queries";
import { attachListStats } from "@/lib/notes";
import { filterByBlocked, getBlockedUserIds } from "@/lib/blocks";
import { getCachedUser } from "@/lib/auth";
import { NOTE_LIST_COLUMNS, asNotesWithAuthor } from "@/lib/note-columns";
import type { NoteWithAuthor } from "@/types/database";

export async function HomeRecentNotes() {
  const user = await getCachedUser();
  let notes: NoteWithAuthor[];

  if (user) {
    const supabase = await createClient();
    const { data: recentNotes } = await supabase
      .from("notes")
      .select(NOTE_LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(6);

    const blocked = await getBlockedUserIds(supabase, user.id);
    notes = filterByBlocked(asNotesWithAuthor(recentNotes), blocked);
  } else {
    notes = await getCachedRecentNotes();
  }

  if (notes.length === 0) return null;

  const supabase = await createClient();
  const notesWithStats = await attachListStats(supabase, notes, user?.id);

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <h2 className="text-lg font-semibold text-foreground">Appunti recenti</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notesWithStats.map(({ note, stats }) => (
          <NoteCard key={note.id} note={note} likeCount={stats.likeCount} />
        ))}
      </div>
    </section>
  );
}
