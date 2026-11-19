# Round 11 review: slit-only pocket fill, 1.6 mm dot floor, wall-join limits, notch give-back, lash-tip removal

**Inputs and method**
- Same Gemini drawings (/tmp/gz/png). Cutters: /tmp/gz/out2/NAME_cutter.svg (mm, dated Nov 19 15:18-15:19). Drawing-side faults are marked "drawing" and kept short.
- **All coordinates are SVG mm.** Work files are in `round11_work/`. The round 10 scripts were copied and re-pointed (`render.py`, `masks.py`, `measure.py`, `chan.py`, `thin.py`, `wallthk.py`, `wobble.py`, `hug.py`, `ringchk.py`, `pair.py`). One new script: `cornerR.py`, which lists sharp turns on each path with a fitted local radius.
- Renders: `NAME_mm20.png` (20 px/mm), `NAME_1400.png` (the brief's rsvg command), `NAME_pair.png` (drawing left, cutter right, 10 mm grid), `NAME_Z_*.png` zooms (1 or 5 mm grid).
- **Registration caveat (unchanged):** the drawing is registered on its ink box and the cutter on the cookie, so the two are 0.5-4 mm apart in pad, nails, hearts, stylish, duo and hands. I compared shapes side by side. All coordinates below are cutter coordinates.

## Summary table

| # | Image | Cutter verdict | Remaining conversion faults (SVG mm) | Gate / drawing |
|---|---|---|---|---|
| 1 | uterus | **FAIL** | ovaries still not round: right arc broken at the ligament T, corner (66.2,38.0) + acute 25° cream spike to (65.6,39.6) + corner (66.3,40.4); left bump/corner (24.7-25.0, 38.0-38.7) and (25.0,40.5); left top corner (18.2,35.9); ovary feet: straight facet + wall ledge (76.0-78.5, 43.2-44.6, outer kink 51° at 77.5,44.6) and (12.8-14.5, 43.0-44.6, kink 62° at 13.7,44.5); lobe bottoms flat with cream points (78.0-78.3, 43.1) and (13.0,43.1); tube V still an S-bend stub into the wall (29.5-30.3, 34-37) and (60.5-61.2, 34-37) | rungs (drawing) |
| 2 | pad | FAIL | right join: line bends 35° into the wall (66.6-67.3, 64.2-65.3) and leaves an acute cream sliver (67.4-67.6, 61.7-64.1, 0.8 mm); bottom join: hump + flat stub + notch (62.0-63.4, 74.2-75.0) where the drawing merges tangentially; top-right join leaves the wall steeply with a bend (30.8-31.2, 17.3-18.0); 0.8 mm channels unchanged (28.6-31.6, 29.8-36.8), (41.0-44.1, 39.4-44.5), (47.0-50.5, 46.2-47.4); **new**: ear tips now sharp, cream radius 0.09-0.10 mm at (12.0,9.7) and (66.0,9.7), wall 2.0 mm thick at the tips (11.5,8.8)/(66.4,8.8) | wrong subject; strokes 0.5-1 mm apart (drawing) |
| 3 | lotus | FAIL | fingertip crescent sliver 0.67 mm (18.0-20.7, 49.0-50.0); centre: the long right-petal curve is broken into a knot with a kink (44.0-44.9, 49.6-50.3) and an S-wobble below it (44.4-44.9, 51-53); base-line step unchanged (41.6-42.2, 56.6-57.4); free end still squared (47.8-48.4, 50.3-51.0); small nub at the separator V (19.4,57.7); petal-tip cell 2.47 mm inscribed (just under 2.5) with a 25° cusp (67.8,54.0) | thin fingers (drawing) |
| 4 | nails | FAIL (gated: thin part, correct) | open slits between separators and nails, 0.3-0.54 mm: (26.4-27.1, 26.7-32.6) 6 mm, (24.8-25.8, 29.5-34.2), (32.8-33.0, 27.1-31.8), (31.0-31.6, 26.4-30.2); nail 1 0.81 mm from the wall over 4.7 mm (20.4-21.3, 30.7-35.4); file-tip nail slit 0.8 mm (69.0-73.8, 36.9-37.2) and (62.1-68.0, 37.0-37.4); filings now a lumpy zig-zag wall with 0.5-0.6 mm slivers (64.5-73, 44-48.8); thumb tip a filled plastic wedge (57.6-59.7, 46.6-48) with a 0.67 mm crescent (52.6-56.4, 48-50.1) | filings, spike, dense nails (drawing) |
| 5 | hearts | FAIL (gated: thin part, correct) | **hair outline now jagged**: faceted notches with kinks of 75-116° at (77.1,30.9), (81.3,31.9), (85.2,31.1), (87.5,40.0), (63.9,28.8), (69.1,27.0) (fairness 0.54, round 10: 0.24); face profile still wall: lips are a lump on the wall (59.0-60.4, 45.8-47.3), chin knob (61.5-62.9, 49-50.7); nose bar corner (60.8,43.2); eye still a curl with a 0.59 mm channel (64.2-66.2, 42-45); hem slivers 0.4-0.8 mm (49.3-55.2, 76.6-84.0) | too detailed (drawing) |
| 6 | stylish | FAIL | **brows reopened** as hollow crescents with 0.72-0.76 mm interiors: left (27.8-35.3, 20.8-23.2) 7.6 mm, right (45.0-48.6, 18.0-20.6); mouth's right side still 0.1-0.55 mm from the cheek wall over 7 mm (outer 53.2-53.5, 33.1-39.8); Cupid's bow flattened (top line 46-50, 34.2-34.6 has no dip); nose tip still a filled two-lobed blob (48.6-49.8, 30.0-32.1); **new** orphan hook on the wall with a cream speck (45.4-46.6, 10.5-12.0); hair line still bends into the wall at a corner (41.5-43.0, 8.5-9.6); hairpin tip is now one stub into the wall with a corner (29.6-30.6, 5.4-6.8); collar-to-wall sliver 0.63 mm (45.3-46.4, 51-54.6); small wiggle on the inner wall (45.9-46.4, 47.9-50.6); squared lash, nostril and lid ends (28.0,26.6), (29.5,26.0), (31.0,26.0), (39-39.4, 26.5-27.3), (46.8-47.1, 30.6-31.8), (43.5-43.8, 30.3) | lashes outside the outline (drawing) |
| 7 | duo | FAIL (gated: open outline + thin part, correct) | nostrils still balls: 2.0 mm (74.5,40.1), 2.3 mm (77.5,39.9), 2.0 mm (37.5,49.1); **brows reopened** as hollow loops: (22.7-31.2, 40.2-43.3) 0.7 mm, (35.3-39, 36-40) 0.93 mm, right face (67-73, 29-32.6); lids are doubled lines with 0.3-0.6 mm slits (26-32.4, 43.3-45.3), (38.3-47, 37-42), (63-71, 32.3-34.6), (79-86.9, 30.4-33.6); left-face lower lip still starts 0.6 mm from the lip corner (35.4-36.2, 56.2-56.8); jaw ridge 0.36 mm from the wall (28.6-31.2, 54.7-58); X pinch where the heads meet (61.5-62, 39.8-41); invented neck cell (56-64.5, 43.5-53.5); tail now ends in a rounded point (95.4,86.2) with an acute cream tip (95.3,84.6) | open outline (drawing) |
| 8 | heart | FAIL (gated: busy, correct) | junction beads still there: 20 blobs over 1.5 mm, e.g. 3.18 mm (77.6,43.6), 2.06 (26.3,41.6), 2.04 (22.4,46.3), 1.93 (22.2,41.6), 1.92 (26.4,46.4), 1.91 (20.4,37.2), 1.79 (38.8,43.7), 1.77 (24.4,47.7); inner rim 1.0-2.1 mm from the wall over 69 mm ((79.8,63.1)-(54.4,86.3), (47.9,86.4)-(23.0,63.7)) plus 0.3-0.95 mm over 9.5 mm (12.2-16.1, 46.1-54.5); 95 cream cells, most under 2.5 mm | 11 figures (drawing) |
| 9 | hands | FAIL (gated: thin part, correct) | **lips back to a filled dark lens** (42.0-46.9, 51.6-53.5) with a 0.2 mm slit, which reads as a pout: bow and pointed corners lost; left nostril still a 1.8 mm ball (41.7-43.0, 48.6-50.2); top-hand fingers partly back but finger 2 ends in a ball (40.3-41.2, 21.2-22.6); walls still fused from the middle finger down the connector (45.0-46.6, 22.5-31.5), so the cookie is split; hair strand merges into the face line with a 0.5 mm sliver (36.6-37.5, 46-55); hair bar from the wall (34-37, 39.3-40.5) and box cells (52.6-55.5, 40-42), (55-56, 46.5-51); parting stubs (43-44.3, 31-33.2), (45-46, 31.5-33.5); hair strands 0.05-0.6 mm from the wall in 10 stretches | thin fingers, connector (drawing) |
| 10 | venus | **PASS** | none. Ring r = 24.122 mm, 0.092 mm peak to peak; inner ring r = 22.72 mm; wall 1.40 mm, ridge 0.90 mm. The cross corners are now sharp on the plastic side (r 0.33-0.48 mm at (46.95,59.16), (55.63,59.17), (46.94,66.85), (55.63,66.91), (46.95,75.58), (55.56,75.54)), as in the drawing; on the dough side they are about 1.4-1.7 mm (fine for C8). Note: those dough-side fillets are drawn with 4-5 facets of 0.5 mm (`venus_Z_corners.png`); invisible at 1:1, but they could be smoother | drawing PASS |

**Result:** 1/10 cutters pass (venus), the same as rounds 9 and 10.
- **Gates:** heart is busy; nails, hearts, duo and hands are thin; duo has an open outline. These are the same gates as round 10 and they match the cutters.
- **Thin-part check (`thin.py`):** the 4.3 mm disc test now also flags
  - the pad ear tips (10.6-13.8, 7.6-11.4) and (64.2-67.5, 7.7-11.4), 4.3-4.5 mm², maximum width 2.6-3.0 mm;
  - a hearts hair tip (60-63.4, 25.9-28.9).
  - Whether the pad gate fires depends on the app's area cut-off. If it does, it is because the ear tips got sharper this round (see pad).
- Uterus, pad, lotus and stylish are not gated and fail on conversion faults alone.

## Checks unchanged and passing
- **C2:** widest side 80 mm on all 10.
- **C3:** ridge p10/p50/p90 0.85/0.89-0.90/0.92 mm (heart p90 0.95); wall p5-p95 1.37-1.40 mm.
- **No dark specks** (`small_dark_comp` is empty except for real features). The uterus has no cream specks this round (round 10 had specks at (40.8,90.1), (50.4,90.1), (12.9,43.0) and (78.2,43.0)).

## Outline fairness (high-frequency curvature RMS; round 10 in brackets)
It got worse on all 10: uterus 0.20 (0.059), pad 0.099 (0.042), lotus 0.35 (0.075), nails 0.39 (0.21), hearts 0.54 (0.24), stylish 0.15 (0.12), duo 0.23 (0.16), heart 0.092 (0.041), hands 0.33 (0.12), venus 0.23 (0.060).
- **Expected part:** the notch give-back restores real corners: lotus finger and petal notches, nails finger notches, the venus cross corners and the uterus tube peaks. These are correct and match the drawings.
- **Unwanted part:**
  - the hearts hair is now a jagged, faceted edge (27 kinks, was 10);
  - wall ledges appear where a ridge meets the wall: uterus feet (77.5,44.6) and (13.7,44.5); pad ear tips (11.1,7.6) and (66.7,7.7).

## Compared with round 10

**Better**
1. **Uterus canal feet are fixed** (`uterus_Z_canal.png`): both canal lines run straight into the wall as clean T-joins. The dogleg, the extra stubs and the cream specks are gone.
2. **Stylish lips are back** (`stylish_Z_faceR.png`): the "O" is gone. Upper lip, parting line and lower lip are back, so the expression reads as parted lips again. The bow dip is still flattened (see below).
3. **Notches restored:**
   - lotus finger notches (11.6-12.0, 49.4-49.8) and (17.6,48.9), and the third fingertip is back (18-21.5, 47.3-49.5);
   - nails notches 1-3 (24,23.6), (31.4,25.3), (38.4,23.4). The 2/3 separator now reaches its notch (it floated 3.5 mm short in round 10);
   - the venus cross is truer to the drawing.
4. **Invented wall links removed:**
   - stylish lower-lid link (48.6-50.2, 27.2-28.4);
   - stylish head-back bar (11-14.6, 39.9-40.6) and its 0.76 mm triangle;
   - stylish end dogleg and 0.71 mm triangle (18.9-21.4, 47.5-49.5);
   - stylish jaw hump (43.7-46, 54.2-55.5);
   - the two hairpin prongs are now one stub;
   - hands long diagonals across the hair (31-40, 51-55) and (33-39, 63-69);
   - pad top tooth (29.2-31.1, 17.6-18.8).
5. **Knobs removed:** pad (67.8,64.8) and (63,75.5); uterus (78.3,42.6) and (13.1,42.9); hearts (55,80.6) and (69.2,26.9).
6. **Lash spike removed** (stylish 53.7,24.1). The nails file X-diagonals are gone. The hands top-hand fingers are partly back. The duo tail needle is shortened from 7 mm to a rounded point.

**Worse or new**
1. **Brows reopened** (stylish both brows, duo all four): the 0.7 mm slit limit lets 0.72-0.93 mm brow interiors through. Each is now a hollow crescent with a channel that dough cannot fill. In round 10 these were single lines.
2. **Hands lips are again a filled dark lens** (42.0-46.9, 51.6-53.5). Expression lost.
3. **Dots:** the 1.6 mm floor did not shrink or remove the nostril dots.
   - duo nostrils measure 2.0 / 2.3 / 2.0 mm;
   - the hands nostril measures 1.8 mm;
   - heart still has 20 junction beads of 1.5-3.2 mm.
   - The rule still makes dots from line ends and junctions; the minimum size is not what decides this.
4. **Hearts hair** is jagged and faceted (see fairness).
5. **Pad ear tips** are now sharp: dough-side radius 0.09 mm, and the wall is 2.0 mm at the tip.
6. **Stylish:** a new orphan hook on the wall (45.4-46.6, 10.5-12.0), the leftover of the hair line, which was split by the "within 2.2 mm" end rule.

**Unchanged**
- stylish mouth hugging the cheek wall;
- heart rim at 1-2 mm;
- the pad 0.8 mm channels;
- the uterus tube S-bends;
- the lotus base step and squared free end;
- the hands connector fused;
- the duo neck cell and X pinch.

## Per-image detail

### 1. uterus: FAIL
- **Canal:** fixed (see above).
- **Right ovary** (`uterus_Z_ovaryR.png`, `uterus_Z_ovaryRleft.png`, `uterus_Z_ovaryRfoot.png`):
  - The top is now round (round 10's flat top is gone).
  - The two ligament lines are merged into the wall (their 0.9 mm slit was filled). Where they meet the circle, the arc becomes a straight chord with a corner at (66.2,38.0), an acute cream spike down to (65.6,39.6), and a second corner at (66.3,40.4). The drawing has two clean T-joins on a round arc.
  - At the bottom right, the arc ends in a corner (77.0,43.2), then a straight facet to (76.0,44.0) and a ledge on the outer edge (77.5-78.5, 44.5). The lobe beside it has a flat bottom.
- **Left ovary** (`uterus_Z_ovaryL.png`, `uterus_Z_ovaryLtop.png`):
  - corner at the curl join (18.2,35.9);
  - bump at the ligament (24.7-25.0, 38.0-38.7) and corner (25.0,40.5);
  - the lower-left side is straight at x = 13.8-14 from 41 to 43.2, with a corner at (14.0,43.2);
  - ledge on the outer edge (12.8-13.7, 44.5);
  - the lobe ends in a cream point at (13.0,43.1).
- **Tube V** (`uterus_Z_tubeL.png`, `uterus_Z_tubeR.png`): still an S-bend into the wall at (29.5-30.3, 34-37) and (60.5-61.2, 34-37). The drawn V tip (30,35) floats 2.3 mm from the outline peak (drawing D8), so the joining itself is acceptable. The sharp V shape is lost.

### 2. pad: FAIL
- **Top** (`pad_Z_top.png`):
  - The tooth is gone and the left half merges into the wall (small nub at 24.6-24.9, 17.8-18.4).
  - The right half leaves the wall steeply at (30.7,17.2) with a bend (30.8-31.2, 17.3-18.0). The drawing leaves tangentially.
- **Right** (`pad_Z_right.png`):
  - The knob is gone.
  - The loop line bends about 35° into the wall at (66.6-67.3, 64.2-65.3), leaving an acute cream sliver 2.4 mm long and 0.8 mm wide (67.4-67.6, 61.7-64.1). In the drawing that wedge is ink.
  - Lower down, the ball-knob became a hump plus a flat stub plus a notch underneath (62.0-63.4, 74.2-75.0). The drawing merges tangentially.
- **Channels:** 0.8 mm channels unchanged (`chan.py`). These are open channels, not slits under 0.7 mm, so the new rule leaves them.
- **Ears** (`pad_Z_ear_r10vs11.png`):
  - The tips are sharper and taller than in round 10. Dough-side radius is 0.09 mm at (12.0,9.7) and 0.10 mm at (66.0,9.7); the wall swells to 2.0 mm at the tip.
  - Closer to the drawing, but against A10/C8: Bakerlogy blunts points, and dough will not fill a 40° point.

### 3. lotus: FAIL
- **Fingers** (`lotus_Z_fingers.png`):
  - Both notches and the third fingertip are back, and the separators run from the notches as drawn (big improvement).
  - New sliver: the fingertip's inside is a crescent 0.67 mm wide (18.0-20.7, 49.0-50.0). The drawing's crescent is about 1 mm; either collapse it to a line or widen it to 2.5 mm.
  - Small nub at the separator V (19.4,57.7).
- **Petal tip** (`lotus_Z_petalR.png`): the cell is now a quadrilateral like the drawing (better than round 10's triangle). It has a 2.47 mm inscribed opening and an acute cusp at (67.8,54.0). There is a slight jog on the wall's inner face (65.3-65.6, 48.3-49.9).
- **Centre** (`lotus_Z_centre.png`):
  - The drawing's long right-petal curve passes the Y smoothly. The cutter breaks it into a knot with a kink (44.0-44.9, 49.6-50.3), and the stem below wobbles (44.4-44.9, 51-53).
  - The base-line step remains (41.6-42.2, 56.6-57.4).
  - The free end (47.8-48.4, 50.3-51.0) is still squared and faceted (C12).

### 4. nails: FAIL (gated: thin part)
- **Fingers** (`nails_Z_fingers.png`):
  - Notches and the 2/3 separator are fixed. The nail 1 bar and sliver loop are gone.
  - New/remaining: the separators and nail sides run 0.3-0.54 mm apart for 4-6 mm (see table). These are open channels, so the slit fill does not touch them.
  - Nail 1 is 0.81 mm from the wall over 4.7 mm.
- **File** (`nails_Z_filings.png`):
  - The X-diagonals are gone.
  - The filings are a lumpy zig-zag wall with 0.5-0.6 mm slivers.
  - The thumb tip is a filled wedge; the thumbnail is a 0.67 mm crescent.
  - The file-tip nail is a 0.8 mm slit.

### 5. hearts: FAIL (gated: thin part)
- **Face** (`hearts_Z_face.png`): unchanged. The profile is the wall, with a lip lump and a chin knob. The forehead/nose bar has a corner. The eye is a curl with a 0.59 mm channel, so the closed-eye expression is still lost.
- **Hair** (`hearts_Z_hair_r10vs11.png`): round 10 had smooth chunky lobes; round 11 has faceted notches and kinks. The knob (69.2,26.9) and the inner hair stubs are gone.

### 6. stylish: FAIL
- **Mouth:**
  - The parted lips are restored (main win).
  - The upper-lip top is now one smooth arc: the drawn Cupid's-bow dip (about 0.5 mm, between the two humps) is gone.
  - The lip loop's right side runs 0.1-0.55 mm from the cheek wall over 7 mm (`hug.py`): a C5 fail as in round 10.
- **Right eye:**
  - The lash spike and the lid link are gone, and the lashes are removed with them. Those lashes are drawn outside the face outline (drawing), so this is acceptable. The two eyes now differ (left lashed, right bare).
  - Lid and pupil match the drawing.
- **Brows** (`stylish_Z_eyeL.png`): both are hollow crescents with 0.72-0.76 mm interiors, which is worse than round 10's single lines.
- **Nose tip:** still a filled two-lobed blob (48.6-49.8, 30.0-32.1). The drawing has two separate ticks.
- **Hair top** (`stylish_Z_top.png`):
  - The hairpin tip is one stub into the wall with a corner (29.6-30.6, 5.4-6.8).
  - The upper hair line still turns into the wall at a corner (41.5-43.0, 8.5-9.6).
  - Its remaining 3 mm became an orphan hook on the wall with a cream speck (45.4-46.6, 10.5-12.0). The drawing merges tangentially at (47,12.5).
- **Head back** (`stylish_Z_back.png`): the bar, dogleg and triangles are gone. The junctions are acute wedges, as in the drawing (acceptable).
- **Jaw** (`stylish_Z_neck.png`): the hump is gone. Remaining: a small wiggle on the inner wall (45.9-46.4, 47.9-50.6), a nub where the chin line meets the wall (46.0-47.0, 46.7-47.7), and a 0.63 mm sliver between the collar and the wall (45.3-46.4, 51-54.6).

### 7. duo: FAIL (gated)
- **Faces** (`duo_Z_faceR.png`, `duo_Z_faceL.png`):
  - The nostrils are still 2.0-2.3 mm balls, so the right face still reads as a snout.
  - The brows are hollow again.
  - The lids are doubled with 0.3-0.6 mm slits (the drawing's lid and crease lines are close together, but the conversion should merge them).
  - The left lips' upper loop is closed now, but the lower lip starts 0.6 mm from the corner.
- **Tail** (`duo_Z_tail.png`): shortened to a rounded point; the dough tip is still acute.
- **Neck** (`duo_Z_neckX.png`): X pinch and invented cell unchanged.

### 8. heart: FAIL (gated: busy)
- The beads remain (`heart_Z_dots.png`), now 1.6-2.1 mm, plus the 3.18 mm dot.
- The rim is still 1-2.1 mm from the wall over 69 mm.

### 9. hands: FAIL (gated: thin part)
- **Face** (`hands_Z_face.png`):
  - The lips are a filled dark lens with a 0.2 mm slit: back to round 9's dark bar, and worse than round 10's line.
  - The left nostril is a 1.8 mm ball.
  - A hair strand fuses into the face line with a 0.5 mm sliver.
- **Top** (`hands_Z_top.png`):
  - Fingers are partly restored; finger 2 has a ball tip.
  - The middle finger and the connector are fused solid plastic (45.0-46.6, 22.5-31.5).
  - Parting stubs hang from the wall.

### 10. venus: PASS
- Ring and inner ring are unchanged (`ringchk.py`).
- Cross corners now follow the drawing's square corners (`venus_Z_cross.png`, `venus_Z_r10_vs_r11_1400.png`).
- Dough-side corner radius is about 1.4-1.7 mm, which satisfies C8.
- The dough-side fillets have 4-5 visible facets at high zoom (`venus_Z_corners.png`): cosmetic only.

## Top 3 remaining conversion fixes (most important first)

1. **Faces: thin closed shapes and small marks must become their own centre line, never a hollow, a fill or a ball.**
   - Any closed shape whose interior is under about 1.5 mm, of any width, should collapse to its medial line. The 0.7 mm limit is too low; above it, nothing should be left between 0.7 and 2.5 mm. This covers:
     - brows: stylish (27.8-35.3, 20.8-23.2) and (45-48.6, 18-20.6); duo (22.7-31.2, 40.2-43.3), (35.3-39, 36-40), (67-73, 29-32.6);
     - lip slits: hands lens (42.0-46.9, 51.6-53.5) should become bow line + parting line with pointed corners;
     - lid pairs: duo four eyes;
     - lotus fingertip crescent (18-20.7, 49-50).
   - Keep the Cupid's bow dip on the stylish upper lip (46-50, 33.3-34.6).
   - Dots only for drawn isolated filled dots. A line end or a short hook stays a stroke. Fixes:
     - duo nostrils (74.5,40.1), (77.5,39.9), (37.5,49.1);
     - hands nostril (42.3,49.4);
     - stylish nose blob (48.6-49.8, 30-32.1);
     - heart's 20 junction beads.
2. **Joins: keep curves and circles intact where a line meets them or the wall.**
   - At a T-join on a circle, fit the circle and keep the arc. Fixes uterus ovary chords and corners (66.2,38.0)-(66.3,40.4), (24.7-25.0, 38-40.5), (18.2,35.9), (14.0,43.2) and feet (76-78.5, 43.2-44.6), (12.8-14.5, 43-44.6).
   - A line that merges into the wall tangentially in the drawing should blend along its own tangent. No bend, hump, ledge or leftover piece. Fixes:
     - pad (66.6-67.3, 64.2-65.3) plus its sliver, (62.0-63.4, 74.2-75.0) and (30.8-31.2, 17.3-18.0);
     - stylish hair line (41.5-43, 8.5-9.6) plus its orphan hook (45.4-46.6, 10.5-12.0);
     - uterus tube S-bends (29.5-30.3, 34-37) and (60.5-61.2, 34-37).
   - A line that passes through a Y in the drawing should stay one smooth curve (lotus knot (44-44.9, 49.6-53)).
3. **Clearance: no ridge may run 0.1-2.4 mm from the wall or from another ridge.**
   - Either merge it (it becomes the wall or one ridge) or push it to at least 2.5 mm, including closed shapes. Fixes:
     - stylish mouth (outer 53.2-53.5, 33.1-39.8) at 0.55 mm over 7 mm;
     - heart rim 1-2.1 mm over 69 mm;
     - pad channels (28.6-31.6, 29.8-36.8), (41-44.1, 39.4-44.5), (47-50.5, 46.2-47.4);
     - nails slits (24.8-27.1, 26.7-34.2), (31-33, 26.4-31.8) and nail 1 to wall (20.4-21.3, 30.7-35.4);
     - duo jaw (28.6-31.2, 54.7-58);
     - hands strand/face (36.6-37.5, 46-55).
   - Also blunt convex outline points to a dough-side radius of at least 1 mm: pad ear tips (12.0,9.7) and (66.0,9.7). Smooth the hearts hair facets.

**Gate notes:** the gates are correct for all five gated images (heart busy; nails, hearts, duo and hands thin; duo open outline). Uterus, pad, lotus and stylish are ungated and fail on conversion alone. Uterus and lotus are the nearest candidates: uterus needs fix 2 (ovaries and tubes); lotus needs fix 2 (centre knot) plus the fingertip crescent from fix 1.

**Drawing-side, not scored:**
- pad subject;
- hearts and heart detail;
- thin fingers (nails, hands, lotus);
- lashes outside the outline (stylish);
- close parallel strokes (pad, duo, nails);
- duo open outline;
- uterus rung spacing and the tube V near-miss.
