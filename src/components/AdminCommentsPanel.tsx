import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCommentDate } from "@/lib/notes";
import {
  deleteCommentAdminForm,
  hideCommentForm,
  restoreCommentForm,
} from "@/app/admin/actions";

export async function AdminCommentsPanel() {
  const supabase = await createClient();

  const { data: comments } = await supabase
    .from("note_comments")
    .select("*, profiles(username, full_name)")
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: reported } = await supabase
    .from("content_reports")
    .select("comment_id")
    .eq("status", "open")
    .not("comment_id", "is", null);

  const reportedIds = new Set((reported ?? []).map((r) => r.comment_id).filter(Boolean));

  const items = comments ?? [];

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-foreground">Moderazione commenti</h2>
      <p className="mt-1 text-sm text-muted">
        Nascondi o elimina commenti segnalati o inappropriati.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-muted">Nessun commento.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((c) => {
            const name =
              (c.profiles as { username?: string; full_name?: string } | null)
                ?.full_name ||
              (c.profiles as { username?: string } | null)?.username ||
              "Studente";
            const isHidden = !!c.hidden_at;
            const isReported = reportedIds.has(c.id);

            return (
              <li
                key={c.id}
                className={`card rounded-xl p-4 text-sm ${isHidden ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-medium text-foreground">{name}</span>
                  <time>{formatCommentDate(c.created_at)}</time>
                  {isReported && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-900">
                      Segnalato
                    </span>
                  )}
                  {isHidden && (
                    <span className="rounded bg-gray-light px-2 py-0.5">Nascosto</span>
                  )}
                </div>
                <p className="mt-2 text-foreground">{c.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/appunti/${c.note_id}`}
                    className="text-sage hover:underline"
                  >
                    Vedi appunto
                  </Link>
                  {!isHidden ? (
                    <form action={hideCommentForm} className="inline">
                      <input type="hidden" name="comment_id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-amber-200 px-2 py-1 text-amber-900"
                      >
                        Nascondi
                      </button>
                    </form>
                  ) : (
                    <form action={restoreCommentForm} className="inline">
                      <input type="hidden" name="comment_id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-gray-light px-2 py-1"
                      >
                        Ripristina
                      </button>
                    </form>
                  )}
                  <form action={deleteCommentAdminForm} className="inline">
                    <input type="hidden" name="comment_id" value={c.id} />
                    <input type="hidden" name="note_id" value={c.note_id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-red-700"
                    >
                      Elimina
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
