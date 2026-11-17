# Round 7b review: new conversion (simplify + corner-cut, even wall band, wall-zone pruning, pinhole fill, open-outline gate)

**Inputs and method:**
- I used the same 10 Gemini drawings as round 7 (/tmp/gz/png) and the new SVGs (/tmp/gz/out).
- Each SVG is two filled paths: cream = cookie, dark = plastic (`fill-rule=evenodd`).
- **Registration:** SVG coordinates = drawing px + 24, scale 1.00 (checked against the ink bounding box on all 10). **All coordinates below are drawing px.**
- **Renders:**
  - 4x renders in drawing coordinates: `round7b_work/NAME_cut4x.png`.
  - Brief-style renders: `rsvg-convert -b white -w 1400 -h 1400`, saved as `NAME_1400.png`.
  - Side-by-side images: `NAME_pair.png`.
  - Zoom crops (left = drawing, right = cutter): `NAME_Z_*.png`.
- **Measurements** (scripts `measure.py`, `facets.py`, `kinks.py`, `ringfacet.py`; results in `measure.json` and `facets.json`):
  - wall and ridge width from 2 x the distance transform on the dark skeleton;
  - dark "blobs" (inscribed diameter over 2.2 mm);
  - short dark fragments (under 3 mm);
  - small cream pockets;
  - venus ring roundness and curvature (`venus_ring_dev.png`, `venus_ring_curvature.png`).
- Scale: widest side = 80 mm, so 6.2-8.7 drawing px per mm.

## Summary table

| # | Image | Cutter (conversion) | Remaining conversion faults (drawing px) | Drawing-side notes |
|---|---|---|---|---|
| 1 | uterus | **FAIL (near pass)** | residual facets (C11); ovary pockets filled flat at (67,277) and (515,277); wall kink (145,261); notch in the hairpin turn (191,184); ridges 0.73 mm (under the 0.8 mm spec) | ligament double line and rungs 2.4 mm apart (drawing) |
| 2 | pad | FAIL | ridges 0.53-0.96 mm, not uniform (C3); dark blobs at the tangent merges (162,113) 2.8 mm and (488,576) 2.2 mm; facets | wrong subject (cat head), tangent merges (drawing) |
| 3 | lotus | FAIL | fingertip blob (57,329) 2.4 mm; leftover cream pockets (115,331) 1.15 mm and (454,350) 2.3 mm; ridge 1.13 mm against a 1.36 mm wall (too close, C3); facets 1.5 per 100 px | thin fingers, pine-cone flower (drawing) |
| 4 | nails | FAIL | filings still a jagged dark mass on the wall (360-440, 245-280) with 0.3-0.8 mm cream slivers at (389,260), (402,263), (414,258), (418,206); blob (428,260) 3.0 mm; introduced outline kinks (172,107) and (301,245); worst facets (2.6 per 100 px) | filings, forearm spike (drawing) |
| 5 | hearts | FAIL | dress-fold wedges still solid (269,369), (229,390), (150,433), (270,472), 2.2-2.4 mm; brow and eyelid fused into one zig-zag (393-400, 245-262); lip strokes dropped or chunky (365-375, 262-278); facets 3.1 per 100 px | far too detailed, spiky hair (drawing) |
| 6 | stylish | FAIL | right eye: pupil, lower lid and outline fused into a 2.6 mm blob at (388,197); left pupil a D-shape with a flat side (268,218), 2.8 mm; lip opening half filled into a dark wedge (390-440, 285-300); flat chisel ends on brows (375,190); brow loop pocket 1.1 mm (384,146) | lashes, filled pupils (drawing) |
| 7 | duo | **Correctly rejected by the gate** (not scored) | if it had passed: eye blob (152,244) 2.7 mm, 2 mm fragment (229,211), dangling open body lines | open silhouette (drawing) |
| 8 | heart | FAIL | 33 dark areas over 2.2 mm, worst (194,260) 4.6 mm, (552,304) 4.5 mm, (254,177) 3.7 mm; badge filled solid (566,302); necklace filled (162,324) | 11 figures, doubled rim hugging the wall (drawing) |
| 9 | hands | FAIL | fingertips filled solid (294,175) 2.8 mm and (338,176) 2.9 mm; hair strand **split** by wall-zone pruning at (317,240), leaving a 2.7 mm orphan (329,248); orphan triangle (246,472) 1.7 mm; pupils kite-shaped (367,349); flat chisel stroke ends; nostril and nose merged into a zig-zag (330-345, 375-385) | thin connector strand, crowded hair (drawing) |
| 10 | venus | **FAIL (C11 only)** | ring is a rounded polygon: 12 curvature peaks at about 3x the circle's curvature with flat runs between them (outer edge); inner ring has peaks at about 3x; visible at 1400 px; straight stem walls bow slightly (330 and 390, 415-475) | drawing PASS |

Result: **0/10 cutters pass**, but uterus and venus are now close. In round 7 every cutter failed on several conversion faults at once.

## What changed since round 7

**Better (confirmed):**
1. **Stair-steps are gone.** The new paths are dense smoothed polylines with no 1-px axis steps. At 100% every outline reads as clean. C1 mostly passes; what remains is milder faceting (below).
2. **The wall is now thicker than the ridges (C3, wall part).**
   - Wall median 1.29-1.36 mm on all 10 (p10 1.21-1.28, p90 1.34-1.46): even and on target.
   - Ridge medians: 0.68-1.13 mm.
   - In round 7 the wall and ridges were both about 0.9 mm.
3. **No corner knobs.**
   - Venus stem and cross corners are clean small fillets (`venus_Z_neck.png`, `venus_Z_cross.png`).
   - The ring-to-stem joins are now rounded concave corners, which is fine under rubric A10.
4. **Lash tips and corner bulges no longer stick into the cookie.**
   - The stylish right-eye lashes are gone from the edge (`stylish_Z_eyeR.png`).
   - Hearts hair and lotus fingertips have a clean wall.
5. **Far fewer blobs.**
   - Uterus and venus have none (no dark area over 2.2 mm).
   - The uterus ligament junction block from round 7 is gone (`uterus_Z_lig.png`).
   - Heart's large face and hair fills are mostly gone.
   - Stylish lips are no longer fully solid.
6. **Open outline:** duo is rejected and redrawn instead of shipping dangling wall.

**Worse or new:**
1. **Wall-zone pruning breaks strokes and leaves orphans** (new, C9/C14).
   - The rule "within 2.8 mm of the wall keep only ink that runs in from inside" cuts strokes that run *parallel* to the wall.
   - hands: one continuous hair strand is split with a V gap at (317,240) and leaves a 2.7 mm piece at (329,248) (`hands_Z_frag.png`). The left hair strand loses its middle and leaves a 1.7 mm triangle at (246,472) (`hands_Z_hairL.png`).
   - In round 7 these strokes were intact.
2. **Round stroke ends turn into flat chisel ends, and round dots into kites or D-shapes** (new, C11/C12/C14).
   - The "turn above 55° stays sharp" rule fires on the tight curvature of round caps and dots.
   - Examples:
     - hands: pupils (367,349) are kite-shaped, and the brow end is cut flat (`hands_Z_earspecks.png`, `hands_Z_seam.png`).
     - stylish: the brow end (375,190) is flat and the pupil (268,218) is a D-shape (`stylish_Z_eyeL.png`).
     - uterus: the hairpin turn (191,184) has a V notch (`uterus_Z_topjoin.png`).
3. **Residual faceting.** Simplifying at a 1-px tolerance and then corner-cutting leaves curvature peaks every 10-30 px with flat runs between them. Deviation from a true circle is small (venus ring 1.4 px peak-to-peak = 0.19 mm), but at about 175-200% the ring reads as a polygon (`venus_1400_top.png`, `venus_ring_curvature.png`).
   - Facet count (slope breaks over 3°) per 100 px of outline: heart 0.1, uterus 0.4, pad 0.6, stylish 0.7, duo 0.9, hands 1.1, venus 1.4, lotus 1.5, nails 2.6, hearts 3.1.
   - Not worse than round 7, which was much worse, but still not Bakerlogy-smooth.
4. **Thin parts become solid plastic.**
   - Where a part is narrower than about 2 x wall + 1 mm, the even 1.4 mm band on both sides meets in the middle. The cookie part disappears into plastic.
   - Examples: hands fingers (294,175) and (338,176) (`hands_Z_fingers.png`, `hands_Z_neck.png`), nails filings, lotus fingertip (57,329).
   - The drawing causes this (D6), but the converter should flag it, not fill it.
5. **Ridge width is still the drawn stroke width, not normalised** (C3).
   - pad 0.53-0.96 mm, uterus 0.68-0.81 mm (too thin, will print weakly).
   - lotus 1.13 mm, venus 1.04 mm.
   - heart p90 2.0 mm and hearts p90 1.6 mm, where several strokes merge.

## Per-image detail

### 1. uterus: FAIL (near pass)
- **Good:**
  - Outline, tubes, ovaries and rungs are smooth at 100%.
  - The wall is even at 1.30 mm (p10 1.23).
  - No blobs, one connected piece.
  - The ligament join is now clean.
- **C14 ovary pockets** (`uterus_Z_ovaryL.png`, `uterus_Z_ovaryR.png`).
  - The drawing has a rounded U pocket where the fimbria outline meets the ovary, at (60-72, 270-285) and (509-521, 270-285).
  - In the cutter the pocket ends in a flat slanted cut at (67,277) and (515,277), with about 2 mm of solid plastic below it.
  - The outer wall has a shoulder there.
- **C14 kink** in the wall's inner edge where the ovary circle meets the outline: (145,261) (`uterus_Z_lig.png`).
- **C14 V notch** in the hairpin turn at the top of the uterine cavity: (191,184) and its mirror at about (390,184) (`uterus_Z_topjoin.png`). The drawing's turn is solid and round.
- **C11:**
  - The ovary circles and the tube curves show light facets at 1400 px.
  - The top outline has an angle on the inner wall edge at about (201,163).
- **C3:** ridges 0.73 mm median (p10 0.68), under the 0.8 mm minimum.
- Spacing between the ligament double line and the vaginal rungs comes from the drawing.

### 2. pad: FAIL
- **Good:** the thick, uneven drawn outline became an even 1.36 mm wall, and the stain loops are smooth.
- **C3:** ridges 0.53-0.96 mm (median 0.68). They are thin and uneven because they inherit the drawing's stroke.
- **C7/C14:**
  - Where the inner pad outline merges tangentially into the outer outline, the merge leaves dark wedges: (162,113) 2.8 mm and (155,108) 2.2 mm at the top, (488,576) 2.2 mm at the bottom right.
  - There are also thin cream tails (233,118), 0.3 mm wide, and (467,592), under 0.1 mm.
- Ear tips have small flat nubs.
- **Drawing:** the subject became a cat (not counted).

### 3. lotus: FAIL
- **C7/C9:** a fingertip and petal blob at (57,329), 2.4 mm.
- **C7:** cream pockets of 1.15 mm at (115,331), the fingertip sliver, and 2.3 mm at (454,350), the petal lobe. Both are under 2.5 mm, so they will fill with dough. Neither is a pinhole, so neither was filled.
- **C3:** ridge median 1.13 mm (p90 1.25) against a 1.36 mm wall. The wall barely reads as thicker than the ridges.
- **C11:** facets 1.5 per 100 px, visible on petal tips (`lotus_1400.png`).
- **Drawing:** thin fingers, pine-cone flower.

### 4. nails: FAIL
- **C9/C14 filings** (`nails_Z_filings.png`).
  - Still a jagged row of dark teeth fused to the wall along (360-440, 245-280).
  - Cream slivers 0.3-0.8 mm wide at (389,260), (402,263), (414,258) and (418,206).
  - Blob (428,260), 3.0 mm.
  - Improved from round 7's single solid mass, but still not acceptable.
- **C1:** two outline kinks the drawing doesn't have: (172,107), a 59° turn where the drawing turns 14°; and (301,245), 52° where the drawing turns 14°.
- **C11:** most faceted outline in the set (2.6 per 100 px).
- **Drawing:** the filings and the forearm spike (C8) come from the drawing.

### 5. hearts: FAIL (mostly drawing)
- **C7/C14:**
  - Dress-fold wedges are still solid: (269,369), (229,390), (150,433), (270,472), each 2.2-2.4 mm.
  - Long ridges run within 0.2 mm of each other at (285,503), across 29 mm of the dress.
- **C14 face** (`hearts_Z_face.png`):
  - The separate brow and eyelid strokes are fused into one zig-zag at (393-400, 245-262).
  - The small lip stroke at (360-372, 268-275) is dropped.
  - The chin and lip profile became a chunky notch at (365-375, 262-278).
- **C11:** facets 3.1 per 100 px, the worst (hair spikes).
- **Drawing:** the drawing is too detailed, has spiky hair and drops the hearts motif. Not legible at 300 px.

### 6. stylish: FAIL
- **Better:**
  - The lashes no longer cross the face outline.
  - No blob on the cutting edge.
  - The wall is even at 1.33 mm.
- **C7/C14:**
  - Right eye: the pupil, lower lid and outline fused into a blob at (388,197), 2.6 mm (`stylish_Z_eyeR.png`).
  - Lips: the 1.5 mm opening is half filled into a dark wedge across (390-440, 285-300). The right corner ends in a chisel point (460,295) (`stylish_Z_lips.png`).
- **C11:**
  - The left pupil is a D-shape with a straight right side: (268,218), 2.8 mm.
  - The brow end at (375,190) is cut flat where the drawing has a round cap (`stylish_Z_eyeL.png`).
- **C7:** the brow-loop pocket is 1.1 mm (384,146) and the nose pocket 1.5 mm (268,166). They are too small and will fill.
- **Drawing:** lashes, filled pupils, a 1.5 mm lip opening.

### 7. duo: rejected by the open-outline gate (correct behaviour)
- The drawing leaves the lower body open, so the app asks for a redraw. That fixes round 7's fault of shipping dangling wall.
- For reference, the face faults that would remain if it got through:
  - eye blob (152,244), 2.7 mm;
  - a 2.0 mm fragment (229,211);
  - several pockets under 1 mm in the eyes and brows.

### 8. heart: FAIL (mostly drawing)
- Much cleaner than round 7, but:
  - 33 dark areas over 2.2 mm (worst (194,260) 4.6 mm, (552,304) 4.5 mm, (254,177) 3.7 mm);
  - the "ooo" badge is filled solid at (566,302);
  - the necklace is a filled band at (162,324);
  - 44 cream pockets under 2.5 mm.
- The doubled heart rim makes a ridge hugging the wall at under 2 mm along both lower sides (drawing).
- The cutting edge itself is the smoothest in the set (0.1 facets per 100 px).

### 9. hands: FAIL
- **C9/C14, new in this round:**
  - A continuous hair strand is split at (317,240), leaving a 2.7 mm orphan (329,248) (`hands_Z_frag.png`).
  - The left strand's middle is removed, leaving an orphan triangle (246,472), 1.7 mm (`hands_Z_hairL.png`).
  - Both come from wall-zone pruning, about 2 mm from the wall.
- **C7/C8:**
  - The top-hand fingertips became solid plastic wedges: (294,175) 2.8 mm and (338,176) 2.9 mm (`hands_Z_fingers.png`).
  - The connector to the head is a cream spike under 0.5 mm at about (343,195) (`hands_Z_neck.png`). It will tear.
- **C11/C14:**
  - Round pupils became kites (367,349) and (305,349).
  - Brow and strand ends are flat chisels.
  - The nostril strokes merged into the nose base as a zig-zag at (330-345, 375-385) (`hands_Z_seam.png`, `hands_Z_earspecks.png`).
- **Drawing:** the thin connector, the crowded strands under 1.5 mm apart, and the open neck.

### 10. venus: FAIL (C11 only)
- **Fixed since round 7:**
  - stair-steps;
  - the 8 corner knobs (now clean fillets about 0.8 mm);
  - wall vs ridge: wall 1.32 mm, ring ridge 1.04 mm.
- **C11:** both rings are rounded polygons, not circles.
  - Roundness: the outer edge fits a circle of r = 180.6 px within 1.4 px peak-to-peak; the inner ridge fits r = 118 px within 1.1 px.
  - The curvature profile shows 12 peaks at about 3x the circle's curvature on the outer edge, with flat runs between them (`venus_ring_curvature.png`).
  - At 1400 px (about 175%) the ring visibly reads as a 14-16-gon: for example the left flat between (183,230) and (183,262), and corners at about (213,135), (500,128) and (247,190) on the inner ridge (`venus_1400_top.png`, `venus_Z_ringL.png`).
- **C1, minor:** the straight stem walls (x = 330 and 390, y = 415-475) and the foot bow by about 1 px.
- Venus would pass with a true curve fit, or a circle fit for near-round loops.

## Top 3 remaining conversion fixes (most important first)

1. **Make wall-zone pruning topology-safe, and stop filling thin parts solid.**
   - Never cut a stroke in the middle. Only drop a whole skeleton branch that (a) touches the outline and (b) ends freely within 2.8 mm, such as lash spurs and corner bulges.
   - After pruning, delete any piece under 3 mm, so no orphans are left (hands (329,248) and (246,472)).
   - Wherever the silhouette is narrower than about 2 x wall + 1.5 mm (fingers, filings, connectors), flag it or send it back for a redraw. Don't let the two wall bands merge into solid plastic (hands (294,175), (338,176); lotus (57,329); nails (428,260)).
   - Any enclosed cream pocket under 2.5 mm that isn't a pinhole: merge its two bounding strokes onto one centreline. Never fill it to a wedge or leave it to fill with dough (stylish lips and brow loop, pad merges, nails filings slivers, lotus pockets).
2. **Replace "simplify 1 px + corner-cut" with a real curve fit, and treat caps and dots separately.**
   - Fit G2-continuous splines (Schneider or potrace with alphamax about 1.0) to the centreline and outline. Fit circles or ellipses to near-round closed loops.
   - That removes the residual facets (venus ring, nails, hearts, lotus) and the introduced kinks (nails (172,107) and (301,245); uterus (145,261)).
   - Exempt stroke end caps and filled dots from the "turn above 55° stays sharp" rule. Re-cap free ends as semicircles, and output dots as circles. That fixes the chisel ends, the kite and D pupils, and the uterus hairpin notch.
3. **Normalise ridge width.**
   - Skeletonise the inner ink and re-stroke every ridge at a constant 0.9 mm with round caps and round joins, instead of keeping the drawn stroke width.
   - That fixes C3 on pad (0.53 mm), uterus (0.68 mm), lotus (1.13 mm, too close to the 1.36 mm wall), heart and hearts (up to 2 mm where strokes merge).
   - It also stops fused features from turning into blobs.

Drawing-side (not scored here): pad subject, hearts and heart detail, hands, lotus and nails thin parts, lashes and filled pupils. These remain the Gemini prompt and gate items from round 7.
