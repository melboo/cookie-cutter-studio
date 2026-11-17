// CUT IT. redraw server (Cloudflare Worker)
//
// Takes a picture from the app and asks Gemini to redraw it as a simple, cookie-cutter-friendly
// drawing: one bold silhouette, a few thick connected lines, flat colours, no shading or labels.
// The app then traces that drawing. The Gemini API key lives here as a secret, never in the app.
//
// POST /redraw   body: {"image": "data:image/png;base64,...", "style": "color" | "lineart"}
//                reply: {"image": "data:image/png;base64,..."}   or   {"error": "..."}

const MODEL = "gemini-3.1-flash-image";
const MAX_BYTES = 6 * 1024 * 1024; // largest picture accepted (base64 included)

const PROMPT_LINEART = `Redraw this picture as clean black line art of its main subject.

Content:
- Only the main subject, centred, filling about 85% of the image width or height.
- No words, letters or numbers anywhere in the image. Remove every label and the thin pointer line that leads to it, and remove arrows, captions, logos, frames, sparkles, motion marks, shadows and background objects.
- Keep the subject's real silhouette, simplified and smooth, with the bumps, tips and notches that make it recognisable.
- Keep the details that make it recognisable as simple lines and shapes: lines where parts meet or overlap, eyes, nose, mouth, openings, seeds, plates, layers, or a simple pattern that belongs to it.
- Keep any face exactly as it is: where the eyes look, the shape of the mouth, the eyebrows and the expression. Keep the pose and the character.
- Never leave out a part of what the subject is (a head or tip, a face, an opening, a limb, a petal); make it bigger and simpler instead. Never add anything that is not in the original.

Drawing rules:
- Pure black lines on a plain white background. No colour, no grey, no fills, no shading, no texture. Only pupils, seeds or similar small details may be small solid black dots.
- Every line has the same even weight, about 1.5% of the image width, the outline included.
- The edge of the subject itself is the outline: one single closed line exactly on the subject's edge. Never draw a second line around it, a border, a halo or any shape around the subject.
- Lines are complete and connected: every inner line ends exactly on the outline or on another line, or is a small closed shape (an eye, a ring, a dot). No gaps, no broken or dashed lines, no loose ends floating in space.
- The result will be printed small, about 8 cm wide. Make every detail large and simple, at least about 5% of the subject's width. Keep at least about 4% of the subject's width of empty space between any two lines. Usually 5 to 20 details in total.
- Parts that stick out (a stem, a stalk, a tail, an antenna, a handle) are drawn as a solid shape at least about 6% of the subject's width thick, firmly joined to the body, never as a single thin line. Pointed tips (ears, horns, leaves) are slightly rounded.
- Round things (eyes, pupils, dots, openings, rings) are drawn as clean, regular circles or ovals.
- Smooth, confident curves, like a minimal icon or a clean colouring-page drawing. Output an image only.`;

const PROMPT = `Redraw this picture as a simple, bold, flat illustration of its main subject.

Content:
- Only the main subject, centred, filling about 85% of the image width or height.
- No words, letters or numbers anywhere in the image. Remove every label and the thin pointer line that leads to it, and remove arrows, captions, logos, frames, sparkles, motion marks, shadows and background objects.
- Keep the subject's real silhouette, simplified and smooth, with the bumps, tips and notches that make it recognisable.
- Keep the details that make it recognisable, as simple shapes: lines where parts meet or overlap, eyes, nose, mouth, openings, seeds, plates, layers, or a simple pattern that belongs to it.
- Keep any face exactly as it is: where the eyes look, the shape of the mouth, the eyebrows and the expression. Keep the pose and the character. Only simplify how they are drawn, never what they show.

Size:
- The result will be printed small, about 8 cm wide, and pressed into dough. Every detail must still read at that size.
- Make details large and bold. A detail smaller than about 5% of the subject's width is drawn bigger and simpler, or merged with its neighbour into one shape. Only decoration may be left out (for example: a leaf keeps its outline and at most one centre vein; many tiny seeds become a few clear dots).
- Never leave out a part of what the subject is: a head or tip, a face, an opening, a limb, a petal. Make it bigger and simpler instead.
- Never add anything that is not in the original picture: no new shapes, rings, marks, crosses or patterns. Stay faithful to the original's shapes and their positions.
- Keep at least about 4% of the subject's width of empty space between any two lines. Fewer, bigger, well-spaced details are better than many small ones, but every part of the subject stays. Usually 5 to 15 details in total.

Style:
- Thick black lines of one even weight, about 2% of the image width, for the outline and every inner line.
- The edge of the subject itself is the outline: one single black line drawn exactly on the subject's edge, not around it. Never draw a second line parallel to it, a border, a halo, a white edge, a sticker edge or any shape around the subject.
- Fill each area with one flat colour. No shading, gradients, highlights, reflections or texture.
- Leave clear space between lines; two lines never run close and parallel.
- If the picture shows human anatomy, draw it as a neutral, schematic biology-textbook illustration.
- Plain off-white background (#F7F1E3). Output an image only.`;

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

    // Gemini's REST format has changed between versions; try the current one, then the older one.
    const style = body.style === "lineart" ? "lineart" : "color";   // only these two built-in styles
    const parts0 = [{ text: style === "lineart" ? PROMPT_LINEART : PROMPT }, { inline_data: { mime_type: m[1], data: m[3] } }];
    const tries = [
      { url: `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`,
        gen: { responseModalities: ["IMAGE"], responseFormat: { image: { imageSize: "1K" } } } },
      { url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        gen: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { imageSize: "1K" } } },
      { url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        gen: { responseModalities: ["TEXT", "IMAGE"] } },
    ];
    let why = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      let g = null;
      for (const t of tries) {
        g = await fetch(t.url, {
          method: "POST",
          headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: parts0 }], generationConfig: t.gen }),
        });
        if (g.ok) break;
        const txt = await g.text();
        let msg = txt; try { msg = JSON.parse(txt).error.message || txt; } catch {}
        why = `Gemini ${g.status}: ${String(msg).slice(0, 300)}`;
        console.log(why);
        if (g.status !== 400 && g.status !== 404) break;   // only a format problem is worth another format
      }
      if (!g.ok) return reply({ error: g.status === 429 ? "busy, try again in a minute" : "redraw failed", detail: why }, 502, h);
      const out = await g.json();
      const cand = (out.candidates && out.candidates[0]) || {};
      const parts = (cand.content && cand.content.parts) || [];
      const imgs = parts.filter(p => (p.inline_data || p.inlineData) && !p.thought);
      const last = imgs[imgs.length - 1];
      if (last) {
        const d = last.inline_data || last.inlineData;
        return reply({ image: `data:${d.mime_type || d.mimeType || "image/png"};base64,${d.data}` }, 200, h);
      }
      // no picture: note why (finish reason, block reason, any text) and try again
      const text = parts.filter(p => p.text && !p.thought).map(p => p.text).join(" ").slice(0, 200);
      const block = out.promptFeedback && out.promptFeedback.blockReason;
      why = `no image; finish: ${cand.finishReason || "-"}${block ? "; blocked: " + block : ""}${text ? "; text: " + text : ""}`;
      console.log(why);
    }
    return reply({ error: "no picture came back", detail: why }, 502, h);
  },
};
