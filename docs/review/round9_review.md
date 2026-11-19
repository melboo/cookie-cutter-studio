# Round 9 review: dot cores, merging off, whole-line wall pull, 0.8 mm opening + sigma 1.2 mm outline, redraw gates

**Inputs and method**
- Same Gemini drawings as rounds 7 to 8 (/tmp/gz/png). Cutters: /tmp/gz/out2/NAME_cutter.svg (mm). Drawing-side faults are marked "drawing" and kept short.
- **All coordinates are SVG mm.** Work files are in `round9_work/`. The round 8 scripts are reused (`render.py`, `masks.py`, `measure.py`, `wobble.py`, `wallthk.py`, `ringchk.py`, `pair.py`, `overlay.py`), plus a new `hug.py`. `hug.py` walks inward along the outline normal and reports stretches where the cream gap between the wall's inner edge and a ridge is under 2.5 mm, with the minimum and median gap.
- Renders:
  - `NAME_mm20.png`: 20 px/mm.
  - `NAME_1400.png`: the brief's `rsvg-convert -b white -w 1400 -h 1400`.
  - `NAME_pair.png`: drawing (left) and cutter (right) with a 10 mm grid.
  - `NAME_Z_*.png`: zooms with a 1 or 5 mm grid.
  - `NAME_ov_*.png`: overlays. Red is drawing only, dark red is drawing and plastic together, grey is plastic only.
- Registration of the drawing is within about 0.5 mm for uterus, pad, lotus, stylish and venus. Nails, hearts, duo and hands are off by 1-3 mm because the outline is cut or truncated, so for those I compared shapes side by side.

## Summary table

| # | Image | Cutter verdict | Remaining conversion faults (SVG mm) | Gate / drawing |
|---|---|---|---|---|
| 1 | uterus | **FAIL** | **ovaries no longer round**: lower half became the wall; left flank pulled into the wall with a stub (11.8-13.1, 40.7-41.3); right ovary top is a flat polygon (68.5-72.5, 35.2) with a corner at (72.8,35.2) and a spur into the wall at (78.3,41.4); left and right ovaries no longer mirror each other. Ligament: upper line dropped; the tube's V turned into vertical stubs into the wall at (28.2-29.0, 36.2-37.9) and (62.3-62.7, 36.5-38); dark wedge (25.2-26.5, 38.7-40.0). Canal feet now dogleg about 45° outward into the wall at (40.0-41.7, 88-90) and (49.4-51.3, 88-90), leaving 0.14-0.36 mm slivers 2.5 mm long. Flat corner on the hairpin (30.4,29.7). | rungs 2.2-2.3 mm apart (drawing) |
| 2 | pad | FAIL | **invented wall knobs** (28.0-30.4, 17.2-18.5) 1.8 mm and (66.2-68.2, 63.6-66.0) 2.3 mm; forked double end with a 0.4-0.7 mm slot (30.5-31.8, 17.1-18.2); cusp (21.5,17.0); hook into the wall (66.2-68.2, 61.2-62.9); hump plus right-angle stub (60.0-62.4, 75.2-76.6) where the drawing merges tangentially; 0.45-0.67 mm cream channels kept between near-parallel strokes at (20.3,33.5) (11 mm long), (30.8,32.0), (42.5,41.8) and (49.1,46.6) | wrong subject (cat); strokes 0.5-1 mm apart (drawing) |
| 3 | lotus | FAIL | **finger notches smoothed away** at (11.4,49.6) and (17.3,48.0), so fingers 1 and 2 are one lobe; third fingertip is a sliver loop with a 0.4 mm opening (17.6-19.7, 48.6-50.8); wall bulge 2.14 mm at (19.7,48.0); centre join still lumpy (41.4-44.2, 56.2-57.3) with an underside bump at (42,57.2); kink at the Y (44.2,50.0) | petal-tip pocket 2.45 mm (64.6-68, 50-54); thin fingers (drawing) |
| 4 | nails | FAIL (gated: thin part) | finger notches (24,22) and (38.5,23.5) lost; dark taper wedge (31.2-32.8, 21.3-27.2); nail 4 opened, with its top run into the wall (39.3-44, 30.7-31.6); knot loop (37.1-38.7, 34.5-35.6); 0.1 mm wedge (25.8-26.4, 32.5-35.5); filings now a zig-zag wall with kinks at (61,46.4), (67,48.2), (69.9,49.4), (71.7,46.9), (73.6,47.7) and (75.1,46.5); pockets of 0.73, 1.03 and 0.9 mm at (67.5,46.0), (69.3,46.5) and (71.5,37.0); thumbnail reduced to a triangle with a 0.8 mm hole (56.4,48.0); lump (90.8,70.2) 2.4 mm | filings, spike, dense nails (drawing) |
| 5 | hearts | FAIL (gated: thin part) | face profile still absorbed into the wall (56-62, 38-50); eye and brow became a curled hook loop (63-66, 41.6-44.4), so the expression is lost; **bead chain of 2 mm dots** on the neck at (67.2,53.6) and (68.0,55.8); dot on the hair wall (68.3-70.2, 26.4-28.2); slim triangles kept as loops with 0.3-0.5 mm slits: (30.6-33.5, 74-76.3) and the diamond (44.5-46.5, 73-78); broken hem ladder (26.8-37.7, 81.3-86.8) with 1.6-1.96 mm pockets | far too detailed, spiky hair (drawing) |
| 6 | stylish | FAIL | **lash spike still on the cutting edge** (51.2-53.6, 23.2-25.2): tip at (53.6,24.1), 73° kink, wall 2.1-2.8 mm; right upper lid wavy, about 0.8 mm W (48.6-49.9, 24.0-25.0); left lashes fused at the roots with 0.1-0.3 mm slits (29.4-32.0, 27.4-28.8) and faceted tips; **lip ends pulled onto the cheek wall** as three straight links at y = 34.0, 36.0 and 37.0 (x 51.6-54.2), which changes the mouth shape; nose-tip fork blob (47.7-49.3, 30.1-32.0); head-back line S-kink (12.6-14.6, 38.6-40.4) and end dogleg (19.8-20.6, 47.4-49.5) | lashes, 1.4 mm brow interior, 2.0-2.35 mm lip pockets (drawing) |
| 7 | duo | FAIL (gated: open outline + thin part) | **C2: widest side 59.97 mm, not 80**; body dropped and the silhouette closed with an invented diagonal; **nostrils turned into free dots** (58.1,29.9) and (28.2,36.8); **lower lip turned into a dot** (58.0,35.0); dot on the jaw wall (37.8,42.5); a knob beside each pupil reads as a double pupil: (29.5,29.8) and (20.3,33.7); brow sliver loops with 0.36-0.78 mm slits at (52.4,23.1), (61.0,21.8) and (29.1,27.6); hair tuft knot (56.7,14.6) with a 0.42 mm slit | open outline (drawing) |
| 8 | heart | FAIL (gated: busy, correct) | inner rim kept about 1.9-2.0 mm (cream gap) from the wall over about 90 mm, from (86.5,53.9) to (54.5,86.2) and from (48.2,86.5) to (17.0,55.8): just outside the pull band, still a C5 fail; 63 cream cells under 2.5 mm; the "ooo" badge has 0.4 mm cells; faces blank | 11 figures (drawing) |
| 9 | hands | FAIL (gated: thin part) | **cookie still split**: the walls cross at the neck (45.9, 27.5-30.1); nostril turned into a 2 mm dot (42.4,49.8); **lips turned into a filled dark bar** with a 0.3 mm slit (41.6-46.7, 51.6-53.3), which reads as an open mouth; neck lines dropped (38.9-39.5, 55-65) and (48.8-50, 55.5-67); invented straight "collar" ridges (31.5,57)-(39,55) and (48.5,55.3)-(56,57.5) crossing the hair strands; hair strand 1.7 mm from the wall for 17 mm (53-58.6, 35-51.5); lid knob (39,44.5) | thin fingers and connector (drawing) |
| 10 | venus | **PASS** | none blocking. The outline ring curvature is 0.017-0.067 /mm around the circle's 0.041 /mm and is never concave (round 8: -0.06 to +0.11). Position deviation is 0.093 mm peak to peak. Polish: fit a true arc. | drawing PASS |

**Result:** 1/10 cutters pass (venus). In round 8, none passed.
- **Gates:**
  - heart is now correctly gated on the busy ratio, as round 8 asked.
  - nails, hearts and hands are gated on thin parts; duo on its open outline and thin parts.
  - The gates are right. Uterus, pad, lotus and stylish are not gated and fail on conversion faults.

## Checks unchanged and still passing
- **C2:** 79.9-80.2 mm on 9 of 10. **Duo is 59.97 x 57.0 mm** (see above).
- **C3:**
  - ridge p10/p50/p90: 0.85/0.90/0.92 mm (duo p90 1.1, heart 1.0, from blobs);
  - wall p5-p95: 1.40 mm on all 10.
- **Wall fairness** (`wobble.py`, high-frequency curvature RMS):
  - venus 0.050, uterus 0.041 and heart 0.025, against about 0.08 in round 8: halved;
  - stylish 0.17, lotus 0.13, pad 0.12, nails 0.28 and hearts 0.35 are still rough.
- **No merge knots.** The round 8 merge artefacts are gone:
  - pad knot (31,31.4) and H-bridge (48.3,46);
  - stylish ear loops;
  - nails X-crossing and spur;
  - uterus canal jog (40.5,71);
  - hands bead rope.

## Compared with round 8

**Better**
1. **Pupils are back, in the right place.**
   - stylish: (33.6,27.8) d 2.7 mm, against the drawn (33.6,28.2), and (47.4,25.4) d 2.5 mm;
   - hands: (40.1,45.3) and (47.8,45.1);
   - duo: all 4 eyes, where round 8 lost 3 of 4.
   - The gaze is restored in stylish and hands. This was round 8's fix #1.
2. **Merging off** removed every invented knot, crossing and bead rope: the stylish ear is now a clean curl (`stylish_Z_ear.png`) and the pad knot is gone (`pad_Z_knot.png`).
3. **Wall-hugging lines are gone where they lay within 2.9 mm:**
   - uterus ligament sliver, hearts hem, pad loop end gap;
   - the heart rim moved from 0.6-1.0 mm to about 1.9 mm from the wall.
4. **Outline fairness:** the venus ring is no longer locally concave, which makes venus a pass. Uterus and heart are half as rippled.
5. **Heart is gated** (busy 0.29 > 0.25).

**Worse or new**
1. **The dot rule over-fires (new, the most serious).** A "thick compact core" of more than 2x the half-width is only 1x the line width, and that also catches stroke junctions, two strokes that touch, tight hooks and line ends on the wall. Results:
   - wall knobs: pad (29.3,17.6) and (67.4,64.8); hearts hair (69.2,27.2); duo jaw (37.8,42.5);
   - bead chain: hearts neck (67.2,53.6) and (68.0,55.8);
   - free dots that change the face:
     - nostrils: duo (58.1,29.9) and (28.2,36.8); hands (42.4,49.8);
     - duo lower lip (58.0,35.0);
     - double pupils: duo (29.5,29.8) and (20.3,33.7).
   - The owner rule "expressions kept exactly" now fails in the other direction: the eyes are right, but the nose and mouth gain dots.
2. **Whole-line wall pull is too blunt:**
   - **Circles that touch the outline are not protected:** the uterus ovaries lost their flanks and shape (`uterus_ov_ovaryL.png`, `uterus_Z_ovaryR.png`). "True circles are never pulled" only protects closed loops that do not touch the outline.
   - **Closed shapes are opened:** nail 4 (39-45,31); the stylish lips are attached to the cheek wall.
   - **"Ends run into the wall" adds bends** instead of following the line's own tangent:
     - uterus canal feet (40-41.7, 88-90) and (49.4-51.3, 88-90);
     - uterus tube stubs (28.6,36-38) and (62.5,36.5-38);
     - pad hook (67,62) and hump (61,75.8);
     - stylish head-back line dogleg (20.2,48.5).
   - **Pad loop top:** pulled into the wall, which leaves a forked end with a slot (31,17.5).
3. **Outline smoothing (sigma 1.2 mm) fills real concave notches:**
   - lotus finger notches (11.4,49.6) and (17.3,48.0);
   - nails finger notches (24,22) and (38.5,23.5).
   - The opening of 0.8 mm did **not** remove the stylish lash spike: the fused lash bundle is about 2 mm wide at its base. The spike at (53.6,24.1) is unchanged.
4. **Merging off leaves sub-mm channels and slits** wherever the drawing has strokes 0.3-1 mm apart:
   - pad channels 0.45-0.67 mm;
   - stylish lash roots 0.1-0.3 mm;
   - hearts slivers and diamond 0.3-0.5 mm (round 8 collapsed the diamond into a clean dash);
   - duo brows 0.36-0.78 mm;
   - hands lips 0.3 mm (now a filled bar).
   - These are C7 fails (dough fills them) and partly drawing-side. Narrow closed shapes still need collapsing to one centre line.
5. **Hands:**
   - The neck lines are dropped and two straight "collar" ridges are invented (`hands_Z_collar.png`).
   - The split cookie at the neck is unchanged.
6. **Duo is scaled to 60 mm**, not 80 mm, after the open body was dropped.

## Per-image detail

### 1. uterus: FAIL
- **Good:**
  - the ligament slivers and the 0.3 mm pockets are gone;
  - rung T-joins are clean at 8x (`uterus_ov_rungL.png`, within 0.1 mm of the drawing);
  - the canal jog is gone;
  - outline ripple is halved.
- **Ovaries** (`uterus_Z_ovaryL.png`, `uterus_ov_ovaryL.png`, `uterus_Z_ovaryR.png`):
  - The drawn circles touch the silhouette at the bottom, so their lower halves became the cutting edge. That part is acceptable.
  - **Left ovary:** the flank beside the fimbria hook (13.1-13.9, 40.8-43.7) was pulled into the wall. What remains is the top arc plus a stub into the wall at (11.8-13.1, 40.7-41.3). The ovary reads as a bump on the fimbria, not as a round ovary.
  - **Right ovary:**
    - its top-left is a straight diagonal (65.2,39.8)-(68.5,35.5);
    - its top is flat (68.7-72.3, 35.2), with a corner where the fimbria joins (72.8,35.2);
    - its right flank kinks into the wall through a spur (76-78.3, 40.8-41.4);
    - the wall below is wavy (75-78, 44-45).
  - The two sides no longer mirror each other (D12/A11).
- **Ligament (C14):**
  - The drawing has a two-line band from the ovary to the uterus. The lower line became the wall and the upper line was dropped. That loses the ligament as a feature; acceptable on its own.
  - The tube's sharp V (30.3,35)/(60.8,34.8) was turned into a short vertical stub into the wall at (28.2-29.0, 36.2-37.9) and (62.3-62.7, 36.5-38).
  - A 1 mm dark wedge sits at the circle junction (25.2-26.5, 38.7-40.0).
- **Canal bottom (C14)** (`uterus_Z_canal.png`):
  - Both vertical canal lines now bend about 45° outward to meet the wall at (40.0-41.7, 87.9-90.0) and (49.4-51.3, 87.9-90.0).
  - Each leaves a 0.14-0.36 mm sliver about 2.5 mm long.
  - The drawing has straight T-joins. This is worse than round 8, which had 0.3 mm wedges.
- **Hairpin** (`uterus_Z_topjoin.png`): the round U now has a flat side and a blunt corner at (30.4,29.7), about 0.3 mm. Minor.

### 2. pad: FAIL
- **Good:** the knot and the H-bridge are gone (`pad_Z_knot.png`, `pad_Z_mid.png`); the stain loops are smooth.
- **Top** (`pad_Z_top.png`):
  - The top arc of the pad loop ran 0-2 mm under the outline. It was pulled into the wall, so the loop is now open:
    - the left part enters the wall with a sharp cusp (21.5,17.0);
    - the right part ends in a forked double prong with a 0.4-0.7 mm cream slot (30.5-31.8, 17.1-18.2).
  - An invented 1.8 mm half-disc knob sits on the inner wall at (28.0-30.4, 17.2-18.5).
- **Right** (`pad_Z_right.png`):
  - The loop line hooks sideways into the wall (66.2-68.2, 61.2-62.9).
  - An invented 2.3 mm knob sits on the wall (66.2-68.2, 63.6-66.0); wall bulge 2.72 mm.
  - At the bottom the loop line makes a hump, then a right-angle stub into the wall (60.0-62.4, 75.2-76.6). The drawing merges it tangentially.
  - Small notch at the Y (55.0,48.0).
- **C5/C7 channels:** near-parallel strokes now keep 0.45-0.67 mm cream channels:
  - (19.8-21, 28-34), 11 mm long;
  - (30.8,32.0);
  - (42.5,41.8);
  - (49.1,46.6).
  - The tail end at (20.6,33.8) is a flat butt with a notch.
  - These are drawing spacing, but the cutter cannot be printed as is.

### 3. lotus: FAIL
- **Good:** the petal network, the overlay (`lotus_overlay.png`, within about 0.3 mm) and the round 8 fingertip knot are fixed.
- **Fingers** (`lotus_Z_fingers.png`):
  - The concave notches between fingertips, (11.4,49.6) and (17.3,48.0) in the drawing, are smoothed away. The outline runs over them as one bump.
  - The third, small fingertip became a closed sliver loop (17.6-19.7, 48.6-50.8) with a 0.4 mm opening, plus a stub (20.1-21.4, 47.6-49.2).
  - Wall bulge 2.14 mm (19.7,48.0).
- **Centre join** (`lotus_Z_centre.png`):
  - The bottom ridge still has a lump where the left petal line and the centre line join (41.4-44.2, 56.2-57.3), with an underside bump at (42,57.2).
  - There is a kink at the Y (44.2,50.0).
- **Drawing:** right petal-tip pocket 2.45 mm (64.6-68, 50.1-54.2).

### 4. nails: FAIL (gated: thin part)
- `nails_Z_fingers.png`:
  - the finger notches (24,22) and (38.5,23.5) are smoothed away;
  - the notch at (31,22) became a dark tapered wedge (31.2-32.8, 21.3-27.2);
  - nail 4's right side was pulled into the wall, so the nail is open and its top runs into the wall (39.3-44.0, 30.7-31.6);
  - invented knot loop (37.1-38.7, 34.5-35.6);
  - 0.1 mm wedge (25.8-26.4, 32.5-35.5).
- **Filings** (`nails_Z_filings.png`):
  - zig-zag wall with kinks of 54-87° at (61,46.4), (67,48.2), (69.9,49.4), (71.7,46.9), (73.6,47.7) and (75.1,46.5);
  - pockets of 0.73, 1.03 and 0.9 mm at (67.5,46.0), (69.3,46.5) and (71.5,37.0);
  - the thumbnail became a triangle with a 0.8 mm hole (56.4,48.0);
  - lump (90.8,70.2) 2.4 mm.
- Better than round 8, which had the X-crossing, spur and J-wedge, but still unusable.

### 5. hearts: FAIL (gated: thin part)
- **Face** (`hearts_Z_face.png`):
  - The nose, lip and chin profile is still part of the wall (56-62, 38-50).
  - The closed eye and brow became one curled hook (63-66, 41.6-44.4), so the expression is lost.
  - Two 2 mm dots form a bead chain on the neck where two lines touch: (67.2,53.6) and (68.0,55.8).
- **Hair** (`hearts_Z_hairtop.png`):
  - A 1.9 mm knob on the inner wall (68.3-70.2, 26.4-28.2), left over from an inward hair spike.
  - One hair spike is kept as a sharp corner (61.7,25.3) while the others are rounded, so the wall is inconsistent.
- **Dress** (`hearts_Z_hem.png`):
  - The hem no longer hugs the wall; it was pulled in.
  - The slim drawn triangles are kept as loops with 0.3-0.5 mm slits: (30.6-33.5, 74.0-76.3) and the diamond (44.5-46.5, 73-78). Round 8 had a clean dash here.
  - The lower fold is a broken ladder (26.8-37.7, 81.3-86.8) with pockets of 1.96 and 1.6 mm.

### 6. stylish: FAIL
- **Fixed:**
  - Both pupils are back:
    - left: (33.6,27.8), d 2.7 mm, against the drawn (33.6,28.2);
    - right: (47.4,25.4), d 2.5 mm, against the drawn (47.4,25.7).
  - The gaze reads as in the drawing.
  - The ear is a clean curl (`stylish_Z_ear.png`).
- **Lash spike** (`stylish_Z_eyeR.png`):
  - The outer lashes form a solid dark triangle on the cutting edge (51.2-53.6, 23.2-25.2). Tip at (53.6,24.1), 73° outline kink, wall 2.1-2.8 mm, 0.5 mm cream notch inside (50.9-51.3, 23.2-24.7).
  - The 0.8 mm opening does not touch it, because the fused lash base is about 2 mm wide.
- **Right lid:** the upper lid between the pupil and the wall is a W with about 0.8 mm amplitude (48.6-49.9, 24.0-25.0). The drawing has one smooth arc.
- **Left lashes** (`stylish_Z_eyeL.png`):
  - The lashes are fused at the roots, with 0.1-0.3 mm cream slits (29.4-32.0, 27.4-28.8) that will fill.
  - The lash tips and the lid end (39.2,26.9) are faceted, not round (C12).
- **Mouth** (`stylish_Z_face.png`):
  - The right ends of the lips lay within 2.9 mm of the cheek line, so they were pulled into it. They are now three straight links to the wall at y = 34.0, 36.0 and 37.0 (x 51.6-54.2).
  - The lips' rounded right end is gone and the mouth looks fixed to the cheek. This is an expression change.
- **Nose:** the two nose-tip strokes are fused into a fork with a 1.5 mm blob (47.7-49.3, 30.1-32.0).
- **Head-back line:**
  - S-kink where it starts at the wall (12.6-14.6, 38.6-40.4);
  - turns vertical into the wall at its end (19.8-20.6, 47.4-49.5) instead of continuing diagonally as drawn.

### 7. duo: FAIL (gated: open outline + thin part, correct)
- **C2:** the cutter is 59.97 x 57.0 mm. The open body was dropped, the silhouette was closed with an invented diagonal, and the result was not rescaled to 80 mm.
- **Faces** (`duo_Z_faceL.png`, `duo_Z_faceR.png`, drawing `duo_draw_faces.png`):
  - All four pupils are present (better).
  - The nostril hooks became free 2 mm dots (58.1,29.9) and (28.2,36.8).
  - The right face's lower lip became a 2.3 mm dot (58.0,35.0).
  - Knobs beside the left-face pupils (29.5,29.8) and (20.3,33.7) read as double pupils.
  - A jaw knob sits on the wall (37.8,42.5).
  - The brows are sliver loops with 0.36-0.78 mm slits at (52.4,23.1), (61.0,21.8) and (29.1,27.6).
  - The hair tuft is knotted at (56.7,14.6), with a 0.42 mm slit (57.5-61.5, 14.5-19.5).

### 8. heart: FAIL (gated: busy, correct)
- The wall is clean: the round 8 lump (89.2,45.3) is gone and the outline is the smoothest in the set.
- **C5 rim** (`hug.py`, `heart_Z_bottom.png`):
  - The doubled inner rim is no longer at 0.6-1.0 mm. It now sits with a median cream gap of 1.9-1.95 mm over about 46 mm on the right (86.5,53.9)-(54.5,86.2) and 44 mm on the left (48.2,86.5)-(17.0,55.8).
  - That is just outside the 2.9 mm pull band, measured centre line to wall, and under the 2.5 mm rubric minimum.
- 63 cream cells under 2.5 mm; the badge cells are 0.4 mm; the faces are blank.

### 9. hands: FAIL (gated: thin part)
- **Fixed:**
  - pupils at (40.1,45.3) and (47.8,45.1), so the eyes read open again;
  - the hair bead rope is gone.
- **Expression** (`hands_Z_face.png`):
  - The left nostril curl became a 2 mm dot (42.4,49.8).
  - The closed lips became a filled dark bar with a 0.3 mm slit (41.6-46.7, 51.6-53.3), about 1.7 mm thick. It reads as a dark open mouth.
  - The lower lip is a thick dash, which is acceptable.
  - Knob at the start of the left lid (39,44.5).
- **Neck and connector** (`hands_Z_top.png`): the two walls still cross at (45.9, 27.5-30.1). The top hand is joined to the head only by plastic, as in round 8.
- **Lower face** (`hands_Z_collar.png`):
  - The neck lines (38.9-39.5, 55-65) and (48.8-50, 55.5-67) are dropped.
  - Two straight ridges that are not in the drawing, (31.5,57)-(39,55) and (48.5,55.3)-(56,57.5), cross the hair strands.
- **C5:** a hair strand runs 1.7 mm (median cream gap) from the wall for 17 mm (53-58.6, 35-51.5).

### 10. venus: PASS
- **Outline ring:**
  - fits r = 24.12 mm within 0.093 mm peak to peak;
  - curvature 0.017-0.067 /mm (p5-p95 0.027-0.057) around 0.041 /mm, with no concave spots;
  - reads round at 1400 px (`venus_1400_top.png`).
- **Inner ring:** a true circle.
- **Wall and ridge:** 1.40 mm wall and 0.90 mm ridge.
- **Neck and cross:** smooth fillets (`venus_1400_bottom.png`).
- **Polish, not blocking:** fit a true arc to near-circular outline segments, so the curvature is constant.

## Top 3 remaining conversion fixes (most important first)

1. **Make the dot rule specific, and collapse narrow closed shapes.**
   - Turn ink into a dot only when it is a round, isolated blob:
     - inscribed diameter of at least about 1.6x the line width (not 2x the half-width);
     - roundness (area / (pi r²)) above about 0.7;
     - not at a point where 3 or more skeleton branches meet, and not where two strokes touch;
     - never within the wall band.
   - Drop any core that touches the outline.
   - This removes the invented knobs and dots:
     - pad (29.3,17.6) and (67.4,64.8);
     - hearts (69.2,27.2), (67.2,53.6) and (68.0,55.8);
     - duo nostrils (58.1,29.9) and (28.2,36.8), lower lip (58.0,35.0), double pupils (29.5,29.8) and (20.3,33.7), jaw (37.8,42.5);
     - hands nostril (42.4,49.8).
   - Collapse any closed shape or channel whose interior is under 2.5 mm into one centre-line ridge, or into one dash:
     - lips: hands (41.6-46.7, 52), stylish lash roots;
     - brows: duo;
     - slivers: hearts, lotus fingertip (18.6,49.4);
     - pad channels (20.3,33.5) and others.
2. **Make the wall pull shape-aware and the joins tangent.**
   - Protect circles and closed loops even when they touch the outline. Keep the arc as a true circle and pull only the part that coincides with the outline: uterus ovaries (13-25, 35-47) and mirror; nail 4; stylish lips.
   - When a pulled line's end runs into the wall, extend it along its own tangent, with no new bends. Fixes:
     - uterus canal feet (40-41.7, 88-90) and (49.4-51.3, 88-90);
     - uterus tube stubs (28.6,37) and (62.5,37);
     - pad hook (67,62), hump (61,75.8) and fork (31,17.5);
     - stylish dogleg (20.2,48.5).
   - Base the band on the cream gap that would remain: pull or push a ridge when the gap to the wall's inner edge would be under 2.5 mm, which is about 4.3 mm centre line to cut edge. Catches the heart rim (1.9 mm) and the hands hair (1.7 mm).
3. **Keep the silhouette true to the drawing.**
   - Smooth the outline in a way that keeps concave notches deeper than about 1.5 mm: lotus fingers (11.4,49.6) and (17.3,48.0); nails (24,22) and (38.5,23.5).
   - Remove line-width strokes that cross the outline (lashes) by classifying ink outside the traced outline stroke as strokes, not by a morphological opening. The 0.8 mm opening does not touch the 2 mm lash bundle at stylish (53.6,24.1).
   - After an outline is closed or truncated, rescale to 80 mm (duo is 60 mm).
   - Never preview a cookie split into two pieces (hands neck (45.9,29)).

**Gate notes:**
- The gates match the faults: heart is busy; nails, hearts and hands have thin parts; duo has an open outline.
- The thin-part gate does not catch lotus's thin third fingertip, which is 1-2 mm. Lotus is still a near-candidate once fix 3 is in.

**Drawing-side, not scored:**
- pad subject;
- hearts and heart detail;
- thin fingers in nails, hands and lotus;
- lashes and strokes 0.3-1 mm apart (stylish, pad, duo);
- duo open outline;
- uterus rung spacing.
