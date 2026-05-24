const serverDsn = process.env.SENTRY_DSN;
const clientDsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

let serverReady = false;

export function isSentryEnabled(): boolean {
  return Boolean(serverDsn || clientDsn);
}

export async function initSentryServer(): Promise<void> {
  if (!serverDsn || serverReady) return;
  const Sentry = await import("@sentry/node");
  Sentry.init({
    dsn: serverDsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  serverReady = true;
}

export async function captureServerException(error: unknown): Promise<void> {
  if (!serverDsn) return;
  await initSentryServer();
  const Sentry = await import("@sentry/node");
  Sentry.captureException(error);
}

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
