import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { otherParticipant } from "@/lib/dm";
import { formatCommentDate } from "@/lib/notes";

export const metadata = { title: "Messaggi" };

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function MessaggiPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/messaggi");

  const { data: conversations } = await supabase
    .from("dm_conversations")
    .select("*")
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const otherIds = (conversations ?? []).map((c) =>
    otherParticipant(c, user.id),
  );

  const profileMap = new Map<string, { username: string; full_name: string }>();
  if (otherIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", otherIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p);
    }
  }

  const previewByConv = new Map<string, { body: string; created_at: string }>();
  const convIds = (conversations ?? []).map((c) => c.id);
  if (convIds.length > 0) {
    const { data: lastMessages } = await supabase
      .from("dm_messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    for (const m of lastMessages ?? []) {
      if (!previewByConv.has(m.conversation_id)) {
        previewByConv.set(m.conversation_id, { body: m.body, created_at: m.created_at });
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Messaggi</h1>
      <p className="mt-1 text-sm text-muted">Chat private tra studenti.</p>

      {error === "blocked" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Non puoi messaggiare questo utente (blocco attivo).
        </p>
      )}

      {!conversations?.length ? (
        <p className="mt-12 text-muted">
          Nessuna conversazione. Apri il profilo di un utente e clicca &quot;Messaggio&quot;.
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {conversations.map((c) => {
            const otherId = otherParticipant(c, user.id);
            const profile = profileMap.get(otherId);
            const name = profile?.full_name || profile?.username || "Utente";
            const preview = previewByConv.get(c.id);

            return (
              <li key={c.id}>
                <Link
                  href={`/messaggi/${c.id}`}
                  className="card flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-sage/30"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{name}</p>
                    {preview && (
                      <p className="mt-1 truncate text-sm text-muted">{preview.body}</p>
                    )}
                  </div>
                  {preview && (
                    <time className="shrink-0 text-xs text-muted">
                      {formatCommentDate(preview.created_at)}
                    </time>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
