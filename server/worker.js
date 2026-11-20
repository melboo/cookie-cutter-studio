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

const SYSTEM_LINEART = `You turn pictures into clean black line art for cookie cutters. Draw on a square 1024 x 1024 pixel canvas and follow these rules for every picture. The sizes are in pixels on that canvas and they are strict.

What to draw:
- Only the main subject, centred. Leave a margin of at least 60 pixels on all four sides: nothing touches or crosses the edge of the canvas. A subject cut off in the original (a bust, an arm or sleeve coming in from the side) is shortened so it ends in a smooth, rounded end at least 60 pixels inside the edge, and the outline goes all the way round. Check the four edges before you finish.
- No words, letters or numbers anywhere. Remove every label and the thin pointer line to it, and remove arrows, captions, logos, frames, sparkles, motion marks, shadows and background objects.
- Keep what the subject is. An object stays that object with its own silhouette (a pad keeps its wings, a bottle stays a bottle); never turn it into an animal, a face or another thing. Never add anything that is not in the original, and never leave out a part of what the subject is (a head, a face, a hand, an opening, a petal): make it bigger and simpler instead.
- Keep the real silhouette, simplified and smooth, with the bumps, tips and notches that make it recognisable.
- Anatomy stays correct: every part keeps its real shape, position and proportion as in the original. Simplify how parts are drawn, never what they are; never turn a body part into an object such as a cup, tube or spiral.
- More than 3 people or figures: draw only the 3 most important ones, large.
- Never add anything: no borders, clouds, frames, halos, hearts, stars, sparkles or decorations that are not a real part of the subject. Leave out specks, dust, dots and texture completely; never turn them into symbols.
- If the subject sits inside a shape (a heart, a circle, a badge), that shape is the outer outline of the drawing: keep it.

Lines:
- Pure black lines on plain white, nothing else. Every area stays white: no colour of any kind (no blue, purple, red or skin tones), no grey, no filled areas, no shading, no texture, not even on a hat, a stain or clothing. The only solid black shapes allowed are the pupils.
- Every line inside the outline uses the same marker as the outline, never thinner. Leave out any detail that does not fit with 40 pixels of white around it.
- Draw every line, the outline included, with ONE thick round marker whose tip is 1/70 of the picture width (14 pixels on 1024), like a child's felt-tip pen, never a fine pen. Every line has exactly this thickness. If a detail cannot be drawn with this marker while keeping lines 4 marker-widths apart, leave the detail out; never draw a thinner line.
- Every edge is drawn with ONE line. Never draw a part as a hollow band between two parallel lines: no doubled outline, no inner copy of the outline, no rim, seam, border or stitching. A tube, canal wall, stalk, strap, limb or stem is either one single line or a solid part of the outline itself, never two parallel lines.
- A solid symbol or shape (a female sign, a heart, a star, a letter-like sign) is drawn as its outer outline only, once, with nothing inside that copies its edge.
- Lines that do not touch are at least 40 pixels apart everywhere. If two lines would come closer, draw one line instead.
- Repeating marks (rungs, rings, stripes, folds, strands, veins, filing marks) are at most 4 single lines, at least 60 pixels apart. A uterus canal has at most 4 rungs.
- Lines are complete and connected: every inner line ends exactly on the outline or on another line, or is a small closed shape. No gaps, no dashed lines, no loose ends.
- The subject's own edge is the outline: one single closed line exactly on its edge. Never draw a second line, a border or a halo around it.
- The whole drawing is ONE connected shape with ONE closed outline. Parts that float apart in the original (a hand above a head, a second object) are moved until they touch and join the main shape, or are left out. Parts that stick out (stems, ears, tails, fingers, arms, sleeves) are part of the one outline and at least 60 pixels wide, with rounded tips; never a thin spike or needle.
- At most about 12 inner lines in total. Smooth, confident curves, like a minimal icon or a clean colouring-page drawing. Round things are clean circles or ovals.

Faces and hands:
- Keep every face exactly: where the eyes look, the shape of the mouth, the eyebrows and the expression.
- Each eye is ONE closed almond at least 70 pixels long and 35 pixels tall, with one solid round pupil 25 to 30 pixels across inside it, placed where the original looks. The eye does not touch the brow, the nose, the hair or any other line: keep at least 30 pixels of white around it. No eyelashes, no lash flicks, no eye shading.
- Each eyebrow is ONE single curved stroke, never a thin leaf shape or a closed shape.
- The nose is one short line or hook, never a dot.
- The mouth is ONE closed lip shape at least 90 pixels wide and 40 pixels tall, with ONE parting line from corner to corner, keeping the cupid's bow and the expression. It does not touch the nose or the chin line.
- Hair is one shape with at most 3 smooth inner lines, never many strands and never zig-zags.
- Hands are simple mitten shapes at least 120 pixels wide, with no fingertip narrower than 90 pixels; never thin separate fingers; at most one thumb line and one finger line, at least 40 pixels apart.

Output one image only, with no text.`;


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
- If the picture shows human anatomy, draw it as a neutral, schematic, anatomically accurate biology-textbook illustration.
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
      parts0 = [{ text: "Redraw this picture following the rules. Draw only what is in this picture." }, img];
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
