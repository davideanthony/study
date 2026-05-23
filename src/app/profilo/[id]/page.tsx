import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NoteCard } from "@/components/NoteCard";
import { getNoteStats } from "@/lib/notes";
import type { NoteWithAuthor } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfiloPubblicoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: notes } = await supabase
    .from("notes")
    .select("*, profiles(username, full_name)")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const typedNotes = (notes ?? []) as NoteWithAuthor[];
  const totalDownloads = typedNotes.reduce((sum, n) => sum + n.download_count, 0);

  const notesWithStats = await Promise.all(
    typedNotes.map(async (note) => {
      const stats = await getNoteStats(supabase, note.id);
      return { note, stats };
    }),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">
        {profile.full_name || profile.username}
      </h1>
      <p className="text-muted">@{profile.username}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card rounded-2xl p-6">
          <p className="text-3xl font-bold text-sage">{typedNotes.length}</p>
          <p className="text-sm text-muted">Appunti caricati</p>
        </div>
        <div className="card rounded-2xl p-6">
          <p className="text-3xl font-bold text-sage">{totalDownloads}</p>
          <p className="text-sm text-muted">Download ricevuti</p>
        </div>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-foreground">Appunti</h2>
      {notesWithStats.length === 0 ? (
        <p className="mt-4 text-muted">Nessun appunto pubblicato.</p>
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
