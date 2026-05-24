import { initSentryServer } from "@/lib/monitoring-server";

export async function register() {
  if (process.env.SENTRY_DSN) {
    await initSentryServer();
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
) {
  const { captureServerException } = await import("@/lib/monitoring-server");
  await captureServerException(err);
  console.error("[stufy] request error", request.method, request.path, err);
}
