"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isBlockedBetween } from "@/lib/blocks";
import { dmParticipants } from "@/lib/dm";
import { checkRateLimit } from "@/lib/rate-limit";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/messaggi");
  return { supabase, user };
}

export async function getOrCreateConversation(otherUserId: string): Promise<string> {
  const { supabase, user } = await requireUser();

  if (otherUserId === user.id) {
    redirect("/messaggi");
  }

  if (await isBlockedBetween(supabase, user.id, otherUserId)) {
    redirect("/messaggi?error=blocked");
  }

  const parts = dmParticipants(user.id, otherUserId);

  const { data: existing } = await supabase
    .from("dm_conversations")
    .select("id")
    .eq("participant_a", parts.participant_a)
    .eq("participant_b", parts.participant_b)
    .maybeSingle();

  if (existing) {
    redirect(`/messaggi/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("dm_conversations")
    .insert(parts)
    .select("id")
    .single();

  if (error || !created) {
    redirect("/messaggi?error=create");
  }

  redirect(`/messaggi/${created.id}`);
}

export async function startConversationForm(formData: FormData) {
  const otherUserId = String(formData.get("user_id") ?? "");
  if (!otherUserId) redirect("/messaggi");
  await getOrCreateConversation(otherUserId);
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const { data: conv } = await supabase
    .from("dm_conversations")
    .select("participant_a, participant_b")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) redirect("/messaggi");

  const isParticipant =
    conv.participant_a === user.id || conv.participant_b === user.id;
  if (!isParticipant) redirect("/messaggi");

  const otherId =
    conv.participant_a === user.id ? conv.participant_b : conv.participant_a;

  if (await isBlockedBetween(supabase, user.id, otherId)) {
    redirect(`/messaggi/${conversationId}?error=blocked`);
  }

  const limit = await checkRateLimit(supabase, user.id, "message");
  if (!limit.allowed) {
    redirect(`/messaggi/${conversationId}?error=${encodeURIComponent(limit.message)}`);
  }

  const { error } = await supabase.from("dm_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (error) {
    redirect(`/messaggi/${conversationId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/messaggi/${conversationId}`);
  revalidatePath("/messaggi");
}
