import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isBlockedBetween } from "@/lib/blocks";
import { otherParticipant } from "@/lib/dm";
import { DmThread } from "@/components/DmThread";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const metadata = { title: "Conversazione" };

export default async function MessaggioThreadPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=/messaggi/${id}`);

  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!conv) notFound();

  const isParticipant =
    conv.participant_a === user.id || conv.participant_b === user.id;
  if (!isParticipant) redirect("/messaggi");

  const otherId = otherParticipant(conv, user.id);

  if (await isBlockedBetween(supabase, user.id, otherId)) {
    redirect("/messaggi?error=blocked");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", otherId)
    .single();

  const { data: messages } = await supabase
    .from("dm_messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  const name = profile?.full_name || profile?.username || "Utente";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/messaggi" className="text-sm font-medium text-sage hover:underline">
        ← Messaggi
      </Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">{name}</h1>
        <Link
          href={`/profilo/${otherId}`}
          className="text-sm text-sage hover:underline"
        >
          Profilo
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="mt-6">
        <DmThread
          conversationId={id}
          myId={user.id}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  );
}
