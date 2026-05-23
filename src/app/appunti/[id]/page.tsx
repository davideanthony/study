import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNoteStats, getPublicFileUrl } from "@/lib/notes";
import { LikeButton } from "@/components/LikeButton";
import { DownloadButton } from "@/components/DownloadButton";
import { CommentsSection } from "@/components/CommentsSection";
import { HeartIcon } from "@/components/HeartIcon";
import { DeleteNoteButton } from "@/components/DeleteNoteButton";
import type { NoteWithAuthor } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("notes").select("title").eq("id", id).single();
  return { title: data?.title ?? "Appunto" };
}

export default async function AppuntoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: note } = await supabase
    .from("notes")
    .select("*, profiles(username, full_name)")
    .eq("id", id)
    .single();

  if (!note) notFound();

  const typedNote = note as NoteWithAuthor;
  const stats = await getNoteStats(supabase, id, user?.id);
  const fileUrl = getPublicFileUrl(supabase, typedNote.file_path);
  const author =
    typedNote.profiles?.full_name || typedNote.profiles?.username || "Studente";
  const authorUsername = typedNote.profiles?.username;

  const isOwner = user?.id === typedNote.user_id;

  const likeLabel =
    stats.likeCount === 0
      ? null
      : stats.likeCount === 1
        ? "1 mi piace"
        : `${stats.likeCount} mi piace`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-gray-light px-3 py-1 text-muted">
          {typedNote.university}
        </span>
        <span className="rounded-full bg-mint-light px-3 py-1 text-sage-dark">
          {typedNote.course}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold text-foreground">{typedNote.title}</h1>

      {typedNote.description && (
        <p className="mt-4 text-muted">{typedNote.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
        <span>
          Autore:{" "}
          {authorUsername ? (
            <Link
              href={`/profilo/${typedNote.user_id}`}
              className="font-medium text-sage hover:underline"
            >
              {author}
            </Link>
          ) : (
            author
          )}
        </span>
        <span>↓ {typedNote.download_count} download</span>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-6">
        {user ? (
          <LikeButton
            noteId={id}
            initialLiked={stats.userLiked}
            initialCount={stats.likeCount}
          />
        ) : (
          <div className="flex flex-col items-start gap-1">
            <Link
              href="/auth/login"
              className="-ml-1 rounded-full p-1 transition hover:scale-110"
              aria-label="Accedi per mettere mi piace"
            >
              <HeartIcon className="text-foreground" />
            </Link>
            {likeLabel && (
              <p className="text-sm font-semibold text-foreground">{likeLabel}</p>
            )}
          </div>
        )}
        <DownloadButton
          noteId={id}
          fileUrl={fileUrl}
          fileName={typedNote.file_name}
        />
        {isOwner && (
          <DeleteNoteButton
            noteId={id}
            noteTitle={typedNote.title}
            redirectTo="/profilo"
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-muted">Anteprima PDF</h2>
        <div className="card mt-2 overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
          <iframe
            src={`${fileUrl}#toolbar=0`}
            title={typedNote.title}
            className="h-[min(70vh,600px)] w-full"
          />
        </div>
      </div>

      <CommentsSection noteId={id} />
    </div>
  );
}
