import { Hono } from "hono";
import type { Env, Variables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** GET /media/* - serve an object from R2 (public read). */
app.get("/*", async (c) => {
  if (!c.env.MEDIA) return c.notFound();
  const key = c.req.path.replace(/^\/media\//, "");
  // Block directory traversal, hidden files, or malformed keys
  if (
    !key ||
    key.includes("..") ||
    key.includes("\\") ||
    key.startsWith("/") ||
    key.startsWith(".") ||
    key.includes("/.")
  ) {
    return c.notFound();
  }
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.notFound();
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", "inline");

  // Stored XSS prevention: force attachment download for non-safe media types
  const cType = (headers.get("content-type") || "").toLowerCase();
  if (cType.includes("html") || cType.includes("javascript")) {
    headers.set("content-type", "application/octet-stream");
    headers.set("Content-Disposition", "attachment");
  }

  return new Response(obj.body, { headers });
});

export default app;
