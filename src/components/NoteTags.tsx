import Link from "next/link";
import { buildCercaUrl } from "@/lib/search-params";

type NoteTagsProps = {
  tags: string[];
};

export function NoteTags({ tags }: NoteTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={buildCercaUrl({ tag })}
          className="rounded-full bg-mint-light/60 px-2.5 py-0.5 text-xs font-medium text-sage-dark hover:bg-mint-light"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
