# Round 12 review: slit-close limit raised to ~1.5 mm, 0.6 mm minimum radius on convex outline tips

**Inputs and method**
- Same Gemini drawings (/tmp/gz/png). Cutters: /tmp/gz/out2/NAME_cutter.svg (mm, dated Nov 19 15:32). Sheets sheetA7/B7 (15:34) match the SVGs. Drawing-side faults are marked "drawing" and kept short.
- **All coordinates are SVG mm.** Work files are in `round12_work/`. The round 11 scripts were copied and re-pointed to `/tmp/r12_*`. New scripts:
  - `diff.py`: pixel diff of the round 11 and round 12 plastic masks (`NAME_diff_r11r12.png`: green = new plastic, red = removed);
  - `islands.py`: every enclosed cream cell with an inscribed width under 2.5 mm, round 11 and round 12;
  - `creamtip.py` plus inline checks: convex tip radius on the outer edge and on the dough-side wall face.
- Renders and zooms use the same names as round 11 (`NAME_mm20.png`, `NAME_1400.png`, `NAME_pair.png`, `NAME_Z_*.png`).
- **Registration caveat (unchanged):** the drawing is registered on its ink box, so pairs for duo (about 12 mm), lotus, hearts and pad are offset. I compared shapes side by side. All coordinates are cutter coordinates.

## What the two changes actually did (measured)

**Change 1 (close interiors under ~1.5 mm).** It acted on lotus, nails, hearts, duo, heart and hands. Uterus, pad, stylish and venus have no change beyond the outer tip rounding (diff 57-109 px, all at outline tips).
- **It closed:**
  - the duo lower-left brow (23-31, 40-43.4) and both right-face brows (67-73, 29-32.8), (77.5-85, 26.8-31.8): now single 0.9-1.0 mm lines;
  - the hands lip lens (42.0-46.9, 51.6-53.5): now a single 0.9 mm line;
  - the nails file-tip slit (68.9-74.2, 36.5-37.5) and the filings slivers (66.3-69.6, 45.1-46.9);
  - the lotus fingertip crescent (17.9-20.8, 48.8-50.2);
  - 7 of the 10 hearts hem/skirt micro-cells and the 3 hearts junction blobs;
  - 34 of the 53 tiny heart cells.
- **It did not close** (cutter interiors still under 1.5 mm):
  - stylish brows: left (27.6-39.4, 20.2-23.6) 1.40 mm max, 0.76 mm median; right (44.9-48.8, 17.9-20.8) 1.06 max, 0.72 median;
  - duo upper-left brow (36.0-42.5, 34.2-39.2) 1.27 max, 0.93 median;
  - duo lid/crease slits: (81.5-84.5, 31.2-31.7) 0.40, (64.9-67.5, 33.2-33.9) 0.41, (27.4-29.2, 44.0-44.8) 0.22, (40.5-44.2, 38.0-39.2) 0.34;
  - duo jaw sliver (28.4-31.7, 54.4-58.4) 0.50;
  - nails thumbnail crescent (52.5-56.6, 47.8-50.3) 0.72;
  - nails filings loop (68.8-72.5, 45.1-46.7) 1.13;
  - hearts hem sliver (52.3-55.4, 80.2-84.0) 0.64;
  - hearts eye curl channel (64.2-66.2, 42-45) 0.59.
- **Root cause (measured):** the limit is applied to the *drawing*, before the strokes are rebuilt at 0.9 mm.
  - The stylish left brow interior is 1.77 mm in the drawing, so it passes the 1.5 mm test. Once the 0.75 mm drawn strokes become 0.9 mm ridges (wider at the ends), the cutter leaves 0.72-1.40 mm.
  - The duo lid slits, duo jaw, nails thumbnail, filings loop and hearts hem are **not closed shapes in the drawing at all**: they are two separate lines that only touch or come close once they are thickened in the cutter. The rule never sees them.
  - Fix: apply the test to the cutter's cream (any cream cell or channel under about 2.5 mm). Also include near-parallel open pairs (the existing `chan.py` list), not only drawn closed loops.
- **Collapse quality:**
  - Duo brows, the nails file tip and the hands lips collapse to clean 0.90-1.00 mm centre lines (`duo_Z_faceR.png`, `nails_Z_filings.png`, `hands_Z_face.png`).
  - The **lotus crescent was filled into the wall instead of re-centred**. The wall/ridge there is now a 2.0 mm bar (16-21, 47.3-49.4), compared with 1.4 mm elsewhere. There is a jog where the separator meets it (17.3-18.3, 49.0-49.3) and a small cream wedge at (20.8, 48.9) (`lotus_Z_tip.png`).
  - **The hands lips now use the medial axis of the lens:** a flat bar (41.3-47.0, 52.4-53.2) with blunt square ends. The drawing's upper-lip contour (Cupid's bow) and pointed corners are gone, so the mouth reads as a flat line over a lower-lip arc rather than full closed lips. When a lip lens is collapsed, keep its *upper contour* (bow plus pointed corners), not the medial axis.

**Change 2 (0.6 mm minimum radius on convex outline tips).** On the outer cutting edge it worked everywhere:
- pad ear tips 0.20/0.24 to 0.59/0.64 mm;
- hearts hair tips 0.21-0.25 to 0.55-0.67;
- nails 0.22-0.43 to 0.55-0.66;
- lotus (61.0, 92.8) 0.25 to 0.62;
- duo tail 0.37 to 0.65;
- stylish base corners 0.53 to 0.69;
- heart tip 0.47 to 0.62.

**But the cookie (dough-side wall face) is unchanged.** Pad ear dough tips are still R 0.09 mm at (12.0, 9.7) and 0.10 mm at (66.0, 9.7) (`pad_Z_earL.png`). An inward 1.4 mm offset of a 0.6 mm convex arc is still a sharp point. For the dough tip to reach R 0.6 mm, the outer radius must be at least 0.6 + 1.4 = 2.0 mm. Alternatively, round the inner face itself. The same holds for every other outer tip: the cookie shape did not get any blunter. The outer edge now does match the drawing's rounded ear tip better (C1), which is a small real gain.

## Summary table

| # | Image | Cutter verdict | Remaining conversion faults (SVG mm) | Gate / drawing | Fixable by a cleaner drawing? |
|---|---|---|---|---|---|
| 1 | uterus | **FAIL** | unchanged from round 11: right ovary arc broken at the ligament T, corner (66.2,38.0) + 25° cream spike to (65.6,39.6) + corner (66.3,40.4); left bump (24.7-25.0, 38.0-38.7), corners (25.0,40.5), (18.2,35.9), (14.0,43.2); ovary feet facet + wall ledge (76.0-78.5, 43.2-44.6) and (12.8-14.5, 43.0-44.6), lobe ridges 0.05-1.0 mm from the wall over 6 mm (10.2-13.1, 40.1-44.6) and (78.4-81.0, 40.1-44.6); tube S-bend stubs (29.5-30.3, 34-37), (60.5-61.2, 34-37); rung cells 2.2-2.3 mm (40.4-50.6, 74.3-83.8) | none; rungs and tube V (drawing) | **Partly.** Rungs ≥3 mm apart and the tube V touching the outline would remove those two items. The ovary/ligament T-joins and feet are conversion faults on a clean drawing. |
| 2 | pad | **FAIL** | dough-side ear tips still R 0.09/0.10 mm (12.0,9.7), (66.0,9.7) (outer edge now 0.59/0.64); right join bend + 0.8 mm cream sliver (66.6-67.6, 61.7-65.3); bottom join hump/stub/notch (62.0-63.4, 74.2-75.0); top-right join leaves the wall steeply (30.8-31.2, 17.3-18.0); 0.8 mm channels (28.6-31.6, 29.8-36.8), (41.0-44.1, 39.4-44.5), (47.0-50.5, 46.2-47.4); cell 1.99 mm (17.6-22.4, 22.4-33.9) | wrong subject (owl/cat shape, not the pad); strokes 0.5-1 mm apart (drawing) | **Mostly.** The channels and the 1.99 mm cell come from strokes drawn ~1 mm apart; at ≥3 mm spacing they vanish. The ear-tip dough point and the wall joins remain conversion work. The subject itself is wrong (drawing). |
| 3 | lotus | **FAIL** | **new:** fingertip filled into a 2.0 mm wall bar (16-21, 47.3-49.4) with a jog (17.3-18.3, 49.0-49.3) and a wedge (20.8,48.9); unchanged: centre knot/kink (44.0-44.9, 49.6-50.3) + S-wobble (44.4-44.9, 51-53); base-line step (41.6-42.2, 56.6-57.4); squared free end (47.8-48.4, 50.3-51.0); nub (19.4,57.7); petal-tip cell 2.47 mm with 25° cusp (67.8,54.0); ridge 0.1 mm from the wall (69.2, 53.5-54.2) | thin fingers (drawing) | **Partly.** A drawing without the tiny fingertip crescent and with the petal tip cell ≥3 mm removes the fingertip bar and the cusp. The centre knot and the base step are conversion faults (the drawing is clean there). |
| 4 | nails | FAIL (gated: thin part, correct) | open slits 0.3-0.54 mm between separators and nails (26.4-27.1, 26.7-32.6), (24.8-25.8, 29.5-34.2), (32.8-33.0, 27.1-31.8), (31.0-31.6, 26.4-30.2); nail 1 0.81 mm from the wall (20.4-21.3, 30.7-35.4); thumbnail crescent 0.72 mm (52.5-56.6, 47.8-50.3); filings still a lumpy zig-zag wall with a 1.13 mm loop (68.8-72.5, 45.1-46.7) and 0.05-0.75 mm wall hugs (67.4-72.2, 47.1-48.8); file ridge 0.9 mm channel (62.2-68.4, 37.0-37.2); thumb-tip plastic wedge (57.6-59.7, 46.6-48) | thin spike, filings, dense nails (drawing) | **Yes, largely.** Almost every remaining fault comes from strokes under 1 mm apart (nails vs separators, filing teeth, file-on-nail). Bold nails ≥3 mm apart, no filings and a plain file would leave little for the conversion to get wrong. |
| 5 | hearts | FAIL (gated: thin part, correct) | hair outline still faceted (27 kinks, fairness 0.53; e.g. (63.9,28.8), (69.1,27.0), (77.1,30.9), (85.2,31.1), (87.5,40.0)); face profile is the wall: lip lump (59.0-60.4, 45.8-47.3), chin knob (61.5-62.9, 49-50.7); eye curl with a 0.59 mm channel (64.2-66.2, 42-45) = closed-eye expression lost; hem line 0.05-0.6 mm from the wall over 13.5 mm (48.4-56.2, 78.4-85.5) with a 0.64 mm sliver cell (52.3-55.4, 80.2-84.0); cell 1.27 mm (40.1-42.4, 46.0-47.5) | too detailed, thin hair tips (drawing) | **Yes, largely.** The faceted hair is the conversion following a spiky drawn hair edge; a drawing with chunky hair lobes and a simple face profile set ≥3 mm inside the outline removes nearly all of it. |
| 6 | stylish | **FAIL** | **brows still hollow:** left (27.6-39.4, 20.2-23.6) 0.76 mm median / 1.40 max, right (44.9-48.8, 17.9-20.8) 0.72 / 1.06 (the drawing interior is 1.77 mm, so the rule skips it); mouth's right side 0.1-0.55 mm from the cheek wall over 7 mm (53.2-53.5, 33.1-39.8); Cupid's-bow dip flattened (46-50, 34.2-34.6); nose tip a filled two-lobed blob (48.6-49.8, 30.0-32.1; 1.53 mm blob at 48.6,31.0); orphan hook + speck on the wall (45.4-46.6, 10.5-12.0); hair line bends into the wall at a corner (41.5-43.0, 8.5-9.6); hairpin stub corner (29.6-30.6, 5.4-6.8); collar sliver 0.63 mm (45.3-46.4, 51-54.6); squared lash/lid/nostril ends; ear cells 2.0-2.06 mm (19.9-24.1, 38.0-41.0) and channels 0.7-0.85 mm (17.4-22.8, 35.7-42.4) | lashes outside the outline (drawing) | **Partly.** Single-line brows, a single-line nose tip and a mouth ≥3 mm from the cheek outline in the drawing would remove the brow, nose and mouth items. The hair-line/wall joins, the orphan hook and the squared ends are conversion faults. |
| 7 | duo | FAIL (gated: open outline + thin part, correct) | nostrils still balls: 2.0 mm (74.5,40.1), 2.3 mm (77.5,39.9), 2.0 mm (37.5,49.1) (right face reads as a snout); upper-left brow still a hollow loop (36.0-42.5, 34.2-39.2) 0.93 mm; lid/crease pairs still slit 0.22-0.41 mm (81.5-84.5, 31.2-31.7), (64.9-67.5, 33.2-33.9), (27.4-29.2, 44.0-44.8), (40.5-44.2, 38.0-39.2); right-face left lid broken around the pupil (63-71, 32.3-34.6); jaw ridge 0.05-0.35 mm from the wall over 6 mm (27.1-30.8, 54.9-59.5); X pinch where the heads meet (61.5-62, 39.8-41); invented neck cell (56-64.5, 43.5-53.5); left lower lip starts 0.6 mm from the corner (35.4-36.2, 56.2-56.8) | open outline (drawing) | **Partly.** A closed outline, one lid line per eye (no crease), brows as single strokes and nostrils as small hooks ≥2 mm long would clear the gate and most face items. The nostril-to-ball conversion and the head-junction X pinch are conversion faults. |
| 8 | heart | FAIL (gated: busy, correct) | junction beads still there: 17 over 1.5 mm, e.g. 3.18 mm (77.6,43.6), 2.05 (26.3,41.6), 2.04 (22.5,46.3), 1.93 (22.2,41.6), 1.91 (20.4,37.2), 1.90 (26.4,46.4); 19 cream cells under 2.5 mm (was 53); inner rim 0.85-2.25 mm from the wall over ~68 mm ((79.8,63.1)-(54.4,86.3), (48.1,86.5)-(23.0,63.7)) and 0.55-0.95 mm (12.2-16.1, 46.1-54.5); necklace/lei detail turned into a tangle of beads and lumps (`heart_Z_dots.png`) | 11 figures (drawing) | **Yes.** At 8 cm this subject needs about 3-4 figures with no necklace beads and no rim line. Almost every fault is detail density. The bead-making at junctions is still a conversion fault, but it only shows at this density. |
| 9 | hands | FAIL (gated: thin part, correct) | **lips now a flat 0.9 mm bar (41.3-47.0, 52.4-53.2) with blunt ends:** bow and pointed corners lost (better than the dark lens, but the mouth shape is not kept); left nostril still a 1.8-1.9 mm ball (41.7-43.0, 48.6-50.2); right nostril merged into the nose base line (44-46.6, 49-50.3); finger 2 ball tip (40.3-41.2, 21.2-22.6); middle finger + connector fused solid (45.0-46.6, 22.5-31.5); finger walls 0.05-0.55 mm apart in 6 places (36.2-53.7, 18.3-27.1); hair strand fused into the face line with a 0.5 mm sliver (36.6-37.5, 46-55); hair bar from the wall (34-37, 39.3-40.5); parting stubs (43-44.3, 31-33.2), (45-46, 31.5-33.5) | thin fingers, connector (drawing) | **Mostly.** Chunky fingers (≥6 mm) and hair strands ≥3 mm from the outline remove the finger, connector and hair faults. The lip and nostril treatment is conversion. |
| 10 | venus | **PASS** | none. Ring r = 24.122 mm, 0.093 mm peak to peak; inner ring r = 22.72 mm; wall 1.40 mm, ridge 0.90 mm; no convex outline tip (change 2 not triggered); cross corners as round 11 | drawing PASS | n/a |

**Result:** 1/10 cutters pass (venus), the same as rounds 9-11.
- **Gates (unchanged and correct):** heart busy; nails, hearts, duo and hands thin; duo open outline. `thin.py` still flags the pad ear tips (10.6-13.8, 7.7-11.4) and (64.2-67.5, 7.8-11.4) at 4.2-4.4 mm², maximum width 2.6-3.0 mm. Whether the pad gate fires depends on the area cut-off. Uterus, pad, lotus and stylish are ungated and fail on conversion alone.

## Checks unchanged and passing
- **C2:** widest side 80 mm on all 10.
- **C3:** ridge p10/p50/p90 0.85/0.89-0.90/0.92 mm; wall p5-p95 1.38-1.40 mm (duo p95 1.89 at the tail and neck, hands p99 1.9).
- **No dark specks** apart from the real dots listed above.
- **Outline fairness (hf curvature RMS, round 11 in brackets):** uterus 0.198 (0.200), pad 0.081 (0.099), lotus 0.349 (0.354), nails 0.385 (0.394), hearts 0.530 (0.542), stylish 0.151 (0.155), duo 0.231 (0.235), heart 0.089 (0.092), hands 0.325 (0.328), venus 0.228 (0.231). All slightly better from the tip rounding; nothing material.

## Compared with round 11

**Better**
1. **Duo brows** (3 of 4) and the **duo lower-left brow** are single centre lines again (they reopened in round 11).
2. **Hands lips:** the filled dark lens with a 0.2 mm slit is gone. It is now a clean 0.9 mm line. The expression is still not the drawn one (see below).
3. **Nails:** the file-tip slit is a single line; two filings slivers are closed (cream cells under 2.5 mm: 4 to 2).
4. **Hearts:** junction blobs 3 to 0; small cells 10 to 3 (skirt/hem region 44-56, 58-85).
5. **Heart:** tiny cream cells 53 to 19; beads 20 to 17.
6. **Lotus:** the 0.67 mm fingertip crescent is gone.
7. **Outer tips** are rounded to 0.55-0.71 mm everywhere. The pad ear outline now matches the drawing's rounded tip.

**Worse or new**
1. **Lotus fingertip** is now a 2.0 mm bar of plastic merged into the wall, with a jog and a wedge (16-21, 47.3-49.4). The crescent was filled, not collapsed to a 0.9 mm centre line.
2. **Hands mouth** collapsed to its medial line, so the upper-lip shape and pointed corners of the drawing are lost (flat bar with blunt ends).
3. Nothing else is worse.

**Unchanged (expected to change, did not)**
- **Stylish brows** (0.72-0.76 mm median): the rule measures the drawing (1.77 mm interior), not the cutter.
- **Duo lid slits, duo jaw, nails thumbnail, hearts hem sliver and eye curl:** these are not closed shapes in the drawing, so the rule cannot see them.
- **Pad ear dough-side points** (R 0.09/0.10 mm): only the plastic exterior was rounded.
- Everything else from round 11:
  - uterus ovaries and tubes;
  - pad joins and channels;
  - lotus centre;
  - stylish mouth hug, nose blob and hair joins;
  - duo nostril balls and neck;
  - heart rim;
  - hands fingers and connector.

## Per-image detail (only what changed or needs a note)

### 1. uterus: FAIL
No change except tip-rounding noise. Round 11 detail stands (`uterus_Z_ovaryR.png`). The ovaries are still not round where the ligaments join, and the feet have ledges. Not touched by either change.

### 2. pad: FAIL
- **Ears** (`pad_Z_earL.png`):
  - The outer tip is now a 0.6 mm round, like the drawing.
  - The dough tip is still a 0.09 mm needle, and the wall is 1.4 mm measured perpendicular but much longer along the bisector.
  - The dough tip only becomes blunt if the outer radius is at least 2.0 mm, or if the inner face is rounded directly.
- Joins and channels: unchanged.

### 3. lotus: FAIL
- **Fingertip** (`lotus_Z_tip.png`, `lotus_diff_r11r12.png`): the crescent was absorbed into the outer wall. The plastic is 1.3-2.0 mm thick over 5 mm (16-21, 47.3-49.4). That is thicker than the wall (1.4) and the ridge (0.9), with a jog at the separator T (17.3-18.3, 49.0-49.3) and a cream wedge (20.8, 48.9). The drawn fingertip arc should remain as one 0.9 mm ridge (or simply be the wall).
- **Centre, base step, free end, petal-tip cusp:** unchanged.

### 4. nails: FAIL (gated)
- **File** (`nails_Z_filings.png`, `nails_Z_filings2.png`):
  - The tip slit is now a single line.
  - The filings are still a lumpy zig-zag wall with one 1.13 mm loop.
  - The thumbnail crescent (0.72 mm) is still open.
- **Fingers:** unchanged slits.

### 5. hearts: FAIL (gated)
- **Hem/skirt** (`hearts_Z_hem.png`): micro-cells collapsed into junctions, which is acceptable. The hem line still hugs the wall over 13.5 mm and leaves a 0.64 mm sliver.
- **Face and hair:** unchanged.

### 6. stylish: FAIL
- Unchanged apart from the base corners.
- **Brows** (`stylish_Z_brows.png`): still hollow, and this is the clearest failure of change 1.
- **Mouth** (`stylish_Z_faceR.png`): still hugs the cheek wall.

### 7. duo: FAIL (gated)
- **Brows:** three of four are now single lines. The upper-left brow loop (36-42.5, 34.2-39.2) is still open (cutter median 0.93 mm).
- **Lids:** still lid + crease with 0.22-0.41 mm slits. The drawing draws these as two separate strokes that only meet at the eye corner, so they are not a closed shape.
- **Nostrils:** still 2.0-2.3 mm balls (`duo_Z_faceR.png`, `duo_Z_faceL.png`).
- **Jaw sliver, X pinch, neck cell:** unchanged.

### 8. heart: FAIL (gated: busy)
Fewer micro-cells, but the beads remain, the largest still 3.18 mm (77.6, 43.6). The necklaces read as a tangle (`heart_Z_dots.png`). The rim is still 0.85-2.25 mm from the wall.

### 9. hands: FAIL (gated)
- **Mouth** (`hands_Z_face.png`): a flat 0.9 mm bar plus the lower-lip arc. The drawing has a full upper lip with a bow and pointed corners. The expression now reads as neutral or flat instead of full closed lips.
- **Nostrils:** the left one is still a ball.
- **Fingers:** unchanged.

### 10. venus: PASS
No material change (109 px of antialiasing noise); ring metrics identical to round 11.

## Top 3 remaining conversion fixes (most important first)

1. **Run the "thin interior" rule on the cutter, not the drawing, and include open near-parallel pairs.**
   - After the ridges are rebuilt at 0.9 mm, any cream cell or channel narrower than about 2.5 mm, between two ridges or between a ridge and the wall, should either:
     - become one centre-line ridge (if under ~1.5 mm), or
     - be pushed to ≥2.5 mm.
   - This is regardless of whether the drawing had a closed shape there.
   - When collapsing, re-centre at 0.9 mm. Do not fill: the lotus fingertip became a 2.0 mm bar.
   - This one change fixes:
     - stylish brows (27.6-39.4, 20.2-23.6), (44.9-48.8, 17.9-20.8);
     - duo upper brow (36-42.5, 34.2-39.2) and four lid slits;
     - duo jaw (27.1-30.8, 54.9-59.5);
     - nails slits, thumbnail and filings;
     - hearts hem and eye curl;
     - pad channels;
     - stylish mouth hug (53.2-53.5, 33.1-39.8);
     - heart rim.
2. **Faces: line ends and short hooks stay strokes; lip lenses keep their outline.**
   - Nostril and line-end dots must not become balls: duo (74.5,40.1), (77.5,39.9), (37.5,49.1); hands (42.3,49.4); stylish nose blob (48.6-49.8, 30.0-32.1); the 17 heart junction beads.
   - When a lip lens collapses, keep the upper contour with its Cupid's bow and pointed corners, plus the parting line. Do not keep the medial axis: hands (41.3-47.0, 52.4-53.2). Keep the stylish bow dip (46-50, 34.2-34.6).
3. **Round convex tips on the dough side and keep circles and tangents intact at joins.**
   - The 0.6 mm rule must apply to the cookie (inner wall face): outer radius ≥ 2.0 mm, or fillet the inner face. Pad ear dough tips at (12.0, 9.7) and (66.0, 9.7) are still 0.09-0.10 mm.
   - Carry over round 11's fix 2, which is still entirely open:
     - fit the circle at uterus ovary T-joins ((66.2,38.0)-(66.3,40.4), (24.7-25.0, 38-40.5)) and remove the foot ledges;
     - blend tangential wall merges without bends or stubs: pad (66.6-67.3, 64.2-65.3), (62.0-63.4, 74.2-75.0), (30.8-31.2, 17.3-18.0); stylish hair line (41.5-43, 8.5-9.6) plus hook (45.4-46.6, 10.5-12.0);
     - keep the lotus Y as one smooth curve (44-44.9, 49.6-53).
   - Uterus, pad and lotus (all ungated) would be close to passing with fixes 1 and 3.

**Gate notes:** gates are unchanged and correct for all five gated images. The cutters shown for gated images were still judged above.

**Drawing-side, not scored:**
- pad subject (owl/cat shape);
- hearts and heart detail;
- thin fingers (nails, hands, lotus);
- lashes outside the outline (stylish);
- close parallel strokes (pad, duo, nails);
- duo open outline;
- uterus rung spacing and the tube V near-miss.
