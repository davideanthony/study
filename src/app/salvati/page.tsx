import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NoteCard } from "@/components/NoteCard";
import { attachListStats } from "@/lib/notes";
import { NOTE_LIST_COLUMNS } from "@/lib/note-columns";
import type { NoteWithAuthor } from "@/types/database";

export const metadata = { title: "Salvati" };

export default async function SalvatiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/salvati");

  const { data: favorites } = await supabase
    .from("note_favorites")
    .select(`note_id, notes(${NOTE_LIST_COLUMNS})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const notes = (favorites ?? [])
    .map((f) => {
      const n = f.notes as unknown;
      return n && typeof n === "object" && "id" in n ? (n as NoteWithAuthor) : null;
    })
    .filter((n): n is NoteWithAuthor => n != null);

  const notesWithStats = await attachListStats(supabase, notes, user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Appunti salvati</h1>
      <p className="mt-2 text-muted">I PDF che hai aggiunto ai preferiti.</p>

      {notesWithStats.length === 0 ? (
        <p className="mt-12 text-muted">
          Nessun salvato.{" "}
          <Link href="/cerca" className="font-medium text-sage hover:underline">
            Cerca appunti
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notesWithStats.map(({ note, stats }) => (
            <NoteCard key={note.id} note={note} likeCount={stats.likeCount} />
          ))}
        </div>
      )}
    </div>
  );
}
