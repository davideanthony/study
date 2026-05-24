import "server-only";

const serverDsn = process.env.SENTRY_DSN;

let serverReady = false;

export function isSentryServerEnabled(): boolean {
  return Boolean(serverDsn);
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
