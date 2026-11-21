# t30b review: run 2 of the same 30 pictures (new SYSTEM_LINEART rules + ellipse snap + length/area busy gate)

**Inputs:** originals `/tmp/t30/orig`, run-2 drawings `/tmp/t30b/png`, run-2 cutters `/tmp/t30b/out`, sheets `/tmp/t30b/sheet{1,2,3}.png`, gate notes `/tmp/t30b/notes.txt`. Compared against `t30_review.md` (run 1).

**Method:** the same as run 1, with the scripts copied to `t30b_work/` (`render.py` repointed to t30b).
- Every cutter is rendered at 20 px/mm in its SVG mm frame (`NAME_mm20.png`), next to the drawing registered on the ink box (`NAME_draw_mm20.png`). Pairs are in `NAME_pair.png` and grouped two per sheet in `G??_*.png`. Zooms are in `NAME_Z_*.png`.
- `meas_out.txt` lists protrusions under 6 mm and cream gaps under 2 mm. Gaps of w0.2 on straight walls are anti-aliasing artefacts and are ignored.
- Coordinates are SVG mm. C2 (scale, 80 mm) passes on all 30.

**How similar are the two runs' drawings?** Pixel IoU between the run-1 and run-2 drawings:
- About the same (IoU 0.84 or more): grapes 0.99, coffee 0.92, cake 0.89, pudding 0.89, bishop 0.84. For these five the run-2 rules made no visible difference: Gemini returned nearly the same picture.
- Clearly different (IoU 0.21 or less): about half the set, including frog, panda, cherries, apple, the faces and fallcat.

**How the verdicts are scored:** the same as run 1.
- **Drawing:** rubric B plus the owner rules.
- **Cutter:** whether the conversion is faithful and Bakerlogy-grade (rubric C plus C14), judged against the drawing it was given.
- **Customer:** whether a Bakerlogy customer, looking at the cutter render, would accept it as-is.

---

## Summary table

| # | picture | cat | drawing | cutter | gate (run 2) | gate right? | vs run 1 |
|---|---|---|---|---|---|---|---|
| 1 | panda | animal | PASS (soft: grin mouth) | FAIL | – | yes | same (cutter fault changed) |
| 2 | fox | animal | FAIL | FAIL | – | yes | same |
| 3 | dog | animal | FAIL | FAIL | – | yes | **worse** (eyes now closed) |
| 4 | frog | animal | **PASS** | **PASS** | – | yes | **better: accepted** |
| 5 | rabbit | animal | **PASS** | FAIL | – | yes | **better** (drawing flips) |
| 6 | cat | animal | FAIL | FAIL | busy | yes (**fixed**) | slightly better |
| 7 | sleepcat | animal | FAIL | FAIL | busy | yes | slightly better |
| 8 | strawberry2 | food | FAIL | FAIL | thin | yes | same |
| 9 | pear | food | FAIL | FAIL | – | yes | same |
| 10 | grapes | food | FAIL | FAIL | – | **MISSED** (honeycomb) | same (drawing identical) |
| 11 | cherries | food | FAIL (sticker halo) | FAIL (wobbly circles) | – | yes (**fixed**: no molar now) | **better** |
| 12 | apple | food | FAIL (subject swapped for a stock apple) | **PASS** | – | yes | better (cutter flips) |
| 13 | cake | food | FAIL (stem is a 5 mm tube) | FAIL | – | borderline (5.2 mm stem not flagged) | same |
| 14 | pudding | food | FAIL (stem still a single line) | FAIL | – | **MISSED** (run 1 caught it) | same, gate worse |
| 15 | icecream | food | FAIL | FAIL | busy | yes (**fixed**) | same, gate better |
| 16 | pose | people | FAIL | FAIL | – | **MISSED** (face erased) | outline better, gate worse |
| 17 | redpants | people | FAIL | FAIL | – | **MISSED** (face scrambled, busy) | outline better, gate worse |
| 18 | portrait | people | FAIL | FAIL | off-picture | yes (**fixed**) | same |
| 19 | face | people | FAIL | FAIL | – | **MISSED** (eyes lost) | outline better, gate worse |
| 20 | cocktail | object | FAIL | FAIL | thin | yes | slightly better |
| 21 | deodorant | object | FAIL | FAIL | – | yes | same |
| 22 | popper | object | FAIL | FAIL | busy | yes | same (confetti cloud instead of a molecule) |
| 23 | coffee | object | PASS | FAIL | – | yes | same |
| 24 | bell | object | PASS (clapper restored) | FAIL | – | yes | drawing better, cutter same |
| 25 | bishop | object | FAIL (inner copy again) | PASS | – | yes | same |
| 26 | trans | symbol | PASS | PASS | – | yes | same |
| 27 | mfsymbol | symbol | FAIL | **PASS** (faithful) | – | n/a (fidelity, not gate-type) | cutter better |
| 28 | flytrap | scene | FAIL | FAIL | busy | yes | same (74 lines instead of 127) |
| 29 | goose | scene | FAIL | FAIL | thin | yes | same |
| 30 | fallcat | scene | FAIL | FAIL | thin | yes (**fixed**) | same, gate better |

## Pass rates: run 1 → run 2

| category | n | drawing | cutter | both | customer accepts cutter as-is |
|---|---|---|---|---|---|
| animals | 7 | 1 → **3** (panda, frog, rabbit) | 1 → 1 (frog) | 0 → **1** (frog) | 0 → **2** (frog, rabbit) |
| food | 8 | 0 → 0 | 0 → **1** (apple) | 0 → 0 | 0 → **2** (apple, cherries) |
| faces/people | 4 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| objects | 6 | 2 → 2 (coffee, bell) | 1 → 1 (bishop) | 0 → 0 | 3 → 3 (coffee, bell, bishop) |
| symbols | 2 | 1 → 1 (trans) | 1 → **2** (trans, mfsymbol) | 1 → 1 (trans) | 1 → 1 (trans) |
| scenes/plants | 3 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| **total** | **30** | **4 → 6** (13 → 20 %) | **3 → 5** (10 → 17 %) | **1 → 2** (3 → 7 %) | **4 → 8** (13 → 27 %) |

Notes on the customer column:
- In run 1, panda was borderline. In run 2 it is "no", because the cutter drops the right body line and the body is lopsided.
- Coffee and bell are still accepted by a customer despite a rubric FAIL: the heart without a point and the faceted clapper are only visible up close.
- Rabbit is accepted: it reads cute at 8 cm. Its floating ear line is a production fault that a customer does not see.
- Cherries and apple are accepted: they read clearly as cherries and as an apple.

**Gate:**
- Run 2 flagged 10 pictures, with no false alarms.
- It now catches cat, icecream (length/area busy), fallcat and portrait, which run 1 missed.
- It misses 5: grapes, pudding, pose, redpants and face, plus cake as borderline.
- Pose, redpants and face were caught in run 1 only because their outlines were open. Now that the rule closes the outline, the lost faces pass silently.
- Net: 6 misses become 5, but the misses moved to the faces, which are the worst ones to miss.

---

## Per picture

### Animals
**1 panda**
- Drawing PASS (soft):
  - the tuft is gone;
  - round eye patches with solid pupils plus highlights;
  - the mouth is still an enlarged open grin with a tongue (the original is a small mouth).
- Cutter FAIL (`panda_Z_lower.png`):
  - **the right body line (x≈70, y 58-80) is dropped**; only a collar hook stub is left at (73, 58-62), so the body is lopsided;
  - nose free end cut flat (52.5, 45);
  - small blob where the left body line meets the arm (31, 73).
  - Pupils with their highlight become plain rings (opening ≈3 mm, fine). The mouth is faithful (`panda_Z_mouth.png`).
- vs run 1: same verdict. The ear/leg kinks are gone, and a dropped line replaces them.

**2 fox**
- The drawing is nearly the same as run 1:
  - inner ear lines 1.2-1.4 mm from the wall at (18, 14), (59, 14) and (53, 10);
  - narrow zig-zag tail fringe.
- Cutter FAIL:
  - the same ear crowding;
  - the leg/tail Y still breaks into a wall notch at (52, 52);
  - paw-hook gap 0.2 mm × 15 mm at (56, 66);
  - toe bumps;
  - thin bit at (19, 82), 4.0 mm.
  - Eyes are now rings (fine).
- Same.

**3 dog**
- Drawing FAIL:
  - **the expression changed**: the original's open eyes with highlights became closed "^ ^" happy eyes;
  - the brows are closed leaf loops;
  - thin inner lines;
  - tick toes.
- Cutter FAIL:
  - brow loops are opened into dashes (24, 13) and (47, 17);
  - lines 1.0-1.3 mm apart at (42, 27) and (30, 25);
  - toe stubs.
- **Worse** (eyes).

**4 frog**
- Drawing **PASS**:
  - round eyes with one solid pupil, the highlight dropped as the rule asks;
  - two nostril dots and the wavy smile line kept;
  - the lips are gone;
  - faithful and cute.
- Cutter **PASS** (`frog_Z_face.png`):
  - eye rings aspect 1.005;
  - pupils are rings, opening 4.96 mm, aspect 1.001, placed inward exactly as drawn;
  - nostrils are 2.6 mm dots;
  - smooth notches.
  - Soft fault (C12): the smile's free ends are cut flat.
- **Better: now accepted.**

**5 rabbit**
- Drawing **PASS**:
  - all whiskers are gone, the outline is closed, the "x" mouth is kept;
  - the eye is a dot with a highlight (small, acceptable).
- Cutter FAIL (`rabbit_Z_head.png`, `rabbit_Z_earY.png`):
  - the Y where the right ear's edge meets the gap between the ears is broken: the ridge (58-63, 44-50) ends floating about 1 mm from the wall at (63, 43.5) (C5, C14);
  - a stub spur at (64.5, 50);
  - flat ridge ends.
- **Better** (the drawing flips; the cutter is one junction away from passing).

**6 cat**
- Drawing FAIL:
  - whiskers gone (the rule worked);
  - but about 15 forehead, leg and tail stripes plus toe lines (the texture cap was ignored);
  - pupils with highlights.
- Cutter FAIL (`cat_Z_face.png`):
  - the eyes are now clean double rings (better than run 1's scribbles), but the gaze is lost;
  - **the nose triangle and the "w" mouth become a vertical stick plus a rectangular tongue inside a shield-shaped muzzle**;
  - stripe stubs.
- Gate: busy, now caught. Slightly better.

**7 sleepcat**
- Drawing FAIL: the keyboard shrank to about 6 key rows, but it is still a frame plus an inner frame plus rows about 3.5 mm apart.
- Cutter FAIL:
  - cluttered;
  - the cat's paw and face are partly lost in the rows;
  - an inner frame line runs about 3 mm from the wall.
- Gate correct. Slightly better.

### Food
**8 strawberry2**
- Drawing FAIL:
  - seeds dropped;
  - spiky calyx;
  - an odd step where the two fruits join (50, 70-80);
  - highlight lines read as segment lines.
- Cutter FAIL:
  - calyx spikes 3.8-5.5 mm (21-67, 24-40);
  - stray calyx dashes (35, 30) and (50, 36);
  - stub at (50, 72).
- Gate thin, correct. Same.

**9 pear**
- Drawing FAIL: **the stem is still two parallel lines** (the rule was ignored), the leaf veins cross, and there are double highlight lines.
- Cutter FAIL:
  - stem 5.7 mm wide;
  - knotted leaf/stem/body joins with stubs (50-55, 30-33);
  - wall notch at (38, 40);
  - one highlight dropped.
- Same.

**10 grapes**
- The drawing is identical to run 1 (IoU 0.99).
- Cutter FAIL: the same Voronoi honeycomb with triangles at (43, 44), (57, 44) and (50, 52). **The ellipse snap does not fire, because the touching circles are not separate closed loops.**
- Gate missed. Same.

**11 cherries**
- Drawing FAIL:
  - Gemini satisfied the stem rule by wrapping everything in a **sticker halo** (an outline about 3 mm outside the fruit, leaf and stems);
  - this is against "never a second line, border or halo";
  - the stems are single lines inside it.
- Cutter FAIL (`cherries_Z_fruit.png`):
  - it reads clearly as cherries (no molar), but **the cherry circles are not round**: a flat left side (62, 95-105), a lumpy right one (103, 100), and wobbly ridge width;
  - no ellipse snap, because each loop has a stem T-junction.
- **Better.** A customer would accept it.

**12 apple**
- Drawing FAIL (D11): the original is an oval red fruit with one leaf on the right. The drawing is a **stock apple icon with a stem it does not have**. It is clean and cute, but it is not the uploaded subject.
- Cutter **PASS**: faithful, smooth, the stem is ≥6 mm, notches rounded.
- Better. The customer accepts it (a likely "close enough").

**13 cake**
- Drawing FAIL: the cherry stem is now part of the outline, but as a **hollow tube 5.2 mm wide** (two parallel lines with a round end), not 60 px. Otherwise clean.
- Cutter FAIL (`cake_Z_cherry.png`):
  - the cream channel inside the stem is about 2 mm, so it fills with dough;
  - **the cherry's right side is a straight vertical ridge** (88.5, 69-75) and its top is a bridge, so it is not round;
  - wall ripple on the tier sides.
- Gate not flagged (5.2 mm is just under the target). Same.

**14 pudding**
- The drawing is almost identical to run 1: **the stem is still a single thin line** (the rule was ignored).
- Cutter FAIL (`pudding_Z_cherry.png`, `pudding_Z_plate.png`):
  - the stem is dropped;
  - **the cherry is an onion dome with a peak** (47, 21) and pinched at its base, with the top line crossing it with stubs (43-52, 30-31);
  - plate tips 3.9-4.0 mm at (9, 72) and (86, 72).
- **Gate missed** (run 1 fired thin). Same quality.

**15 icecream**
- Drawing FAIL:
  - double bowl rim (the one-rim rule was ignored);
  - about 10 drizzle bands;
  - wavy scoop edges.
- Cutter FAIL:
  - rim ridge 0.6 mm × 63 mm from the next line at (48, 66);
  - drizzle gaps.
- **Gate busy, now caught.**

### Faces/people
**16 pose**
- Drawing FAIL:
  - the outline is now closed, with the legs shortened (good);
  - the face is still fine-pen (small eyes with lash flicks, small lips): the 70 × 35 eye rule is ignored.
- Cutter FAIL (`pose_Z_face.png`):
  - eyes become two dashes;
  - lips one line;
  - jaw and hair lines scrambled;
  - 0.2 mm gaps at (50, 34) and (52, 20).
- **Gate missed.**

**17 redpants**
- Drawing FAIL: closed, but a fine-pen face, about 25 pleat and fold lines, thin inner lines.
- Cutter FAIL:
  - eyes are scribbles at (52-60, 17);
  - mouth a dash;
  - pleat clutter;
  - 24 sub-2 mm gaps.
- **Gate missed** (notes: 61 lines, not busy).

**18 portrait**
- Drawing FAIL: fine-pen face, thin lines, flat-cut bottom.
- Cutter FAIL:
  - eyes are solid dots;
  - brows and nose lost;
  - collar nub 3.0 mm at (39, 35).
- Gate off-picture, correct. Same.

**19 face**
- Drawing FAIL:
  - closed bust (good);
  - **lash flicks** kept;
  - small pupils;
  - small lips.
- Cutter FAIL:
  - the left eye has merged into the outline at (31, 33);
  - the right eye is a dash with a blob at (45, 32);
  - the left brow is dropped;
  - gaps 0.2-0.4 mm at (66, 34) and (62, 33).
- **Gate missed.**

### Objects
**20 cocktail**
- Drawing FAIL:
  - the straw is now part of the outline (good), but as a 5 mm hollow tube;
  - the foot has pointed tips.
- Cutter FAIL:
  - straw arm 5.0 mm (94, 30);
  - foot tips 4.2 mm with a solid slab foot (61-79, 101);
  - liquid line 1.8 mm from the wall (54, 66).
- Gate thin, correct. Slightly better.

**21 deodorant**
- Drawing FAIL: the cup has a **double rim ellipse**, and the bottle has a collar band (the rim rule was ignored).
- Cutter FAIL:
  - collar band 1.0 mm apart × 22 mm (36, 23);
  - the cup's inner rim is lost;
  - wall notches where the cup overlaps the bottle (47, 53) and (47, 76).
- Same.

**22 popper**
- Drawing FAIL:
  - the confetti is now a halo cloud holding about 50 specks (more faithful than run 1's molecule, but busy and haloed);
  - wavy tube string.
- Cutter FAIL: speck dots, 31 narrow gaps.
- Gate busy, correct.

**23 coffee**
- The drawing is the same as run 1 (PASS).
- Cutter FAIL (`coffee_Z_heart.png`): **the heart still has no point** (a U with radius about 3 mm at (61.5, 73)) and a shallow cleft. The lid and sleeve are clean (`coffee_Z_lid.png`).
- Same. The customer accepts it.

**24 bell**
- Drawing PASS: the clapper from the original is now drawn.
- Cutter FAIL (`bell_Z_mouth.png`):
  - the mouth ellipse's top is flattened (52-60, 70);
  - **the clapper is faceted, with a flat bottom** (55-60, 75);
  - bulges at the clapper's T-joins (48, 71) and (67, 70);
  - no ellipse snap, because the loop has T-junctions.
- The drawing got better and the cutter stayed the same. The customer accepts it.

**25 bishop**
- Drawing FAIL: the **inner copy of the outline** is still there (the line-icon rule was ignored).
- Cutter PASS: faithful.
- Same.

### Symbols
**26 trans**
- Drawing PASS.
- Cutter PASS: inner circle aspect 1.000, radius 8.44-8.49 mm.
- Same. Accepted.

**27 mfsymbol**
- Drawing FAIL:
  - the rings overlap into "∞";
  - **the "=" became "≡" inside it**;
  - inner copies of the ring band;
  - the line-icon rule was ignored, and an invented joining shape was added.
- Cutter PASS (`mfsymbol_Z_waist.png`):
  - faithful;
  - the inner band is now ≥4 mm from the wall (run 1: 1.7 mm);
  - the waist cusp is rounded;
  - bars about 3.5 mm apart.
  - Soft fault: chisel ridge ends.
- The customer would reject it, because the symbol is wrong.

### Scenes/plants
**28 flytrap**
- Drawing FAIL: a halo around the group again, 74 lines.
- Cutter FAIL: 45 narrow gaps.
- Gate busy, correct.

**29 goose**
- Drawing FAIL: **the beak is still replaced by a tulip** (anatomy), and the base is busy.
- Cutter FAIL: head hook 2.9 mm at (39, 25), and base clutter.
- Gate thin, correct.

**30 fallcat**
- Drawing FAIL: a blob ghost silhouette with no face and leaf stars embedded.
- Cutter FAIL: thin part 3.7 mm at (48, 31).
- Gate thin, now caught.

---

## Rule verdicts (run 2 changes)

| change | verdict | evidence |
|---|---|---|
| Line icons: outer edge of the band only | **Ignored** (0 of 3) | bishop still has the inner copy (IoU 0.84 with run 1); mfsymbol has inner ring copies plus an invented ≡; trans was already fine. Worse: Gemini now **adds halos/sticker edges** (cherries, popper, flytrap). |
| At most one rim/collar line, at most 3 texture lines | **Mostly ignored** (1 partial of 6) | icecream double rim plus about 10 drizzles; deodorant double cup rim plus collar band; cat about 15 stripes; pear double highlights; fox ear copies. Only sleepcat (keys 40 → about 6 rows) moved in the right direction. |
| Stems, strings, straws, whiskers: omit, or part of the outline 60 px wide | **Half worked** | **Whiskers: 2 of 2 removed** (rabbit, cat). Straws/strings/stems moved into the outline (cocktail, popper, cake) **but as hollow tubes of 35-45 px** (5 mm), not 60 px. Cherries were solved with a halo. **Ignored on pudding (single line) and pear (double line).** |
| Human-only eye and lip rules | **Worked for animals** (4 of 4), not for humans | Frog lips are gone (accepted). Panda, rabbit and cat keep round eyes. But the dog's open eyes became closed "^ ^" (a new expression change). The human size rules are still ignored on pose, redpants, portrait and face (fine pen, lash flicks). |
| Conversion: near-elliptical closed loops become true ellipses | **Works only on isolated loops**, 0 flips | Frog eyes and pupils aspect 1.00, trans 1.000. It does not fire on loops with a T-join or that touch: grapes, cherries, cake cherry, pudding cherry (part of the outline), bell clapper and mouth. Those are exactly the failing ones. |
| Conversion: busy gate on length/area over 0.15 mm/mm² | **Worked** | It newly catches cat and icecream (run-1 misses), with no false alarms. It does not catch redpants (pleats), which may be just under the threshold. |

## Remaining failure patterns (by pictures hit)

1. **Faces lost, with no gate** (9): pose, redpants, portrait and face (fine-pen human faces erased in conversion); cat (mouth turned into a stick and tongue); dog (expression changed by Gemini); goose (beak turned into a tulip); fallcat (no face); panda (soft: grin). With closed outlines, the gate now misses 3 of these.
2. **Loops with junctions are not round or fair** (7, conversion): grapes (honeycomb), cherries (flat sides), cake cherry (straight side), pudding cherry (onion), bell (flat ellipse top, faceted clapper), coffee (heart loses its point). This blocks 2 drawings that already pass (coffee, bell) and 4 near-misses.
3. **Doubled bands, inner copies and halos** (10, drawing): bishop, mfsymbol, cherries, popper, flytrap, icecream, deodorant, fox, sleepcat, pear (stem/highlights).
4. **Thin parts drawn as hollow 4-5.7 mm tubes or spikes** (9): cake, cocktail, pear, pudding (single line), strawberry2 calyx, goose head, fallcat, popper string, fox paw.
5. **Junctions broken or lines dropped in conversion** (6): panda (right body line dropped), rabbit (ear Y becomes a floating end 1 mm from the wall), fox (leg/tail Y becomes a notch), pear (knotted stem base), deodorant (overlap notches), face (eye merged into the wall). Free ridge ends are often cut flat or chiselled instead of round (frog, panda, mfsymbol; soft C12).
6. **Busy** (6): cat, sleepcat, icecream, popper, flytrap, redpants.

---

## Top 3 conversion fixes (ranked by flips)

1. **Never drop or break a drawn junction (T/Y/near-wall).**
   - Rule: a drawn ridge that comes within 2.5 mm of the wall or of another ridge either fuses into it with a G1 blend, or stays at least 2.5 mm away. A free end within 1.5 mm of a line is extended to touch it.
   - Never delete a ridge because it runs near the wall (panda x≈70).
   - Round all free ridge ends with a semicircular cap.
   - **Flips: panda cutter (→ accepted), rabbit cutter (→ accepted); fixes fox, pear and deodorant joins. +2 accepted.**
2. **Junction-tolerant primitive fitting.**
   - Split each loop at its junctions, fit a circle or ellipse arc to each arc segment (residual under 3 % of R), then re-join at the drawn junction points.
   - Keep drawn corners over 60° as corners (heart point and cleft).
   - For touching circles (grapes), detect circles on the drawing's inner (white) edges, offset them by half the stroke width, and rebuild from the circles instead of the medial axis.
   - Apply the same fit to outline bumps (the pudding cherry).
   - **Flips: coffee cutter and bell cutter (→ both accepted). Cherries, cake and pudding cutters become round (and accepted once their drawing rule lands); grapes is fixed. +2 accepted now, +3 with rule 1 below.**
3. **Face-loss gate plus a thin-part gate at 6 mm.**
   - Count the closed eye loops, pupils and mouth in the drawing and in the cutter, and flag on any loss or any eye turned into a dash.
   - Flag a thin part under 6 mm (not about 4 mm), plus any drawn circle whose aspect goes over 1.05 in the cutter.
   - Flips no quality verdict, but **makes the gate right on all 5 misses plus the borderline one** (pose, redpants, face, pudding, grapes, cake).

## Top 3 rule changes (ranked by flips), concrete wording

1. **Leave thin parts out instead of fattening them** (Gemini draws "60 px wide" as a 40 px tube or a halo):
   > "Leave out every stem, stalk, string, straw, whisker and antenna. A cherry on a cake or pudding is a plain circle sitting on top, with no stem. Two cherries are two circles that touch, with one short leaf on top. Never draw a line around the whole subject to hold thin parts together."
   - Flips: the cake and pudding drawings, and the cherries drawing (no halo). With conversion fix 2, all three become accepted.
   - Helps: cocktail (no straw), pear and popper.
   - **+3 accepted (with fix 2).**
2. **Single edge only, stated as a check, not a style** (the line-icon rule was ignored in this form):
   > "Before you finish, look for any two lines that run side by side at the same distance for more than 100 pixels. Delete the inner one. This removes inner copies of the outline, double rims, collars, bands and sticker borders. A thick black band in the original becomes ONE line along its outside edge. Do not add or change symbols: '=' stays two short bars and is not joined to anything."
   - Flips the bishop drawing (the cutter already passes, so it becomes accepted).
   - Helps the mfsymbol, deodorant, icecream, fox and flytrap drawings.
   - **+1 to +2 accepted.**
3. **Make the human face big, and keep eyes open or closed as they are**:
   > "If the picture shows a person and the face would be narrower than one-third of the drawing, crop to head and shoulders so the face fills at least one-third of the width. Eyes that are open in the original stay open, and closed eyes stay closed. Never draw eyelashes or lash flicks."
   - Fixes the dog's expression.
   - Gives the 4 human pictures face features that survive conversion (each still needs its own cleanup).
   - **+0 to +1 accepted** (face or portrait are the closest), but it removes the worst customer-visible failure.

**Projected:**
- Conversion fixes 1 and 2 plus rule 1: about 9 of 30 accepted (trans, frog, panda, rabbit, coffee, bell, cake, pudding, cherries).
- Adding rule 2: about 10, with bishop.
- Run 2 as delivered: 2 accepted (both drawing and cutter pass); 8 the customer would accept.
