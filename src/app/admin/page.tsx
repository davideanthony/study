import { redirect } from "next/navigation";
import { requireCachedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { updateReportStatus, deleteReportedNoteForm } from "./actions";
import { AdminReindexPanel } from "@/components/AdminReindexPanel";
import { AdminCommentsPanel } from "@/components/AdminCommentsPanel";
import { hasServiceRole } from "@/lib/supabase/service";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireCachedUser("/admin");
  const supabase = await createClient();

  if (!(await isAdmin(supabase, user.id))) redirect("/");

  const { data: reports } = await supabase
    .from("content_reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  const { count: notesCount } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true });

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Dashboard admin</h1>
      <p className="mt-2 text-sm text-muted">
        Imposta <code className="text-xs">is_admin = true</code> sul tuo profilo in Supabase
        per accedere.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Appunti" value={notesCount ?? 0} />
        <Stat label="Utenti" value={usersCount ?? 0} />
        <Stat label="Segnalazioni aperte" value={reports?.length ?? 0} />
      </div>

      <h2 className="mt-12 text-lg font-semibold text-foreground">Segnalazioni aperte</h2>
      {!reports?.length ? (
        <p className="mt-4 text-muted">Nessuna segnalazione in coda.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="card rounded-xl p-4 text-sm">
              <p className="font-medium text-foreground">{r.reason}</p>
              {r.details && <p className="mt-1 text-muted">{r.details}</p>}
              <p className="mt-2 text-xs text-muted">
                {new Date(r.created_at).toLocaleString("it-IT")}
                {r.note_id && ` · Appunto ${r.note_id}`}
                {r.comment_id && ` · Commento ${r.comment_id}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.note_id && (
                  <>
                    <a
                      href={`/appunti/${r.note_id}`}
                      className="rounded-lg border border-gray-light px-3 py-1 text-sage hover:bg-mint-light/40"
                    >
                      Vedi appunto
                    </a>
                    <form action={deleteReportedNoteForm}>
                      <input type="hidden" name="note_id" value={r.note_id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700"
                      >
                        Elimina appunto
                      </button>
                    </form>
                  </>
                )}
                <form action={updateReportStatus} className="inline">
                  <input type="hidden" name="report_id" value={r.id} />
                  <input type="hidden" name="status" value="reviewed" />
                  <button type="submit" className="rounded-lg bg-sage px-3 py-1 text-surface">
                    Segna esaminata
                  </button>
                </form>
                <form action={updateReportStatus} className="inline">
                  <input type="hidden" name="report_id" value={r.id} />
                  <input type="hidden" name="status" value="dismissed" />
                  <button
                    type="submit"
                    className="rounded-lg border border-gray-light px-3 py-1 text-muted"
                  >
                    Ignora
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminCommentsPanel />

      <AdminReindexPanel
        serviceRoleConfigured={hasServiceRole()}
        totalNotes={notesCount ?? 0}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card rounded-2xl p-6">
      <p className="text-3xl font-bold text-sage">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
