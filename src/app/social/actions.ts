"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth";
import { REPORT_REASONS } from "@/lib/constants";
import { isBlockedBetween } from "@/lib/blocks";
import { checkRateLimit } from "@/lib/rate-limit";

async function requireUser() {
  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");
  return { supabase, user };
}

export async function toggleFavorite(noteId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("note_favorites")
    .select("id")
    .eq("note_id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("note_favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("note_favorites").insert({ note_id: noteId, user_id: user.id });
  }

  revalidatePath(`/appunti/${noteId}`);
  revalidatePath("/salvati");
}

export async function toggleBlock(targetUserId: string) {
  const { supabase, user } = await requireUser();

  if (targetUserId === user.id) return;

  const { data: existing } = await supabase
    .from("user_blocks")
    .select("id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_blocks").delete().eq("id", existing.id);
  } else {
    await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
    await supabase.from("user_follows").delete().eq("follower_id", targetUserId).eq("following_id", user.id);
    await supabase.from("user_blocks").insert({
      blocker_id: user.id,
      blocked_id: targetUserId,
    });
  }

  revalidatePath(`/profilo/${targetUserId}`);
  revalidatePath("/profilo");
  revalidatePath("/cerca");
  revalidatePath("/messaggi");
}

export async function toggleFollow(targetUserId: string) {
  const { supabase, user } = await requireUser();

  if (targetUserId === user.id) return;

  if (await isBlockedBetween(supabase, user.id, targetUserId)) {
    return;
  }

  const { data: existing } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_follows").delete().eq("id", existing.id);
  } else {
    const limit = await checkRateLimit(supabase, user.id, "follow");
    if (!limit.allowed) return;

    await supabase.from("user_follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
    });
  }

  revalidatePath(`/profilo/${targetUserId}`);
  revalidatePath("/profilo");
}

export async function reportContent(formData: FormData) {
  const { supabase, user } = await requireUser();

  const noteId = String(formData.get("note_id") ?? "") || null;
  const commentId = String(formData.get("comment_id") ?? "") || null;
  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  if (!noteId && !commentId) return;
  if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
    return;
  }

  const limit = await checkRateLimit(supabase, user.id, "report");
  if (!limit.allowed) {
    const returnTo = String(formData.get("return_to") ?? "/");
    redirect(`${returnTo}?error=${encodeURIComponent(limit.message)}`);
  }

  await supabase.from("content_reports").insert({
    reporter_id: user.id,
    note_id: noteId,
    comment_id: commentId,
    reason,
    details,
  });

  const returnTo = String(formData.get("return_to") ?? "/");
  redirect(`${returnTo}?reported=1`);
}

export async function markNotificationRead(notificationId: string) {
  const { supabase, user } = await requireUser();

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/notifiche");
}

export async function markNotificationReadForm(formData: FormData) {
  const id = String(formData.get("notification_id") ?? "");
  if (id) await markNotificationRead(id);
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await requireUser();

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/notifiche");
}
