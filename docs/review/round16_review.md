# Round 16 review: new Gemini rules (white areas, same marker inside, almond eyes 70x35 px with 25-30 px pupil, one-stroke brows, mouth 90x40 px with one parting line, 3 hair lines, mittens, no parallel-line tubes, cut-off parts rounded 60 px inside) and new conversion (run-on to the wall within 3 mm, join ends 0.9-2.4 mm from a line, pupils capped at 2 mm)

**Inputs and method**
- Originals `/tmp/gz/orig`; round-15 drawings `/tmp/gz/png15`; NEW drawings `/tmp/gz/png16`; NEW cutters `/tmp/gz/out16/*_cutter.svg`; sheets `sheet16A/B.png`.
- Scripts: the round-15 scripts were copied to `/home/claude/review/round16_work/` and re-pointed to `out16`, `png16` and `/tmp/r16_*` (`render.py`, `masks.py`, `measure.py`, `strokew2.py`, `spacing2.py`, `pair.py`, `cut.py`, `cornerR.py`, `paths.py`, `ringchk.py`; `ringchk.py` and `paths.py` now read `out16` directly). Raw output: `round16_work/measure_out.txt` (cutter) and `round16_work/measure_draw_out.txt` (drawings, ring).
- Renders: `NAME_mm20.png` (20 px/mm, SVG mm origin), `NAME_1400.png`, `NAME_pair.png` (drawing | cutter with mm grid), zooms `NAME_Z_*.png`.
- **Coordinates are SVG mm read from the cutter panel.** The drawing panel is registered on the ink box and is off by 1-6 mm wherever the cutter dropped a part (duo, hands, pad) — every coordinate below comes from the cutter itself.
- C2 passes on all 10 (widest side 80 mm). C3 passes on all 10: ridge p10/p50/p90 0.85/0.90/0.92 mm, wall 1.33-1.39/1.40/1.43 mm (unchanged).

---

## Summary table

| # | picture | drawing | vs r15 | cutter | main faults |
|---|---|---|---|---|---|
| 1 | uterus | FAIL (tubes and vaginal wall still double lines; fundus circle crossed by the tubes) | same | FAIL (closer) | **rungs now joined to the wall (r15 fault fixed)**; ovaries still lemon-shaped half-circles (12.5-24.5 and 67.5-79, 30-34.3); wedge slivers 0.45-0.5 mm at the fundus crossings (35.3, 29.2) and (57.0, 28.8); seam hairline (46.1, 74.8-75.4) |
| 2 | pad | near-PASS (grey fill gone, even line; two small stroke-overlap kinks) | **better** | FAIL (one fault + one pinch) | body line still stops **0.7 mm** short of the wall at the top wing Y (53.2, 26.9), so the run-on rule did not fire; left wing join is a tangent pinch, cream corner radius 0.1 mm (23.9, 39.6) |
| 3 | lotus | FAIL (flower inside an invented pointed hood → reads as an artichoke; margin 16 px) | **much better** (arm ends inside, mitten hand, one shape) | FAIL | 2.0 mm blob at the petal hub with a square stub (48.9, 52.1); slivers 0.1-0.3 mm beside the merged spine (48.4, 51.0), (49.5, 50.8); 1.3 mm × 4.4 mm channel petal/hood (59.2, 31.0); step in the palm line (48.6, 54) |
| 4 | nails | FAIL (identical to r15: 7 px, needle sleeve, pointed teeth, nail loops) | same | FAIL (gated: thin, correct) | the nail file is lost into the outline; nail loops tangled with finger lines; 3.23 mm blob in the sleeve tip (86.6, 56.9); tooth bumps in the wall 2.67/2.06/1.93 mm |
| 5 | hearts | FAIL (zig-zag hair, filled black lips, 6.6 px, many loose folds) | slightly better (15 → 6 tight cells) | FAIL (gated: thin, correct) | **face erased again** (eye, nose and lips gone in 58-68, 38-48); 0.51 mm cell (62.7, 44.9); 3.22 mm foot blob (13.1, 61.4); lumpy hair wall |
| 6 | stylish | FAIL (hollow brows, no closed almond eyes, lash flick, 8.8 px) | slightly better (margin 21 → 60 px) | FAIL (closer) | **mouth kept as closed lips with a parting line (fixed)**; pupils 2.0 mm (cap works); left eye = wavy lid + pupil, lower lid lost (41.6-52, 30.5-34.5); nose turned into a V check-mark with a fat end (56.9-58.1, 37.3-37.7); mouth parting line bridged to the jaw wall (64.5-66, 42.6) with 0.1-0.2 mm slivers; hair strand turned into a sawtooth of wall bridges (24-28, 22-46) with a 0.6 mm cell (24.5, 30.8); 0.1 mm × 8 mm top sliver (47-54, 10.2) |
| 7 | duo | FAIL (torso runs off the bottom edge; 4 hollow brows; lash flicks; 7 px) | **worse** (open again) | FAIL (gated: open 13 %, correct) | torso dropped; left mouth (closed lips) → one dash (52.5-55.3, 54.5-55.5); right mouth → frown line + dash (87-96, 44-48); nose → two 2 mm dots (89.0, 41.0), (92.2, 40.8) |
| 8 | heart | FAIL (**9 women** despite the 3-figure rule; 5 px inner lines, ratio 3.2; double heart frame) | **much worse** | FAIL (gated: busy 31.3, correct) | every face erased (no eyes or mouths at all); spike from the top notch (49.8, 21-24.5); stubs of the inner frame (14, 44-47), (85-88, 40-48) |
| 9 | hands | FAIL (top hand now **separate**; thin fingers; ~10 hair strands; 6 px) | mixed (cleaner face, but split) | FAIL (gated: open 25 %, correct) | top hand dropped; closed lips → open "D" mouth (66.5-75, 76.5-80.5); 1.6 mm "beads" on both brows (67.7, 63.0), (76.4, 63.0); lower lids lost |
| 10 | venus | **PASS** | same | **PASS** | ring R 22.64 mm, peak-to-peak 0.11 mm; outer circle R 24.05 mm, peak-to-peak 0.10 mm; no sharp corners, no blobs, no cells |

**Result: 1/10 drawings pass (venus; pad is one small step away), 1/10 cutters pass (venus), as in rounds 14 and 15.** The conversion moved forward on uterus (rungs), stylish (mouth, pupil size) and pad (no change, still one gap). The gates fired correctly on all five pictures that needed them (nails, hearts, duo, heart, hands). The face problem is unchanged in kind: hearts and heart lose their faces entirely, and duo and hands lose their mouths.

---

## 1. Measured line width, spacing, colour (round 15 → round 16)

Width = ink area / skeleton length, px on a 1024 canvas (rule: same marker as the outline, ~1/70 = 14.6 px). Ratio = p90/p10 of the local width (rule D3 ≤ 1.3). Cells = enclosed white regions with an inscribed width under 40 px@1024. Margin = closest ink to the frame, px@1024 (rule 60).

| picture | width r15 → r16 | ratio r15 → r16 | cells < 40 px r15 → r16 | margin r15 → r16 | fill |
|---|---|---|---|---|---|
| uterus | 9.7 → 10.4 | 1.20 → 1.33 | 4 → 5 | 37 → 37 | none |
| pad | 19.0 → 11.6 | **1.85 → 1.41** | 0 → 0 | 63 → 61 ✓ | **grey gone ✓** |
| lotus | 11.3 → **13.2** | 1.30 → 1.25 | 2 → 1 | 0 → 16 | none |
| nails | 6.4 → 7.0 | 1.12 → 1.50 | 14 → 15 | 57 → 58 | none |
| hearts | 5.4 → 6.6 | 2.24 → 2.12 | 15 → 6 | 85 → 82 ✓ | filled lips (~2 mm) |
| stylish | 7.7 → 8.8 | 1.50 → 1.34 | 13 → 7 | 21 → **60 ✓** | pupils only |
| duo | 8.7 → 7.1 | 2.00 → 1.50 | 12 → 16 | 43 → 70 ✓ (but the torso runs off the frame) | pupils only |
| heart | 10.3 → **5.3** | 1.33 → **3.16** | 21 → **55** | 74 → 77 ✓ | **purple gone ✓** |
| hands | 6.6 → 6.3 | 3.00 → 2.83 | 6 → 3 | 18 → 67 ✓ | pupils, filled brows |
| venus | 18.4 → 15.6 | 1.08 → 1.08 | 0 → 0 | 85 → 85 ✓ | none |

- **Every area white:** works. The grey stain (pad) and the purple hat (heart) are both gone; only pupils, the hearts lips and the hands brows are filled.
- **Same marker inside:** only pad improved: the outline came down to the inner lines (ratio 1.85 → 1.41). But the absolute width fell (19 → 11.6), so Gemini evened the line by thinning the outline, not by thickening the inner lines. Only venus and lotus are near 14.6 px. Heart fell from 10.3 to 5.3 px when it went back to a crowd. The detail-heavy pictures (nails, hearts, duo, heart, hands) stay at 5-7 px.
- **Margin:** 7 of 10 meet 60 px (was 4). Lotus is at 16 px: the arm end is rounded but sits about 11 px@720 from the right edge, not 60 px.

---

## 2. Per picture

### 1. uterus
Zooms: `uterus_pair.png`, `uterus_Z_canal_pair.png`, `uterus_Z_fundus.png`, `uterus_Z_ovaryL.png`, `uterus_Z_bottom.png`.

**Drawing: FAIL, same as r15.**
- Good: symmetric; 4 rungs plus a cervix bar, so the ≤4 marks rule holds; 10.4 px.
- Faults:
  - **tubes are still two parallel lines** ~1.5 mm apart over ~25 mm per side, so the new "tubes never two parallel lines" rule is ignored;
  - the vaginal canal is still drawn as an inner wall line ~1.2 mm inside the outer wall (57-75);
  - the fundus is a full circle crossed by the tube lines (X crossings at about (34, 29) and (58, 29));
  - margin 37 px.

**Cutter: FAIL (closer than r15).**
- **Fixed:** all four rungs now run into the wall cleanly (the r15 gaps of 0.45-0.8 mm at (41.25-50.85, 61-66) are gone); the r15 bottom box is gone. The inner canal walls merge into the outer wall at a normal 1.4 mm.
- **Ovaries not round (owner rule):** each ovary is an upper arc on the wall, a lemon 11 × 4.3 mm with sharp 0.2 mm cream tips at (13.1, 34.1), (24.3, 34.2), (67.6, 34.0) and (78.8, 34.3). The drawing has full circles.
- **Fundus crossings (C5, C14):** where the tube line crosses the fundus circle, the cutter makes a knot with wedge slivers 0.45-0.5 mm wide over ~5 mm at (35.3, 29.2) and (57.0, 28.8), plus 0.2 mm tips at (34.0, 28.6) and (58.2, 28.6). The drawing has a clean X.
- **Last rung:** it carries two small lumps where the dropped inner wall stubs were (42.5, 69.7) and (49.5, 69.7), so it reads as a cap rather than a straight rung.
- **Seam hairline:** a 0.05 mm dark spike at (46.1, 74.8-75.4), a path-closing artefact.

### 2. pad
Zooms: `pad_pair.png`, `pad_Z_wingTop.png` + `pad_Z_wingTop_draw.png`, `pad_Z_wingL.png`, `pad_Z_wingLlow.png`, `pad_Z_wingR.png`.

**Drawing: near-PASS, better than r15.**
- The grey fill is gone and the outline now matches the inner lines.
- Minor faults:
  - a small stroke-overlap step on the bottom stain (about 447, 540 px@720);
  - a Z-shaped notch on the middle stain (about 310, 297 px@720);
  - slight tremor on the stain edges.

**Cutter: FAIL (one gap, one pinch).**
- **Top wing join (C6, C14):** in the drawing the body line runs straight into the outline at a clean Y. In the cutter the line ends at (53.2, 26.9), **0.7 mm** below the wall (worse than r15's 0.35-0.55 mm). The new "run on within 3 mm" rule did not fire here. The end points at a concave wall notch (53.5, 26.2), so either the heading test or the target choice misses it.
- **Left wing join:** the line touches the wall only at a tangent point, with cream corners of radius 0.08-0.2 mm at (23.9, 39.6) and (23.8, 39.8). That is a pinch, not a fused T.
- Lower-left join (40.0, 68.4): a small step on the right side, radius 0.14 mm (minor).
- The right join (70.5, 48.5) is clean.

### 3. lotus
Zooms: `lotus_pair.png`, `lotus_Z_hub.png`, `lotus_Z_hoodR.png`, `lotus_Z_hoodL.png`, `lotus_Z_thumb.png`.

**Drawing: FAIL, much better than r15.**
- Better:
  - **the arm is cut short with a rounded end**, so the cut-off rule partly works (rounded, but 16 px from the edge, not 60);
  - the hand is a mitten with a thumb;
  - one closed shape, 13.2 px, ratio 1.25.
- Faults:
  - **D11:** the flower sits inside an invented pointed hood, and the petals are rounded loaf shapes. It reads as an artichoke or onion in a hand, not a lotus. The original's pointed petal tips are lost.
  - Margin 16 px.

**Cutter: FAIL (passes the gate now).**
- **Hub blob:** the petal lines that meet at the base become a **1.98 mm dark ball** at (48.9, 52.1) with a square 0.8 mm stub down to the palm line (48.5-49.3, 52.8-53.5).
- **Merged spine:** the two central petal lines are merged into one spine (48.6-49.2, 46-51), leaving wedge slivers of 0.28 mm × 3.4 mm (48.4, 51.0) and 0.1 mm × 2.4 mm (49.5, 50.8).
- **Channel:** 1.3 mm wide over 4.4 mm between the top-right petal and the hood wall (59.2, 31.0), ending in an acute tip at (62.5, 35.1).
- Palm line step of ~0.4 mm at the hub (48.6, 54).
- Outline smooth, notches filleted; thumb joins (26.5-29.5, 50-52) are clean.

### 4. nails
Zooms: `nails_pair.png`, `nails_Z_fingers.png`, `nails_Z_file_sleeve.png`.

**Drawing: FAIL, the same as r15** (it looks redrawn from the same seed):
- 7 px line;
- the sleeve tapers to a needle (87.5, 64);
- 3 pointed filing teeth;
- nail loops sit inside the finger outlines;
- 15 cells under 40 px;
- the file overlaps the fingers.

None of the new rules show.

**Cutter: FAIL (gated: thin, correct).**
- The nail file is lost: its top edge merges into the outline at y 26, and its left end becomes a thumb-like U (28-37, 25.5-31.6).
- Nail loops are tangled with the finger lines, with slivers of 0.1-0.2 mm over 5-8 mm at (23.6, 22.4), (34.6, 25.0), (29.4, 21.8) and (64.8, 26.8).
- A free stroke (28.2, 15-21).
- 3.23 mm blob in the sleeve tip (86.6, 56.9).
- Wall bulges: 2.67 mm (53.2, 37.2), 2.06 mm (66.0, 37.3), 2.05 mm (15.6, 23.5), 1.93 mm (57.5, 34.6).

### 5. hearts
Zooms: `hearts_pair.png`, `hearts_Z_head.png`.

**Drawing: FAIL, slightly better than r15.**
- 6 tight cells (was 15); margin 82 px.
- Faults:
  - zig-zag spiky hair (the "3 smooth lines" rule is ignored);
  - filled black lips (~2 mm);
  - 6.6 px inner lines (ratio 2.1);
  - many loose dress fold lines (D8);
  - the face is a small profile (eye ~2 mm).

**Cutter: FAIL (gated: open 4 % + thin, correct).**
- **Face erased again:** no eye, nose or lips anywhere in (58-68, 38-48), only crossing hair lines; there is a 0.51 mm cell at (62.7, 44.9).
- Foot blob 3.22 mm (13.1, 61.4).
- Dress slivers 0.1 mm × 6-8 mm at (54.0, 70.6), (34.4, 54.8), (41.6, 77.0).
- Hair becomes a lumpy wall (55-90, 24-52).

### 6. stylish
Zooms: `stylish_pair.png`, `stylish_Z_face.png` + `stylish_Z_face_draw.png`, `stylish_Z_hair.png` + `stylish_Z_hair_draw.png`.

**Drawing: FAIL, slightly better than r15.**
- Good:
  - margin 60 px (was 21);
  - 3 smooth hair lines (rule obeyed);
  - closed lips with one parting line, about 8 × 6 mm (rule obeyed);
  - hook nose and ear.
- Faults:
  - **both brows are still hollow leaves** (one-stroke rule ignored);
  - **neither eye is a closed almond**: each is a crease line, an upper lid and a big filled pupil (~4 mm, ~43 px@1024, above the 25-30 px rule) with no white around it;
  - a lash flick on the right eye;
  - 8.8 px line.

**Cutter: FAIL (closer than r15).**
- **Fixed:**
  - the mouth stays a closed lip shape with its parting line (r15 lost the bow);
  - pupils are 1.99 and 1.96 mm (r15: 2.94 and 2.52 mm balls);
  - brows become single strokes, which matches the rule.
- **Left eye:** the crease and the lid merge into one wavy stroke with a hump (41.6-52, 30.5-34.5), and the 2 mm pupil hangs under it at (46.6, 33.3). The drawn heavy-lidded look becomes a small peeking dot. The lower lid does not exist in the drawing either, so the almond rebuild had nothing to rebuild from.
- **Right eye:** lid and flick become a "V" check mark (57.5-64, 28.5-30.3) touching the pupil at (61.2, 30.8), and the nose line hooks into it.
- **Nose:** the separate nose line and the nostril "U" are joined by the new 0.9-2.4 mm rule into one S that ends in a **sharp V kink** at (58.1, 37.7) with a fat 1.3 mm end at (56.9, 37.3). The drawing has a soft U.
- **Mouth to jaw:** the parting line is extended through the right corner into the jaw wall (64.5-66, 42.6), probably by the new join rule. The mouth now touches the face outline, against the rule, and leaves slivers of 0.1-0.2 mm × 6 mm at (64.4, 42.4) and (64.4, 43.4). The left corner doubles up into a step at (57.4, 44.2).
- **Hair sawtooth (new in r16):** in the drawing the outer strand runs smoothly about 2 mm inside the outline. In the cutter it is broken into pieces with four bridges to the wall at (25.6, 25), (24.5, 29.5), (24.2, 37.4) and (25.4, 43), forming a 0.6 mm triangle cell at (24.5, 30.8). Seen at arm's length this is the most visible flaw.
- **Top sliver:** the top hair line hugs the wall at 0.1 mm over 8.2 mm (47-54, 10.2).
- The sharp shoulder tip makes a 2.75 mm wall lump (18.0, 87.0); it is sharp in the drawing too.

### 7. duo
Zooms: `duo_pair.png`, `duo_Z_faces.png` + `duo_Z_faces_draw.png`.

**Drawing: FAIL, worse than r15.**
- The torso runs off the bottom edge with no rounded end (cut-off rule ignored); this is what the 13 % open gate saw.
- Four hollow leaf brows (ignored).
- Eyes are lids with flicks plus pupils, not almonds (ignored).
- Left mouth: closed lips ~5.6 mm wide (~63 px, below the 90 px rule).
- Right mouth: an upper lip plus a lower-lip dash, not closed.
- 7.1 px line; 16 tight cells.
- The faces themselves are expressive and the frown is kept.

**Cutter: FAIL (gated, correct).**
- Torso dropped.
- **Mouths lost again:** the left closed lips become one dash (52.5-55.3, 54.5-55.5); the right lips become a frown line plus a dash (87-96, 44-48).
- The nose becomes two 2 mm dots (89.0, 41.0) and (92.2, 40.8).
- Many crossing cells around the left ear and collar: 2.44 mm (77.4, 50.1); slivers 0.1-0.2 mm × 7-10 mm at (75.0, 38.4), (35.7, 43.6), (35.0, 37.8).

### 8. heart
Zooms: `heart_pair.png`, `heart_Z_faces.png`.

**Drawing: FAIL, much worse than r15.**
- The purple fill is gone (good).
- **It is a crowd of 9 women again** (the 3-figure rule is ignored, as the conversion notes say).
- Small profile faces; 5.3 px inner lines against a ~10 px heart frame (ratio 3.2).
- A double heart frame.
- 55 cells under 40 px.

**Cutter: FAIL (gated: busy 31.3, correct).**
- **Every face is erased:** the heads are blank outlines with no eyes or mouths.
- The inner frame is mostly dropped, but leaves a spike from the top notch (49.8, 21-24.5) and stubs at (14, 44-47) and (85-88, 40-48).
- 12 cells under 2.5 mm (e.g. 1.49 mm (37.4, 36.7), 1.5 mm (43.0, 36.7)).
- Long 0.1 mm channels: (59.2, 22.6) 14.6 mm, (36.6, 47.6) 12.5 mm, (74.0, 60.8) 10.4 mm.

### 9. hands
Zooms: `hands_pair.png`, `hands_Z_face_cut.png` + `hands_Z_face_draw.png`.

**Drawing: FAIL, mixed against r15.**
- Better: the top arm now ends rounded inside the frame (margin 67 px); the face is clean (almond-ish eyes with pupils, closed lips with a parting line).
- Faults:
  - the top hand is now **detached** from the head (the one-shape rule is ignored; this is the 25 % open gate);
  - thin separate fingers on both hands (mitten rule ignored);
  - ~10 hair strands (the 3-line rule is ignored);
  - thick filled tapered brows;
  - lash flicks;
  - 6.3 px line.

**Cutter: FAIL (gated, correct).**
- Top hand dropped.
- **Mouth:** closed lips become an open "D" (66.5-75, 76.5-80.5), so a neutral mouth turns into an open smile.
- **Brow beads:** the thick part of each filled brow becomes a 1.6 mm dot on the brow line at (67.7, 63.0) and (76.4, 63.0); they read as extra eyes.
- Eyes: 2 mm pupils on the lid lines at (65.3, 66.1) and (77.4, 66.2); no lower lids.
- Hair strands hug the face line at 0.1 mm over 15 mm (56.4, 66.4) and 8.7 mm (57.8, 59.4).

### 10. venus
Zooms: `venus_pair.png`, `venus_Z_top.png`.

**Drawing: PASS.** One outline plus a ring, 15.6 px, ratio 1.08, symmetric, margin 85 px.

**Cutter: PASS.**
- Outer circle R 24.05 mm, peak-to-peak 0.10 mm; ring R 22.64 mm, peak-to-peak 0.11 mm: both round.
- No corner tighter than the 1.2 mm fillet is reported.
- No blobs, cells, channels or bulges.

---

## 3. Conversion changes: did they work?

- **Run on to the wall (within 3 mm, heading towards it):** yes on uterus; all four r15 rung gaps are closed. **Not on pad:** the top-wing end at (53.2, 26.9) is 0.7 mm from a concave wall notch and still stops. The rule seems to miss targets at a concave corner, or ends whose heading is not square to the wall.
- **Ends 0.9-2.4 mm from another line join it:** it fires, but without a check on what the join makes:
  - stylish nose: the U plus line become a V kink (58.1, 37.7);
  - stylish mouth: it is welded to the jaw (64.5-66, 42.6), so the mouth now touches the outline;
  - probably the stylish hair sawtooth (24-28, 22-46), with a new 0.6 mm cell.

  The join is welcome where the drawing nearly connected two lines; it is harmful where the drawing kept them apart on purpose (a mouth corner beside the cheek, a nostril beside the nose line).
- **Pupils capped at 2 mm:** works on every pupil (stylish 1.99/1.96, duo 1.94-2.0, hands 1.99). But non-pupil blobs remain or appear:
  - the lotus hub (1.98 mm, the cap's size: a junction treated like a pupil);
  - nails sleeve 3.23 mm and hearts foot 3.22 mm (in the wall, not capped);
  - hands brow beads 1.6 mm (filled brows read as pupils).

---

## 4. Rules: which now work, which are still ignored or unstable

**Work (this run)**
- **Every area white:** the grey pad stain and the purple hat are gone; 10/10 without area fills.
- **Margin / subject inside the frame:** 7/10 meet 60 px (was 4/10).
- **Cut-off part shortened to a rounded end:** lotus arm and hands top arm (the lotus end is at 16 px, not 60).
- **Mittens:** lotus only.
- **Mouth as closed lips with one parting line:** stylish (and the hands face is drawn this way, though it is small).
- **Hair 3 smooth lines:** stylish only.

**Partly / unstable**
- **Same marker inside:** pad evened out (ratio 1.85 → 1.41) but by thinning the outline; heart fell 10.3 → 5.3 px. Detail pictures still draw at 5-7 px.
- **One connected shape:** lotus now connected; duo lost its closed torso (was closed in r15); hands' top hand detached (was joined in r15). It flips from run to run.
- **Mouth size ≥ 90 × 40 px:** stylish yes; duo, hands and heart no.

**Still ignored**
- **Eye = one closed almond, 70 × 35 px, 25-30 px pupil, 30 px white:** 0 of 5 face pictures. Gemini draws a lid line (often plus a crease and a flick) and a filled pupil, in every run.
- **Brows one stroke:** stylish (2) and duo (4) still hollow leaves; hands filled tapered brows.
- **No lash flicks** (implied by "one closed almond"): stylish, duo and hands still have them.
- **Tubes/limbs never two parallel lines:** uterus tubes and canal still doubled.
- **Hair 3 lines:** hands ~10 strands, hearts zig-zag, duo 4-5.
- **Mittens, fingertips ≥ 90 px:** hands and nails still have thin pointed fingers.
- **3 figures at most:** heart is a 9-woman crowd again (it was 3 in r15, so this is unstable rather than fixed).
- **Nails** shows no change at all from r15, which suggests a cached or same-seed output.

---

## 5. Top 3 remaining conversion fixes

1. **Keep faces (still the biggest fault; 5 of 10 pictures, no gate measures it).**
   - A closed loop in the drawing ≥ 3 mm long (lips, eye, nostril) must stay a closed loop of the same shape in the cutter. If its inside is under 2.5 mm, enlarge it about its centre to a 2.5 mm opening; never collapse it to a dash, a line, an O or a D.
   - Never erase a face. In profile faces (hearts, heart), keep at least the eye stroke, the nose-lip profile and a lip stroke as ridges, even where the area is busy. Drop hair and fold lines first.
   - A filled brow is a brow, not a pupil: thin it to one centre-line stroke and never put a dot on it.
   - Add a gate: "face features in the drawing (eye, mouth) not present in the cutter" and "closed loops ≥ 3 mm lost".
   - Fixes: hearts face (58-68, 38-48); heart all faces (20-80, 25-65); duo mouths (52.5-55.3, 54.5-55.5) and (87-96, 44-48); hands mouth (66.5-75, 76.5-80.5) and brow beads (67.7, 63.0), (76.4, 63.0).

2. **Make the join rules finish their job, and only where the drawing meant to join.**
   - Run-on also when the nearest wall point is in a concave notch or the end is not square to the wall: extend along the end's tangent and fuse with a fillet. Fix pad (53.2, 26.9) → wall at (53.5, 26.2).
   - A join with the wall must be a fused T with ≥ 0.5 mm fillets, not a tangent kiss. Fix pad (23.9, 39.6) and (40.0, 68.4).
   - Do **not** apply the 0.9-2.4 mm join when:
     - (a) one side is a mouth or eye loop and the other is the outline;
     - (b) the join would create a cell under 2.5 mm or a kink sharper than the drawing's;
     - (c) the end is a nostril or hook end.

     Fixes: stylish mouth-to-jaw (64.5-66, 42.6), nose V (58.1, 37.7), hair bridges (25.6, 25), (24.5, 29.5), (24.2, 37.4), (25.4, 43).

3. **Clean hubs and crossings; keep circles round.**
   - Where 3 or more ridges meet, build one Y/star with fillets, never a dot; drop stubs under 1 mm. Fix lotus hub (48.9, 52.1) and stub (48.5-49.3, 52.8-53.5).
   - Merging two near-parallel lines into one spine must also remove the wedge slivers beside it (fill wedges under 1 mm wide). Fix lotus (48.4, 51.0), (49.5, 50.8).
   - At an X crossing, keep a clean X or drop the shorter arm; never leave wedges under 1 mm. Fix uterus (35.3, 29.2), (57.0, 28.8).
   - A circle in the drawing that overlaps the outline stays a full circle (close the arc with an inner ridge), aspect ratio ≤ 1.05. Fix uterus ovaries (12.5-24.5, 30-34.3) and (67.5-79, 30-34.3).
   - Channels and cells under 2.5 mm: merge or drop. Fix lotus (59.2, 31.0), stylish top (47-54, 10.2) and hair cell (24.5, 30.8), uterus seam hairline (46.1, 74.8-75.4).

## 6. Top 3 Gemini rule changes (still needed)

Pixel sizes are not being obeyed at all (eyes, brows, mouth, marker). Gemini does not measure, so the rules should be in proportions and pictures it can follow, and the most-ignored rules should come first.

1. **Faces in proportions, not pixels; simple cartoon features.**
   > "Draw each face like a simple sticker: each eye is a closed lemon shape about one fifth of the face width, with a round dot pupil in the middle that does not touch the eye line; no eyelashes, no creases, no flicks. Each eyebrow is a single thin arc, never a filled or two-line shape. The mouth is a closed lip shape about one third of the face width with one line through the middle. Keep where the eyes look and the mouth's expression from the photo."

2. **Hard count limits stated first, with what to drop.**
   > "At most 3 people (choose the 3 most in front; leave the rest out). Each head has at most 3 hair lines. Hands have no separate fingers. A tube, arm or leg is one line or a filled-in part of the outline, never two lines side by side."

   Heart (9 people), hands (10 strands, fingers), uterus (double tubes) and nails (fingers) all ignore the current wording.

3. **One shape that stays inside the frame, with the line weight anchored to something visible.**
   > "The whole subject is ONE outline; everything touches or is inside it. If a body or arm would leave the picture, end it with a rounded edge well inside the picture (a gap of one finger-width to the border). Draw every line with one thick marker, as thick as the pupil dot is wide, outline and inner lines alike; if something does not fit at that thickness, leave it out."

   Duo (open torso), hands (detached hand) and lotus (16 px margin) show the cut-off and one-shape rules are unstable; inner lines are still 5-7 px on 5 pictures.

## 7. Honest count

- **Accepted by a Bakerlogy customer today: 1 of 10** (venus).
  - Pad is one fault away (the 0.7 mm gap plus the pinch).
  - Uterus is two faults away (ovaries, fundus slivers).
  - Stylish has its mouth right now, but the nose kink, mouth-to-jaw weld and hair sawtooth fail it.
- **After the gated redraws (nails, hearts, duo, heart, hands), taking the better of rounds 15 and 16 for each: still 1 of 10.**
  - Nails and hearts are the same in both rounds, and both cutters fail (file lost, face erased).
  - Duo: round 15 had the closed torso but its cutter turned the mouths into an O and a frown line.
  - Heart: round 15 had 3 women but its cutter turned the lips into smile lines and left cells.
  - Hands: round 15 was joined but its cutter made a lumpy join and an open-D mouth.

  None of these passes without conversion fix 1.
- With conversion fixes 2 and 3: pad and uterus reach acceptance → **3/10**. With fix 1 also working: stylish and probably heart (round-15 drawing) → **about 5/10**. Duo, hands, nails, hearts and lotus need Gemini to obey the face, count and one-shape rules (section 6) first.
