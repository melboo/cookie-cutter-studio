# Round 15 review: new Gemini rules (1/70 marker, black only, keep enclosing shape, one shape, ≤4 marks, mittens, single brows) and new conversion (pupil gaps kept, eye rebuild, 1.2 mm inside fillets, one dot per feature, short strokes kept)

**Inputs and method**
- Originals `/tmp/gz/orig`; round-14 drawings `/tmp/gz/png14`; NEW drawings `/tmp/gz/png15`; NEW cutters `/tmp/gz/out15/*_cutter.svg`; sheets `sheet15A/B.png`.
- Scripts: the round-14 scripts were copied to `/home/claude/review/round15_work/` and re-pointed to `out15`, `png15` and `/tmp/r15_*` (`render.py`, `masks.py`, `measure.py`, `strokew2.py`, `spacing2.py`, `pair.py`, `cut.py`, `ringchk.py`, `paths.py`, `curv.py`). Raw measurement output: `round15_work/measure_out.txt`.
- Renders: `NAME_mm20.png` (20 px/mm, SVG mm origin), `NAME_1400.png`, `NAME_pair.png` (drawing | cutter with mm grid), zooms `NAME_Z_*.png`.
- **Coordinates are SVG mm read from the cutter panel.** Registration of the drawing on the ink box is off by 1-3 mm in several pictures (the drawing still carries a faint tinted background box and the cutter is rescaled), so the drawing panel of the pairs is only approximately aligned; every cutter coordinate below was taken from the cutter itself.
- Scale and walls: C2 passes on all 10 (widest side 80 mm). C3 passes on all 10: ridge p10/p50/p90 0.85/0.90/0.92 mm, wall 1.33-1.39/1.40/1.43 mm (unchanged).

---

## Summary table

| # | picture | drawing | vs r14 | cutter | main faults |
|---|---|---|---|---|---|
| 1 | uterus | FAIL (D5/D7 double bands, D12 ok) | better (10 rungs → 3) | FAIL | tubes and vaginal wall still hollow double bands; fundus drawn as a full circle crossed by the tubes; cutter: canal rungs float 0.45-0.8 mm from the wall (they were joined in the drawing), bottom rung becomes a closed box with a 2.18 mm wall lump (42.6, 71.2); ovaries become half-arcs, not circles |
| 2 | pad | FAIL (**D1 grey fill**, D3 outline 2× inner, D4 wobble) | mixed (cleaner, but grey fill) | FAIL (one fault) | cutter clean except the body line stops 0.35-0.55 mm short of the wall at the top wing join (51.1-51.4, 24.85-25.2) |
| 3 | lotus | FAIL (D2: arm still runs off the frame; thin fingers) | same | FAIL (gated: open 24 %, correct) | arm dropped, 3.35 mm blob at the vein hub (72.8, 78.2), spur tip (42-46, 92-104), lumpy cut edge with 2.1 mm bulge (82.4, 90.1) |
| 4 | nails | FAIL (D3 6 px, D6 needle sleeve, D5 nail loops, pointed teeth) | slightly worse (thinner) | FAIL (gated: thin, correct) | the nail file (the subject) is lost into the outline; nails as loops against finger lines (slits 0.1-0.3 mm); 3.26 mm blob in the sleeve tip (86.6, 57.0); tooth bumps in the wall |
| 5 | hearts | FAIL (D3 5 px, D4 spiky hair, D8 many loose lines, tiny face) | better (no cloud, no hearts) | FAIL (gated: open 4 % + thin, correct) | **the face is gone**: eye, brow, nose and lips all missing in the cutter; lumpy hair wall; 3.5 mm foot blob (14.6, 60.9) |
| 6 | stylish | FAIL (hollow brows, lash flick, margin 21 px, 8 px line) | same | FAIL | both eyes collapse: pupil balls 2.94 mm (42.2, 29.4) and 2.52 mm (56.2, 27.0) skewered by lid strokes, lower lids lost (gaze/expression changed); cupid's bow lost; hair line hugs the wall 0.1 mm over 26 mm (36.1, 8.0) |
| 7 | duo | FAIL (D3 9 px, hollow brows on the left face, lash flicks) | **much better** (closed torso, no blue) | FAIL | left mouth (closed full lips) becomes an empty "O" oval (34-39, 38.5-41.5); right mouth becomes a frown line plus a dash (61-69, 33-35); eyes reduced to dot plus dash; cells 1.84 mm (48.5, 39.0) and 1.49 mm (37.2, 39.9); hair channel 0.32 mm × 12 mm (62.6, 13.8) |
| 8 | heart | FAIL (**D1 purple hat fill**) | **much better** (heart frame back, faces clean) | FAIL (closest of the people pictures) | all three closed-lip mouths become single smile lines; hat band cell 1.65 mm (30.7, 29.3); cell 1.4 mm (62.1, 49.9); right hijab line runs 1.4 mm from the heart wall over 38 mm (80, 33); lid-to-pupil slivers 0.3 mm (25.6, 37.7), (69.4, 37.5) |
| 9 | hands | FAIL (thin pointed fingers, 8+ hair strands, sleeve hatching, 6 px, margin 18) | slightly better (one connected shape) | FAIL (gated: thin, correct) | finger-to-head join is a lumpy 3.1 mm wall mass (55.4, 20.6); right eye a lone dot with no lid (50.8, 42.4); mouth an open D (45-52, 50-53); 3.6 mm blob in the bottom hand (58.7, 78.0) |
| 10 | venus | **PASS** | same (thicker line) | **PASS** | concave corners now 1.16-1.31 mm (the r14 minor fault is fixed); ring round |

**Result: 1/10 drawings pass, 1/10 cutters pass (venus), as in round 14.** But the gap to passing has shrunk on pad (one 0.5 mm gap), heart (mouths, two cells, one channel) and uterus (rungs). The gates fired correctly on all four of lotus, nails, hearts and hands. Uterus, pad, stylish, duo and heart pass the gates and still fail; in stylish, duo and heart the reason is again the faces, which no gate measures.

---

## 1. Measured line width, spacing, colour (round 14 → round 15)

Width = ink area / skeleton length, in px on a 1024 canvas (rule: 1/70 = 14.6 px). Cells = enclosed white regions with an inscribed width under 40 px@1024. Margin = closest ink to the frame, px@1024 (rule in the old wording 60 px; the current wording still says 60).

| picture | width px@1024 r14 → r15 | p90/p10 r15 | cells < 40 px r14 → r15 | margin r14 → r15 | colour / grey fill |
|---|---|---|---|---|---|
| uterus | 9.1 → 9.7 | 1.20 | 0 → 4 | 37 → 37 | none |
| pad | 7.3 → **19.0** (outline ~22, inner ~10) | **1.85** | 6 → 0 | 61 → 63 ✓ | **grey filled stain (61-78, 58-71)** |
| lotus | 12.8 → 11.3 | 1.30 | 2 → 2 | 0 → **0** | none |
| nails | 7.7 → 6.4 | 1.12 | 13 → 14 | 55 → 57 | none |
| hearts | 5.0 → 5.4 | 2.24 | 13 → 15 | 46 → 85 ✓ | none |
| stylish | 6.4 → 7.7 | 1.50 | 14 → 13 | 38 → 21 | none |
| duo | 4.9 → 8.7 | 2.00 | 83 → 12 | 48 → 43 | blue gone ✓ |
| heart | 7.1 → 10.3 | 1.33 | 21 → 21 | 112 → 74 ✓ | **purple hat, 1.8 % of pixels, RGB (161, 120, 180)** |
| hands | 4.9 → 6.6 | 3.00 | 7 → 6 | 13 → 18 | none |
| venus | 15.5 → 18.4 | 1.08 | 0 → 0 | 85 → 85 ✓ | none |

**What the numbers say**
- **1/70 marker:** only venus (18) and the pad outline (22) reach it. Heart, lotus and uterus are at 10-11 px (70-75 % of the rule). Duo, stylish, nails, hands and hearts stay at 5-9 px. The detail-heavy pictures still draw thin. In pad the outline obeys the marker and the inner lines do not, so the line weight is now *less* uniform (p90/p10 1.85): Gemini treats "the outline" differently from "every line".
- **Colour:** blue is gone from duo, but pad has a grey filled area and heart a purple hat. "Black only" is obeyed in 8 of 10.
- **Spacing:** cells under 40 px are unchanged in the busy pictures (nails 14, hearts 15, stylish 13, duo 12, heart 21).
- **Margin:** 4 of 10 meet 60 px; lotus still touches the frame.

---

## 2. Rules: what works, what is still ignored

**Works**
- **Nothing added, specks left out:** hearts lost its invented cloud border and the 8 hearts. No invented decorations in any picture.
- **Enclosing shape kept as the outline:** heart now sits inside its heart frame (the round-14 D11 failure is fixed).
- **At most 4 repeated marks:** uterus rungs 10 → 3 plus a top bar; nails filing teeth 5 → 3.
- **ONE connected shape:** duo now has a closed torso; hands is now one piece (via a thin finger join).
- **Black only:** blue gone from duo.

**Partly works**
- **1/70 marker:** see table; met by venus and by the pad outline only.
- **Single-line brows:** heart and hands obey; stylish (both brows) and duo (left face) still draw hollow leaf brows.
- **Black only:** a filled grey stain (pad) and a purple hat (heart) replace the round-14 blue.

**Still ignored**
- **Mitten hands:** hands still has thin pointed separate fingers; lotus fingers ~3-4 mm.
- **One line per edge / no hollow bands:** uterus tubes and vaginal walls are still two parallel lines ~1.3-1.5 mm apart; nails' nail loops still sit inside the finger outlines.
- **Margin / subject cut off:** lotus arm still runs off the frame (0 px), stylish 21 px, hands 18 px.
- **Hair ≤ 3 lines:** hands has 8+ strands, hearts spiky zig-zag hair.
- **No lash flicks:** stylish right eye and duo eyes still carry flicks.

---

## 3. Per-picture detail

### 1. uterus
Zooms: `uterus_pair.png`, `uterus_Z_canal.png`, `uterus_Z_tubeL.png`.

**Drawing: FAIL, better than r14.**
- Better: 3 rungs plus a top bar (was 10), 9.7 px, symmetric.
- Faults:
  - tubes still hollow double bands, ~1.5 mm apart, over ~25 mm per side (D5, one-line rule ignored);
  - vaginal wall drawn as two parallel lines ~1.3 mm apart (inner and outer walls, 40-52, 57-74);
  - the fundus is a full circle that the tube lines cross at (33, 29) and (57, 29): X crossings inside the body (anatomy and D7);
  - margin 37 px; 4 cells under 40 px.

**Cutter: FAIL.**
- Good: both tubes become solid paddles, symmetric now (the r14 right-tube hug is gone); fundus crossings become clean Y joins.
- **Rungs disconnected (C5, C14):** in the drawing the rungs end on the inner wall lines; the cutter drops those lines, so the rungs float:
  - rung at y 61.0-61.8: 0.50 mm gap left (41.25→41.75), 0.65 mm right (50.2→50.85);
  - rung at y 65.6: 0.45 mm gap left (42.1→42.55), 0.80 mm right (49.2→50.0).
  - These cream gaps will close in the dough and print as a smeared join.
- **Bottom box:** the last rung plus the stubs of the inner walls form a closed box (44.5-49.5, 68.8-73) with a 2.18 mm wall lump at (42.6, 71.2) and a 0.1 mm cream sliver along its base (49.0, 72.4).
- **Ovaries not round:** the ovary circles lose their lower half to the outline; each reads as a dome arc (12.5-19.6, 30-34.3), meeting the wall at a sharp V at (12.5, 34.3).

### 2. pad
Zooms: `pad_pair.png`, `pad_Z_wingTop.png`, `pad_Z_wingL.png`, `pad_Z_wingR.png`, `pad_Z_wingLlow.png`.

**Drawing: FAIL, mixed against r14.**
- Better: one clean thick outline, wings read clearly, stains no longer cross, 0 cells under 40 px, margin 63 px.
- Faults:
  - **D1:** the dark stain is a grey-filled band (61-78, 58-71);
  - D3: outline ~22 px against inner lines ~10 px (ratio ~2);
  - D4: stain outlines still wobble.

**Cutter: FAIL (one fault from PASS).**
- Good: the grey band becomes a clean closed crescent loop; outline concave corners are now filleted 1.18-1.30 mm at (21.2, 37.2), (37.9, 68.0), (52.4, 23.3), (70.4, 46.8) (the r14 cusp at the top wing is gone); left, right and lower wing joins are clean T joins.
- **Top wing join (C6, C14):** the body line, which meets the outline in a Y in the drawing, stops short of the wall: cream gap 0.35-0.55 mm at x 50.8-51.4, y 24.7-25.25. This is the "lines connected" rule broken by the conversion.

### 3. lotus
Zooms: `lotus_pair.png`, `lotus_Z_blob_cut.png`, `lotus_Z_hand_cut.png` (cutter only).

**Drawing: FAIL, same as r14.** The arm still runs off the right edge (margin 0) and the lower arm line ends free at (94, 85); fingertips ~3-4 mm; a floating palm line.

**Cutter: FAIL (gated: open 24 %, redraw is correct).**
- Arm dropped; what remains reads as a cabbage on a mitten.
- **Blob:** 3.35 mm solid dot at the vein hub (72.8, 78.2), with a square stub under it (72.7, 80-81).
- **Spur:** tapered tip (42-46, 92-104), ~1.5 mm at the end.
- **Cut edge:** S-bite and 2.1 mm wall bulge at (82.4, 90.1).
- Sliver 0.14 mm at (56.0, 53.2).

### 4. nails
Zoom: `nails_pair.png`, `nails_Z_fingers.png`.

**Drawing: FAIL, slightly worse than r14** (6.4 px, was 7.7). Sleeve still tapers to a needle (87.5, 64); 3 pointed filing teeth (63-70, 34-38); nail loops 0.5 mm inside the finger outlines; 14 cells under 40 px; the nail file overlaps the fingers.

**Cutter: FAIL (gated: thin, correct).**
- **The nail file is lost (D11/C4):** its top edge merges into the outline and its lower edge becomes a thumb-like U (28.5-37, 26-32).
- Nail slits 0.1-0.3 mm (17-36, 19-25).
- Tooth bumps in the wall: 2.64 mm (53.3, 37.2), 2.0 mm (57.5, 34.4), 2.0 mm (66.0, 37.2).
- 3.26 mm solid blob in the sleeve tip (86.6, 57.0).

### 5. hearts
Zooms: `hearts_pair.png`, `hearts_Z_head.png`, `hearts_Z_head_cut.png`.

**Drawing: FAIL, better than r14.** The invented cloud and hearts are gone, and the silhouette is the curled-up woman again. Still: 5 px inner lines (p90/p10 2.24), zig-zag spiky hair (D4), the profile face sits *inside* a hair box so it is not on the outline, eye ~2 mm, many loose fold lines (D8).

**Cutter: FAIL (gated: open 4 % + thin, correct).**
- **Face erased:** no eye, brow, nose or lips anywhere in (58-68, 33-48); only crossing hair lines remain. Worse than r14 (which kept an eye ball and a lip dash).
- Zig-zag hair becomes a lumpy wall (55-90, 24-52).
- 3.52 mm blob at the foot (14.6, 60.9) with a 3.2 mm wall bulge.
- Dress channels 0.2 mm × 10-11 mm at (40.8, 77.4) and (54.6, 70.0); cells 1.75 and 1.34 mm at (51.1, 75.7) and (52.9, 76.1).

### 6. stylish
Zooms: `stylish_pair.png`, `stylish_Z_face.png`.

**Drawing: FAIL, about the same as r14.**
- Faults: **both brows still hollow leaf shapes** (36-49, 21-25) and (52-58, 20-23); a lash flick on the right eye (59-61, 26.5); margin 21 px (worse); 7.7 px; 13 cells under 40 px.
- Good: almond eyes with pupils, hook nose, parted lips with a bow, 3 hair lines, ear.

**Cutter: FAIL.**
- **Left eye:** the almond is not rebuilt. It becomes an upper-lid arc (38.5-44.5, 26-29) and a straight stroke through a **2.94 mm pupil ball** (42.2, 29.4); the lower lid is lost. The eye reads as a squint.
- **Right eye:** a 2.52 mm ball (56.2, 27.0) on a hook stick (53.8-56, 24-28) plus a flick (57-58.5, 26.5); no almond.
- The eye rebuild did not fire, because both eyes touch other lines (brow/lash/nose) and are not "one small separate shape".
- **Mouth:** the cupid's bow is lost (55-58, 35); the parting line runs into the left corner, so the lips read more open than drawn.
- **Hair:** hair line hugs the top wall 0.1 mm over 26 mm (36.1, 8.0); 0.1 mm over 14.6 mm at (26.0, 33.2).
- Brows become single lines (an accidental improvement that matches the rule).

### 7. duo
Zooms: `duo_pair.png`, `duo_Z_faces.png`.

**Drawing: FAIL, much better than r14.**
- Better: no blue, closed torso, 8.7 px (was 4.9), 12 cells under 40 px (was 83), clean faces with the frown kept on the right.
- Faults: left face's brows hollow (28-38, 22-26); lash flicks on all four eyes; eyes are lid plus pupil, ~5 mm; line 9 px (60 % of the rule); p90/p10 2.0.

**Cutter: FAIL.**
- Silhouette now correct (the r14 torso cut-away is fixed).
- **Left mouth:** closed full lips with a parting line become an **empty "O" oval** (34-39, 38.5-41.5): the face now gasps.
- **Right mouth:** lips become a frown line (61-69, 33-34) plus a separate dash (64-68, 34.5): the full lips are lost.
- **Eyes:** dot plus a dash on all four; pupils 1.9-2.2 mm at (39.7, 28.7), (30.0, 32.8), (57.9, 24.6), (68.8, 23.2). The left face's left eye sits on the hair line.
- Cells 1.84 mm (48.5, 39.0) and 1.49 mm (37.2, 39.9) (C7); hair channel 0.32 mm × 12 mm (62.6, 13.8); 0.58 mm × 19 mm channel (47.6, 26.0) where the two heads overlap.

### 8. heart
Zooms: `heart_pair.png`, `heart_Z_faces_draw.png`, `heart_Z_faces_cut.png`.

**Drawing: FAIL (only for the fill), much better than r14.**
- Better: the heart frame is back; three women (hat + hijab, helmet, hijab), so the diversity of the original returns; clean faces; single-line brows; 10.3 px.
- Faults: **purple-filled hat** (D1); 21 cells under 40 px (hijab folds and lapels); margin 74 px.

**Cutter: FAIL (closest of the face pictures).**
- Outline: clean heart, top notch rounded.
- **Mouths (expression rule):** all three closed full-lip shapes become single smile lines: (28-33, 46.5), (66-74, 44.5), (48-53, 60). Cute, but not the drawn mouth.
- Eyes: lid stroke plus 1.8-2.1 mm pupil, matching the drawing well; but lid-to-pupil cream slivers of 0.3 mm at (25.6, 37.7) and (69.4, 37.5) (the "never close a gap next to a pupil" rule leaves gaps that dough cannot hold).
- **Cells:** hat band 1.65 mm (30.7, 29.3); 1.4 mm between helmet brim and hijab (62.1, 49.9).
- **Channel:** right hijab outer line runs 1.4 mm from the heart wall over 38 mm (80.0, 33.2); a 1.22 mm channel over 22.5 mm at (42.1, 47.8).
- Busy 23.8 (just under the gate's 28).

### 9. hands
Zooms: `hands_pair.png`, `hands_Z_face_cut.png`, `hands_Z_join_cut.png`.

**Drawing: FAIL, slightly better than r14** (one connected shape now). Thin pointed fingers (mitten rule ignored); the top hand joins the head through one finger ~1.5 mm wide; 8+ hair strands; sleeve hatching (15-19, 24-31) and (24-30, 75-80); 6.6 px; margin 18 px.

**Cutter: FAIL (gated: thin, correct).**
- Finger-to-head join becomes a lumpy wall mass, 3.11 mm (55.4, 20.6).
- Face: left eye a 1.78 mm pupil welded to a lid that merges into the face line (42.5, 42.2); right eye a lone 1.75 mm dot with no lid (50.8, 42.4); mouth an open D with a gap at the left corner (45-52, 50-53).
- Hair strands hug the face and wall at 0.1-0.3 mm over 21-28 mm (56.7, 58.7), (54.0, 33.8), (38.8, 49.2).
- 3.6 mm blob at the bottom hand (58.7, 78.0).

### 10. venus
Zooms: `venus_pair.png`, `venus_Z_cross.png`.

**Drawing: PASS.** Single outline plus ring, 18.4 px, even (1.08), symmetric, margin 85 px.

**Cutter: PASS.** Ring round (R 23.87, peak-to-peak 0.12 mm); no blobs, cells, channels or bulges. All 12 concave and convex corners of the stem and cross now have radius 1.16-1.31 mm (were 0.35-0.5 mm): the 1.2 mm fillet works.

---

## 4. Conversion changes: did they work?
- **Inside corners rounded 1.2 mm:** yes (venus 1.16-1.31 mm, pad 1.18-1.30 mm, no cusps left).
- **One dot per feature:** yes, no double dots seen.
- **Short strokes stay strokes:** yes (heart and duo nose hooks kept, not balls).
- **Eye rebuilt as almond plus pupil:** not seen working. In stylish, duo and hands the eye touches a brow, lash or face line, so it is not "one small separate shape" and still collapses to lid + ball.
- **Gaps next to pupils / inside closed eye or mouth loops never closed:** the loops are not closed, but mouths are still lost: the closed lip shape is turned into an O (duo left), a line (heart ×3, duo right) or an open D (hands). The kept pupil gaps leave 0.3 mm slivers (heart).

---

## 5. Top 3 Gemini rule changes (only those still needed)

1. **Same marker for every line, inner lines included, and no fill of any shade.**
   > "Every line inside the outline is drawn with the same marker as the outline: same thickness, never thinner. If an inner detail does not fit with that marker and 40 px of white around it, leave it out. Every area stays white: no grey, no colour, no tinted hats, stains or clothes. Only the pupils are solid black."

2. **Mouth, eyes and brows as cutter-friendly shapes.**
   > "A mouth is ONE closed lip shape at least 90 px wide and 40 px tall, with ONE parting line from corner to corner; the parting line ends exactly on the two corners. An eye is ONE closed almond at least 70 px long and 35 px tall, with the pupil inside it, not touching the brow, the nose or the hair. No eyelash flicks. Each eyebrow is one single stroke drawn with the marker, never a closed leaf or two lines."

3. **Tubes, walls and hands as single shapes; subject fully inside the frame.**
   > "A tube, canal wall or limb is either one single line or a solid part of the outline; never two parallel lines with a gap between them. Hands are mittens: no separate fingers, no fingertips narrower than 90 px. An arm that leaves the picture is cut short and closed with a rounded end 60 px inside the edge. Hair is at most 3 smooth lines, no zig-zag spikes."

## 6. Top 3 remaining conversion fixes

1. **Protect face features (still the biggest fault; 5 of 10, no gate).**
   - Any closed loop in the drawing at least 3 mm long (mouth, eye almond) stays a closed loop of the same shape in the cutter; a parting line inside a mouth is kept as one ridge end-to-end. Never turn it into an O, a single line, a dash or an open D.
   - Rebuild an eye as almond plus pupil also when it touches other lines (detect it by the pupil dot: a dot with a stroke within 1.5 mm is an eye).
   - Cap pupils at 2.0 mm.
   - Where a pupil gap is kept, make it at least 1.5 mm or close it; never leave 0.3 mm.
   - Add a gate: "loops ≥ 3 mm in the drawing that are not loops in the cutter" and "blobs > 2.2 mm".
   - Fixes: stylish eyes (42.2, 29.4), (56.2, 27.0) and bow (55-58, 35); duo mouths (34-39, 38.5-41.5) and (61-69, 33-35); heart mouths (28-33, 46.5), (66-74, 44.5), (48-53, 60) and slivers (25.6, 37.7), (69.4, 37.5); hands eyes (42.5, 42.2), (50.8, 42.4) and mouth (45-52, 50-53); hearts whole face (58-68, 33-48).

2. **Never leave a line short of the line it met in the drawing.**
   - When a supporting line is dropped or merged (inner wall merged into the outer wall), extend every ridge that ended on it to the new wall, tangentially, so it joins.
   - Any ridge end within 1.5 mm of another ridge or the wall is extended to touch it.
   - Fixes: pad (51.1-51.4, 24.85-25.2); uterus rungs (41.25-41.75, 61.0-61.8), (50.2-50.85, 61.0-61.8), (42.1-42.55, 65.6), (49.2-50.0, 65.6); uterus bottom box (44.5-49.5, 68.8-73) → one rung.

3. **Merge near-wall and near-parallel lines; resolve cells under 2.5 mm.**
   - A ridge within 2.5 mm of the wall over more than 3 mm merges into the wall.
   - A cell under 2.5 mm is removed by dropping its shorter side.
   - Fixes: heart hijab channel (80, 33), cells (30.7, 29.3), (62.1, 49.9), channel (42.1, 47.8); duo cells (48.5, 39.0), (37.2, 39.9) and channels (62.6, 13.8), (47.6, 26.0); stylish hair hugs (36.1, 8.0), (26.0, 33.2); hands strand hugs (56.7, 58.7), (54.0, 33.8); hearts dress channels (40.8, 77.4), (54.6, 70.0).
   - Also: ovaries kept as full circles (inner ridge closes the lower arc) when the drawing has a full circle.

## 7. Honest view

If the gates' redraws behaved like this run (they did not fix lotus, nails, hearts or hands: the same base faults came back):
- **Accepted today: 1 of 10** (venus).
- **Within reach with the conversion fixes above: pad** (one 0.5 mm gap) and **uterus** (rung joins); **heart** too, once its mouths stay lips and the two cells and the channel are cleaned (its drawing also needs the purple fill gone, though the cutter ignores it).
- **Stylish and duo** need the face protection fix; their silhouettes and drawings are otherwise close.
- **Lotus, nails, hearts and hands** depend on Gemini obeying the margin, mitten and hair rules; in this run it did not, so 0 of these 4.
- So: **1/10 now, about 4/10 after the three conversion fixes, about 6/10 if the face fix also works on stylish and duo.**
