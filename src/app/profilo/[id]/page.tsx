import { notFound } from "next/navigation";
import Link from "next/link";
import { getCachedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NoteCard } from "@/components/NoteCard";
import { FollowButton } from "@/components/FollowButton";
import { BlockButton } from "@/components/BlockButton";
import { MessageUserButton } from "@/components/MessageUserButton";
import { isBlockedBetween } from "@/lib/blocks";
import { attachListStats, getPublicThumbnailUrl } from "@/lib/notes";
import { NOTE_LIST_COLUMNS, asNotesWithAuthor } from "@/lib/note-columns";
import { buildCercaUrl } from "@/lib/search-params";
import type { NoteWithAuthor } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfiloPubblicoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCachedUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  if (user && user.id !== id && (await isBlockedBetween(supabase, user.id, id))) {
    const { data: myBlock } = await supabase
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", id)
      .maybeSingle();
    if (!myBlock) {
      return (
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-muted">Questo profilo non è disponibile.</p>
        </div>
      );
    }
  }

  const isSelf = user?.id === id;
  let isFollowing = false;
  let isBlocked = false;
  if (user && !isSelf) {
    const { data: blockRow } = await supabase
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", id)
      .maybeSingle();
    isBlocked = !!blockRow;
    const { data: follow } = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", id)
      .maybeSingle();
    isFollowing = !!follow;
  }

  const { data: notes } = await supabase
    .from("notes")
    .select(NOTE_LIST_COLUMNS)
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const typedNotes = asNotesWithAuthor(notes);
  const totalDownloads = typedNotes.reduce((sum, n) => sum + n.download_count, 0);
  const notesWithStats = await attachListStats(supabase, typedNotes, user?.id);

  const topCourse = typedNotes[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full border border-gray-light object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-light text-2xl font-bold text-sage">
            {(profile.full_name || profile.username).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-2 max-w-lg text-sm text-muted">{profile.bio}</p>}
          {profile.default_university && (
            <p className="mt-1 text-sm text-muted">{profile.default_university}</p>
          )}
        </div>
        {user && !isSelf && (
          <div className="flex flex-wrap gap-2">
            {!isBlocked && (
              <>
                <FollowButton targetUserId={id} initialFollowing={isFollowing} />
                <MessageUserButton targetUserId={id} />
              </>
            )}
            <BlockButton targetUserId={id} initialBlocked={isBlocked} />
          </div>
        )}
      </div>

      {topCourse && (
        <Link
          href={buildCercaUrl({
            corso: topCourse.course,
            universita: topCourse.university,
          })}
          className="mt-6 inline-block text-sm font-medium text-sage hover:underline"
        >
          Appunti dello stesso corso ({topCourse.course}) →
        </Link>
      )}

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
              thumbnailUrl={getPublicThumbnailUrl(supabase, note.thumbnail_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
