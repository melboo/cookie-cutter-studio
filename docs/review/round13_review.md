# Round 13 review: new Gemini line-art rules (SYSTEM_LINEART) + steady-distance wall pull

**Inputs and method**
- Originals `/tmp/gz/orig`; OLD drawings `/tmp/gz/png`; NEW drawings `/tmp/gz/png13`; NEW cutters `/tmp/gz/out13/*_cutter.svg` (mm); sheets `sheet13A/B.png`.
- The round 12 scripts were copied to `round13_work/` and re-pointed to `out13`, `png13` and `/tmp/r13_*`. New scripts:
  - `strokew.py`: drawing stroke width (p10/p50/p90), scaled so the widest side = 80 mm;
  - `spacing.py`: enclosed white cells under 3 mm and 2 mm inscribed width, old vs new.
- Renders: `NAME_mm20.png` (20 px/mm, origin = SVG 0,0), `NAME_1400.png`, `NAME_pair.png` (drawing | cutter, mm grid). Zooms: `NAME_Z_*.png`.
- **All coordinates are SVG mm.** Registration is on the ink box. Pairs for pad, nails, hearts and duo are offset by about 1.5-3 mm, and for lotus and hands they are badly offset (the cutter dropped the arm and the hands), so shapes were compared side by side.
- C2 passes on all 10: widest side 79.7-80.1 mm. C3 passes: ridge 0.85/0.90/0.92 mm; wall 1.36/1.40/1.43 mm.

## Measured effect of the new rules (drawing side)

| picture | median stroke old → new (mm at 80 mm) | p90/p10 new | white cells < 3 mm, old → new | touches frame |
|---|---|---|---|---|
| uterus | 0.67 → **0.36** | 1.16 | 5 → **13** | no |
| pad | 1.11 → **0.40** | 1.64 | 1 → 0 (but doubled outline) | no |
| lotus | 1.01 → 0.95 | **3.26** | 2 → 2 | **yes** |
| nails | 0.48 → **0.23** | 3.0 | 10 → 11 | no |
| hearts | 0.28 → **0.13** | 1.83 | 10 → 7 | no |
| stylish | 0.54 → **0.21** | 3.0 | 6 → **17** | no |
| duo | 0.38 → **0.22** | 3.0 | 7 → **16** | **yes** |
| heart | 0.13 → 0.40 | 3.47 | 130 → 42 | no |
| hands | 0.61 → **0.23** | 3.0 | 2 → 4 | **yes** |
| venus | 0.67 → **0.43** | 1.67 | 0 → **2** | no |

Notes on the table:
- Skeleton widths below 3 px are quantised, so treat the small values as "hairline".
- The rule asks for 1.5 % of the image width (about 1.4 mm at 80 mm). Every new drawing is 3-10x thinner than that. Lines got **thinner** in 8 of 10 pictures; only heart got bolder, and lotus is unchanged. Weight is also less even: p90/p10 is 3.0 or more in 6 of 10 (lotus has a 1.2 mm outline with 0.4 mm inner lines).

## Summary table

| # | picture | drawing verdict | vs old | cutter verdict | main faults |
|---|---|---|---|---|---|
| 1 | uterus | FAIL (D3, D5, D7, D10) | **worse** | FAIL | 12 rungs drawn as hollow boxes at ~1.5 mm pitch; tubes drawn as hollow bands; double cavity V; cutter turns tubes into solid paddles, drops rungs and canal walls, and invents a centre line, a hat-shaped cervix and a hook |
| 2 | pad | FAIL (D2, D3, D5) | subject better, lines worse | FAIL | now a real pad with wings, but the whole outline is doubled; cutter keeps the second outline 0.1-1.5 mm from the wall on the right and leaves fragments at the bottom |
| 3 | lotus | FAIL (D2 frame, D3, D6) | flower better, closure worse | FAIL (gated: edge + open) | arm runs off the frame; cutter drops palm and arm, leaving a claw with a spur |
| 4 | nails | FAIL (D3, D5, D6, D7) | same / thinner | FAIL (gated: thin) | composition unchanged; finger outlines < 1 mm apart; filings; sleeve spike |
| 5 | hearts | FAIL (D3, D4, D5, D6, D8) | same | FAIL (gated: thin) | spiky hair, hairline strokes, many floating strands; cutter loses the face profile and turns the eye into a ball |
| 6 | stylish | FAIL (D3, D5, D9) | better shape, worse spacing | FAIL | bust now closed and round; hollow brows, right-eye lash flicks; cutter **closes the left eye** (two lines), drops the right eye, nose becomes a ball |
| 7 | duo | FAIL (D2 frame, D3, D5, D9) | mixed | FAIL (gated: edge) | eyes, nose and lips become dots, a dash and an "O" mouth: both expressions lost |
| 8 | heart | FAIL (D5, D10, D11) | better but still fails | FAIL (gated: busy 35.6) | 11 figures (rule says 3), 3-D double heart rim; cutter faces become boxes with googly-eye balls |
| 9 | hands | FAIL (D2 frame, D3, D6) | **worse** | FAIL (gated: edge + open) | hands now thin hairline arms off the frame; cutter **drops both hands**; mouth becomes an open D-shape |
| 10 | venus | FAIL (D2, D5: doubled outline) | **worse** (was PASS) | **FAIL** (was PASS) | symbol drawn as a hollow double-line ♀; cutter has a ridge 1.1-1.2 mm inside the wall all round plus two concentric rings 1.9 mm apart |

**Result: 0/10 drawings pass and 0/10 cutters pass** (round 12: 1/10, venus). The gates fired correctly on lotus, duo, heart and hands (edge / open / busy) and on nails and hearts (thin). Uterus, pad, stylish and venus are ungated and fail.

## Per-picture detail

### 1. uterus
**Drawing: FAIL, worse than old.** (`uterus_pair.png`, `uterus_Z_canal.png`, `uterus_Z_fundus.png`, `uterus_Z_tubeL.png`)
- **Canal rungs too dense (yes):**
  - 12 rungs (old: about 7);
  - each rung is a closed double-line box with a 0.5-0.7 mm interior, at about 1.5 mm pitch (36-56, 52-75).
  - This breaks the 4 %-spacing rule and the "no two lines alongside" rule.
- **Fallopian tubes:** drawn as hollow bands about 2 mm wide (two parallel lines) curling round the ovaries.
- **Cavity:** the V is doubled (inner triangle plus a parallel V about 1 mm outside).
- **Fundus crossings:** both tube lines cross the fundus circle (X joins at about (34.5, 28.3) and (57.5, 28.0)), which is a D7 fault.
- Lines are 0.36 mm (old 0.67).
- **Better:** the ovaries are round, the shape is symmetric, and there are no labels.

**Cutter: FAIL.**
- **Tubes become solid paddles** (7-31, 21-38) and mirrored (60-86, 21-38):
  - the inner tube line and the loop hole are dropped, so the tube anatomy is lost (bull-skull look).
  - The tube-to-uterus band (24-31, 32.5-34.5) collapses to one ridge, which is acceptable.
- **Ovaries:** the lower half is now the cutting wall. The upper arc stays a ridge, so the new steady-distance wall-pull worked: the arc is not dragged onto the wall. But the arc meets the wall at corners, not tangentially: (13.6, 33.6) and (24.0, 33.8), and mirrored at about (68.2, 33.8) and (78.6, 33.6). The ovary does not read as a full circle.
- **Fundus X:**
  - cream wedges 0.36 mm (34.8-39.2, 28.8-31.8) and 0.41 mm (52.8-56.9, 29.0-31.8);
  - wall bulge 1.98 mm (33.9, 28.0);
  - bump/notch (56.5-57.5, 27.0-27.5).
- **Cavity V doubled:** 0.9 mm cream channels over about 19 mm on each side, (40.8-45.2, 33.8-52.8) and (46.8-51.2, 33.8-53.1), plus the top (41.8-50.4, 32.7-33.0). This is a C4/C5 doubled ridge.
- **Canal:**
  - all 12 rungs and both canal walls are dropped;
  - an **invented centre ridge** (46.0, 57.5-72.5) and a hat-shaped cervix block (40.5-51.5, 51-58) appear;
  - there is a free hook stub (41.2-42.3, 57.6-59.8).
  - None of these exist in the drawing (C4, C9, C14).

### 2. pad
**Drawing: FAIL; the subject is better, the lines are worse.**
- **Better:** it is now a pad with wings, not the round-12 owl/cat. The "object stays that object" rule worked.
- **Worse:**
  - the whole outline and both wings are doubled: outer edge plus a parallel inner contour 1.5-2.5 mm inside (the original's white border and stitching were drawn as a second line);
  - strokes are 0.40 mm (old 1.11);
  - the wings are drawn as overlapping separate lobes.

**Cutter: FAIL.** "Closed 33 narrow gaps" handled the doubled outline inconsistently.
- **Doubled outline kept on the right:** a ridge 0.1-1.5 mm from the wall over about 25 mm (80-85, 57-82), merging into the wall with a notch at (80.5, 58) (`pad_Z_right.png`).
- **Bottom fragments** (`pad_Z_bottom.png`):
  - sliver cell 0.71 mm (44.1-46.0, 78.2-80.8);
  - triangle cell 0.81 mm (60.7-64.0, 86.8-87.7);
  - free dash (68-73, 84.5-86.2);
  - stub (76-77, 83-85.5).
- **Left wing:** 1.41 mm cell (29.1-36.1, 64.2-70.4); channel 0.1 mm over 10 mm (29.6, 64.2); wall bulge 2.12 mm (29.4, 63.0).
- **Top wing join** (`pad_Z_wingTop.png`):
  - a sharp concave V with a plastic lump at (52.5-54.5, 26-28.5);
  - a T-join that is not in the drawing at (53.5-54.5, 37.5-39), where a stain outline was fused to the wing separator.

### 3. lotus
**Drawing: FAIL.**
- **Better than old:** the flower is a cleaner stacked-petal shape.
- **Faults:**
  - the forearm still runs off the right and bottom frame (rule 25 ignored);
  - weight is uneven: 1.2 mm outline vs 0.4 mm inner lines (p90/p10 3.26);
  - thin fingers;
  - the thumbnail is a small double circle.

**Cutter: FAIL** (gated: edge + open 38 %, correct).
- The palm, wrist and arm are dropped, leaving a fist of fingers under the flower (`lotus_Z_hand.png`).
- Lumpy cut bottom edge (38-75, 84-90).
- Spur with a 2.64 mm wall bulge (32-35.5, 92-96).
- Thumbnail loop open and fused into the wall (54-62, 83-90).
- Fingertip cell 1.84 mm (23.5-25.9, 75-82.8); cell 2.37 mm (37.2-41.8, 72.5-77).

### 4. nails
**Drawing: FAIL, about the same as old.**
- Same composition.
- Strokes 0.23 mm (old 0.48).
- Finger outlines overlap or sit 0.3-1 mm apart.
- Nail loops touch the finger lines.
- The filings teeth are still there.
- The sleeve tapers to a needle spike (bottom right).

**Cutter: FAIL** (gated: thin, correct). (`nails_Z_fingers.png`, `nails_Z_filings.png`)
- Finger walls fused into thick bars (25.5-27.5, 10-18) and (34-35.5, 13-23).
- Nails fused to the finger lines with 0.1-0.2 mm slits: (22.2-29.4, 20.4-23.8), 5-6 mm long.
- Index finger shape lost (15-21, 20-26.5).
- File tip collapsed to one line with a step (65.5, 27.5).
- Filings form a lumpy wall (57-74, 33-38).
- Thumb tip is a needle (50-58, 34.5-38.5).
- Sleeve tip is solid plastic: 3.2 mm blob at (86.8, 56.3).

### 5. hearts
**Drawing: FAIL, about the same as old.**
- Spiky, sharp hair (the rounded-tips rule was ignored).
- Hairline strokes 0.13 mm.
- More than 10 floating strand and fold lines (the "no loose ends" rule was ignored).
- Eye about 1.5 mm.
- Thin feet.
- The small heart particles of the original were dropped. That is acceptable as decoration, but the name of the picture comes from them.

**Cutter: FAIL** (gated: thin, correct). (`hearts_Z_head.png`)
- **Face profile (nose, lips, chin) lost:** the left of the head is a straight wall (58-60, 28-44).
- **Eye:** a 2 mm ball on a line (66.4-67.4, 39.8-40.0). The upward look is lost.
- Hair spikes are sharp, with 2.4-2.6 mm wall bulges at (65.6, 25.2) and (59.2, 28.4).
- Hair line hugs the face at 0.3 mm over 17.8 mm (from 69.8, 43.9).
- Toe is solid plastic: 3.27 mm (15.4, 60.8).
- Dress channel 0.3 mm over 11 mm (51.2, 63.6).

### 6. stylish
**Drawing: FAIL; better shape, worse spacing.**
- **Better:**
  - the bust is now closed with a rounded base (the cut-off rule worked);
  - the left eye has no lashes;
  - the hair is simpler;
  - the eyes are almonds with an iris.
- **Faults:**
  - the brows are still hollow closed shapes, 1.5-2 mm wide;
  - the right eye still has lash flicks (50-52, 24-25);
  - the nostril is a tiny teardrop;
  - strokes are 0.21 mm;
  - 17 white cells under 3 mm (old 6).

**Cutter: FAIL.** (`stylish_Z_face.png`)
- **Left eye closed:** iris and lower lid dropped, leaving two parallel lines (30-38, 25-28.5). The expression changes from a half-lidded look to closed eyes.
- **Right eye lost:** it is merged with the brow into hooks against the cheek wall (44-50, 22-27).
- **Brows:** the left brow is now a single line (good), but the right brow is merged.
- **Nose:** 2 mm ball (45.2, 31.6) plus a hook (43-44.5, 30.5-33).
- **Mouth:** the upper-lip bow is flattened (44-51, 33.5-35); the lips sit 0.3 mm from the cheek wall over 8 mm (51.4, 37).
- **Hair and ear:**
  - hair strands hug the wall: channels 0.1 mm at (17.2, 38) over 7.2 mm and at (17.4, 34.6);
  - cell 0.4 mm (12.7-13.1, 30.1-32.8);
  - ear cells 1.0-2.19 mm (17.1-22.3, 24.9-44.6);
  - crown cell 2.43 mm (30.6-44.5, 5.8-10.8).

### 7. duo
**Drawing: FAIL; mixed.**
- **Better:** the bottom is now closed with rounded corners.
- **Faults:**
  - it still sits on the frame edge;
  - lash flicks on all four eyes;
  - eyes about 2 mm;
  - floating hair strands;
  - strokes 0.22 mm;
  - 16 cells under 3 mm (old 7).

**Cutter: FAIL** (gated: edge, correct). (`duo_Z_faces.png`)
- **Both expressions lost:**
  - eyes become 2 mm dots (26.8, 29.7) and (51.2, 29.0);
  - the right face's other eye is gone (only the brow arc at 44-49, 23-24.5);
  - the left nose is a 2.0 mm dot (25.6, 35.2);
  - the left lips are a 3 mm dash (26-29, 37.8-38.5);
  - the right lips are a 2.45 mm ball under an arc (53.2, 33.4), so the face reads as an "O" mouth.
- Extra blobs: 1.75 mm (29.0, 28.6), 1.68 mm (20.2, 32.3), 1.7 mm (56.5, 23.8).
- Cells 1.44 mm (36.9-39.9, 19.1-23.9) and 1.5 mm (14.3-17.1, 30.4-34.8).
- Hair channel 0.2 mm over 13.8 mm (36.6, 26.2).

### 8. heart
**Drawing: FAIL; better than old but still fails.**
- **Better:** the necklace beads are gone (white cells 169 to 80) and the lines are bolder.
- **Faults:**
  - 11 figures, ignoring the explicit "at most 3 figures" rule;
  - a second inner heart rim was added (a 3-D frame or doubled outline).

**Cutter: FAIL** (gated: busy 35.6, correct). (`heart_Z_faces.png`)
- **Profiles lost:** every face is a boxy loop with a 2 mm eye ball: (21.2, 28.6), (37.8, 29.0), (64.2, 29.0), (80.4, 29.0), (54.4, 42.6), (72.0, 42.7), (40.0, 57.2), (55.6, 57.4).
- 13 cells under 2.5 mm, the smallest 0.54 mm (54.5-55.4, 41.2-42.1).
- Rim fragments 0.1 mm from the wall: (75, 61.8) over 10.6 mm and (23.2, 61.9) over 10.4 mm.

### 9. hands
**Drawing: FAIL, worse than old.**
- The two hands, closed and chunky in the old drawing, are now hairline arms that run off the left frame.
- Thin pointed fingers.
- Eight floating hair strands.
- Strokes 0.23 mm (old 0.61).
- The face itself is clean, with almond eyes and closed lips.

**Cutter: FAIL** (gated: edge + open 38 %, correct).
- **Both hands are dropped.** Only the head is kept, so the key feature of the picture is lost.
- Torn, lumpy bottom edge (43.5-82.7, 123-142).
- Spur (39.5-43.5, 116.7-119.6).
- Eyes become a lid line plus 2.3 mm dots (56.6, 88.0) and (70.8, 88.1); the almond is lost.
- **Mouth changed:** closed lips become an open D-shape (59-68.5, 102-106), which reads as a laugh.
- Hair strands sit 0.1-0.22 mm from the face and outline: (43.0, 89.8) over 22 mm, (49.8, 94.8) over 15 mm, (47.4, 125.4).

### 10. venus
**Drawing: FAIL, worse than old.**
- **Yes, it became a hollow double-line symbol:** outer outline plus an inner copy about 2 mm inside, around the ring, the hole and the cross.
- The old drawing (single silhouette outline) passed.

**Cutter: FAIL (regression).** (`venus_pair.png`, `venus_Z_cross.png`)
- **Doubled outline:** the inner contour is a ridge 1.1-1.2 mm inside the wall all the way round. Cream channels:
  - ring: median 1.14 mm over 78.6 mm (24.2-68.2, 9.5-54);
  - cross: 1.1 mm over 18.6 mm (31.7-41.8, 61.4-70.6); 1.0 mm over 11.2 mm (53.4-63.4, 61.4-64); 1.2 mm over 14.2 mm (42.8-45.6, 72.6-85.6).
- **Ring hole filled**, carrying two concentric ridges (R 15.0 and 12.2 mm, centre 47.6, 32.7) with only 1.9 mm of cream between them (cell 33.0-62.1, 18.1-47.2).
- The circles themselves are round: peak-to-peak 0.10-0.15 mm.

## 1. Rules: what worked, what didn't, new faults

**Worked**
- **Object stays the object:** pad is a pad again.
- **Close a cut-off subject with a rounded edge:** works for stylish (rounded bust base) and partly for duo (closed bottom, but it still touches the frame).
- **Fewer beads and necklaces:** heart, 169 to 80 cells.
- **No lashes:** hands and the stylish left eye.
- **Eyes as almond plus pupil:** stylish, duo, hands. The drawings now carry the expression better; the conversion destroys it (see the fixes below).

**Did not work**
- **Line weight:** lines are **thinner**, not bolder. Median 0.13-0.43 mm at 80 mm in 9 of 10 pictures, against about 1.4 mm requested. Thinner than old in 8 of 10. Weight is also less uniform (p90/p10 of 3.0 or more in 6 of 10).
- **Spacing ≥ 3-4 mm: not met.** White cells under 3 mm went up in uterus (5→13), stylish (6→17), duo (7→16), venus (0→2), hands (2→4) and nails (10→11). They went down only in heart and hearts, and in pad (where the doubled outline is the real problem). The percentages are ignored.
- **At most 3 figures:** ignored (heart has 11).
- **Picture edge:** lotus, duo and hands still touch the frame.
- **No loose ends / rounded tips:** ignored (hearts hair, stylish and hands strands).
- **Hollow brows:** remain (stylish).

**New faults caused by the rules**
- **Hollow double-line drawing** is now the default for anything "solid" or "tube-like":
  - venus symbol (a PASS became a FAIL);
  - pad outline and wings;
  - uterus tubes, cavity and rungs;
  - heart rim.
  - Likely cause: "no fills / no solid black areas" together with "lines … as bold as the outline" makes Gemini outline a solid stroke instead of drawing it as one line.
- **The uterus canal has rungs that are too dense: yes.** 12 rungs, each a hollow box, at ~1.5 mm pitch. The "keep a simple pattern that belongs to it" rule outweighs the spacing rule.
- **Hands lost their mitten shape:** now hairline arms running off the frame.

## 2. Top 3 Gemini rule changes (wording)

1. **Absolute line weight and spacing, stated in pixels and counts, not percentages.**
   > "Draw on a 1024×1024 canvas. Every line, the outline included, is drawn with the same round marker exactly 14 pixels thick, like a bold colouring-book page; a line thinner than 12 pixels is a mistake. Between any two lines that do not touch, leave at least 40 pixels of white. If two lines would be closer, draw only one of them. Leave a white margin of at least 60 pixels on all four sides; nothing may touch the picture edge. If the subject is cut off by the picture edge (an arm, a bust, a body), end it inside the margin with a smooth rounded end."
2. **One line per edge: never hollow bands, never outlined strokes; repeated rows are capped.**
   > "Draw every edge with ONE line. Never draw a part as a hollow band of two parallel lines: no doubled outlines, no inner copy of the outline, no seams, stitching, borders, rims or frames. A symbol or shape that is solid in the picture (♀, ♥, an icon) is drawn as its outer outline only, exactly once. A thin part such as a tube, a string or a stalk is drawn as a single line or as part of the outline, never as two lines. Repeating marks (rings, ridges, rungs, stripes, folds, strands) are at most 5 single lines spaced at least 60 pixels apart."
3. **Faces and crowds as fixed minimum sizes, with a hard figure count.**
   > "Each eye is an almond at least 70 pixels long with one round solid pupil at least 25 pixels across, placed where the original looks. Each brow is ONE single line, never a closed shape. No lashes or lash flicks. The mouth is one closed lip shape at least 90 pixels wide with one parting line, keeping the Cupid's bow and the original's expression (open, closed or smiling). The nose is one short line or hook at least 40 pixels long, never a dot. Hair has at most 3 inner lines and every strand line ends on another line. Hands are mitten shapes at least 120 pixels wide. Count the people: if there are more than 3, draw only the 3 front figures, each as large as possible."

## 3. Top 3 remaining conversion fixes

1. **Merge near-parallel pairs in the cutter domain: one line, never two, never fragments.**
   - After the ridges are rebuilt, any two ridges, or a ridge and the wall, that run closer than 2.5 mm over more than 3 mm become one line. A ridge parallel to the outline merges into the wall; it is not left 1 mm inside it.
   - Leftover pieces shorter than 3 mm are deleted, not left as triangles or dashes.
   - This fixes:
     - venus ring and cross (1.1-1.2 mm channels);
     - pad right side (80-85, 57-82) and bottom fragments (44-77, 78-88);
     - uterus double cavity V (40.8-51.2, 33.8-53.1);
     - stylish hair channels, duo and hands strand hugs, heart rim fragments.
   - This is round 12 fix 1, still open and now much bigger because Gemini draws doubled lines.
2. **Protect face features: never collapse an eye, mouth or nose below its drawn shape.**
   - A closed loop at least 3 mm long (eye almond, lips) must stay a loop. Enlarge it until the inner opening is at least 2.5 mm; do not collapse it to a line, a dash or a ball.
   - Pupils stay inside the eye loop.
   - A nostril becomes a short stroke, never a 2 mm ball.
   - This fixes:
     - stylish left eye (30-38, 25-28.5) and right eye (44-50, 22-27);
     - duo eyes, nose and lips (26.8, 29.7), (51.2, 29.0), (25.6, 35.2), (26-29, 37.8-38.5), (53.2, 33.4);
     - hands eyes and the D-mouth (59-68.5, 102-106);
     - hearts eye (66.4, 40.0) and the profile lost into the wall (58-60, 28-44);
     - the 8 heart eye balls.
3. **Dense patterns and dropped parts: never invent, never silently drop.**
   - A ladder or ring pattern whose pitch is under 3 mm (uterus rungs) is resampled to at most 5 single rungs at 3 mm or more spacing between the canal walls, or dropped together with a clean outline. It must never be replaced by a medial-axis centre line plus hooks: uterus (46.0, 57.5-72.5), cervix (40.5-51.5, 51-58), hook (41.2-42.3, 57.6-59.8).
   - Do not drop a component that holds a key feature of the picture:
     - hands lost both hands;
     - lotus lost its palm and arm.
   - When the gate already asks for a redraw, keep the closed silhouette and round the cut edge instead of tearing it: hands (43.5-82.7, 123-142), lotus (32-75, 84-96).
   - Also blend joins tangentially: uterus ovary arcs meet the wall at corners (13.6, 33.6), (24.0, 33.8) and mirrored, and the fundus X has 0.36/0.41 mm wedges (34.8-39.2, 28.8-31.8) and (52.8-56.9, 29.0-31.8).

**Wall-pull change (steady distance under 1.2 mm):** verified harmless. The uterus ovary arcs stay ridges and are no longer pulled onto the wall. Their remaining fault is the corner joins listed above.
