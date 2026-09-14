import crypto from "node:crypto";
import { cookies, headers } from "next/headers";

async function getTrackedServerCookies(): Promise<Record<string, string>> {
  const selected: string[] = [];
  const all = false;
  const cookieStore = await cookies();
  return Object.fromEntries(cookieStore.getAll().filter(({ name }) => all || selected.includes(name)).map(({ name, value }) => [name, value]));
}

function generateTraceId(): string {
  return `${Date.now()}.${crypto.randomBytes(24).toString("hex")}`;
}

function projectSecret(): Buffer {
  const secret = process.env.NEUP_ANALYTICS_PROJECT_KEY;
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) throw new Error("Configure NEUP_ANALYTICS_PROJECT_KEY with a generated project secret.");
  return Buffer.from(secret, "hex");
}
function generateContextId(traceId: string): string {
  return crypto.createHmac("sha256", projectSecret()).update(traceId).digest("hex");
}
function signContextId(contextId: string): string {
  const signature = crypto.createHmac("sha256", projectSecret()).update("neup-context:v1:" + contextId).digest("hex");
  return "v1." + contextId + "." + signature;
}

export async function getAnalyticsContext() {
  const cookieStore = await cookies();
  let traceId = cookieStore.get("_neuptraceid")?.value;
  // Root layouts are Server Components; cookies() is read-only here. Create
  // _neuptraceid in middleware/proxy before this function is called.
  if (!traceId) traceId = generateTraceId();
  const contextId = generateContextId(traceId);
  return { traceId, contextId, signedContextId: signContextId(contextId), projectId: "cmt1ve8im0000gc9kgleao4wh" };
}

export async function logPageActivity(contextId: string, pageUrl: string): Promise<void> {
  const projectKey = process.env.NEUP_ANALYTICS_PROJECT_KEY;
  if (!projectKey) return;
  const { traceId } = await getAnalyticsContext();
  const requestHeaders = await headers();
  try {
    await fetch("https://neupgroup.com/analytics/bridge/api.v1/activity?project=cmt1ve8im0000gc9kgleao4wh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _neuptraceid: traceId, contextId: signContextId(contextId), moreDetails: { serverCookies: await getTrackedServerCookies() }, pageUrl, agent: requestHeaders.get("user-agent") ?? "", ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "" }),
      cache: "no-store",
    });
  } catch {
    // Analytics failures must never break the application.
  }
}

export async function logActivity(activity: string, data?: Record<string, unknown>): Promise<void> {
  const projectKey = process.env.NEUP_ANALYTICS_PROJECT_KEY;
  if (!projectKey) return;
  const { contextId, traceId } = await getAnalyticsContext();
  const requestHeaders = await headers();
  await fetch(
    "https://neupgroup.com/analytics/bridge/api.v1/activity?project=cmt1ve8im0000gc9kgleao4wh",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity, data, contextId: signContextId(contextId), _neuptraceid: traceId, moreDetails: { serverCookies: await getTrackedServerCookies() }, agent: requestHeaders.get("user-agent") ?? "", ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "" }),
      cache: "no-store",
    },
  );
}

export async function logClientActivity(activity: string, data?: Record<string, unknown>): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("https://neupgroup.com/analytics/bridge/api.v1/activity?project=cmt1ve8im0000gc9kgleao4wh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, data, agent: navigator.userAgent, pageUrl: window.location.href }),
    keepalive: true,
  });
}
