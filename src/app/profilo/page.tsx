import Link from "next/link";
import { requireCachedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NoteCard } from "@/components/NoteCard";
import { DeleteNoteButton } from "@/components/DeleteNoteButton";
import { signOut } from "@/app/auth/actions";
import { attachListStats, getPublicThumbnailUrl } from "@/lib/notes";
import { NOTE_LIST_COLUMNS, asNotesWithAuthor } from "@/lib/note-columns";
import type { NoteWithAuthor } from "@/types/database";
import { PlausibleConversion } from "@/components/PlausibleConversion";

export const metadata = { title: "Il tuo profilo" };

type PageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function ProfiloPage({ searchParams }: PageProps) {
  const { registered } = await searchParams;
  const user = await requireCachedUser("/profilo");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: myNotes } = await supabase
    .from("notes")
    .select(NOTE_LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const notes = asNotesWithAuthor(myNotes);
  const totalDownloads = notes.reduce((sum, n) => sum + n.download_count, 0);
  const notesWithStats = await attachListStats(supabase, notes, user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {registered === "1" && <PlausibleConversion event="signup" />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-14 w-14 rounded-full border border-gray-light object-cover"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || profile?.username || "Profilo"}
            </h1>
            <p className="text-muted">@{profile?.username}</p>
            {profile?.bio && <p className="mt-2 max-w-md text-sm text-muted">{profile.bio}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/profilo/modifica"
            className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm font-medium text-sage shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40"
          >
            Modifica profilo
          </Link>
          <Link
            href="/salvati"
            className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm font-medium text-sage shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40"
          >
            Salvati
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm text-muted shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40"
            >
              Esci
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Appunti caricati" value={notes.length} />
        <StatCard label="Download ricevuti" value={totalDownloads} />
        <Link
          href="/carica"
          className="flex items-center justify-center rounded-2xl border-2 border-dashed border-sage/35 bg-mint-light/40 p-6 text-center font-medium text-sage-dark shadow-[var(--shadow-soft)] transition hover:border-sage/50 hover:bg-mint-light/70"
        >
          + Carica nuovo appunto
        </Link>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-foreground">I tuoi appunti</h2>
      {notesWithStats.length === 0 ? (
        <p className="mt-4 text-muted">Non hai ancora caricato appunti.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notesWithStats.map(({ note, stats }) => (
            <div key={note.id} className="flex flex-col gap-2">
              <NoteCard
                note={note}
                likeCount={stats.likeCount}
                thumbnailUrl={getPublicThumbnailUrl(supabase, note.thumbnail_path)}
              />
              <DeleteNoteButton
                noteId={note.id}
                noteTitle={note.title}
                className="w-full rounded-xl border border-red-200/80 bg-red-50/60 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card rounded-2xl p-6">
      <p className="text-3xl font-bold text-sage">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
