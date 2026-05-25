import { createHash } from "node:crypto";

/** UUID stabile per rate limit anonimo (da IP). */
export function rateLimitActorId(
  userId: string | null | undefined,
  clientIp: string,
): string {
  if (userId) return userId;
  const digest = createHash("sha256").update(`stufy:anon:${clientIp}`).digest("hex");
  return [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `4${digest.slice(13, 16)}`,
    `8${digest.slice(17, 20)}`,
    digest.slice(20, 32),
  ].join("-");
}

export function getClientIpFromHeaders(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip")?.trim() ||
    "0.0.0.0"
  );
}
