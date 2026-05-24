import { initSentryServer } from "@/lib/monitoring";

export async function register() {
  if (process.env.SENTRY_DSN) {
    await initSentryServer();
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
) {
  const { captureServerException } = await import("@/lib/monitoring");
  await captureServerException(err);
  console.error("[stufy] request error", request.method, request.path, err);
}
