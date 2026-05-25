import Link from "next/link";
import Image from "next/image";
import { HeartIcon } from "@/components/HeartIcon";
import type { NoteWithAuthor } from "@/types/database";

type NoteCardProps = {
  note: NoteWithAuthor;
  likeCount?: number;
  thumbnailUrl?: string | null;
};

export function NoteCard({ note, likeCount = 0, thumbnailUrl }: NoteCardProps) {
  const author =
    note.profiles?.full_name || note.profiles?.username || "Studente";

  return (
    <Link
      href={`/appunti/${note.id}`}
      className="card group block overflow-hidden rounded-2xl transition hover:border-sage/40 hover:shadow-[var(--shadow-lift)]"
    >
      {thumbnailUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-mint-light/30">
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover object-top transition group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <div className="p-5">
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-gray-light px-2.5 py-1 text-muted">
            {note.university}
          </span>
          <span className="rounded-full bg-mint-light px-2.5 py-1 text-sage-dark">
            {note.course}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-sage">
          {note.title}
        </h3>
        {note.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{note.description}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span>{author}</span>
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <HeartIcon filled className="h-3.5 w-3.5 text-[#e25555]" />
              {likeCount}
            </span>
            <span>↓ {note.download_count}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
