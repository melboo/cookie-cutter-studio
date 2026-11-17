// CUT IT. redraw server (Cloudflare Worker)
//
// Takes a picture from the app and asks Gemini to redraw it as a simple, cookie-cutter-friendly
// drawing: one bold silhouette, a few thick connected lines, flat colours, no shading or labels.
// The app then traces that drawing. The Gemini API key lives here as a secret, never in the app.
//
// POST /redraw   body: {"image": "data:image/png;base64,..."}
//                reply: {"image": "data:image/png;base64,..."}   or   {"error": "..."}

const MODEL = "gemini-3.1-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`;
const MAX_BYTES = 6 * 1024 * 1024; // largest picture accepted (base64 included)

const PROMPT = `Redraw this picture as a design for a cookie cutter.

Rules:
- Keep the main subject only, centred, with its shape and proportions recognisable. Remove text, labels, arrows, leader lines, captions, frames and background objects.
- The whole subject is one closed, solid silhouette with a thick, smooth black outline of even weight. The silhouette carries the important features (bulges, notches, tips), so it reads even if filled black.
- Inside, use at most 8 thick black lines of the same weight as the outline. Every line ends on the outline or on another line, so the inside is divided into a few large areas. A small closed ring is fine for an opening or an eye, at most two.
- Fill each area with one flat, saturated colour. No shading, gradients, highlights, hatching, texture or thin details.
- Lines and rings never run close and parallel to each other; leave clear space between them.
- Plain off-white background (#F7F1E3), nothing else in the image.
- Flat graphic style with bold outlines, like a sticker or a modern flat illustration.`;

function cors(origin, allowed) {
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function reply(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "https://melboo.github.io").split(",").map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const h = cors(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/redraw") return reply({ error: "not found" }, 404, h);

    // Only the app may use this (stops other web pages from spending the key).
    const fromApp = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (!fromApp) return reply({ error: "not allowed" }, 403, h);
    if (!env.GEMINI_API_KEY) return reply({ error: "server has no API key" }, 500, h);

    // Rate limit per visitor, if the binding is set up (see wrangler.toml).
    if (env.LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") || "anon";
      const { success } = await env.LIMITER.limit({ key: ip });
      if (!success) return reply({ error: "too many pictures, try again in a minute" }, 429, h);
    }

    const len = +(request.headers.get("Content-Length") || 0);
    if (len > MAX_BYTES) return reply({ error: "picture too large" }, 413, h);
    let body;
    try { body = await request.json(); } catch { return reply({ error: "bad request" }, 400, h); }
    const m = /^data:(image\/(png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body && body.image || ""));
    if (!m) return reply({ error: "send a PNG, JPEG or WebP picture" }, 400, h);
    if (m[3].length > MAX_BYTES) return reply({ error: "picture too large" }, 413, h);

    const g = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: m[1], data: m[3] } }] }],
        generationConfig: { responseModalities: ["IMAGE"], responseFormat: { image: { imageSize: "1K" } } },
      }),
    });
    if (!g.ok) {
      const t = await g.text();
      console.log("gemini error", g.status, t.slice(0, 500));
      return reply({ error: g.status === 429 ? "busy, try again in a minute" : "redraw failed" }, 502, h);
    }
    const out = await g.json();
    const parts = (out.candidates && out.candidates[0] && out.candidates[0].content && out.candidates[0].content.parts) || [];
    const imgs = parts.filter(p => (p.inline_data || p.inlineData) && !p.thought);
    const last = imgs[imgs.length - 1];
    if (!last) return reply({ error: "no picture came back" }, 502, h);
    const d = last.inline_data || last.inlineData;
    return reply({ image: `data:${d.mime_type || d.mimeType || "image/png"};base64,${d.data}` }, 200, h);
  },
};
