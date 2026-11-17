// CUT IT. redraw server (Cloudflare Worker)
//
// Takes a picture from the app and asks Gemini to redraw it as a simple, cookie-cutter-friendly
// drawing: one bold silhouette, a few thick connected lines, flat colours, no shading or labels.
// The app then traces that drawing. The Gemini API key lives here as a secret, never in the app.
//
// POST /redraw   body: {"image": "data:image/png;base64,...", "style": "color" | "lineart"}
//                reply: {"image": "data:image/png;base64,..."}   or   {"error": "..."}

const MODEL = "gemini-3.1-flash-image";
const CHECK_MODEL = "gemini-3.5-flash";   // only used to spot text in a drawing
const MAX_BYTES = 6 * 1024 * 1024; // largest picture accepted (base64 included)

const SYSTEM_LINEART = `You turn pictures into clean black line art for cookie cutters. Follow these rules for every picture.

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
- Smooth, confident curves, like a minimal icon or a clean colouring-page drawing.
- Match the style of the example drawing exactly: the same line weight, cleanliness and level of detail. Never copy its subject.
- Output one image only, with no text.`;

const STYLE_EXAMPLE = "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"; // our own example of the target style (an owl), sent with every line-art request

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

// Ask a fast Gemini text model whether the drawing contains any letters. If the check itself fails, the drawing is kept.
async function hasText(env, d) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CHECK_MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Does this image contain any written letters, words or numbers? Answer only YES or NO." },
                             { inline_data: { mime_type: d.mime_type || d.mimeType || "image/png", data: d.data } }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 5 },
      }),
    });
    if (!r.ok) return false;
    const j = await r.json();
    const t = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || "").join(" ");
    return /\bYES\b/i.test(t);
  } catch { return false; }
}

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
    const img = { inline_data: { mime_type: m[1], data: m[3] } };
    let parts0, sys = null;
    if (style === "lineart") {
      sys = { parts: [{ text: SYSTEM_LINEART }] };
      parts0 = [
        { text: "Example of the style to use (do not copy its subject):" },
        { inline_data: { mime_type: "image/png", data: STYLE_EXAMPLE } },
        { text: "Redraw this picture in exactly that style:" },
        img,
      ];
    } else {
      parts0 = [{ text: PROMPT }, img];
    }
    const base = `https://generativelanguage.googleapis.com`;
    const steady = { temperature: 0.4, seed: 7 };
    const tries = [
      { url: `${base}/v1beta/models/${MODEL}:generateContent`, sys, gen: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { imageSize: "1K" }, ...steady } },
      { url: `${base}/v1beta/models/${MODEL}:generateContent`, sys, gen: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.4 } },
      { url: `${base}/v1/models/${MODEL}:generateContent`, sys: null, gen: { responseModalities: ["IMAGE"], responseFormat: { image: { imageSize: "1K" } } } },
    ];
    let why = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      let g = null;
      for (const t of tries) {
        g = await fetch(t.url, {
          method: "POST",
          headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(t.sys
            ? { system_instruction: t.sys, contents: [{ role: "user", parts: parts0 }], generationConfig: t.gen }
            : { contents: [{ parts: sys ? [{ text: sys.parts[0].text }, ...parts0] : parts0 }], generationConfig: t.gen }),
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
        // a drawing with words or labels in it is redrawn (only as long as attempts remain)
        if (style === "lineart" && attempt < 2 && await hasText(env, d)) { why = "drawing had text in it"; console.log(why); continue; }
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
