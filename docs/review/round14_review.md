# Round 14 review: pixel-based Gemini rules (SYSTEM_LINEART) with the unchanged round-13 conversion

**Inputs and method**
- **Inputs:**
  - originals: `/tmp/gz/orig`;
  - round-13 drawings: `/tmp/gz/png13`;
  - NEW drawings: `/tmp/gz/png14`;
  - NEW cutters: `/tmp/gz/out14/*_cutter.svg` (mm);
  - sheets: `sheet14A/B.png`.
- **Scripts:** the round-13 scripts were copied to `round14_work/` and re-pointed to `out14`, `png14` and `/tmp/r14_*`. New scripts:
  - `strokew2.py`: robust stroke width (ink area / skeleton length, and the 2·DT percentiles), in **px on a 1024 canvas** and in mm at 80 mm.
  - `spacing2.py`: the rules in their own units: margin in px@1024, and enclosed white cells under 40 px and under 20 px.
  - `inlet.py`: narrow slots cut into the silhouette (narrower than 2 mm).
  - `cut.py`: zoom crops of the cutter alone, used where the drawing and the cutter do not register.
- **Renders:**
  - `NAME_mm20.png`: 20 px/mm, origin = SVG 0,0;
  - `NAME_1400.png`;
  - `NAME_pair.png`: drawing | cutter, with an mm grid;
  - zooms: `NAME_Z_*.png`.
- **Coordinates:** all are SVG mm. Registration is on the ink box. Lotus and hands do not register, because the cutter dropped the arm and the top hand and was rescaled. For those two, `cut.py` crops of the cutter alone were used.
- **Scale and wall checks:**
  - C2 passes on all 10.
  - C3 passes: ridge 0.86/0.90/0.92 mm; wall 1.33/1.40/1.43 mm (identical to round 13).
- **Canvas size:** the Gemini output arrives at **720×720** (`draw14/*.jpg`), not 1024. The pixel rules are therefore applied to a canvas Gemini does not draw on. All px numbers below are rescaled to 1024.

---

## Summary table

| # | picture | drawing | vs r13 | cutter | main faults |
|---|---|---|---|---|---|
| 1 | uterus | FAIL (D5, D7, D3 weight) | better | FAIL | tubes still hollow double bands; 10 rungs at ~1.9 mm pitch; cutter: right tube's inner line hugs the wall 0.05-0.15 mm over 33 mm while the left tube is solid (asymmetric); rungs 0.9-1.2 mm apart and 0.35-0.6 mm from the wall; last rung dropped |
| 2 | pad | FAIL (D4, D5, D7) | better | FAIL | single outline now (good); stain loops wobble and cross; wing and body lines run 0.3-1 mm apart; cutter cusp at the top wing join (53, 27.5) and kinks at the wing joins |
| 3 | lotus | FAIL (D2 frame, D6) | slightly better | FAIL (gated: open 29 %, correct) | arm still runs off the frame; cutter drops the arm and leaves a spur (37-39, 96-99.7), lumpy cut edges and stepped petal joins |
| 4 | nails | FAIL (D5, D6, D7, D4) | slightly better | FAIL (gated: thin, correct) | filings teeth, needle sleeve, nails 0.5 mm from the finger lines; cutter nail slits 0.1-0.3 mm, invented cross ridges, lumpy filings wall, 3.1 mm tip blob |
| 5 | hearts | FAIL (D11 invented, D3, D4, D8) | **worse** | FAIL (ungated) | invented cloud outline and 8 hearts; spiky hair; cutter face becomes a box with a 2 mm eye ball, the profile is lost, the hearts become blobs, the hair fuses into the wall |
| 6 | stylish | FAIL (D3 weight, D5, D9 hollow brows) | slightly better | FAIL (ungated) | hollow brows and double-line hair band remain; cutter pushes the left pupil out of the eye (3 mm ball), the right eye becomes a ball on the cheek wall, and a slot cell is left in the hair |
| 7 | duo | FAIL (**D1 colour fill**, D2 open, D5) | **worse** (faces better) | FAIL (gated: open 6 % + thin, correct) | blue fills; 83 cells < 40 px; cutter **cuts away the whole sweater/torso**; both faces collapse to dots, a wink, a dash and an "O" mouth |
| 8 | heart | FAIL (**D11: heart frame lost**, D5) | mixed | FAIL (ungated, busy 15.7) | 3 figures and mittens (rules obeyed), but the heart shape that names the picture is gone; cutter eyes become dashes and a wink, a smile becomes an "O" notch, a 0.6-2 mm slot (59-64, 46-54.5) |
| 9 | hands | FAIL (D2: 3 pieces, D6, D3, frame) | same | FAIL (gated: open 27 % + thin, correct) | thin pointed fingers, hands not joined to the head; cutter **drops the top hand again**, the closed mouth becomes an open D-shape, the nose becomes a ball, and a 3.7 mm fingertip blade |
| 10 | venus | **PASS** | much better (was FAIL) | **PASS (one minor fix)** | single outline, 14 px, symmetric; cutter is clean and the ring is round (w/h 1.000), but the cross's concave corners have a radius of only 0.35-0.5 mm, with faceted chamfers |

**Result:** 1/10 drawings pass and 1/10 cutters pass (venus). Round 13 had 0/10 and 0/10.
- **Gates:** they fired correctly on lotus, nails, duo and hands.
- **Ungated but failing:** uterus, pad, hearts, stylish and heart pass the gates yet fail. In stylish, hearts and heart the main cause is face collapse, which no gate measures.

---

## 1. Measured line width and spacing (round 13 → round 14)

Width = ink area / skeleton length, rescaled to a 1024 canvas (the rule asks for 14 px). The 2·DT p10/p50/p90 values are in px@1024. A cell is an enclosed white region; "< 40 px" means its inscribed width is under the 40 px rule. The margin is the closest ink to the frame, in px@1024 (the rule asks for 60).

| picture | width px@1024 r13 → r14 | mm at 80 mm r14 | p90/p10 r13 → r14 | cells < 40 px r13 → r14 | margin r13 → r14 |
|---|---|---|---|---|---|
| uterus | 5.7 → **9.1** | 0.77 | 1.12 → 1.12 | 13 → **0** | 37 → 37 |
| pad | 5.1 → 7.3 | 0.69 | 1.41 → 1.41 | 2 → 6 | 61 → 61 ✓ |
| lotus | 11.3 → **12.8** | 1.15 | 2.69 → **1.12** | 2 → 2 | 0 → **0** |
| nails | 4.0 → 7.7 | 0.67 | 2.00 → 1.34 | 12 → 13 | 58 → 55 |
| hearts | 3.1 → 5.0 | 0.44 | 1.41 → 2.00 | 10 → 13 | 88 → 46 |
| stylish | 4.5 → 6.4 | 0.55 | 2.00 → 1.12 | 17 → 14 | 16 → 38 |
| duo | 4.0 → 4.9 | 0.42 | 2.00 → 2.24 | 16 → **83** (blue fill speckle) | 0 → 48 |
| heart | 4.8 → 7.1 | 0.71 | 2.24 → 1.50 | 54 → **21** | 82 → 112 ✓ |
| hands | 4.0 → 4.9 | 0.41 | 2.00 → 2.24 | 5 → 7 | 0 → 13 |
| venus | 7.1 → **15.5** | 1.45 | 1.50 → **1.02** | 2 → **0** | 53 → 85 ✓ |

(`strokew.py` and `spacing.py` from round 13 were also run. Their quantised skeleton widths agree: median 0.36-1.20 mm in r14 against 0.13-0.43 mm in r13. Small cells under 3 mm: uterus 13 → 0, venus 2 → 0, heart 42 → 15, stylish 17 → 13, duo 16 → 112, pad 0 → 4.)

**What the numbers say**
- **Weight:** lines are bolder in all 10 pictures, by +13 % to +118 %. But only **venus (15.5 px) and lotus (12.8 px)** reach the 14 px rule (≥ 12). Six pictures are still at 5-8 px, i.e. about 40-55 % of the rule. The busier the picture, the thinner the line: duo, hands and hearts are 5 px.
- **Uniformity:** p90/p10 improved in 6 of 10 (lotus 2.69 → 1.12, stylish 2.0 → 1.12, venus 1.02).
- **Spacing:** the 40 px rule is met only where the subject is simple (uterus cells, venus). Detail-heavy pictures still have 13-21 cells under 40 px. Duo's 83 are an artefact of the blue fill (speckled cells), which is itself a violation. Open spacing (not enclosed cells) also fails:
  - uterus rungs are 22 px pitch with ~13 px of white;
  - pad wing and body lines are 4-12 px apart;
  - nail loops sit 6 px from the finger lines.
- **Margin:** 3 of 10 meet 60 px (pad, heart, venus). Lotus still touches the frame (0 px) and hands sits at 13 px. Duo (48) and stylish (38) improved but still fall short.

---

## 2. Rules: what now works and what is still ignored

**Works (clear effect)**
- **ONE line per edge / symbol as its outer outline:** venus is back to one outline (drawing PASS). The pad's doubled outline is gone. The heart's 3-D rim is gone. The uterus cavity V and the rungs are single lines, no longer hollow boxes.
- **At most 3 figures:** heart 11 → 3.
- **Hands as mittens:** obeyed in heart (big mittens). Ignored in hands (see below).
- **Nose never a dot:** obeyed in every drawing: stylish hook, duo hooks, hands hook, heart "L". The conversion then *creates* nose balls; see fix 1.
- **Eyes as almond plus pupil, no lashes:** obeyed in stylish, duo, hands and heart.
- **Bolder, more even line:** directionally yes in every picture.

**Partly works**
- **Margin:** improved in duo, stylish and hands, but met in only 3 of 10. Lotus is unchanged (0 px).
- **Minimum feature sizes:** met at stylish scale (eye ~117 px, pupil ~41 px, mouth ~94 px). Missed where the face is small:
  - duo: mouth ~70 px, pupils ~23 px;
  - hands: eyes ~54 px, pupils ~18 px, mouth ~60 px;
  - heart: eyes ~30 px, mouth ~40 px.
  - These are estimates from mm × px/mm.

**Still ignored**
- **14 px line:** 8 of 10 below 12 px.
- **≤ 5 repeating marks, 60 px apart:** uterus has 10 rungs at ~22 px pitch. Hands has 5-6 sleeve-wrinkle hatch lines ~10 px apart. Nails has 5 filing teeth.
- **Single-line brows:** stylish brows are still hollow leaf shapes, and so is the left brow of duo's left face.
- **ONE line per edge for tubes and bands:** uterus tubes are still hollow double bands; stylish's hair band is two parallel lines 1.2-1.5 mm apart; pad wing and body lines overlap.
- **No colour:** duo has blue filled shoulder areas (3.9 % of pixels, mean RGB 89/128/182).
- **Faithfulness:** hearts invented a cloud border and 8 hearts from the red specks, and the cookie outline is now a cloud, not a figure. Heart dropped the heart frame that names the picture.
- **Closed subject:** hands is 3 separate pieces (top arm, head, bottom hand). Duo's sweater bottom is open. The lotus arm runs off the frame.

**New faults caused by the round-14 rules**
- **Invented decorative content** (hearts: cloud plus hearts). This is probably "small marks → closed shapes ≥ N px" applied to the specks, which turned them into hearts.
- **Dropped framing shape** (heart). Probably "≤ 3 figures" was satisfied by redrawing the scene and discarding the heart container.

---

## 3. Per-picture detail

### 1. uterus
Zooms: `uterus_pair.png`, `uterus_Z_tubeL.png`, `uterus_Z_tubeR.png`, `uterus_Z_canal.png`.

**Drawing: FAIL, better than r13.**
- **Better:**
  - 9 px lines (r13 5.7);
  - single cavity V;
  - rungs are single lines;
  - round ovaries;
  - symmetric;
  - 0 cells under 40 px.
- **Faults:**
  - tubes are still hollow bands, two lines ~1.5 mm apart over about 25 mm per side (D5, ONE-line rule);
  - **10 rungs** at ~1.9 mm pitch with ~1.1 mm of white (rule: ≤ 5 at 60 px ≈ 5 mm);
  - rung ends sit ~0.8-1.2 mm from the canal outline (D8);
  - the cavity arms end 1.5 mm above the first rung (46, 52.5) (D8 near-miss);
  - margin 37 px.

**Cutter: FAIL.**
- **Asymmetric tubes (C4, C5, C14):**
  - Left tube (5-34, 22-38): inner line and loop dropped, so the tube is a solid paddle.
  - Right tube: the inner line is **kept as a ridge 0.05-0.15 mm from the wall** from (66.7, 23.9) to (78.9, 35.8), over 33 mm. This is a sliver channel; cream islands 0.1 mm at (69.2-75.1, 23.8-24.9) and 1.1 mm at (77.2-84.6, 23.1-34.6). It joins the ovary with a stub at (77.4, 33.5-35.2).
- **Ovary arcs:** they meet the wall at corners, not tangentially: (13.4, 34.0), (24.1, 34.0) and (67.7, 34.0). Neither ovary reads as a full circle.
- **Canal (C5):**
  - rungs only 0.9-1.2 mm apart (cream channels: 53 mm total, median 0.9 mm, at 41.6-50.5, 55.8-70.7);
  - rung ends 0.35-0.6 mm from the canal wall (51.0-51.5, 65.5-69.7) and 0.1-0.5 mm on the left (40.5-41.5, 63.6-71.5);
  - rung 9 fused into the right wall with an angled cut (51.2, 71);
  - **rung 10 (y 72.4) dropped**;
  - thin 0.1 mm channel at the canal base (42.8, 70.8).
- **Good:** no invented centre line, cervix block or hook (the r13 faults are gone because the drawing changed).

### 2. pad
Zooms: `pad_pair.png`, `pad_Z_stains.png`, `pad_Z_wingL.png`, `pad_Z_wingTop.png`.

**Drawing: FAIL, better than r13** (the doubled outline is gone).
- **Faults:**
  - stain outlines wobble (hand-tremor, D4);
  - two stain loops cross each other at (59-64, 49-61) (D7);
  - the left wing edge and the body edge run on top of each other, 0.3-1 mm apart, over 30 mm (25-40, 40-70) (D5/D7);
  - the wing joins carry ink blobs at (52.5-53.5, 26-30) and (72-73.5, 49-50);
  - lines 7 px.

**Cutter: FAIL.**
- **Good:**
  - the wing/body double line merges into one ridge;
  - no doubled outline;
  - no fragments (r13 had 4).
- **Top wing join:** a sharp cusp in the wall at (53, 27.5), with a narrow V and a plastic lump (C8/C14).
- **Wing joins:**
  - left: a kink/step at (22-24, 40-41) and a concave notch with a bump at (38.5, 68.5-70);
  - right: a bump at (73, 49.5).
- **Stain joins:** the crossing at (61, 59.5) becomes a kinked T. Channels 0.8-0.9 mm at (55.9-59.7, 59.0-60.1) and (37.2-41.6, 36.6-39.1) (C5). A 0.14 mm sliver at (37.6, 37.4).

### 3. lotus
Zooms: `lotus_pair.png`, `lotus_Z_hand.png`, `lotus_Z_petals.png` (cutter only; no registration).

**Drawing: FAIL, slightly better than r13.**
- **Better:**
  - 12.8 px, even weight (p90/p10 1.12, was 2.69);
  - the thumbnail double circle is gone.
- **Faults:**
  - the forearm still runs off the right and bottom frame (margin 0 px; D2);
  - fingertips are thin (~3-4 mm);
  - a floating palm line (D8).

**Cutter: FAIL** (gated: open 29 % → redraw, correct).
- The arm is dropped, leaving a mitten-like palm under a cabbage-like flower.
- **Spur:** a sharp tip at (37-39, 96-99.7), with a 2.47 mm wall bulge at (38.6, 99.0) and a thin region of max width 2.6 mm.
- **Lumpy cut edge** (40-58, 90-94).
- **S-bite** where the arm was cut off (80-84, 78-90), with wall bulges of 2.1 mm at (83.0, 89.4) and (82.7, 89.8).
- **Junctions:**
  - finger ridge meets the wall in a sharp V cusp at (38.5, 77.5);
  - a hooked finger end at (38.5, 87);
  - stepped notches where petal lines meet the wall at (60.5, 48), (70, 43), (76.5, 46.6), (88, 51) and (96, 68.5);
  - the centre vein zig-zags at (71-77, 47-68).
- Cream slivers 0.1 mm at (73.4, 75.8) and (71.2, 43.2).

### 4. nails
Zooms: `nails_pair.png`, `nails_Z_fingers.png`, `nails_Z_filings.png`, `nails_Z_spike.png`.

**Drawing: FAIL, slightly better than r13** (8 px, was 4).
- **Faults:**
  - 5 pointed filing teeth (57-70, 33-38) (D4/D5);
  - the sleeve still tapers to a needle at (86.5, 64) (D6);
  - nail loops sit about 0.5 mm from the finger lines;
  - adjacent finger outlines touch and overlap (20-21, 13-29), (28-29, 13-26) (D7);
  - the file tip line floats at (71, 27.5);
  - 13 cells under 40 px.

**Cutter: FAIL** (gated: thin, correct).
- **Finger 1:**
  - nail lost into an open U (19-23, 20-28);
  - an **invented** horizontal ridge (15-21, 20.5);
  - a scribble hook (15-19, 22.5-25).
- **Nail 4:** an open U on the file line, plus an invented ridge (36-41, 21).
- **Slits:** nail and finger-line slits of 0.1-0.3 mm at (21-36, 16-25) (channels 0.34-0.75 mm × 4-5.5 mm).
- **Thumb loop:** distorted into a bulb (55-61, 29-35), with a ~2 mm blob where it meets the wall (59.5, 34.5).
- **Filings:** a lumpy wall (60-70, 34.5-38.5) with bulges of 2.2 mm (65.8, 37.2) and 2.12 mm (69.2, 35.8).
- **Sleeve tip:** a 3.1 mm solid blob at (86.4, 56.9), with a thin region of max width 8.5 mm tapering to a point (83.9-88, 53.5-61.6).
- **Inlet:** a narrow slot (27.3-28.8, 11.1-14.1) between the fingers.

### 5. hearts
Zooms: `hearts_pair.png`, `hearts_Z_head.png`, `hearts_Z_legs.png`.

**Drawing: FAIL, worse than r13.**
- **Invented content (D11, auto-fail):**
  - a scalloped cloud outline around the whole figure;
  - 8 outline hearts.
  - The original has scattered red specks. The silhouette is now a cloud, not a curled-up woman.
- **Still present:**
  - spiky zig-zag hair (D4);
  - 5 px lines;
  - more than 6 floating fold and strand lines (D8);
  - eye about 1.5 mm.

**Cutter: FAIL** (not gated; that is a gap).
- **Face destroyed (C14, expression rule):**
  - the profile nose and lips are lost;
  - the lips become a dash (57.5-59.5, 38.5-39);
  - the eye becomes a **1.97 mm ball** at (62.8, 36.6);
  - the brow is gone;
  - the upward gaze is lost.
- **Hearts:**
  - the small hearts become rounded triangles and blobs with the notch lost: (11-13, 43-47), (14-17, 61-66);
  - inner openings are only 1.84 mm (84.3, 28.9), 2.19 mm (71.6, 32.8) and 2.4 mm (18.4, 45.0) (C7);
  - the heart at (71-74, 31-35) becomes a D shape.
- **Hair:** the right hair outline fuses into the cloud wall (80-87, 25-50); the hug is 0.15 mm at (84.2-86.9, 26.2-30.2). Hair spikes become free stubs and a Y-fork at (55-58, 23-25) and (75-77, 28-30) (C9).
- **Dress:** a 0.36 mm channel over 17.9 mm at (47.2, 59.0), and 0.98 mm channels at (47.8-50.8, 62.5-69.4).

### 6. stylish
Zooms: `stylish_pair.png`, `stylish_Z_face.png`, `stylish_Z_hair.png`.

**Drawing: FAIL, slightly better than r13** (6.4 px, was 4.5; p90/p10 1.12).
- **Faults:**
  - **brows are still hollow leaf shapes** (37-51, 22-28) and (56-62, 20-23);
  - the hair band is two lines 1.2-1.5 mm apart over about 30 mm (20-35, 8-35);
  - hair lines cross at (36-42, 7-11);
  - margin 38 px;
  - 14 cells under 40 px.
- The face itself is good: almond eyes with pupils, a hook nose, closed lips with a parting line.

**Cutter: FAIL** (not gated).
- **Left eye (gaze changed):** the almond shrinks from about 10 mm to 5 mm (43.5-48.5, 29-31), the lower lid is lost, and the pupil becomes a **3.07 mm ball pushed out to the left corner** at (44.0, 30.4).
- **Right eye lost:** it becomes a 2.62 mm ball on a crossing stick against the cheek wall (58.3, 28.2), with a hook (55-57, 26-29).
- **Brows:** they collapse to single lines. This is an accidental improvement.
- **Mouth:** the double parting line becomes one line (acceptable). Lips run 0.3 mm from the cheek wall (64.3-64.5, 36.3-42.3).
- **Hair:**
  - band merged into the wall, but leaves a **rectangular slot cell** (24-31, 10.5-21) with square-cut ends;
  - a 0.54 mm cell at (22.2-22.9, 28.6-31.2);
  - wall hugs of 0.05-0.25 mm along (21.4-27.5, 36.5-48.9) and (23.6-30.8, 10.4-19.0);
  - top strands 0.1-0.15 mm from the wall at (40.6-43.8, 6.2-6.4) and (51.5-56.5, 7.9-11.7);
  - the X crossing becomes a kinked Y at (42.5-44, 8-11).
- **Neck:** a 0.1 mm hug at (57.5-58.7, 55.0-59.6).

### 7. duo
Zooms: `duo_pair.png`, `duo_Z_faces.png`.

**Drawing: FAIL, worse than r13 overall; the faces are better.**
- **D1 auto-fail:** blue filled areas, 3.9 % of pixels, mean RGB (89, 128, 182), on the left shoulder and arm (8-33, 46-85) and the right shoulder (73-86, 38-47). The rule forbidding colour is ignored.
- **D2:** the sweater bottom is still open; lines end at (25, 87), (67, 86) and (84, 81).
- **Other faults:**
  - 5 px lines;
  - the left face's left brow is hollow;
  - hair strands (62-70, 12-22) are 0.5-1 mm apart;
  - 83 cells under 40 px.
- **Better:** the faces are good, with almond eyes plus pupils, hook noses, full closed lips and angled brows that keep the frown.

**Cutter: FAIL** (gated: open 6 % + thin, correct).
- **Torso missing:** the cutter outline follows the shoulder line. The whole sweater (about 22-85, 55-88) is outside the cookie, leaving an arch of two heads plus two arm legs.
- **Right arm:** a thin tail (83.3-87.4, 67.1-79.6, max width 3.6 mm) with a 3.4 mm blob at (85.4, 70.5).
- **Both expressions lost (as in r13; conversion fix still open):**
  - left face: eyes become 2.2 mm balls at (31.0, 33.8) and (41.2, 29.6); the nose becomes a ball (37.4, 37.1); the full lips become a 3 mm dash (37-41, 40.5);
  - right face: the left eye becomes a single line, i.e. a **wink** (58-64, 25); the right eye becomes a 2.16 mm ball (72.6, 24.0); the nose becomes a ball (66.6, 29.9); the lips become a frown arc plus a 2.08 mm ball (69.0, 35.0), reading as an "O" mouth.
- **Shoulder ridges:** the blue-fill edges become ridges.
- **Cells and channels:**
  - cells 1.84 mm (48.8-52.8, 36.8-43.4) and 2.0 mm (52.2-55.0, 25.9-30.1);
  - hair channels 0.5 mm over 11.6 mm (57.8-66.2, 12.4-21.7);
  - collar channel 0.5 mm over 8.4 mm (42.1-50.2, 44.4-48.4);
  - hair-to-wall hug 0.1 mm at (79.5-79.7, 20.2-26.9).

### 8. heart
Zooms: `heart_pair.png`, `heart_Z_faces.png`.

**Drawing: FAIL, mixed.**
- **Better:**
  - 3 figures (was 11);
  - mitten hands;
  - 7 px lines;
  - cells under 40 px 54 → 21;
  - faces clean (profile, front, profile).
- **Worse (D11):** the **heart frame that names the picture is gone**. The silhouette is a rounded blob with a faint point at (55, 88). The diversity of the crowd (the original's hijabs) is also lost.
- **Other faults:**
  - free arm-line ends at (24.5, 58-64) and (85, 58-63) (D8);
  - a narrow wedge between the centre head and the right figure (59-64, 45-54).

**Cutter: FAIL** (not busy now: 15.7).
- **Left face:**
  - the eye becomes two dashes, i.e. a closed eye (24.4-27.7, 32);
  - the **smile becomes a round "O" notch** (24.5, 37.9) (2.4 mm blob, wall bulge 2.43 mm), so the face reads as a gasp.
- **Centre face:**
  - the left eye becomes a squiggle merged with the brow, i.e. a wink (51-53, 43.5);
  - the right eye becomes a dash plus a 1.56 mm blob (57.8, 44.0);
  - the lips become a wavy dash (52.5-57, 49.5).
- **Right face:** the eye becomes a dash with no pupil (82-85, 33.8); the profile lips are smoothed into the wall (85-87, 35-40).
- **Slot (C8):** a narrow slot cut into the silhouette, 0.6-2 mm wide and 8.8 mm long (59.1-64.3, 45.7-54.5), plus a second slot (44.3-47.4, 44.7-47.2).
- **Helmet band:** double-line channels 0.85-0.92 mm at (67.6-72.6, 30.2-33.6) and (23.5-29.2, 28.9-31.8).
- **Wall hugs:** 0.05-0.2 mm at (45.2-46.1, 38.1-42.7), (63.5-64.3, 38.2-43.1) and (74.1-80.7, 19.1-19.7).

### 9. hands
Zooms: `hands_pair.png`, `hands_Z_face_cut.png`, `hands_Z_bottomhand_cut.png`.

**Drawing: FAIL, same as r13.**
- **Three separate pieces:** top arm and hand, head, bottom hand (D2).
- **Hands:** thin pointed fingers (D6); the mitten rule is ignored.
- **Hatching:** 5-6 sleeve-wrinkle lines (D5).
- **Hair:** 8 or more hair strands.
- **Other:** 5 px lines; margin 13 px.
- **Good:** the face (almond eyes plus pupils, single-line brows, hook nose, closed lips with a Cupid's bow).

**Cutter: FAIL** (gated: open 27 % + thin, correct).
- **The top hand is dropped again.** The picture's key feature (two hands framing the face) becomes one hand.
- **Mouth:** closed lips become an **open D-shape** (63.5-71, 71-74), reading as a laugh (the r13 fault is unchanged).
- **Nose:** becomes a 2.2 mm ball (67.5, 67.6).
- **Eyes:** a lid line with a ball at the corner (61.5, 61.5) and (71.5, 61.8); the lower lids are lost.
- **Hair strands:** they hug the face and the wall at 0.05 mm, from (68.5, 42.6) to (82.9, 57.7) over 23 mm, at (52.5-57.6, 46.4-56.3) and at (84.3-85.2, 61.2-70.1). Cream islands of 0.72 mm (79.5-81.4, 54.1-58.0) and 0.78 mm (56.0-58.5, 48.0-51.2).
- **Bottom hand:**
  - fingertip is a 3.7 mm solid plastic blade (80-86, 104.5-108);
  - finger lines broken into stubs, with a 1.5 mm near-miss (65.5-67.2, 102.4);
  - a tangled loop where the fingers rise (58-63, 88-96);
  - 4 hatch stubs at the wrist (42-47, 100-108);
  - a narrow slot between the fingers (73.2-76.4, 103.1-104.8).

### 10. venus
Zooms: `venus_pair.png`, `venus_Z_cross.png`.

**Drawing: PASS, much better than r13.**
- One outline plus the ring hole, 15.5 px, even (p90/p10 1.02).
- Symmetric, with a margin of 85 px.
- Stem about 6.7 mm and cross arms about 7 mm (D6 ok).

**Cutter: PASS, with one minor fix.**
- Clean wall with no hug.
- The ring hole is an imprint ridge, perfectly round: inner cream w/h 1.000, path peak-to-peak 0.11 mm.
- No channels, cells, blobs or bulges.
- **Minor (C8/C11):** the 6 concave corners have an outline radius of only 0.35-0.5 mm:
  - cross corners at (47.2, 67.2), (55.4, 67.3), (55.3, 75.5) and (47.2, 75.4);
  - stem-to-ring corners at (47.2, 59.0) and (55.3, 59.1).
  - The wall turns them with visible 45° facets, not arcs. A 1-1.5 mm fillet would make it fully Bakerlogy.

---

## 4. Top 3 Gemini rule changes (concrete wording)

1. **Make the line weight impossible to miss, and fix the canvas mismatch.** The output arrives at 720 px, so "14 px on 1024" is not what Gemini sees. Pair the absolute number with a relative and visual one:
   > "Use ONE thick round marker for every line in the picture, the outline included. Its thickness is 1/70 of the picture width (14 px on a 1024 px image, 10 px on a 720 px image). This is as thick as a child's felt-tip on a colouring page, never a fine pen. Every line has the same thickness: a line thinner than the outline is a mistake. If the subject has too much detail to draw with this marker while keeping lines 4 marker-widths apart, leave the detail out. Simplify; do not thin the line."

2. **Faithful content: no colour, no invented decorations, keep the framing shape.**
   > "Draw only black lines on white. No colour, no grey and no filled areas, except the eye pupils. Draw only what is in the picture: never add borders, clouds, frames, hearts, stars, sparkles or background shapes. Leave out specks, dust, dots and texture completely; do not turn them into symbols. If the people or objects are arranged inside a shape (a heart, a circle, a badge), that shape is the outer outline of the drawing: keep it, and fit the figures inside it."

3. **One closed subject, mitten hands, counted marks, single brows.**
   > "The whole drawing is ONE connected shape with ONE closed outer outline. Parts that float apart in the picture (a hand above a head, an arm) are moved until they touch the main shape, or left out. Nothing may touch the picture edge. End every arm, body or sleeve 60 px inside the edge with a rounded end, and close the bottom of a bust with a smooth curve. Hands are mittens: the fingers are joined into one rounded shape at least 120 px wide, with at most one separate thumb, and never thin separate fingers. Repeated marks (rings, rungs, ridges, stripes, wrinkles, strands, teeth): count them, and draw at most 5, at least 60 px apart. A uterus canal has at most 4 rungs. A tube (such as a fallopian tube) is ONE single line, never two parallel lines. Each eyebrow is ONE single curved line; never draw a brow as a thin closed leaf shape."

## 5. Top 3 remaining conversion fixes

1. **Protect face features. This is the biggest fault: 5 of 10 cutters, unchanged since r13, and not detected by any gate.**
   - A closed loop at least 3 mm long (eye almond, lips) stays a closed loop. If it is too small, scale it up around its centre until the opening is at least 2.5 mm. Never collapse it to a line, a dash, a ball or an open D.
   - A pupil stays inside its eye loop and is at most 1.5 mm across.
   - No dark blob wider than 1.5 mm inside the cookie (`measure.py` already lists them).
   - **Add a gate** on "blobs > 1.5 mm" and on "loops ≥ 3 mm in the drawing that are not loops in the cutter".
   - **Fixes:**
     - stylish: left pupil (44.0, 30.4); right eye (58.3, 28.2);
     - duo: eyes (31.0, 33.8), (41.2, 29.6) and (72.6, 24.0); wink (58-64, 25); noses (37.4, 37.1) and (66.6, 29.9); lips (37-41, 40.5) and (69.0, 35.0);
     - heart: "O" smile (24.5, 37.9); winks and dashes (51-53, 43.5), (57.8, 44.0) and (82-85, 33.8);
     - hearts: eye ball (62.8, 36.6) and lost profile (57-60, 35-40);
     - hands: D-mouth (63.5-71, 71-74) and nose ball (67.5, 67.6).

2. **Merge near-parallel lines symmetrically into one line, and resample dense patterns.**
   - A ridge running within 2.5 mm of the wall over more than 3 mm merges into the wall, with a tangential blend and no leftover slot.
   - Two ridges within 2.5 mm of each other become one centre line.
   - Apply the decision to mirrored features identically.
   - A ladder whose pitch is under 3 mm is resampled to at most 5 rungs at 3 mm or more spacing, kept 2.5 mm or more from the walls.
   - **Fixes:**
     - uterus: right tube hug (66.7-78.9, 23.9-35.8) against the solid left tube; rung gaps 0.9-1.2 mm and rung-to-wall 0.35-0.6 mm (40.5-51.5, 55-72); dropped rung 10;
     - stylish: hair slot (24-31, 10.5-21) and wall hugs (21.4-30.8, 10.4-48.9);
     - heart: helmet channels (67.6-72.6, 30.2-33.6) and (23.5-29.2, 28.9-31.8);
     - hands: strand hugs (68.5-82.9, 42.6-57.7) and (52.5-57.6, 46.4-56.3);
     - hearts: hair fused into the cloud wall (80-87, 25-50);
     - nails: nail slits (21-36, 16-25).

3. **Never cut away or drop large parts; round every cut and every concave join.**
   - When the outline is open, close it along the shortest smooth curve across the gap. Do not keep only the closed sub-region.
   - Never drop a component larger than 5 % of the ink area.
   - Thin tips under 6 mm are widened to a rounded 6 mm end, or cut off with a rounded end. They are never left as needles or solid blobs.
   - Every concave outline corner gets a fillet radius of at least 1.2 mm. Every ridge-to-wall join is tangential, without a V-cusp or a step.
   - **Fixes:**
     - duo: torso cut away (22-85, 55-88); arm tail (83.3-87.4, 67-80);
     - hands: top hand dropped; fingertip blade (80-86, 104.5-108);
     - lotus: spur (37-39, 96-99.7), lumpy edge (40-58, 90-94), S-bite (80-84, 78-90), petal-join steps (60.5, 48), (70, 43), (76.5, 46.6), (88, 51) and (96, 68.5);
     - nails: sleeve blob (86.4, 56.9);
     - pad: wing cusp (53, 27.5);
     - heart: slot (59.1-64.3, 45.7-54.5);
     - venus: corners at radius 0.35-0.5 mm (47.2-55.4, 59-75.5).
