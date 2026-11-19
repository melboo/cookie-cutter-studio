# CUT IT. – Handoff (branch `auto-cookie`)

State as of 17 Nov 2026. Read this first, then `docs/review/round7b_review.md`.

## Goal

**CUT IT.** turns any uploaded picture (or a drawing) into a clean, simple line drawing and then into a 3D-printable cookie cutter (`.stl`).

The quality bar is **Bakerlogy** (bakerlogy.com): smooth, even lines, crisp joins, a sturdy cutting wall, and imprint lines that still read at about 8 cm.

The flow is upload → AI redraw (clean line art) → the user can adjust or erase → cutter.
- The upload must never go straight to a cookie.
- The cookie view is only a preview. Judge quality by the drawing and the cutter.

The drawing must follow the owner's rules:
- Keep faces exactly (where the eyes look, the mouth shape).
- No extra outline around the object: its own edge is the outline.
- Every line connects, and joins are as smooth in the cutter as in the drawing.
- Round things are truly round.
- Stems and other thin parts are thick enough to hold.
- Details are big enough to survive baking.
- Anatomy is correct.
- Overall: easy, cute, clean.

## Branches

- `main` is live at https://melboo.github.io/cookie-cutter-studio/. It has trace mode: the upload sits faded behind the canvas.
- `auto-cookie` is this work: AI redraw plus vector conversion. Merge it into `main` only once the reviewer passes the results and the owner is happy.

## Architecture

- **Single-file app.** `build.py` inlines `vendor/*` and `src/*` into `index.html`. Always run `python3 build.py` after editing `src/`, and commit `index.html` too.
- **Redraw server.** `server/worker.js` is a Cloudflare Worker at https://cut-it-redraw.mnbossert.workers.dev.
  - It calls Gemini `gemini-3.1-flash-image` with the `SYSTEM_LINEART` rules, `temperature` 0.4 and `seed` 7.
  - A text check with `gemini-3.5-flash` triggers a redraw when the drawing contains words.
  - It makes up to 3 attempts.
  - Only allowed origins (melboo.github.io, localhost) can call it.
  - The Gemini key is a Cloudflare secret. **Never put a key in the repo.**
  - The owner deploys by pasting `worker.js` into the Cloudflare dashboard editor.
  - **The latest rules (commit `313c1a9`) may not be deployed yet. Ask the owner.**
- **Vector conversion.** `vectorDesign()` in `src/app.js` turns the redrawn PNG into:
  - `outline`: the cookie silhouette, in mm;
  - `ink`: all imprint ridges as one shape, so every join is kept.

  The steps:
  1. Raster at about 720 px with 24 px padding.
  2. Close gaps in the outline (1–3.5 mm, with a coverage check), then flood from outside to get the silhouette.
  3. Make ridges an even width: thicken thin lines to about 1.1 mm, then thin thick ones to about 0.9 mm.
  4. Turn small separate dots into true circles.
  5. Add bridges only where the outline leaked.
  6. Fill only pinholes (under about 1.2 mm).
  7. Make the cutting wall an even 1.4 mm band along the outline. Within 2.8 mm of the wall, keep only ink that runs in from the inside.
  8. If more than 3% of the ink lies outside the silhouette, the outline is open: redraw once.
  9. If the drawing touches the picture edge: redraw once.
  10. Trace with ImageTracer (`vendor/imagetracer.js`), then `smoothPoly()`: simplify with a 1 px tolerance, then corner-cut, keeping turns over 55° sharp.
- **Cutter.** In `cutterReady()`, the `d.art.vector` branch:
  - The blade runs along `offset(outline, -0.45)`.
  - Details are `ink ∩ blade line`, and crossbars come from `makeBars`.
  - 3D uses Manifold and three.js; print settings are in `DEFAULT_PRINT`.
- **Centre-line ridges (since 19 Nov).** The inner lines are no longer the drawn ink itself. `clRidges()` (in `src/app.js`, mirrored in `tools/centerline.js`) thins the ink to centre lines, builds a graph, drops stubs off thick corners, removes the drawn outline's own centre line (the wall replaces it), merges lines whose centres are closer than 1.3 mm, smooths every line (gaussian, real corners kept), turns near-round loops into true circles and small separate blobs into dots, and pulls lines that run within ~2.3 mm of the wall onto it. Then every line is drawn again at 0.9 mm with round ends (`strokeLines`). The outline is smoothed with `clSmooth`. Parts narrower than ~4.3 mm (`thinPart`) trigger one redraw, like `touchesEdge` and `openOutline`.
- **Prototype.** `tools/vector-prototype.js` (uses `tools/centerline.js` and `vendor/clipper.js`) is the same conversion as a Node script for fast iteration. Run it as `SRC=dir_of_pngs OUT=outdir node tools/vector-prototype.js name1 name2 …`. It needs `pngjs` and `imagetracerjs`, and writes `NAME_cutter.svg`, with cream for the cookie and dark for the plastic. Port changes from the prototype to `src/app.js`.

## How quality is judged

- **Rubric:** `docs/review/rubric.md`, with drawing checks D1–D13 and cutter checks C1–C14. C14 means joins in the cutter must be as smooth as in the drawing.
- **Reviewer:** a separate agent judges each round against Bakerlogy and gives PASS/FAIL per picture. The owner doesn't want to critique by hand.
- **Before/after sheets:** always show original | Gemini drawing | cutter.
- **Test pictures:** contemporary feminist illustrations from Unsplash (free licence), loaded straight from the source: uterus, pad, lotus, nails, hearts, stylish, duo, heart, hands, venus. **Don't commit them** (no third-party images in the public repo). The older set is in `test-images/` (temporary; remove before merging).

## Current status

19 Nov, after review round 8 (`docs/review/round8_review.md`):
- Pupils and dots that touch a line (an eye's lid) are found as thick compact cores (more than 2x the line's half-width) and kept as dots of at least 2 mm. Round 8 had deleted them.
- Line merging is off by default (`opt.merge`): at any radius it invented knots and crossings in faces.
- Lines within 2.9 mm of the wall are pulled onto it along their whole length, then re-smoothed; line ends that met the drawn outline run into the wall; true circles are never pulled.
- Hair-thin spikes (lash tips through the outline) are removed from the cookie shape (opening by 0.8 mm); the outline is smoothed more (sigma 1.2 mm).
- `tooBusy`: total line length per cookie area over 0.25 mm/mm² (the crowded heart is 0.29, all others 0.19 or less) asks for one redraw; if it is still busy the bar says so.
- Review round 9: venus PASSES (first one). Fixed after it:
  - Dots only for thick, round cores (inscribed radius over 2x the line half-width, roundness 1.35), never within ~1.6 mm + dot radius of the wall.
  - Narrow enclosed pockets inside the drawing (under ~2 mm across: lips, brows, lash roots) are filled first, so they become one line.
  - Wall pull only for stretches that run ALONG the wall (within 3.5 mm); lines heading into the wall keep their direction, and ends that met the outline run straight on into it. Closed shapes are never pulled.
  - Outline smoothing moves no point more than 0.35 mm (finger notches stay); strokes poking out of the cookie (lash tips) are removed when a protrusion is at least 85% ink.
  - Size comes from the cookie itself, not from all ink (duo was 60 mm instead of 80).
  - `tooBusy` is now separate lines + dots per 1000 mm² over 28 (heart 37, others 19 or less). A cookie whose dough splits into pieces inside the wall counts as `thinPart`. Both show a short message in the bar after the one automatic redraw.
- Review round 10: venus still the only pass. Fixed after it:
  - Pocket filling only for real slits (under ~0.7 mm); at 2 mm it collapsed whole lips (stylish became an "O").
  - Dot minimum 1.6 mm across (nostrils were 2 mm balls).
  - Wall: ends that met the drawn outline run straight on into it (only if within 2.2 mm), and nothing within 5 mm of such an end is pulled sideways; the along-wall pull only moves stretches at least 3 mm long. This removed the zig-zag "feet" and doubled stubs.
  - A line that forks into two short branches at the wall keeps the straight one.
  - Notches: small areas filled by the outline's gap-closing that are really outside (reachable from outside without closing) are given back.
  - Lash spikes: protrusions narrower than ~2 mm that are at least 70% ink leave the cookie.
- Review round 11: venus still the only pass. The remaining faults are local (see `docs/review/round11_review.md`). Fixed after it:
  - Closed shapes with an inside under ~1.5 mm (hollow brows, doubled lids) close up and become one line. Lips stay parted.
  - Convex outline tips get at least a 0.6 mm radius (pad ear tips were needle-sharp).
- Still open from round 11: ovary arcs at joins; lines 0.1–2.4 mm from the wall or another line (stylish mouth, heart rim, pad channels); nostril hooks still become 2 mm dots; lotus centre knot; hearts hair outline jagged. Several of these are also drawing-side: the new worker rules should reduce them.
- Review round 12: venus still the only pass; the reviewer noted gaps must be judged on the built cutter, not on the drawing. Fixed after it:
  - `clRefine()`: a second pass on the cutter as built (ridges at 0.9 mm plus the wall band). Every dough gap narrower than ~1.5 mm, between ridges or a ridge and the wall, is closed and the centre lines are taken again, so it becomes one line. The second pass keeps the first pass's dots and never makes new ones.
  - The wall's inner (cookie-side) face is rounded by 0.6 mm too, so tips like the pad's ears aren't needle-sharp on the dough side.
- 19 Nov: the owner deployed the new `server/worker.js` (17 Nov rules). Rerun through the live worker on 19 Nov: the pad is a pad again (no cat), the crowded heart is simpler, duo's outline is closed. Side effects: Gemini now draws thinner lines, the uterus canal got ~10 rungs only ~1 mm apart, and venus became a hollow (double-line) symbol. Conversion fix after this run: a wall-pull stretch must keep a steady distance from the wall (range under 1.2 mm), so arcs like the ovaries are no longer pulled into it. Review round 13 runs on the new drawings (`/tmp/gz/png13` in the session).

## Status at review round 7b

**0 of 10 cutters pass.** Uterus and venus are close. Full details with coordinates are in `docs/review/round7b_review.md`.

**Fixed since round 7:**
- stair-stepped outlines;
- the wall drawn thinner than the ridges;
- corner knobs;
- lash tips reaching the edge;
- big solid fills;
- open outlines (now sent back for a redraw).

**Next conversion fixes, in order:**
1. **Make the wall-zone pruning safe.**
   - Only drop whole branches that touch the outline and end freely within 2.8 mm (spurs, corner bulges).
   - Never cut a stroke in the middle. Today it splits hair strands on the hands picture.
   - Afterwards, remove pieces under 3 mm.
   - Parts narrower than about 2 × wall + 1.5 mm should trigger a redraw instead of turning solid.
   - For gaps under 2.5 mm that aren't pinholes, merge the two strokes onto one centre line.
2. **Use a real curve fit instead of corner-cutting.**
   - Fit smooth splines (potrace or Schneider style), and fit circles to near-round loops (the venus rings still show about 12 corners).
   - Exclude stroke ends and dots from the sharp-corner rule: give free ends round caps and output dots as circles. Today pupils become kites or D-shapes, and stroke ends come out flat.
3. **Make ridges uniform.** Reduce the inner ink to centre lines, then redraw every ridge at a constant 0.9 mm with round caps and joins.

**Drawing-side faults (Gemini):**
- The pad turned into a cat.
- The heart picture has 11 tiny figures.
- Hairlines, lashes and hair strands.

The rules for these were added in `server/worker.js` (commit `313c1a9`). They take effect once the owner deploys them. After that, rerun all 10 and re-review.

**Also open:**
- A slight extra line inside the wall at the top of the owl.
- Select and erase don't yet work on vector designs (the pen works).
- Check the whole flow on a phone.

## Standing rules from the owner

- Every change goes to GitHub (`melboo/cookie-cutter-studio`) and, once merged, to the published Claude artifact.
- App text never mentions Claude. The AI helper is called **"Cookie Monster AI"**.
- Mobile must work.
- No API keys anywhere in the code or the repo.
- No copyrighted art in the public repo.
- Before merging: remove `test-images/` and the debug code.

## Testing tips

- **Headless:** Playwright plus Chrome. Point `REDRAW_URL` at a local mock server that returns a fixed PNG, to test the conversion and 3D without calling Gemini.
- **Live worker:** CORS only allows melboo.github.io and localhost, so call it from a page on those origins.
