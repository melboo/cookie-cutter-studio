# Bakerlogy Quality Rubric (cookie-cutter app review)

Evidence base: reference images in /home/claude/review/ref/ (clitoris anatomy cutter + dough imprint + baked cookies, Venus of Willendorf cutter + imprint, vulva, uterus, heart & brain, alpaca, sea turtle, paw-heart, dachshund, French bulldog, ice cream cone, teabag/tag, teapot/teacup, hot dog/pizza/burger, cupcake, honey jar). Detail crops in /home/claude/review/crops/.
Scale assumption: finished cutter ~8 cm on its widest side, so 1 mm = 1.25 % of the width. On an 800 px-wide render, 1 mm ~ 10 px.

Every criterion is PASS / FAIL. One FAIL in a "Hard" criterion = the result does not reach Bakerlogy quality. "Soft" criteria may fail once and still be acceptable if everything else is excellent.

---

## A. What Bakerlogy actually does (observations)

1. Silhouette is simplified and chunky. Venus: head, torso, breasts, belly, two legs: an outline with ~10 smooth lobes and no thin spikes. Clitoris: hood knob, two tapered crura, a bulb mass, and a bottom edge with small rounded bumps. Alpaca: the wool is drawn as an even scalloped edge, not individual hairs.
2. One stroke weight everywhere. Every imprint groove (Venus hair waves, breast outlines, clitoris lobes, the tiny glans loop) has the same width. No tapering, no brush ends, no thick/thin calligraphy. Ridges are visibly thinner than the cutting wall (ridge about 0.8 to 1 mm, cutting wall about 1.2 to 1.6 mm at the tip).
3. Curves are long and fair: few inflection points, no wobble, no flat spots, no kinks. Where texture is intended (Venus hair waves, the alpaca's scalloped wool, the clitoris bottom bumps) it is a regular rhythm with constant period and amplitude, never noise.
4. Inner lines may float. The Venus hair waves, the arm/shoulder line, the belly-fold ends and the knee lines all end freely inside the dough, with clean rounded ends. Floating is fine. What matters is that every free end is deliberate (a line that stops 1 mm short of another line or the edge never appears).
5. Junctions are clean: T-junctions meet square with no overshoot, no gap and no blob. Y-merges (Venus pubic triangle, clitoris center line into the lobes) merge tangentially. Tessellations (turtle shell, waffle cone) close every cell, with every line ending on another line or the outline.
6. Detail is sparse and iconic. Venus: about 15 strokes in total. Clitoris: about 8 strokes. Food: 3 to 10 strokes. Only the strokes that make the subject readable at arm's length are kept. No shading, no hatching for tone, no perspective, no shadows, no outline doubling. (Hatch-like patterns appear only as a texture motif with even spacing: waffle cone, turtle shell.)
7. Small features are tiny closed shapes or short strokes, never filled blobs and never sub-millimetre dots. Venus navel: a closed teardrop about 5 to 6 mm wide. Clitoris glans: a closed loop about 4 mm across with a short tail. Teabag hole: a closed circle ridge about 5 mm across, not a cut-through hole. Dog eyes and noses: small closed ovals.
8. Spacing is generous. Parallel ridges sit at least 3 mm apart (the Venus hair waves are about 8 to 10 mm apart). Ridges never run alongside the cutting edge closer than about 3 mm. They either join it cleanly or stay clearly away.
9. Thin parts are fattened or turned into ridges. No outline protrusion is narrower than about 6 to 8 mm (clitoris crura taper to a rounded tip about 6 mm wide, Venus feet about 15 mm). A teabag string, tail, stem or whisker is omitted or drawn as an inner ridge, never as a thin cut-out arm.
10. Corners are rounded. Outer concave notches have a radius of at least 1 to 2 mm. Sharp convex points are rare and slightly blunted (heart tip, crura tips).
11. Symmetry where the subject is symmetric: the Venus breasts, the uterus and the vulva are mirror-true. Asymmetry is used deliberately (the clitoris is drawn in 3/4 view, with the hood curl to one side).
12. The cookie reads instantly as the subject and keeps its charm when baked. In the baked clitoris cookies every groove survives baking and is legible at plate distance.

---

## B. Rubric for the LINE-ART DRAWING (image-model output)

| # | Criterion | Check | Type |
|---|---|---|---|
| D1 | Pure black on white, no grey, no fill, no shading, no gradients, no texture noise | Histogram is effectively 2 tones; no filled black area larger than a small eye or nose dot (at most about 3 mm equivalent) | Hard |
| D2 | One single closed outer silhouette, no gaps, no doubled outline, no stray marks outside it | Flood-fill from the corner reaches only the background | Hard |
| D3 | Uniform stroke weight | Thickest stroke / thinnest stroke is at most 1.3; no tapered or brush-pen ends | Hard |
| D4 | Smooth, fair curves | No visible wobble, jaggies, kinks or hairy edges at 100 % zoom; intended texture has a regular period | Hard |
| D5 | Sparse detail | Interior strokes at most about 20 (simple subjects at most 10); nothing that would be closer than 3 mm at 8 cm | Hard |
| D6 | Silhouette chunky enough | No protrusion narrower than about 6 mm at 8 cm (about 7.5 % of width); no thin stems, whiskers, strings or antennae as outline | Hard |
| D7 | Clean junctions | Lines meet exactly (T or tangential Y); no near-misses (gap under 1.5 mm), no overshoots, no blobs at joins | Hard |
| D8 | Deliberate free ends | Every floating line end is at least 2.5 mm from any other line or the edge, or it touches exactly | Soft |
| D9 | Small features handled the Bakerlogy way | Eyes, nostrils, holes and navels are small closed outlines or single dots at least 2 mm across, at most a few of them; no clusters of specks | Hard |
| D10 | Flat, iconic, front or profile view | No perspective, no cast shadow, no cross-hatching for tone, no sketchy construction lines | Hard |
| D11 | Recognisable and faithful to the uploaded subject | A stranger names the subject in under 2 seconds; key identifying features (from the photo) retained | Hard |
| D12 | Symmetry where expected | Symmetric subjects are mirror-true within about 2 % of width | Soft |
| D13 | No text unless asked; any text is bold, simple sans, stroke equal to other lines, letter height at least 8 mm | Visual check | Hard |

---

## C. Rubric for the CUTTER DESIGN (app output: cutting edge plus ridges)

| # | Criterion | Check | Type |
|---|---|---|---|
| C1 | Cutting edge = exactly the drawing's outer silhouette, one closed smooth curve, no self-intersection, no stair-stepping or vectorisation zig-zags | Overlay the drawing and check visually at 200 % | Hard |
| C2 | Scale | Widest dimension 75 to 85 mm (or as specified) | Hard |
| C3 | Ridge width uniform and correct, about 0.8 to 1.0 mm, thinner than the cutting wall (about 1.2 to 1.6 mm at the tip); the ridge is lower than the cutting edge | Measure in the design | Hard |
| C4 | Every inner line of the drawing is represented once (no doubled ridges from tracing both sides of a stroke = "outline of a line"); no missing strokes | Count strokes in the drawing against ridges in the design | Hard |
| C5 | Minimum ridge-to-ridge and ridge-to-edge clearance at least about 2.5 to 3 mm wherever lines do not intentionally meet | Measure the closest pairs | Hard |
| C6 | Junctions physically joined: ridges that meet in the drawing meet in the design (no hairline gap, no overlap stubs); ridges that join the edge fuse into the cutting wall | Inspect each junction | Hard |
| C7 | Small features: closed loops have an inner opening of at least about 2.5 mm (smaller ones fill with dough and print as a blob); dots become small rings or short dashes of at least about 2 mm, or are dropped | Measure | Hard |
| C8 | No outline neck or protrusion narrower than about 6 mm; no inner concave notch radius under about 1 mm (dough tears, cookie breaks) | Measure | Hard |
| C9 | No orphan fragments: no ridge segment shorter than about 3 mm, no specks, no noise islands | Visual check / count | Hard |
| C10 | Floating ridges are supported: every ridge not touching the edge is connected by a back bridge or crossbar (as on the Venus and clitoris cutters) | Inspect the 3D view or the bridge layer | Hard |
| C11 | Curves are smooth after vectorisation: no polygon facets visible at 200 %, no node wobble; circles intended as circles are round (aspect ratio 1.00 to 1.05) | Visual check plus measurement | Hard |
| C12 | Free ridge ends are clean and rounded, not jagged stubs | Visual check | Soft |
| C13 | The predicted imprint reads like a Bakerlogy cookie: at arm's length (render the design at about 300 px wide) the subject is instantly legible and nothing looks cluttered | Visual check | Hard |
| C14 | Junction fidelity (owner requirement): every place where lines meet (inner line to inner line, inner line to outline/cutting edge) looks exactly as smooth and clean in the CUTTER as the same join in the DRAWING. No gaps, notches, blobs, stubs, tapering/thinning or kinks introduced at the junction; a join that is connected in the drawing stays connected; a closed loop in the drawing stays closed | Compare drawing and cutter side by side, zoomed (4x) at every junction; list each junction that is worse in the cutter | Hard |

---

## D. Automatic FAIL triggers (any one = not Bakerlogy quality)
- Grey shading, filled black regions, or hatching for tone in the drawing.
- Doubled ridges (both sides of a drawn stroke traced as two parallel ridges).
- Ridges closer than 2 mm to each other or to the edge without touching.
- Any junction that is worse in the cutter than in the drawing (gap, notch, stub, blob, thinning, kink) - C14.
- Specks, fragments or noisy stubs anywhere in the cutter.
- Jagged or faceted outline, or wobbly hand-tremor curves.
- Thin outline appendages (stems, tails, whiskers) under about 5 mm wide.
- More detail than can be read on an 8 cm cookie (busy, cluttered imprint).
- Subject not recognisable, or key feature of the uploaded image lost or invented.

## E. Reporting format for Step 2
For each result: D1 to D13 and C1 to C13 PASS/FAIL. For each FAIL: location in the image (quadrant or feature name plus approximate pixel coordinates), what is wrong, and the specific fix (for example "merge the two parallel ridges on the left ear into one centre-line ridge", or "widen the tail to 7 mm or convert it to an inner ridge"). Finish with an overall verdict: Bakerlogy quality YES or NO.
