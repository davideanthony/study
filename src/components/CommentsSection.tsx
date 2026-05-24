import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getNoteComments, formatCommentDate } from "@/lib/notes";
import { CommentForm } from "@/components/CommentForm";
import { DeleteCommentButton } from "@/components/DeleteCommentButton";
import { ReportButton } from "@/components/ReportButton";

type CommentsSectionProps = {
  noteId: string;
  returnTo: string;
};

export async function CommentsSection({ noteId, returnTo }: CommentsSectionProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const comments = await getNoteComments(supabase, noteId);

  return (
    <section className="mt-10 border-t border-gray-light pt-8">
      <h2 className="text-lg font-semibold text-foreground">
        Commenti
        {comments.length > 0 && (
          <span className="ml-2 text-base font-normal text-muted">
            ({comments.length})
          </span>
        )}
      </h2>

      {user ? (
        <div className="mt-4">
          <CommentForm noteId={noteId} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">
          <Link href="/auth/login" className="font-medium text-sage hover:underline">
            Accedi
          </Link>{" "}
          per commentare.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Nessun commento ancora. Sii il primo a scrivere qualcosa.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((comment) => {
            const name =
              comment.profiles?.full_name ||
              comment.profiles?.username ||
              "Studente";
            const isOwn = user?.id === comment.user_id;

            return (
              <li
                key={comment.id}
                className="card rounded-xl px-4 py-3 shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <Link
                        href={`/profilo/${comment.user_id}`}
                        className="text-sm font-semibold text-foreground hover:text-sage"
                      >
                        {name}
                      </Link>
                      <time
                        dateTime={comment.created_at}
                        className="text-xs text-muted"
                      >
                        {formatCommentDate(comment.created_at)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      {comment.body}
                    </p>
                    <div className="mt-2">
                      <ReportButton
                        commentId={comment.id}
                        returnTo={returnTo}
                      />
                    </div>
                  </div>
                  {isOwn && (
                    <DeleteCommentButton commentId={comment.id} noteId={noteId} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
