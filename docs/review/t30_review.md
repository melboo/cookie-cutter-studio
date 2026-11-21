# t30 review: 30 Unsplash illustrations, live pipeline (current SYSTEM_LINEART + centerline.js / vector-prototype.js)

**Inputs:** `/tmp/t30/{orig,png,out}`, the three overview sheets and `notes.txt`.

**Method:**
- Every cutter was rendered at 20 px/mm in the SVG mm frame (`t30_work/NAME_mm20.png`), next to the drawing registered on the ink box (`NAME_draw_mm20.png`), as pairs at 8.4 px/mm (`NAME_pair.png`). Zooms are `NAME_Z_*.png`.
- Scripts: `t30_work/render.py`, `pair.py` (from round 16), `rounds.py` (roundness of cream cells), `meas.py` (protrusions under 6 mm and cream gaps under 2 mm; output in `meas_out.txt`).
- **Coordinates are SVG mm from the cutter panel.** Where the cutter dropped a part (pose, redpants, face, cake stem, rabbit whiskers), the drawing panel is off by a few mm.
- C2 (scale) passes on all 30: the widest side is 80 mm. The wall and ridge widths are the same as in round 16.

**How the verdicts are scored:**
- **Drawing:** rubric section B, plus the owner rules (expression kept, anatomy, round things round).
- **Cutter:** whether the conversion produced a clean, Bakerlogy-grade cutter from the drawing it was given (section C plus C14). A cutter can PASS even when its drawing FAILs.
- **Gate:** whether the picture should have been flagged, and whether it was.
- **Accepted:** whether both the drawing and the cutter pass.

---

## Summary table

| # | picture | cat | drawing | cutter | gate fired | gate right? |
|---|---|---|---|---|---|---|
| 1 | panda | animal | PASS (soft: mouth enlarged to a grin) | FAIL | – | yes (no flag needed) |
| 2 | fox | animal | FAIL | FAIL | – | yes |
| 3 | dog | animal | FAIL | FAIL | – | yes |
| 4 | frog | animal | FAIL (human lips) | PASS | – | yes |
| 5 | rabbit | animal | FAIL | FAIL | – | borderline (whisker clutter) |
| 6 | cat | animal | FAIL | FAIL | – | **MISSED** (face scrambled, busy 21.7) |
| 7 | sleepcat | animal | FAIL | FAIL | busy 35.6 | yes |
| 8 | strawberry2 | food | FAIL | FAIL | thin | yes |
| 9 | pear | food | FAIL | FAIL | – | yes (quality fault, not gate-type) |
| 10 | grapes | food | FAIL | FAIL | – | **MISSED** (grapes became a honeycomb) |
| 11 | cherries | food | FAIL | FAIL | – | **MISSED** (stems filled, reads as a molar) |
| 12 | apple | food | FAIL | FAIL | – | yes |
| 13 | cake | food | FAIL (thin stem) | FAIL | – | yes |
| 14 | pudding | food | FAIL (thin stem) | FAIL | thin | yes |
| 15 | icecream | food | FAIL | FAIL | – | **MISSED** (busy tangle, metric 7.5) |
| 16 | pose | people | FAIL | FAIL | off-picture, open | yes |
| 17 | redpants | people | FAIL | FAIL | off-picture, open | yes |
| 18 | portrait | people | FAIL | FAIL | – | **MISSED** (face erased) |
| 19 | face | people | FAIL | FAIL | open | yes |
| 20 | cocktail | object | FAIL | FAIL | thin | yes |
| 21 | deodorant | object | FAIL | FAIL | – | yes |
| 22 | popper | object | FAIL | FAIL | open | yes |
| 23 | coffee | object | **PASS** | FAIL | – | yes |
| 24 | bell | object | **PASS** | FAIL (near) | – | yes |
| 25 | bishop | object | FAIL (inner copy of the outline) | **PASS** | – | yes |
| 26 | trans | symbol | **PASS** | **PASS** | – | yes |
| 27 | mfsymbol | symbol | FAIL | FAIL | thin | yes |
| 28 | flytrap | scene | FAIL | FAIL | busy 32.3 | yes |
| 29 | goose | scene | FAIL | FAIL | thin | yes |
| 30 | fallcat | scene | FAIL | FAIL | – | **MISSED** (face erased, ghost silhouette) |

## Pass rates

| category | n | drawing PASS | cutter PASS | both (accepted) |
|---|---|---|---|---|
| animals | 7 | 1 (panda) | 1 (frog) | 0 |
| food | 8 | 0 | 0 | 0 |
| faces/people | 4 | 0 | 0 | 0 |
| objects | 6 | 2 (coffee, bell) | 1 (bishop) | 0 |
| symbols | 2 | 1 (trans) | 1 (trans) | 1 (trans) |
| scenes/plants | 3 | 0 | 0 | 0 |
| **total** | **30** | **4 (13 %)** | **3 (10 %)** | **1 (3 %)** |

**Bakerlogy customer, judging only the finished cutter:** 4 of 30 would be accepted as-is (trans, bishop, coffee, bell), with panda borderline.
- A customer would not see the sub-mm kinks, the rounded heart point or the bell's 0.3 mm step.
- A customer would reject the frog (human lips on a frog).

**Gate:**
- 11 pictures were flagged, and all 11 deserved it: no false alarms.
- 6 were missed: cat, grapes, cherries, icecream, portrait, fallcat. Each is a cutter that has lost its subject or its face without becoming "busy", "thin" or "open".
- The pieces-per-area metric does not see long tangled lines (icecream 7.5) or a lost face.

---

## Per picture

### Animals
**1 panda**
- Drawing PASS (soft):
  - clean, cute, one weight, a closed outline;
  - the eye rule gives large almonds around the pupils (they read as panda patches, which is acceptable);
  - the mouth grew from a tiny open "o" with a tongue into a wide grin with an upper lip (owner rule: mouth shape, soft fail).
- Cutter FAIL:
  - Pupils with their highlight become plain rings (opening 4.85 mm, round): acceptable, but the sparkle is lost.
  - Left ear/head join: the head ridge kinks into the wall at (28.5, 28.5), with a step and a wobble at (31, 24) (`panda_Z_earL.png`).
  - Leg joins: bumps and steps where the body ridge meets the wall at (44.5, 83.5) and (55.5, 83.5) (`panda_Z_legs.png`).
  - The tuft stub (50, 16) is fine.
  - Every join is worse than in the drawing (C14).

**2 fox**
- Drawing FAIL:
  - the inner ear triangles sit about 1.5 mm from the outline;
  - toe notches about 2 mm;
  - the tail fringe is narrow zig-zags.
- Cutter FAIL (`fox_Z_tail.png`, `fox_Z_earL.png`):
  - The ear inner lines are 1.2 mm from the wall over 12 mm at (18, 14) and (59, 14) (C5).
  - The leg/tail Y-junction at (51, 57) becomes a floating ridge (51, 56-65) plus a new wall notch (52, 52).
  - The paw-tail hook ends 1 mm from the wall at (54, 76.5).
  - Toe bumps in the bottom wall (40-48, 81).
  - Thin bit at (19, 82), 3.7 mm.

**3 dog**
- Drawing FAIL:
  - expression changed: the original's even, happy brows became one flat brow and one raised, worried brow; a closed lid loop was added over the left eye;
  - inner lines are thinner than the outline (D3);
  - tick toes.
- Cutter FAIL:
  - the lid loop (24, 14) becomes an open dash, so the closed loop is not kept;
  - ear/head lines are 0.8 mm apart at (28, 25) and (46, 29);
  - toe ticks are 2 mm stubs (12-14, 79-81) (C9);
  - thin tail tip at (72, 58), 3.2 mm.

**4 frog**
- Drawing FAIL:
  - the original has a wavy smile line and two nostril dots; the drawing has **human lips** and hook nostrils;
  - this is caused by the "mouth is ONE closed lip shape" rule being applied to an animal.
- Cutter PASS:
  - faithful;
  - pupils are rings with a 3.6 mm opening, aspect 1.00;
  - smooth wall, clean lip corners.

**5 rabbit**
- Drawing FAIL:
  - 8 whiskers stick out through the outline;
  - the chest line (55, 72) and the back of the outline are open;
  - the original eye is a dot, but the drawing gives an almond with a pupil.
- Cutter FAIL:
  - whiskers are clipped to inner ridges that converge with gaps of 0.2-1.2 mm at (55-56, 58-65) (C5);
  - the mouth is merged into them.
- Gate: not flagged. The silhouette is fine, but the face is cluttered.

**6 cat**
- Drawing FAIL:
  - 69 lines: forehead stripes, leg stripes, toe lines, a striped tail;
  - whiskers outside the outline;
  - pupils are about 5 mm solid blobs with highlights.
- Cutter FAIL (`cat_Z_eyes.png`):
  - **Both eyes become scribbles**: the pupil and highlight are skeletonised into a loop tangled with the lower lid.
  - The mouth becomes a nose line running into a tongue "anchor".
  - The nose loop is opened.
  - Leg stripes become stubs.
- Gate: **missed** (busy 21.7 is under 28).

**7 sleepcat**
- Drawing FAIL: a keyboard grid of about 40 key lines, about 3 mm apart, behind the cat.
- Cutter FAIL: the cat's body outline is mostly lost to the grid, and the head is unreadable.
- Gate: busy, correct.

### Food
**8 strawberry2**
- Drawing FAIL:
  - all seeds dropped (a key feature);
  - thin highlight curves read as segment lines;
  - the second fruit's outline is open at (50, 62-70);
  - spiky calyx;
  - thin inner lines.
- Cutter FAIL:
  - the calyx is a row of 3.5-4.5 mm spikes (21-49, 25-32);
  - solid dark leaf tip at (90, 37);
  - lumpy right wall (85-88, 40-55).
- Gate: thin, correct.

**9 pear**
- Drawing FAIL:
  - the stem is two parallel lines crossing the leaf tip;
  - the leaf veins cross each other.
- Cutter FAIL:
  - the leaf/stem/body triangle (40-55, 25-40) is filled, with knotted joins at (46-55, 27-33) and 0.2 mm slivers at (56, 32) and (53, 21);
  - wall lump at (40-44, 41);
  - stem 5.6 mm.

**10 grapes**
- Drawing FAIL:
  - the line is about 2.5 mm, roughly double the marker rule;
  - overlapping back grapes leave tiny triangles and slivers.
- Cutter FAIL: **the round grapes become a polygon honeycomb**. The medial axis of merged thick black turns every circle into straight Voronoi edges, with little triangles at (43, 44), (57, 44) and (50, 52). Round things are not round.
- Gate: **missed**.

**11 cherries**
- Drawing FAIL: the stems are single thin lines forming an open triangle with the leaf (D6).
- Cutter FAIL:
  - the triangle between the stems is filled, so the cutter is one blob that reads as a **molar tooth**;
  - the cherries are no longer two round fruits;
  - leaf tip 4.7 mm.
- Gate: **missed**.

**12 apple**
- Drawing FAIL:
  - the leaf/body join has a gap (100-104, 53-57);
  - corner kinks at (40, 52) and (104, 57).
- Cutter FAIL:
  - the leaf/body separation line is dropped (0 inner lines);
  - the neck between the leaf and the body is about 4 mm at (100-104, 53-56) (C8);
  - thin leaf tip at (101, 30), 3.4 mm.

**13 cake**
- Drawing FAIL (only D6): the cherry stem is a single thin line sticking out. Otherwise clean and cute.
- Cutter FAIL (`cake_Z_cherry.png`):
  - the stem is dropped and leaves a nub at (82, 65.5);
  - the cherry has a flat top and a flat bottom (82-87, 77): aspect 1.23, radius 4.5-6.5 mm, so it is not round;
  - small wall waves on the tier sides.

**14 pudding**
- Drawing FAIL (only D6): the cherry stem is a thin line. Otherwise faithful and clean.
- Cutter FAIL (`pudding_Z_cherry.png`):
  - the stem is a **solid plastic spike** 2.3 mm wide (53, 15-24);
  - the cherry is onion-shaped, with a peak at (52, 24) and flared pinches at (46, 33) and (58, 33): radius 4.3-5.8 mm;
  - the cherry's bottom ridge has bumps.
- Gate: thin, correct.

**15 icecream**
- Drawing FAIL:
  - the drizzle is drawn as hollow bands;
  - the bowl rim is a double line;
  - about 31 lines, most under 3 mm apart.
- Cutter FAIL:
  - the rim ridge runs 1.5 mm from the wall over 64 mm at (46, 66);
  - drizzle gaps 0.4-0.8 mm at (57, 39) and (45, 27).
- Gate: **missed** (7.5 pieces/1000 mm²; long lines are counted as few pieces).

### Faces/people
**16 pose**
- Drawing FAIL: the leg runs off the picture, the outline is open, and the face lines are thin.
- Cutter FAIL: the leg is dropped, the eyes become dashes, and the face is unreadable.
- Gate: correct.

**17 redpants**
- Drawing FAIL: the pants run off the picture, the face lines are thin and small.
- Cutter FAIL: the pants are dropped, the eyes become dashes, the arms are odd lobes, and there is a thin piece at (29, 84).
- Gate: correct.

**18 portrait**
- Drawing FAIL:
  - fine-pen face: eyes with lash flicks and small lips, far under the 70 × 35 eye and 90 × 40 mouth rules;
  - thin inner lines.
- Cutter FAIL:
  - one eye is a dot, the other a dash;
  - the lips become one line;
  - slivers at (46-50, 20-25);
  - collar nub at (42, 38), 3.1 mm.
- Gate: **missed**.

**19 face**
- Drawing FAIL:
  - the shoulders run off the picture;
  - lash flicks;
  - a closed leaf-shaped brow (against the rule).
- Cutter FAIL:
  - the left pupil is lost;
  - the right eye is a loop with a lash stub;
  - the brow is a closed loop;
  - 0.2-0.6 mm gaps at (89, 49), (78, 68) and (63, 37).
- Gate: open, correct.

### Objects
**20 cocktail**
- Drawing FAIL:
  - the straw is two parallel lines crossing the rim;
  - the foot tapers to pointed tips.
- Cutter FAIL:
  - the straw is an arm 5.2 mm wide (94, 30) with notches at the rim (86, 41) and (90, 42);
  - the straw lines inside are about 1.5 mm apart;
  - the foot tips are solid dark wedges (56, 100) and (88, 100);
  - 0.2 mm cream sliver along the foot (60-86, 100).
- Gate: thin, correct.

**21 deodorant**
- Drawing FAIL:
  - the collar is two parallel ellipses about 2.5 mm apart (a rim band);
  - the cap overlaps the bottle at (48, 57-62).
- Cutter FAIL:
  - collar bands 1.4 mm apart over 19 mm (36, 24);
  - the cap's top-left ellipse is lost into a wall notch (48-50, 56-62);
  - floating stub (49, 62-72);
  - 0.2 mm sliver (73, 69).

**22 popper**
- Drawing FAIL:
  - the confetti specks are turned into an invented three-ball "molecule";
  - the string is a thin line;
  - the rim of the tube is open.
- Cutter FAIL: it reads as a lollipop or molecule, the rim is lost, and there are slivers at (29-37, 87-95).
- Gate: open, correct.

**23 coffee**
- Drawing PASS: faithful, uniform heavy line, clean heart.
- Cutter FAIL (`coffee_Z_heart.png`, `coffee_Z_sleeveL.png`):
  - **the heart loses its point and cleft**: the bottom becomes a U with radius about 2.5 mm at (62, 74), and the cleft is shallow at (62, 63);
  - the sleeve ridge steps where it meets the wall at (37-40, 53.5), with a small kink at (46, 53.5).

**24 bell**
- Drawing PASS: simple and clean. (Soft: the original's clapper is dropped.)
- Cutter FAIL (near-pass) (`bell_Z_ellipsetop.png`):
  - the mouth ellipse has stair steps of 0.2-0.3 mm at (55, 69.6) and (59.5, 69.7);
  - flat stretch at the bottom (55-62, 86);
  - everything else is clean.

**25 bishop**
- Drawing FAIL: the line-icon band is drawn as an outline plus an **inner copy of the outline** about 5.5 mm inside (the rule forbids an inner copy).
- Cutter PASS: faithful conversion; the inner line keeps over 5 mm of clearance, the corners are filleted, and the mitre slit is clean.

### Symbols
**26 trans**
- Drawing PASS: outer outline only, uniform line.
- Cutter PASS:
  - inner circle radius 8.31-8.36 mm, aspect 1.000;
  - concave notches have a radius of about 1.5 mm;
  - arms are 6 mm or wider (`trans_Z_arm.png`).

**27 mfsymbol**
- Drawing FAIL:
  - the separate dash is turned into a connecting bar (a dumbbell);
  - the circles and bar get an inner copy of the outline 1.7-1.8 mm inside.
- Cutter FAIL:
  - the inner band is 1.7-1.8 mm from the wall at (20, 43), (67, 39) and (48, 47);
  - the male arrow and the female cross are 4.2 mm wide.
- Gate: thin, correct.

### Scenes/plants
**28 flytrap**
- Drawing FAIL: three traps plus leaves, a halo line around the whole group, and 127 lines.
- Cutter FAIL: about 54 sub-2 mm gaps.
- Gate: busy, correct.

**29 goose**
- Drawing FAIL:
  - **anatomy**: the beak is turned into a tulip on the head;
  - the eye is closed (the original's is open);
  - the feet are lost in a busy tulip base.
- Cutter FAIL: the head is a lump, the eye is erased, and the base is clutter (gaps 0.2-0.6 mm at (35-53, 76-79)).
- Gate: thin, correct (fired for the neck, but the picture did need it).

**30 fallcat**
- Drawing FAIL:
  - the outline is open in several places;
  - the limbs are under 6 mm;
  - tiny toe lines;
  - tiny eye and nose.
- Cutter FAIL:
  - the face is erased (the eye is a 1 mm blob at (65, 42));
  - the silhouette reads as a ghost or duck;
  - thin parts at (18, 46), 5.9 mm, and (72, 40), 3.7 mm.
- Gate: **missed**.

---

## Failure patterns (by passes cost)

1. **Thin appendages drawn as single lines or tubes** (stems, straws, strings, whiskers, calyx and leaf tips, limbs). This is mainly a drawing (rules) problem, with a conversion side.
   - Hits 12: cherries, cake, pudding, pear, cocktail, popper, strawberry2, rabbit, cat, mfsymbol, goose, fallcat.
   - The conversion then makes it worse in three different ways:
     - **filling** the hole (cherries become a molar);
     - **dropping** the part and leaving a nub (cake);
     - making a **solid plastic spike** (pudding stem, cocktail feet, strawberry leaf tip).

2. **Faces lost or changed.** Both a drawing and a conversion problem.
   - Hits 10: cat, portrait, face, pose, redpants, fallcat, goose, dog, frog, panda (soft).
   - Drawing side:
     - Human face rules applied to animals: frog lips, panda grin, dog brows.
     - Fine-pen human faces far under the size rules: portrait, pose, redpants, face.
   - Conversion side:
     - Pupils with highlights are skeletonised into scribbles (cat).
     - Small closed eye loops are opened into dashes (dog, portrait).
     - Faces vanish while no gate fires (portrait, fallcat).

3. **Doubled lines, bands and crowding under 3 mm** (rims, collars, inner ear copies, inner copies of the outline, drizzle bands, halos). Drawing problem; the converter faithfully keeps the 1.2-1.8 mm gaps.
   - Hits 9: deodorant, icecream, cocktail, pear, mfsymbol, bishop, fox, flytrap, sleepcat.

4. **Round shapes and joins lose fidelity in conversion.** Conversion problem.
   - Hits 7: grapes, coffee, cake, pudding, bell, panda, fox.
   - Heavy-stroke centrelines from the medial axis:
     - circles that touch become polygons (grapes);
     - the heart point becomes a U (coffee);
     - cherries are flattened (cake) or turned into onions (pudding).
   - T-joins into the wall get steps and kinks (panda ear and legs, coffee sleeve, fox leg/tail Y), and the ellipse gets stair steps (bell).
   - These are the pictures where the drawing is fine or nearly fine, so this pattern blocks the easy passes.

5. **Busy, off-frame and invented content.** Drawing problem.
   - Hits 9: sleepcat, flytrap, icecream, cat (busy); pose, redpants, face (off the frame); popper, goose (invented content: confetti molecule, beak tulip).
   - The gates catch most of these. They miss icecream and cat.

---

## Top 3 conversion fixes (ranked by flips)

1. **Primitive-preserving centrelines for heavy strokes and closed loops.**
   - When a drawn stroke is over 1.5× the median width, or loops touch, take the centreline from the stroke's own two edges (inner edge offset by half the local width), not from the medial axis of the merged black.
   - Then fit closed loops to a circle or ellipse when the residual is under 3 % of R, and keep corners whose drawn turning angle is over 60° (heart point, heart cleft). Replace the fitted loop exactly.
   - Flips coffee and bell (cutter, and with them both are accepted). Fixes the grape and cherry roundness in grapes, cake and pudding, but those drawings still fail. **About 2 accepted.**

2. **Smooth T/Y fusion at walls and ridges.**
   - For the last 2.5 mm before a junction, replace the ridge with a G1 blend into the target, with a fillet of at least 1 mm on both sides and no step or bump.
   - Keep drawn Y-junctions as Y-junctions, never a floating end plus a new wall notch (fox (51, 57)).
   - Stop "closing narrow gaps" from re-routing the wall at a ridge junction.
   - Flips the panda cutter (panda becomes accepted). Removes the junction faults in coffee, fox and pear. **About 1-2.**

3. **Face-safe conversion plus a subject-loss gate.**
   - Fill highlights inside pupils before thinning, and turn the pupil into a ring with a 2.5 mm or larger opening, or a capped dot.
   - Never open a closed eye or lip loop.
   - Thin protrusions under 4 mm are removed with a smooth wall, never left as a nub or a solid plastic spike.
   - Add gates:
     - (a) count the face features (closed eye loops, pupils, mouth) in the drawing and in the cutter, and flag on any loss;
     - (b) roundness: a drawn circle must stay at aspect ≤ 1.05;
     - (c) silhouette change: flag when the cookie area grows by more than 15 % over the drawing's outline area (the cherries fill);
     - (d) busy measured as ridge length per area, not piece count.
   - Flips no picture to PASS by itself, but makes the gate right on all 6 misses (cat, grapes, cherries, icecream, portrait, fallcat), so no customer gets a molar or a faceless portrait.

## Top 3 rule changes (ranked by flips), with wording

1. **Line icons and symbols become solid shapes** (flips bishop and mfsymbol drawings; bishop becomes accepted, since its cutter already passes):
   > "If the original is a line icon (a shape drawn with a thick band), draw only the outer edge of the whole band as the outline. Holes in the band stay as one inner line only where the original has an opening (a slot, a ring hole). Never draw the inside edge of the band. Never join separate parts with a bar that is not in the original."

2. **Thin parts are fattened or left out** (flips cake and pudding drawings; helps cherries, cocktail, rabbit and cat):
   > "A stem, string, straw, whisker, antenna, tail tip or leaf tip is never a single line sticking out and never two parallel lines. Either leave it out, or draw it as part of the outline at least 60 pixels wide with a round end. Leave out all whiskers. Two cherries hang from one short, thick stem shape; the space between thin stems is never part of the drawing."

3. **Face rules depend on the subject** (flips frog, so frog becomes accepted; protects the panda and dog expressions):
   > "The almond-eye and lip rules are for human faces only. Animals and cartoon characters keep their own eyes and mouth: a round eye stays a round eye with one round pupil (no highlight), and a smile line stays one smile line. Never add lips, teeth, eyelids or eyebrows that the original does not show. A tiny human face is drawn larger, never with a fine pen."

(Next after these: "Rims, collars, inner ears and textures: at most one line, at least 40 pixels from the outline, or leave it out. Patterns such as keyboard keys, stripes, drizzle, seeds and toes become at most 3 lines in total." This would help fox, deodorant, icecream and sleepcat, but each of those also has a conversion fault.)

**Projected:** both rule sets together lift the accepted count from 1 to about 6 of 30 (trans, bishop, frog, coffee, bell, panda). Cake and pudding get close (they then need conversion fix 1 for their cherries). The rest need several of these changes together.
