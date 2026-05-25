import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth";
import { NOTE_LIST_COLUMNS, asNoteWithAuthor } from "@/lib/note-columns";
import { getNoteStats, getPublicFileUrl, getPublicThumbnailUrl } from "@/lib/notes";
import { buildCercaUrl } from "@/lib/search-params";
import { LikeButton } from "@/components/LikeButton";
import { DownloadButton } from "@/components/DownloadButton";
import { CommentsSection } from "@/components/CommentsSection";
import { HeartIcon } from "@/components/HeartIcon";
import { DeleteNoteButton } from "@/components/DeleteNoteButton";
import { PdfPreview } from "@/components/PdfPreview";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportButton } from "@/components/ReportButton";
import type { NoteWithAuthor } from "@/types/database";
import { PlausibleConversion } from "@/components/PlausibleConversion";
import { NoteTags } from "@/components/NoteTags";
import { NoteVersionsPanel } from "@/components/NoteVersionsPanel";
import { getNoteTags } from "@/lib/tags";
import { isBlockedBetween } from "@/lib/blocks";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reported?: string; uploaded?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("notes").select("title").eq("id", id).single();
  return { title: data?.title ?? "Appunto" };
}

export default async function AppuntoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { reported, uploaded } = await searchParams;
  const supabase = await createClient();
  const user = await getCachedUser();

  const { data: note } = await supabase
    .from("notes")
    .select(NOTE_LIST_COLUMNS)
    .eq("id", id)
    .single();

  if (!note) notFound();

  const typedNote = asNoteWithAuthor(note);

  if (user && user.id !== typedNote.user_id) {
    const blocked = await isBlockedBetween(supabase, user.id, typedNote.user_id);
    if (blocked) notFound();
  }

  const tags = await getNoteTags(supabase, id);
  const versionNumber = typedNote.version_number ?? 1;
  const stats = await getNoteStats(supabase, id, user?.id);
  const fileUrl = getPublicFileUrl(supabase, typedNote.file_path);
  const thumbnailUrl = getPublicThumbnailUrl(supabase, typedNote.thumbnail_path);
  const author =
    typedNote.profiles?.full_name || typedNote.profiles?.username || "Studente";
  const authorUsername = typedNote.profiles?.username;

  const isOwner = user?.id === typedNote.user_id;

  let isFavorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from("note_favorites")
      .select("id")
      .eq("note_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    isFavorited = !!fav;
  }

  const likeLabel =
    stats.likeCount === 0
      ? null
      : stats.likeCount === 1
        ? "1 mi piace"
        : `${stats.likeCount} mi piace`;

  const sameCourseUrl = buildCercaUrl({
    corso: typedNote.course,
    universita: typedNote.university,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {uploaded === "1" && <PlausibleConversion event="note_upload" />}
      {reported && (
        <p className="mb-4 rounded-xl border border-sage/30 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          Segnalazione inviata. Grazie per il feedback.
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-gray-light px-3 py-1 text-muted">
          {typedNote.university}
        </span>
        <span className="rounded-full bg-mint-light px-3 py-1 text-sage-dark">
          {typedNote.course}
        </span>
        {typedNote.academic_year && (
          <span className="rounded-full bg-gray-light px-3 py-1 text-muted">
            {typedNote.academic_year}
          </span>
        )}
        {typedNote.semester && (
          <span className="rounded-full bg-gray-light px-3 py-1 text-muted">
            Sem. {typedNote.semester}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-bold text-foreground">{typedNote.title}</h1>

      {typedNote.description && (
        <p className="mt-4 text-muted">{typedNote.description}</p>
      )}

      <NoteTags tags={tags} />

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
        <Link href={sameCourseUrl} className="font-medium text-sage hover:underline">
          Altri appunti di questo corso →
        </Link>
        <ReportButton noteId={id} returnTo={`/appunti/${id}`} />
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        {user ? (
          <>
            <LikeButton
              noteId={id}
              initialLiked={stats.userLiked}
              initialCount={stats.likeCount}
            />
            <FavoriteButton noteId={id} initialSaved={isFavorited} />
          </>
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
          isLoggedIn={!!user}
        />
        {isOwner && (
          <>
            <Link
              href={`/appunti/${id}/modifica`}
              className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm font-medium text-sage shadow-[var(--shadow-soft)] hover:bg-mint-light/40"
            >
              Modifica
            </Link>
            <DeleteNoteButton
              noteId={id}
              noteTitle={typedNote.title}
              redirectTo="/profilo"
            />
          </>
        )}
      </div>

      {isOwner && (
        <NoteVersionsPanel noteId={id} currentVersion={versionNumber} />
      )}

      <div className="mt-8">
        <h2 className="text-sm font-medium text-muted">Anteprima PDF</h2>
        <div className="mt-2">
          <PdfPreview
            fileUrl={fileUrl}
            title={typedNote.title}
            thumbnailUrl={thumbnailUrl}
          />
        </div>
      </div>

      <Suspense
        fallback={
          <section className="mt-10 border-t border-gray-light pt-8">
            <div className="h-6 w-32 animate-pulse rounded bg-mint-light/40" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="card h-20 animate-pulse rounded-xl bg-mint-light/25"
                  aria-hidden
                />
              ))}
            </div>
          </section>
        }
      >
        <CommentsSection noteId={id} returnTo={`/appunti/${id}`} />
      </Suspense>
    </div>
  );
}
