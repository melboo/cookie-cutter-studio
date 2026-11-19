# Round 8 review: centre-line conversion (thin, clean, merge, smooth, circle-fit, even 0.9 mm ridges, 1.4 mm wall, narrow-part / open-outline / edge gates)

**Inputs and method**
- Drawings: /tmp/gz/png (same Gemini drawings as rounds 7 and 7b). Cutters: /tmp/gz/out2/NAME_cutter.svg (mm).
- Each SVG is two filled polyline paths (M/L/Z only, about 0.25 mm point spacing): cream = cookie, dark = plastic (nonzero fill with holes).
- **All coordinates below are SVG mm.**
- Renders in `round8_work/`:
  - `NAME_mm20.png`: 20 px/mm in SVG coordinates.
  - `NAME_1400.png`: the brief's `rsvg-convert -b white -w 1400 -h 1400`.
  - `NAME_draw_mm20.png`: the drawing mapped into the same mm frame, using the ink bounding box against the wall bounding box.
  - `NAME_pair.png`: drawing (left) and cutter (right) with a 10 mm grid.
  - `NAME_Z_*.png`: zoom crops with a 1-5 mm grid.
  - `ov/`, `q/`: overlay and quadrant crops.
- Registration of the drawing is good for lotus, uterus, pad and venus (within 0.5 mm). It is off by about 1 mm for nails and duo, because the outline is open or truncated, so for those I compared shapes side by side.
- **Measurements** (scripts `measure.py`, `wallthk.py`, `wobble.py`, `ringchk.py`, `curv.py`; results in `measure.json`):
  - Width comes from 2 x the distance transform on the skeleton of alias-free masks (`masks.py`).
  - Wall thickness is the distance from the inner wall edge to the outline polyline.
  - Outline fairness is the curvature along the outline after resampling at 0.1 mm.

## Summary table

| # | Image | Cutter (conversion) | Remaining conversion faults (SVG mm) | Gate / drawing notes |
|---|---|---|---|---|
| 1 | uterus | **FAIL (near pass)** | ligament ridge 0.5-0.8 mm from the wall over about 4 mm at (25.5-29.5, 36.5-38.2), mirrored at (61.5-65.5); 0.3 mm pockets (24.5,39.0) and (65.8,39.0); ovary flank flattened to a straight line (15.0, 39-43.5) and mirror (about 76); 1 mm sliver between fimbria and ovary (12.8-14.8, 38-44) and mirror; jog and stub on the canal side (40.5, 70.5-71.3); kinked feet with slivers where the canal lines meet the wall (41.0,90.2) and (49.8,90.3); sharp ligament V rounded off (30.2,34.6) and (60.8,34.8); outline ripple | rungs about 2.2 mm apart (drawing) |
| 2 | pad | FAIL | pad loop now ends 0.4-1.0 mm short of the wall (62.0,74.4), where the drawing merges it tangentially, and the cap is lumpy; merge knot with nub (31.0,31.4) and notch (30.2,33.4); invented H-bridge between near-tangent lines (48.3, 45.6-46.8); stubby Y (19.3,40.2); outline ripple | wrong subject, cat (drawing) |
| 3 | lotus | **FAIL (near pass)** | fingertip pocket (19.3,49.1) 1.1 mm with a knot (18.4,50.3); centre join jog with an under-edge step (41.5,56.6); outline ripple | right petal-tip pocket (66,52) about 1.6 mm, thin fingers (drawing) |
| 4 | nails | FAIL (flagged: narrow parts) | nails mangled: X-crossing (31.5,30), spur (32.5,26-28), J-wedge (21,30-35), pockets (25.8,31.3) 0.5 mm and (26.1,33.0) 0.8 mm; filings teeth with pockets (66.9,45.9) 0.6, (69.0,46.4) 1.1, (70.8,45.6) 0.8 and (71.4,37.0) 0.9 mm; wall lumps (58.2,47.6) 2.15 mm and (90.8,70.3) 2.4 mm | fingers and nails too dense, filings, forearm spike (drawing) |
| 5 | hearts | FAIL (flagged: narrow parts) | face: two invented "pretzel" loops (65-68, 41-43.5) with 0.7-0.8 mm pockets; eye dropped; nose, lips and chin profile lost into the wall (59-62, 44-50); knob on the leg line (26.4,70.8) 1.9 mm; hem ridge hugging the wall 0.5-1 mm along (42-51, 82.5-83.5); lump (51.2,84.2) 2.2 mm; flat end (42.0,82.6) | far too detailed, spiky hair (drawing) |
| 6 | stylish | FAIL | **both pupils deleted** (34.5,28.3) and (47.3,26.3), so the gaze is lost; lashes became a lumpy cluster (28-30.5, 26-28.5); **lash tips turned into a 2 mm spike on the cutting edge** (53.7,24.1); ear knotted into three small loops with a nub (21.2,36.5), pockets 1.1/1.5/2.1 mm; knob at the brow tail join (29.5,23.3) | lashes, filled pupils, 1.4 mm brow interior, lips 2.0-2.35 mm pockets (drawing) |
| 7 | duo | **Correctly gated** (open outline + narrow parts) | if it had passed: pupils lost in 3 of 4 eyes; hair tangle with knot (53.6,18.0) 2.3 mm; brow, lid and pupil knot (60.8,23.6); nostril turned into a 2 mm mid-face dot (58.2,29.9); body lines drawn as dangling 0.9 mm ridges outside the cookie | open silhouette (drawing) |
| 8 | heart | FAIL (**not gated, but should be**) | inner rim ridge hugging the wall at 0.6-1.0 mm over about 25 mm on the left (16-26, 48-62) and right (80-89, 45-58); lump (89.2,45.3) 2.1 mm; about 65 cream cells under 2.5 mm (necklace ladder (20-28, 40-50), badge (65-72, 58-60)); blob (45.4,65.0) 1.9 mm; all faces blank; illegible at 300 px | 11 figures, hairline detail, doubled rim (drawing) |
| 9 | hands | FAIL (flagged: narrow parts) | **neck is solid plastic (45.5-46.5, 27-30.5): the cookie is split into two pieces**, with 0.3 mm cream spikes; **pupils deleted** (39.5,45) and (47.5,45); left brow and lid closed into a loop (36-39.5, 43-44.5); closed lips reduced to a single smile arc (41.5-45.5, 52.7); hair strands merged into a bead rope (47-52, 33-46) with blobs (47.1,37.0) 2.1, (51.4,41.1) 1.6 and (48.6,32.7) 1.5 mm; pockets 1.0-1.5 mm (38.1,35.6), (40.2,43.9), (53.5,45.8), (51.9,49.9) | thin fingers, thin connector, crowded strands (drawing) |
| 10 | venus | **FAIL (C1 only)** | the ring part of the outline ripples: curvature swings from -0.06 to +0.11 /mm around the circle's 0.041 /mm (it goes locally concave every 3-4 mm). It is only 0.12 mm peak-to-peak in position, but it reads as a lumpy wall at 1400 px (`venus_1400_ringL_1to1.png`). The inner ridge is now a perfect circle (0.002 mm). | drawing PASS |

**Result:** 0/10 cutters pass.
- **Near pass:** venus (only the outline fairness), uterus and lotus (local join and sliver faults).
- **Correctly gated:** duo. Nails, hearts and hands are also flagged for redraw.
- **Heart should be gated but is not.** It has 116 subpaths and about 65 sub-2.5 mm cells, and a complexity or density gate is missing.

## Checks that now pass everywhere

- **C2 scale:** widest side 79.9-80.2 mm on all 10.
- **C3 wall versus ridges: fixed.**
  - Ridge width p10/p50/p90 is 0.85/0.90/0.92 mm on all 10. In 7b ridges ranged 0.53-2.0 mm.
  - The wall is an exact 1.40 mm offset on all 10: p1-p95 1.40, measured from the inner wall edge to the outline. It is up to 1.9 mm only at tight concave corners.
  - The ridge sits clearly thinner than the wall everywhere.
- **Stroke caps are round.** The 7b chisel ends are gone: the lotus petal stroke (43.8,19.2) and the uterus rungs are fine. The exceptions are listed per image.
- **True circles for closed near-round loops.** The venus inner ring fits a circle within 0.002 mm, where 7b had a 14-16-gon.
- **Uterus hairpin turn** (31,30)/(60,30) is now a clean round U. The 7b V notch is fixed (`uterus_Z_topjoin.png`).
- **Dark blobs.** None over 1.5 mm in uterus, pad, lotus or venus (7b: lotus 2.4 mm, pad 2.8 mm). The 7b hearts dress wedges and the heart badge and necklace fills are gone.

## Compared with round 7b

**Better**
1. **Even ridge and wall widths** (C3, see above). This was 7b's fix #3, now fully done.
2. **No more solid wedges or blobs from fused strokes.** Uterus, pad, lotus and venus have none. In hearts and heart the largest is under 2 mm, down from 4.6 mm.
3. **Round things round, when they are closed loops.** The venus inner ring is a true circle.
4. **Caps and the uterus hairpin are fixed**, and the lotus fingertip blob is gone.
5. **Gates work:**
   - duo is gated on its open outline;
   - nails, hearts, duo and hands are gated on narrow parts, which is correct: those cutters contain solid-plastic necks and spikes.

**Worse or new**
1. **Pupils are deleted** (new, the most serious fault).
   - In 7b the pupils were ugly (a D-shape and a fused blob) but present. Now:
     - stylish has lost both pupils;
     - hands has lost both;
     - duo has lost 3 of 4.
   - A filled pupil touching a lid line is thinned to a stub and pruned as a "stub off a thick corner". Only separate blobs become dots.
   - The gaze and expression change: stylish's open left eye now reads as a wink, and hands' eyes read as closed.
   - This breaks the owner's rule that facial expressions are kept exactly.
2. **The centre-line merge invents topology.**
   - Strokes 1-1.5 mm apart are merged into knots, X-crossings, small loops, nubs and "bead ropes" that are not in the drawing:
     - pad (30.7,32.5);
     - stylish ear (18-22, 35-40);
     - hands hair (47-52, 33-46);
     - hearts face (65-68, 41-43.5);
     - nails nails (21-34, 26-36);
     - uterus canal stub (40.5,71).
   - In 7b these areas were blobby but did not grow new loops.
3. **Lash tips now become part of the silhouette** (regression).
   - Stylish has a 2 mm spike on the cutting edge at (53.7,24.1). In 7b the lashes had been kept off the edge.
4. **Lines that run beside the wall are neither pulled onto it nor kept clear** (C5 auto-fail).
   - Four cases: the uterus ligaments, the heart inner rim, the hearts hem, and the pad loop end at (62.0,74.4).
   - The 2.3 mm pull rule appears to act only on lines that lie entirely within the band. It misses lines that converge with the wall or end beside it, and leaves 0.5-1 mm cream slivers.
   - The pad case also breaks a connection: the drawing merges the line into the outline, but the cutter ends it 0.4-1.0 mm short of the wall.
5. **The outline is still not fair** (C1, unchanged in kind).
   - Stair-steps were already gone in 7b, but the curvature still oscillates with a 3-4 mm period on every outline: venus, uterus and heart (the smoothest) have a high-frequency curvature RMS of about 0.08 /mm, and nails and hearts about 0.3-0.4 /mm.
   - On venus this is the only remaining fault.
   - Round parts of the outline are not fitted as arcs, unlike closed inner loops, which now are.
6. **Merging flattens circles that touch other lines.**
   - The uterus ovary's left flank merged with the fimbria line, which was about 1.2 mm away, into a straight segment (15.0, 39-43.5), mirrored on the right. The ovaries are no longer round. In 7b they were round but with a filled pocket.
7. **Hands neck:** the cookie is now split into two pieces joined only by plastic. It is gated, but the preview should not show this as a valid cutter.

## Per-image detail

### 1. uterus: FAIL (near pass)
- **Good:**
  - one connected piece, wall 1.40 mm, ridges 0.90 mm, no blobs;
  - the hairpin turns are fixed;
  - the rungs, the cavity "U" (38-53, 61-66) and the top outline are clean (`uterus_pair.png`).
- **C5/C14 ligament (left and mirrored right)** (`uterus_Z_lig.png`, `uterus_Z_ligR.png`):
  - The upper ligament ridge runs 0.5-0.8 mm above the wall along (25.5-29.5, 36.5-38.2). The vertical cream gap at x = 26/27/28 is 0.6/0.7/0.8 mm.
  - The drawing's ovary-circle segment between the two ligament lines leaves a 0.3 mm cream triangle at (24.5,39.0) and at (65.8,39.0). It will fill with dough.
  - The drawing's sharp V where the tube turns into the ligament (30.2,34.6)/(60.8,34.8) is rounded to a U of about 1 mm radius.
- **Round-ness / C7** (`uterus_Z_ovaryL.png`):
  - Each ovary's outer flank was merged with the fimbria hook, which is about 1.2 mm away in the drawing. The ovary now has a straight vertical left side at (15.0, 39-43.5), mirrored at x ≈ 76, so it is not a circle.
  - A 0.8-1 mm cream sliver about 5 mm long remains between the wall and the ovary at (12.8-14.8, 38-44), mirrored at (76-78).
  - There is a cusp where the ovary ridge meets the wall at (14.9,43.5).
- **C14 canal** (`uterus_Z_canalL.png`):
  - The drawing's two near-parallel left canal lines were merged with a sideways jog at y = 70.5-71.3.
  - There is a 0.5 mm stub at (40.6,71.2).
  - The right side (51.8,70) only follows a bend that is in the drawing (`uterus_Z_canalR.png`).
- **C14 bottom** (`uterus_Z_bottom.png`):
  - The two vertical canal lines bend outward just before the wall at (41.0, 89.5-90.5) and (49.8, 89.5-90.5).
  - Each leaves a 0.3 mm cream wedge. The drawing has clean T-joins.
- **C1:** outline ripple (high-frequency curvature RMS 0.08 /mm). It is mild but visible on the tube lobes at 1400 px.
- **Drawing:** the rungs are about 3.2 mm centre to centre, which leaves 2.2-2.3 mm cream between ridges (45.5, 76.0/79.2/82.4).

### 2. pad: FAIL
- **Good:**
  - the even wall replaces the uneven drawn outline;
  - the stain loops are smooth;
  - the top of the pad loop joins the wall cleanly at (24,17.5) and (29.5,17.3).
- **C14/C5 loop end** (`pad_Z_end.png`):
  - In the drawing, the bottom of the pad loop merges tangentially into the outline at about (64,73).
  - In the cutter that stretch was pulled into the wall, but the remaining ridge stops 0.4-1.0 mm short of it at (62.0,74.4).
  - The end cap is a squarish lump with a tail on its underside.
  - So a line that was connected in the drawing ends just short of the wall in the cutter.
- **C14 merge knot** (`pad_Z_knot.png`): two strokes about 1.2 mm apart were merged over about 2 mm at (30.5, 31.4-33.4). The result is a thick knot with a nub at (31.0,31.4) and a notch at (30.2,33.4).
- **C14 H-bridge** (`pad_Z_merge.png`): a blob top and the pad line that nearly touch (0.5 mm gap) are joined by a new 1.3 mm diagonal link at (48.3, 45.6-46.8), with kinks at both ends.
- **C14** (`pad_Z_left.png`): the sharp V where the left blob meets the loop (19.3,40.2) became a short flat-topped stem.
- **C8/A10:** the ear tips are sharp points where the wall widens to 2.0 mm at (11.5,8.8) and (66.6,8.8). This is acceptable, but they could be blunted.
- **Drawing:** the subject became a cat head.

### 3. lotus: FAIL (near pass)
- **Good:**
  - Overlay against the drawing is within about 0.3 mm everywhere (`lotus_overlay.png`, `lotus_ov_top.png`).
  - The petal network and joins are faithful (`lotus_Z_top.png`).
  - The 7b fingertip blob and the 2.3 mm petal pocket are gone, and the stroke ends are round.
- **C7/C14 fingertips** (`lotus_Z_fingers.png`): the third fingertip leaves a 1.1 mm cream pocket at (19.3,49.1) and a small knot at (18.4,50.3). It should be collapsed to one ridge.
- **C14 centre join** (`lotus_Z_centre.png`):
  - Where the left petal line meets the bottom line at (41.5,56.5), the bottom ridge jogs about 0.6 mm and its underside steps at x = 41.5.
  - The drawing has a clean Y.
- **C1:** visible outline ripple on the petal lobes at 1400 px.
- **Drawing:** the right petal-tip pocket (64-68, 49.5-54) is only about 1.6 mm inscribed and will fill; the fingers are thin.

### 4. nails: FAIL (flagged for redraw: narrow parts)
- **Nails and fingers** (`nails_Z_fingers.png`):
  - The four rounded-rectangle nails sit about 1 mm from the finger outlines. Merging produced:
    - an X-crossing between the 2nd and 3rd nails (31.5,30);
    - a spur (32.5, 26-28);
    - a tapered J-wedge for the first nail (21, 30-35);
    - a ladder with 0.5 and 0.8 mm pockets (25.8,31.3) and (26.1,33.0).
  - The finger separations are mostly lost into the wall.
- **Filings** (`nails_Z_filings.png`):
  - jagged teeth with pockets of 0.6-1.1 mm at (66.9,45.9), (69.0,46.4), (70.8,45.6) and (71.4,37.0);
  - a pinhole at (60.5,44.0);
  - wall lumps (58.2,47.6) 2.15 mm and the forearm spike tip (90.8,70.3) 2.4 mm.
- Improved from 7b, which had a solid filings mass and a 3 mm blob, but still unacceptable.
- **Drawing:** filings, forearm spike, nails too dense for 4 mm fingers.

### 5. hearts: FAIL (flagged for redraw: narrow parts)
- **Face** (`hearts_Z_face.png`):
  - The closed eye and brow merged with the forehead line into two small closed loops (65-68, 41-43.5), with pockets of 0.7 and 0.8 mm.
  - The nose, lip and chin profile was absorbed into the wall diagonal (59-62, 44-50).
  - The face no longer reads as a face, so the expression is lost.
- **Body** (`hearts_Z_dress.png`):
  - Knob on the leg line (26.4,70.8), 1.9 mm. A narrow sliver loop in the drawing became a lump on the line instead of a single line.
  - A 1.2 mm diamond became a 3.3 mm dash (45.6, 73.5-76). That is acceptable.
- **Hem** (`hearts_Z_hem.png`):
  - The ridge (42-51, 82.5-83.5) runs 0.5-1 mm from the wall for about 9 mm.
  - Lump (51.2,84.2) 2.2 mm; chisel end (42.0,82.6); jagged joins (52-54, 82-84).
- **C1:** the hair spikes are rounded off, which is acceptable, but there is ripple on every lobe.
- **Drawing:** far too detailed; the hearts motif is dropped.

### 6. stylish: FAIL
- **Expression** (`stylish_Z_eyeL.png`, `stylish_Z_eyeR.png`):
  - Left eye: the 2 mm pupil at (34.5,28.3) is gone. The lid line wobbles where the pupil was (33-35, 27-27.6). The three lashes became a mitten-shaped cluster (28-30.5, 26-28.5), with a dark area of 1.64 mm at (29.4,27.6). The eye now reads as winking or closed.
  - Right eye: the pupil at (47.3,26.3) is gone, leaving an empty almond.
  - The lash tips are now part of the silhouette and make a 2 mm triangular spike on the cutting edge at (53.7,24.1). The wall bulges to 2.3 mm at (52.2,23.9) and there is a 72° outline kink. This is a regression from 7b.
- **Ear** (`stylish_Z_ear.png`):
  - The inner curl's free end (about 1.2 mm from the outer C in the drawing) was merged into it, which created a closed loop and a crossbar.
  - There is a nub at (21.2,36.5) (dark 1.7 mm) and three cream pockets of 1.1, 1.5 and 2.1 mm at (18.9,36.2), (19.2,38.0) and (21.4,39.4).
- **Brow:** knob where the brow tail meets the loop (29.5,23.3). The brow interior is 1.4 mm (34.2,21.1), which comes from the drawing.
- **Mouth:** the shape is kept (`stylish_Z_face.png`). The lip pockets of 2.0 and 2.35 mm at (47.6,35.6) and (47.9,38.1) come from the drawing.
- The lips, nose, hair and neck are good. The outline is smooth apart from the lash spike.

### 7. duo: gated (open outline + narrow parts)
- Correct behaviour.
- If it had gone through (`duo_Z_faceL.png`, `duo_Z_faceR.png`):
  - Pupils are lost in 3 of 4 eyes. Only (29.4,30.2) survives, as a 1.9 mm knob on the lid.
  - Hair strands are tangled into a knot at (53.6,18.0), 2.3 mm.
  - The brow, lid and pupil are knotted at (60.8,23.6).
  - The nostril hook became a 2 mm free dot at (58.2,29.9), which reads like a third eye or a nose ring.
  - The mouth is reshaped.
  - The open body outline is drawn as dangling 0.9 mm ridge lines outside the cookie (wall p10 0.4 mm).

### 8. heart: FAIL (should have been gated)
- The cutting edge is clean, and the heart shape is the smoothest outline in the set.
- **C5:**
  - The drawing's doubled inner rim survives as a ridge 0.6-1.0 mm from the wall for about 25 mm on the left (16-26, 48-62) (`heart_Z_rimL.png`).
  - On the right (80-89, 45-58) the rim merges tangentially into the wall with a 2.1 mm lump at (89.2,45.3) (`heart_Z_rimR.png`).
- **C7:** about 65 cream cells under 2.5 mm, for example the necklace ladder (20-28, 40-50), the "ooo" badge (65-72, 58-60) with 0.4-0.7 mm cells, and the hats.
- Blob (45.4,65.0), 1.9 mm.
- Every face is blank: the hairline features were dropped.
- **C13:** at 300 px it reads as a tangle, not as 11 women.
- A density gate (subpath count, share of cells under 2.5 mm, or ridge length per cm²) should send this back for redraw.

### 9. hands: FAIL (flagged for redraw: narrow parts)
- **Neck** (`hands_Z_top.png`):
  - No cream at all from y = 27.5 to 30.0 at x = 45.5-46.5. The dark section is 2.2-2.9 mm wide.
  - The top hand is a separate cookie joined to the head only by plastic, with 0.3 mm cream spikes on both sides.
  - The top-hand fingers are smoothed into one lobe (36-50, 18-28), and the bottom-hand fingers are lost into the silhouette (50-58, 70-78).
- **Expression** (`hands_Z_face.png`):
  - Both pupils are deleted at (39.5,45) and (47.5,45).
  - The left brow and upper lid closed into a small loop (36-39.5, 43-44.5).
  - The right eye is two parallel lines and reads as closed.
  - The closed lips became one smile-like arc (41.5-45.5, 52.7).
  - The nostril curls are dropped, which is acceptable.
- **Hair:**
  - The strands at the right temple are merged into a chain of tiny loops and beads (47-52, 33-46), with blobs at (47.1,37.0) 2.1, (51.4,41.1) 1.6 and (48.6,32.7) 1.5 mm.
  - Pockets of 1.0-1.5 mm at (38.1,35.6), (40.2,43.9), (53.5,45.8) and (51.9,49.9).

### 10. venus: FAIL (C1 only)
- **Fixed since 7b:**
  - The inner ring is a true circle: centre (51.15,35.17), r = 16.80/15.90 for the two edges, deviation 0.002 mm.
  - The stem, cross and foot are straight; segments of up to 10.25 mm are exactly straight.
  - The neck and cross corners are smooth fillets (`venus_Z_neck.png`).
  - The wall is 1.40 mm and the ridge 0.90 mm.
- **C1/C11 outer ring** (`venus_1400_ringL_1to1.png`, `venus_Z_ringL.png`, `venus_ring_curvature.png`):
  - The outline arc fits r = 24.14 mm within 0.117 mm peak-to-peak, so the position is fine.
  - The curvature oscillates between -0.06 and +0.11 /mm against the circle's 0.041 /mm, with a period of about 3-4 mm.
  - The inner wall edge, as an offset, inherits and amplifies the ripple.
  - At 1400 px the wall reads as lumpy and slightly polygonal, while the inner ridge right next to it is perfectly round. The contrast makes it obvious.
  - The very top is a 1.25 mm flat at (50.7-52.0, 11.22). It is invisible on its own, but shows the same fitting issue.

## Top 3 remaining conversion fixes (most important first)

1. **Protect facial features before thinning and pruning.**
   - Before skeletonising, detect filled ink blobs: inscribed diameter of at least about 1.2 x the stroke width, roundish. That covers pupils, nostril dots and beauty marks, whether or not they touch a line.
   - Emit each one as a dot or circle of at least 2 mm at its own centroid, then join it to any line it touched.
   - Never let stub pruning remove them.
   - This restores the gaze in stylish (34.5,28.3) and (47.3,26.3), hands (39.5,45) and (47.5,45), and duo.
   - Exclude thin stroke tips such as lashes from the silhouette (an opening of about wall width before the outline fit), so they cannot create outline spikes (stylish (53.7,24.1)).
2. **Make merging and wall-pulling topology-safe, and clean up after them.**
   - Merge only along stretches where two centre lines run parallel for at least about 3 mm. Replace them with one smooth mid-line.
   - Never create a new crossing, loop or bridge that the drawing does not have: pad (30.7,32.5) and (48.3,46), stylish ear, hands hair, hearts face, nails.
   - After merging, remove nubs and jogs under 1 mm (uterus (40.6,71.2), lotus (41.5,56.6)). Collapse any enclosed pocket under 2.5 mm to a single line (lotus (19.3,49.1), uterus (24.5,39.0)).
   - Apply the wall-pull rule along each line's whole length, not only to lines that lie entirely in the band. Pull any stretch with perpendicular clearance under about 2.5 mm onto the wall or push it clear.
   - When a pulled stretch leaves a free end within 2.5 mm of the wall, extend it into the wall tangentially, as the drawing does (pad (62.0,74.4); uterus ligament; heart rim; hearts hem).
   - Never merge a circle's flank into a neighbouring line (uterus ovaries (15.0, 39-43.5)).
3. **Fair the outline and keep round parts round.**
   - Replace the current smoothing of the outline (and of long ridges) with a curvature-penalised fit: least-squares cubic splines with a curvature-variation penalty, or a G2 arc and clothoid fit. Keep explicit corners.
   - Fit true arcs to outline segments that are near-circular, as is already done for closed loops. That fixes the venus ring ripple (curvature -0.06 to +0.11 /mm on a 0.041 /mm circle) and the ripple on the uterus, lotus and pad lobes.

**Gate notes:**
- Add a density or complexity gate: heart (116 subpaths, about 65 cells under 2.5 mm) should be redrawn, not converted.
- Do not show a preview cutter whose cookie is split into separate pieces (hands neck) as valid.

**Drawing-side, not scored here:** pad subject; hearts and heart detail; nails, hands and lotus thin parts; filled pupils and lashes; the duo open outline; the uterus rung spacing. These are for the next Gemini prompt update.
