import type { SupabaseClient } from "@supabase/supabase-js";

export type RateLimitAction =
  | "upload"
  | "comment"
  | "report"
  | "like"
  | "message"
  | "follow";

const LIMITS: Record<RateLimitAction, { max: number; windowSeconds: number }> = {
  upload: { max: 15, windowSeconds: 3600 },
  comment: { max: 40, windowSeconds: 3600 },
  report: { max: 12, windowSeconds: 3600 },
  like: { max: 80, windowSeconds: 300 },
  message: { max: 80, windowSeconds: 3600 },
  follow: { max: 40, windowSeconds: 3600 },
};

const MESSAGES: Record<RateLimitAction, string> = {
  upload: "Hai caricato troppi appunti. Riprova tra un'ora.",
  comment: "Troppi commenti in poco tempo. Riprova più tardi.",
  report: "Troppe segnalazioni inviate. Riprova più tardi.",
  like: "Troppi mi piace in poco tempo. Attendi qualche minuto.",
  message: "Troppi messaggi inviati. Riprova più tardi.",
  follow: "Troppi follow in poco tempo. Riprova più tardi.",
};

export async function checkRateLimit(
  supabase: SupabaseClient,
  actorId: string,
  action: RateLimitAction,
): Promise<{ allowed: boolean; message: string }> {
  const cfg = LIMITS[action];
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_actor_id: actorId,
    p_action_key: action,
    p_max_count: cfg.max,
    p_window_seconds: cfg.windowSeconds,
  });

  if (error) {
    console.error("[checkRateLimit]", action, error.message);
    return { allowed: true, message: "" };
  }

  if (data === false) {
    return { allowed: false, message: MESSAGES[action] };
  }

  return { allowed: true, message: "" };
}
