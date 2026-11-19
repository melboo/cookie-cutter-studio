# Round 10 review: round-core dots, narrow-pocket fill, along-wall pull, 0.35 mm outline cap, protrusion removal, cookie-based size, redraw gates

**Inputs and method**
- Same Gemini drawings as rounds 7 to 9 (/tmp/gz/png). Cutters: /tmp/gz/out2/NAME_cutter.svg (mm). Drawing-side faults are marked "drawing" and kept short.
- **All coordinates are SVG mm.** Work files are in `round10_work/`. The round 9 scripts are reused (`render.py`, `masks.py`, `measure.py`, `wobble.py`, `wallthk.py`, `hug.py`, `ringchk.py`, `pair.py`, `overlay.py`), plus two new ones:
  - `chan.py` lists cream channels whose median width is under 1.2 mm over at least 1.5 mm (dough that will not fill);
  - `thin.py` opens the cookie with a 4.3 mm disc and lists what is lost (the thin-part gate test).
- Renders: `NAME_mm20.png` (20 px/mm), `NAME_1400.png` (brief's rsvg command), `NAME_pair.png` (drawing left, cutter right, 10 mm grid), `NAME_Z_*.png` zooms with a 1 or 5 mm grid.
- **Registration caveat:** size now comes from the cookie, not from all ink, so the drawing (still registered on its ink box) is off by 0.5-3 mm in pad, nails, hearts, stylish, duo and hands. For those I compared shapes side by side; all coordinates below are cutter coordinates.

## Summary table

| # | Image | Cutter verdict | Remaining conversion faults (SVG mm) | Gate / drawing |
|---|---|---|---|---|
| 1 | uterus | **FAIL** | **canal feet now doubled**: each canal line doglegs into the wall (39.2-40.8, 87.6-88.8) and (50-51.6, 87.2-88.6) AND a separate pointed stub stands beside it (40.8-41.8, 88.8-91.2) and (49.2-50, 88.4-91.2), with cream specks (40.8,90.1) and (50.4,90.1) 0.5 mm; ovaries still not round: flat top (71.3-73, 35.3-35.9), straight top-left diagonal, spur + knob with a 0.36 mm cream speck (77.3-79.3, 41.8-43.5) and on the left (12.3-14, 42-43.8, speck 12.9,43.0); tube V still a vertical stub into the wall (28.7-29.5, 35-37.8) and (62-62.7, 35.8-37.8); dark wedge with a 0.2 mm pinhole (25.4,39.6) and (65-67, 38.5-40.5) | rungs (drawing) |
| 2 | pad | FAIL | top: hanging tooth/stub (29.2-31.1, 17.6-18.8) and the loop's right leg enters the wall vertically 1 mm to its right with a bend at (33.2,19.7); right: hook into the wall (66.4-69, 61.1-61.8); wall knobs (67.3-68.4, 64.2-65.5) and **new** (62.4-63.7, 74.9-76.1); corner + straight run into the wall (59.6,76.7)-(61.7,78.2); **0.8 mm channels kept**: (29.2-31.8, 30.1-36.8) 6.8 mm long, (41.4-44.6, 39.8-45.0) 5.3 mm, (47.5-50.9, 46.6-47.8) 3.5 mm | wrong subject; strokes 0.5-1 mm apart (drawing) |
| 3 | lotus | FAIL | **finger notches still gone** (outline convex over (10-11.8, 48.2-48.8) and (17.5,47.3)); **third fingertip now deleted** (17-21, 47-50); petal-tip pocket now a sharp triangle with 25° cusps (65.1-67.9, 49.7-54.1) and a wall bulge (67.1-68.4, 48.2-50); step in the base line (64.3-65.0, 52.4-53.6); centre still lumpy: step (41.4-42.0, 56.8-57.5), notch at the Y (44.1-45.0, 50.0-50.3); blunt free end (47.8-48.5, 50.3-51.0) | thin fingers (drawing) |
| 4 | nails | FAIL (gated: thin part, correct) | finger notches 1 and 3 still gone; separator 2/3 floats 3.5 mm short of the wall (31.9, 25.3-32.1); separator 3/4 missing; nail 4 still open into the wall (39.2-44, 30.6-35.7); invented bar from the wall (19.5-21.7, 30.6-31.5) and sliver loop with 0.67 mm slit (19.5-22.2, 33.4-35.7); thumb is a plastic spike (59.2-59.6, 46.9-47.7, 77° kink); invented X of diagonals across the file (55.6-62.6, 36.4-44) with 0.9 mm cells; file pinched to a 0.9 mm lens channel (62.2-68.4, 37.0-37.2); filings knot with 0.28/0.98 mm holes (65.5-71, 44.5-48) | filings, spike, dense nails (drawing) |
| 5 | hearts | FAIL (gated: thin part, correct) | nose/lip/chin profile still lost into the wall (59-62, 46-50.6); eye+brow still a curled hook with a 0.6 mm channel (64.2-66.2, 42-45), so the expression is lost; invented nose bar with a corner (60.0-63.4, 42.6-46); hem lower fold now trapezoid cells on the wall (25.3-29.2, 80.6-85.3), (32.0-35.7, 84.3-87.2, 1.75 mm), (37.3-39.8, 85.2-86.5, 0.5 mm speck), (48.6-54, 81.5-84); wall knobs (54.5-55.5, 79.8-81.5) and (69.2,26.9) 2.1 mm; 0.72 mm channel (51-54.5, 77.1-80.2); thin foot (9.7-15.1, 66.7-71.7) | too detailed (drawing) |
| 6 | stylish | FAIL | **lips collapsed into one "O" loop** (43.3-51.7, 34.7-40.2): Cupid's bow, parting line and opening gone, top dropped about 1.4 mm, which reads as an open, surprised mouth; mouth now 0.1-0.55 mm from the cheek wall over 5 mm (51.7-52.0, 35.3-40.1); **lash spike unchanged** (51.5-53.7, 22.5-26.0, tip 53.7,24.1, 75° kink); invented link lower lid to wall (48.6-50.2, 27.2-28.4); nose tip a filled fork blob (47.6-49.4, 30-32.3); head-back line: invented bar from the wall (11-14.6, 39.9-40.6) with a 0.76 mm triangle (12.3-14.5, 38.2-40.0), end dogleg (18.9-19.6, 47.5-49.5) plus a new triangle cell 0.71 mm (20.1-21.4, 48.1-49.5); hair hairpin split into two prongs into the wall with a 0.6 mm wedge (30.4-33.6, 5.6-8.0); hair line bends into the wall with a corner (41.0,10.3)-(43,8.7); jaw line turned into a T with a hump (43.7-46, 54.2-55.5) and an inner-wall notch (45.9-46.5, 50-51); faceted lash and lid ends (25.9-26.5, 25.2-25.8), (38.4-39.1, 26.3-27.2) | lashes (drawing) |
| 7 | duo | FAIL (gated: open outline + thin part, correct) | **invented body: shoulder closed with a diagonal into a 7 mm plastic needle** (93.5-95.8, 84-91.1), 124° kink; nostrils still dots, now 2.0-2.3 mm and hook shape lost: (73.8,39.8), (76.8,39.6), (37.2,48.7); left-face lips opened: left corner ends 1 mm apart (34.8,55.4)/(35.8,56.0); right-face edge pinched to a point contact where the heads meet (61.0-61.5, 39.8-40.5); invented neck cell (55.6-64.5, 43.5-53.5); kink (59.6,53.4); 0.41 mm channel (40.2-47.6, 33.2-34.4) 7.7 mm long; hair 1.08 mm channel (67.2-73.1, 18-27.8) | open outline (drawing) |
| 8 | heart | FAIL (gated: busy, correct) | **14 invented 2 mm dots** at line junctions and on the necklace, e.g. (20.8,24.6), (22.5,46.4), (26.4,46.4) free, (29.2,28.2), (36.4,27.2), (20.4,37.2), (28.4,38.8), (22.2,41.6), (26.3,41.6), (29,42.2), (33.8,43.6), (39,43.6), (24.5,48.2), plus a 3.2 mm dot (77.6,43.6); inner rim still 1.35-2.2 mm from the wall over 65 mm (25.1,66.1)-(47.9,86.3)-(54.1,86.5)-(79.9,63.0); faces blank; 51 cream cells, 9 under 2.5 mm | 11 figures (drawing) |
| 9 | hands | FAIL (gated: thin part, correct) | **cookie still split**: walls touch at the neck (45.8-47.2, 27.2-31.3); top-hand fingers deleted by the protrusion rule (36-54, 17-28); lips now one flat straight line (41.5-46.9, 52.3-53.0): bow and pointed corners lost; left nostril still a 1.9 mm ball (41.5-43.2, 49-50.6); hair strands turned into straight-sided cells: **invented diagonals** across the hair (31.1,51)-(39.8,55.0) and (33.2,63.1)-(39.2,68.6), box (54.9-57, 47.2-50.5), bar (35-37.5, 40-40.8); parting knot with slivers (41-48, 31-35); neck lines still missing; hair strands 0.05-1.9 mm from the wall in 20 stretches | thin fingers, connector (drawing) |
| 10 | venus | **PASS** | none. Outline ring identical to round 9: r = 24.12 mm, 0.093 mm peak to peak; inner ring true; wall 1.40 mm, ridge 0.90 mm; neck and cross fillets clean (`venus_Z_ringL.png`, `venus_Z_neck.png`) | drawing PASS |

**Result:** 1/10 cutters pass (venus), the same as round 9.
- **Gates:** they match the cutters. `thin.py` finds parts under 4.3 mm only in nails (56.3-59.7, 46.1-49.7) and (87.9-92, 64.6-75.7), hearts (9.7-15.1, 66.7-71.7), duo (92.6-96, 81.9-91.1) and hands (44.4-47.9, 26.1-29.8) plus two fingertips; heart is busy; duo has an open outline.
- The four ungated images (uterus, pad, lotus, stylish) fail on conversion faults only.

## Checks unchanged and passing
- **C2 (fixed for duo):** widest side 79.56-80.16 mm on all 10. Duo is now 79.96 mm (round 9: 59.97).
- **C3:** ridge p10/p50/p90 0.85-0.86 / 0.89-0.90 / 0.92 mm (hands p90 0.95); wall p5-p95 1.40 mm on all 10.
- **Outline fairness** (high-frequency curvature RMS, round 9 in brackets):
  - better: pad 0.042 (0.12), lotus 0.075 (0.13), stylish 0.124 (0.17), nails 0.21 (0.28), hearts 0.24 (0.35);
  - slightly up: uterus 0.059 (0.041), heart 0.041 (0.025), venus 0.060 (0.050). For venus this comes from the cross corners; the ring itself is unchanged.

## Compared with round 9

**Better**
1. **Size from the cookie:** duo is 80 mm, as round 9 asked.
2. **Narrow pockets collapse to one line** where the pocket is enclosed:
   - brows: stylish left and right, duo all four (round 9 slits 0.36-0.78 mm);
   - pad crescent and blob (19.5-22, 23-35), where the 11 mm channel is gone;
   - stylish lash roots: no 0.1-0.3 mm slits; lashes are separate strokes;
   - lotus petal tip: no longer a 2.45 mm pocket (now a sharp triangle, see below).
3. **Bead chains and most knobs are gone:** hearts neck (67.2,53.6)/(68.0,55.8), duo double pupils (29.5,29.8)/(20.3,33.7), duo jaw knob (37.8,42.5), duo lower-lip dot (58.0,35.0), pad knob (28-30.4, 17.2-18.5, now a smaller tooth).
4. **Lips no longer pulled to the cheek** in stylish: the three straight links at y = 34/36/37 are gone.
5. **Outline protrusions:**
   - nails filings spikes are gone from the wall;
   - hearts hair spikes are now a chunky lobed silhouette (better for Bakerlogy A1);
   - wall fairness improved on 5 of 10.
6. **Hands mouth** is no longer a filled dark bar.

**Worse or new**
1. **Pocket fill collapses whole features and changes faces (most serious).**
   - stylish lips → one "O" loop (43.3-51.7, 34.7-40.2): the drawing's parted lips (bow, parting line, opening) became an open, surprised mouth;
   - hands lips → one flat line (41.5-46.9, 52.6), losing the shape of the lips;
   - duo left lips → opened at the left corner (34.8-35.8, 55.4-56.0).
   - The rule fills the lip *interiors* (under 2 mm) and the result is thinned to whatever survives, not to the lips' own centre lines.
2. **The dot rule still fires on thin-line drawings.** "Inscribed radius over 2x the line half-width" is relative to the drawing's stroke. With 0.25-0.5 mm Gemini lines, every junction blob and every nostril tick qualifies.
   - heart: 14 dots plus one 3.2 mm dot;
   - duo: three nostril dots, now 2.0-2.3 mm;
   - hands: nostril ball.
   - The 1.6 mm wall exclusion works (no dots on walls), but the threshold needs an absolute floor.
3. **"Ends run straight on into the wall" now adds new segments instead of replacing bends:**
   - uterus canal: dogleg AND stub, which creates cream specks;
   - hands: two long invented diagonals across the hair;
   - stylish: lower-lid link and head-back bar;
   - pad: second prong at the top.
4. **The protrusion rule (85 % ink) removes real anatomy:**
   - hands top-hand fingers deleted;
   - lotus third fingertip deleted.
   - It did **not** remove the stylish lash spike, which is unchanged at (53.7,24.1).
5. **The 0.35 mm smoothing cap did not restore the finger notches** (lotus, nails). The notches are lost before smoothing, probably in the pocket fill: a notch narrower than 2 mm is a "narrow pocket" open to the outside.
6. **Open parallel channels are not caught:** pad 0.8 mm channels (29-32, 30-37), (41-45, 40-45), (47.5-51, 46.6-47.8); duo 0.41 mm (40-47.6, 33-34.4). The fill only treats enclosed pockets.
7. **Closed-shape protection leaves the heart rim** 1.35-2.2 mm from the wall (C5), because closed shapes are never pulled.

## Per-image detail

### 1. uterus: FAIL
- **Canal bottom** (`uterus_Z_canal.png`): worse than round 9.
  - Each canal line still bends about 45° outward into the wall: (39.2-40.8, 87.6-88.8) and (50-51.6, 87.2-88.6).
  - The "run straight on" end was added as a second piece: a pointed vertical stub (40.8-41.8, 88.8-91.2) and (49.2-50, 88.4-91.2).
  - Between stub and dogleg sit cream specks of 0.36-0.54 mm, (40.8,90.1) and (50.4,90.1).
  - The drawing has two straight T-joins.
- **Ovaries** (`uterus_Z_ovaryL.png`, `uterus_Z_ovaryR.png`):
  - The lower halves are the wall, as in round 9.
  - **Right ovary:** the top is still flat (71.3-73, 35.3-35.9) with a straight top-left diagonal from (65.3,39) and a dark junction wedge (65-67, 38.5-40.5). The right flank ends in a spur plus a new knob (77.3-79.3, 41.8-43.5) holding a 0.36 mm cream speck (78.2,43.0).
  - **Left ovary:** the flank runs sideways into the wall at (11.6-13.5, 39-39.9); knob with speck (12.3-14, 42-43.8).
  - Not round and not mirror-true (A11, C11).
- **Tube V** (`uterus_Z_tubeL.png`): still an S-bend into a vertical stub (28.7-29.5, 35-37.8) and (62-62.7, 35.8-37.8); 0.2 mm pinhole in the wedge at (25.4,39.6).

### 2. pad: FAIL
- **Top** (`pad_Z_top.png`):
  - The left half of the loop merges into the wall tangentially (good).
  - The right half leaves a hanging tooth/stub (29.2-31.1, 17.6-18.8), then enters the wall vertically from (33.2,19.7), so there is a 1 mm gap between two prongs.
  - The drawing leaves the outline tangentially at (30,18.5).
- **Right** (`pad_Z_right.png`):
  - hook into the wall (66.4,61.1)-(69,61.8) unchanged;
  - knob (67.3-68.4, 64.2-65.5), smaller than round 9's 2.3 mm;
  - **new** ball-ended knob (62.4-63.7, 74.9-76.1);
  - the bottom of the loop has a corner (59.6,76.7) and a straight run into the wall at (61.7,78.2), where the drawing merges tangentially.
- **Channels** (`pad_Z_mid.png`, `pad_Z_channels.png`, `pad_Z_channels2.png`):
  - the crescent and blob channel is fixed;
  - three open channels with a median of 0.8 mm remain: (29.2-31.8, 30.1-36.8), (41.4-44.6, 39.8-45.0) and (47.5-50.9, 46.6-47.8).
  - Drawing spacing, but a C5 fail as converted.
- **Wall** is now the fairest after venus (0.042).

### 3. lotus: FAIL
- **Fingers** (`lotus_Z_fingers.png`):
  - The outline is convex over both drawn notches (11.4,49.6) and (17.3,48.0). It now has only a shoulder at (10-11.8, 48.2-48.8) and a shallow dip at (17.5,47.3).
  - The finger 1/2 separator survives as an inner ridge from the wall (11.7,48.6).
  - The third fingertip (17-21, 47.5-50) is gone entirely, which replaces round 9's 0.4 mm sliver loop.
  - Its left side remains as a vertical ridge (18.3-19.4, 48.6-58.3) forming a sharp V with the separator at (19.2,58.3).
- **Petal tip** (`lotus_Z_petalR.png`):
  - The drawn rounded pocket is now a sharp triangle (65.1-67.9, 49.7-54.1) with 25° cusps at (66.3,49.7) and (67.9,54.1). Dough will not fill those corners.
  - The wall's inner edge bulges (67.1-68.4, 48.2-50).
  - The base line steps about 0.4 mm at (64.3-65.0, 52.4-53.6).
- **Centre** (`lotus_Z_centre.png`):
  - a notch at the Y (44.1-45.0, 50.0-50.3);
  - the base line steps down at (41.4-42.0, 56.8-57.5), round 9's lump;
  - the free end (47.8-48.5, 50.3-51.0) is blunt and hooked, not round (C12).

### 4. nails: FAIL (gated: thin part)
- **Fingers** (`nails_Z_fingers.png`):
  - Notches 1 and 3 are gone; only (31.7,21.5) remains.
  - The 2/3 separator now floats: it starts free at (31.9,25.3), 3.5 mm under the wall (D8/C14). The drawing joins the notch.
  - The 3/4 separator is missing.
  - Nail 4 is still open into the wall (39.2-44, 30.6-35.7).
  - Nail 1 is open on the left: an invented bar runs to the wall (19.5-21.7, 30.6-31.5) beside a sliver loop with a 0.67 mm slit (19.5-22.2, 33.4-35.7).
  - Nails 2 and 3 are closed and clean.
- **File and thumb** (`nails_Z_filings.png`):
  - the thumb is a plastic spike (59.2-59.6, 46.9-47.7);
  - two diagonals cross the file (55.6-62.6, 36.4-44), giving cells of 0.9 mm (60.1,41.5);
  - the file's two edges converge into a 0.9 mm lens (62.2-68.4, 37) instead of a 1.8 mm parallel strip;
  - the filings knot with holes of 0.28 and 0.98 mm (65.5-71, 44.5-48).
- The spikes are gone from the wall.

### 5. hearts: FAIL (gated: thin part)
- **Face** (`hearts_Z_face.png`, `hearts_Z_facepair.png`):
  - The nose, lips and chin are still the straight wall (59-62, 46-50.6).
  - An inner forehead/nose bar has a corner (60.8,43.2).
  - The eye is a curled hook with a 0.6 mm channel (64.2-66.2, 42-45), as in round 9, so the expression is lost.
  - The neck bead chain is gone (better).
- **Hem** (`hearts_Z_hem.png`): the lower fold lines are pulled onto the wall as trapezoid cells: (25.3-29.2, 80.6-85.3), (32.0-35.7, 84.3-87.2) with 1.75 mm, (37.3-39.8, 85.2-86.5) with a 0.5 mm speck, and (48.6-54, 81.5-84). They read as teeth.
- **Wall:** knobs (54.5-55.5, 79.8-81.5) and (69.2,26.9); hair silhouette now chunky (good).

### 6. stylish: FAIL
- **Mouth** (`stylish_Z_faceR.png`):
  - The drawing has an upper lip with a Cupid's bow (top 33.3, dip 33.8), a lower lip and a small opening.
  - The cutter has one closed loop (43.3-51.7, 34.7-40.2) with no bow and no parting line. It reads as an "O" mouth: expression changed.
  - The loop's right side is 0.1-0.55 mm from the cheek wall for 5 mm (hug.py (53.2-53.4, 35.3-40.1)), a C5 fail. It should either join the wall or keep 2.5 mm.
- **Right eye:**
  - the lash spike is unchanged (51.5-53.7, 22.5-26.0, tip 53.7,24.1, 75° kink, cream speck 52.0,23.8);
  - the brow is a clean single line into the wall (good);
  - pupil (47.4,25.4) correct;
  - **invented** link from the lower lid to the wall (48.6-50.2, 27.2-28.4).
- **Nose:** the tip fork is a filled blob (47.6-49.4, 30-32.3); the nostril hooks are fine.
- **Left eye** (`stylish_Z_eyeL.png`):
  - The lashes are separate strokes with no slits (better).
  - Root wedges of 0.4-0.5 mm (27.2-31.5, 25.6-28.2) remain at the convergence.
  - The ends are faceted (C12): brow end (25.9-26.5, 25.2-25.8), lid end (38.4-39.1, 26.3-27.2).
- **Head back** (`stylish_Z_back.png`):
  - invented horizontal bar from the wall (11-14.6, 39.9-40.6) with a 0.76 mm triangle (12.3-14.5, 38.2-40.0);
  - end dogleg (18.9-19.6, 47.5-49.5) as in round 9;
  - a new diagonal makes a 0.71 mm triangle (20.1-21.4, 48.1-49.5).
- **Hair top** (`stylish_Z_top.png`, new):
  - The drawn hairpin curl (tip 29.8,6.2) became two prongs into the wall (30.4-31.4, 5.8-8) and (32.6-33.6, 5.6-8) with a 0.6 mm wedge.
  - The hair line turns into the wall with a corner at (41.0,10.3) instead of merging tangentially at (46,11).
- **Jaw** (`stylish_Z_neck.png`):
  - The jaw curve's upper part was pulled onto the wall, leaving a notch on the inner wall (45.9-46.5, 50-51).
  - The rest meets the wall as a T with a hump (43.7-46, 54.2-55.5).
  - The drawing is one smooth curve (C14).

### 7. duo: FAIL (gated: open outline + thin part)
- **C2 fixed** (79.96 mm). The body is still invented: the right shoulder is closed with a long diagonal that ends in a solid 7 mm plastic needle (93.5-95.8, 84-91.1) (`duo_Z_tail.png`).
- **Faces** (`duo_Z_faceR.png`, `duo_Z_faceL.png`, drawings `duo_draw_face*.png`):
  - Pupils and brows are correct; the brows are single lines, with no slits (better).
  - The nostrils are 2.0-2.3 mm balls (73.8,39.8), (76.8,39.6) and (37.2,48.7). The right-face pair reads as a snout, and the drawn hook shapes are lost.
  - The left-face lips are opened: the upper line ends at (34.8,55.4) and the lower at (35.8,56.0). The drawing closes this corner.
- **Joins** (`duo_Z_neckX.png`):
  - the right face's left edge is pinched to a point contact at (61.0-61.5, 39.8-40.5);
  - invented neck cell (55.6-64.5, 43.5-53.5).
- 0.41 mm channel over 7.7 mm (40.2-47.6, 33.2-34.4).

### 8. heart: FAIL (gated: busy 37)
- **Dots** (`heart_Z_dots.png`): 14 round 2 mm dots plus one 3.2 mm dot (77.6,43.6), at necklace beads and line junctions. Several are free and several sit on lines as beads.
- This is a direct effect of the relative dot threshold on 0.25 mm drawing lines.
- **Rim:** the inner rim is still 1.35-2.2 mm (cream) from the wall over about 65 mm (C5).
- The faces are blank.
- The outline is clean.

### 9. hands: FAIL (gated: thin part)
- **Neck** (`hands_Z_top.png`): the walls still touch at (45.8-47.2, 27.2-31.3), so the cookie is split.
- **Top hand:** the fingers (36-54, 17-28) were removed as protrusions, so it is a mitten.
- **Face** (`hands_Z_face.png`, `hands_Z_head.png`):
  - pupils (40.2,45.2) and (47.8,45.1) correct;
  - the lips are one straight line (41.5-46.9, 52.3-53.0) plus a chin arc, so the bow and pointed corners are lost (less wrong than round 9's dark bar);
  - the left nostril is still a ball (41.5-43.2, 49-50.6).
- **Hair:** the strands near the wall were pulled, leaving straight-sided cells:
  - box (54.9-57, 47.2-50.5);
  - bar (35-37.5, 40-40.8);
  - two invented diagonals (31.1,51)-(39.8,55.0) and (33.2,63.1)-(39.2,68.6);
  - parting knot with slivers (41-48, 31-35);
  - the neck lines are still missing.

### 10. venus: PASS
- The ring and inner circle are identical to round 9 (`ringchk.py`: r 24.122 mm, 0.093 mm peak to peak; inner ring true).
- Wall 1.40 mm, ridge 0.90 mm; neck and cross fillets clean.

## Top 3 remaining conversion fixes (most important first)

1. **Faces: collapse narrow closed shapes to their own centre line, and give the dot rule an absolute floor.**
   - Lips and brows must thin to their own medial line, not to the filled blob's outline:
     - stylish lips should be bow line + parting line + lower-lip line, not an O (43.3-51.7, 34.7-40.2);
     - hands lips should keep the pointed corners;
     - duo lip corner (35.3,55.7) must stay closed.
   - A dot only where the core is at least 1.2 mm across in the drawing (absolute), is isolated, and is not on or at a line end or junction. Otherwise keep the stroke (short dash or hook). Fixes:
     - heart's 15 dots;
     - duo nostrils (73.8,39.8), (76.8,39.6), (37.2,48.7);
     - hands nostril (42.3,49.8);
     - nose blobs at stylish (48.5,31.2).
   - Do not let pocket fill touch notches that are open to the outside (lotus and nails finger notches).
2. **Wall joins: replace, don't add.**
   - When a line end is extended into the wall, delete the old bend or stub and extend only along the end tangent. Never create a second segment or a straight bar across other lines. Fixes:
     - uterus canal feet (39-42, 87-91) and (49-52, 87-91), with specks;
     - pad top prongs (29-33, 17-20);
     - stylish lid link (48.6-50.2, 27.8), head-back bar (11-14.6, 40) and triangles, hairpin prongs (30-34, 5.6-8);
     - hands diagonals (31-40, 51-55) and (33-39, 63-69).
   - Along-wall stretches must merge tangentially (pad (59.6,76.7) and (66.4-69, 61.5); stylish jaw (44-46.5, 50-55.5)).
   - Lines that end up 0.1-2.5 mm from the wall must be resolved one way or the other: stylish mouth (51.7, 35-40); heart rim, by offsetting a closed shape to 2.5 mm if it cannot be pulled.
   - Remove knobs left on the wall: pad (67.8,64.8) and (63,75.5); uterus (78.3,42.6) and (13.1,42.9); hearts (55,80.6) and (69.2,26.9).
3. **Silhouette: protrusion removal by stroke width, not ink ratio, and keep notches.**
   - Remove only line-width strokes poking out (lash tips, at most about 1.5x line width). The ink-ratio rule removes real fingers (hands top hand, lotus third fingertip) yet misses the stylish lash spike (53.7,24.1).
   - Restore concave notches deeper than about 1 mm: lotus (11.4,49.6) and (17.3,48.0); nails (24,22) and (38.5,23.5).
   - Keep the ovaries round: fit a circle to each touching arc (uterus (13-25, 35-47) and mirror).
   - Never extend an outline into a needle (duo (93.5-95.8, 84-91)).

**Gate notes:** the gates are correct for all six gated images (heart busy; nails, hearts, duo and hands thin; duo open). Uterus, pad, lotus and stylish are not gated and fail on conversion alone. With fixes 2 and 3, uterus and lotus are the nearest candidates.

**Drawing-side, not scored:** pad subject; hearts and heart detail; thin fingers (nails, hands, lotus); lashes and strokes 0.3-1 mm apart (stylish, pad, duo); duo open outline; uterus rung spacing.
