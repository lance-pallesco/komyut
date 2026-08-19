import { Client } from "@upstash/qstash";

let qstashClient: Client | null = null;

if (process.env.QSTASH_TOKEN) {
  qstashClient = new Client({
    token: process.env.QSTASH_TOKEN,
    baseUrl: process.env.QSTASH_URL || undefined,
  });
}

/**
 * Enqueue background job to QStash if configured.
 * In development or when QStash is not configured, returns false so local in-process runner takes over.
 */
export async function enqueueJob(endpointPath: string, payload: object): Promise<boolean> {
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  // If local QStash emulator is running (QSTASH_URL is set) OR in production (not localhost)
  const isLocalEmulator = !!process.env.QSTASH_URL;
  const isProduction = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  if (qstashClient && appUrl && (isLocalEmulator || isProduction)) {
    try {
      await qstashClient.publishJSON({
        url: `${appUrl}${endpointPath}`,
        body: payload,
      });
      console.log(`[QStash] Enqueued job to ${endpointPath}`);
      return true;
    } catch (err) {
      console.warn("[QStash] Publish error, falling back to in-process runner:", err);
    }
  }

  return false;
}
