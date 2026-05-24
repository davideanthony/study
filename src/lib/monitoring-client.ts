const clientDsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

export async function captureClientException(error: unknown): Promise<void> {
  if (!clientDsn || typeof window === "undefined") return;
  const Sentry = await import("@sentry/browser");
  if (!Sentry.getClient()) {
    Sentry.init({
      dsn: clientDsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "production",
      tracesSampleRate: 0.1,
    });
  }
  Sentry.captureException(error);
}
