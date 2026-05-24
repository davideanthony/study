import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicFileUrl } from "@/lib/notes";

type NoteVersionsPanelProps = {
  noteId: string;
  currentVersion: number;
};

export async function NoteVersionsPanel({
  noteId,
  currentVersion,
}: NoteVersionsPanelProps) {
  const supabase = await createClient();
  const { data: versions } = await supabase
    .from("note_versions")
    .select("version_number, file_path, file_name, created_at")
    .eq("note_id", noteId)
    .order("version_number", { ascending: false });

  if (!versions?.length) return null;

  return (
    <section className="card mt-8 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground">Versioni PDF</h2>
      <p className="mt-1 text-sm text-muted">
        Versione attuale: <strong>v{currentVersion}</strong>
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {versions.map((v) => (
          <li
            key={v.version_number}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-light/80 px-3 py-2"
          >
            <span>
              v{v.version_number} · {v.file_name}
              {v.version_number === currentVersion && (
                <span className="ml-2 text-xs text-sage">(attuale)</span>
              )}
            </span>
            <a
              href={getPublicFileUrl(supabase, v.file_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage hover:underline"
            >
              Scarica
            </a>
          </li>
        ))}
      </ul>
      <Link
        href={`/appunti/${noteId}/modifica`}
        className="mt-4 inline-block text-sm font-medium text-sage hover:underline"
      >
        Carica nuova versione →
      </Link>
    </section>
  );
}
