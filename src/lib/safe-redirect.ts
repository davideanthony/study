/** Path interno sicuro per redirect post-auth (no open redirect). */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/profilo"): string {
  if (!raw) return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  return path;
}
