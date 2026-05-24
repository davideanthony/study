import type { SupabaseClient } from "@supabase/supabase-js";

/** ID utenti da escludere (chi ho bloccato + chi mi ha bloccato). */
export async function getBlockedUserIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data: blocked } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);

  const { data: blockers } = await supabase
    .from("user_blocks")
    .select("blocker_id")
    .eq("blocked_id", userId);

  const ids = new Set<string>();
  for (const row of blocked ?? []) ids.add(row.blocked_id);
  for (const row of blockers ?? []) ids.add(row.blocker_id);
  return ids;
}

export async function isBlockedBetween(
  supabase: SupabaseClient,
  userA: string,
  userB: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_blocked", {
    p_user_a: userA,
    p_user_b: userB,
  });
  if (error) {
    console.error("[isBlockedBetween]", error.message);
    return false;
  }
  return !!data;
}

export function filterByBlocked<T extends { user_id: string }>(
  items: T[],
  blocked: Set<string>,
): T[] {
  if (blocked.size === 0) return items;
  return items.filter((n) => !blocked.has(n.user_id));
}
