# t30c review: run 3 of the same 30 pictures (new SYSTEM_LINEART rules + along-wall pull limited to 2.8 mm)

**Inputs**
- Originals: `/tmp/t30/orig`.
- Run 3: drawings in `/tmp/t30c/png`, cutters in `/tmp/t30c/out`, sheets in `/tmp/t30c/sheet{1,2,3}.png`, gate notes in `/tmp/t30c/notes.txt`.
- Compared against `t30_review.md` (run 1) and `t30b_review.md` (run 2).

**Method**
- The run-2 scripts were copied to `t30c_work/` and repointed to `/tmp/t30c`.
- `NAME_pair.png` shows the drawing and the cutter at 20 px/mm in SVG mm. `G_*.png` puts two pairs on one sheet. `NAME_Z_*.png` are zooms.
- `meas_out.txt` lists parts thinner than 6 mm and cream gaps under 2 mm. A w0.2 on a straight wall is anti-aliasing and is ignored.
- C2 (scale) passes on all 30.

**Drawing change from run 2 (IoU of the drawings):**
- About the same: grapes 0.99, coffee 0.93, pudding 0.93, cake 0.88.
- Half the set changed completely (IoU 0.04 to 0.2): panda, frog, cat, sleepcat, apple, all 4 people, mfsymbol, flytrap, goose, fallcat.
- So most of the run-to-run difference is still Gemini sampling, not the rules.

---

## Per picture (drawing / cutter / gate / vs run 2)

### Animals

**1 panda: drawing FAIL, cutter FAIL. Gate MISSED. Worse.**
- Drawing:
  - **solid black ears, arms, legs and eye patches** (D1, filled areas far larger than 3 mm);
  - the head tuft is back.
- Cutter:
  - the filled areas turn into outline lobes, with a double wall at the feet (33, 82) and (66, 82);
  - the eye patches become wobbly rings with no pupils, so the face is blank;
  - a tuft stub at (46, 15);
  - an arm ridge 0.8 mm from the wall at (70, 57).
- The gate does not detect fills.

**2 fox: drawing FAIL, cutter FAIL. Gate fine. Same.**
- The drawing is nearly identical to run 2: fine strokes and crowded inner ears.
- Cutter:
  - inner ear ridges 1.2 mm from the wall at (18, 14), (59, 14) and (53, 9);
  - the leg/tail notch is still there;
  - paw gap 0.2 × 14 mm at (56, 66);
  - eyes become lumpy rings.

**3 dog: drawing FAIL, cutter FAIL. Gate fine. Drawing better, cutter same.**
- Drawing: the eyes are **open again** (the new rule works), but it has fine-pen strokes, about 25 inner lines, brow flicks and tick toes.
- Cutter:
  - solid pupils with a highlight become "C" hooks, so the gaze is lost;
  - the two forehead spots are dropped;
  - toe stubs;
  - tail tip 3.3 mm at (72, 59);
  - lines 0.8-1.4 mm apart at (27, 21), (47, 24) and (44, 57).

**4 frog: drawing PASS (soft), cutter FAIL. Gate fine. Worse (the cutter flips back).**
- Drawing: the highlight is back in the solid 8 mm pupils, against the "no highlight" rule. The nostrils are now dashes.
- Cutter (`frog_Z_eye.png`): each pupil becomes a **lumpy, off-centre, triangular ring** about 3 × 3.5 mm (C7, C11). In run 2 the pupils were clean rings with aspect 1.00.
- A customer would still accept it.

**5 rabbit: drawing PASS (soft: eye highlight), cutter FAIL. Gate fine. Same.**
- Cutter (`rabbit_Z_earY.png`): **the same broken Y where the ear meets the head**. The ridge (57-62, 42-50) ends with a chisel end about 1 mm from the wall at (62, 41). Gap w0.6 at (63, 41).
- The customer accepts it.

**6 cat: drawing FAIL, cutter FAIL. Gate busy, right. Same.**
- Drawing: about 16 stripes, toe lines, and eyes drawn as an eye ring plus a pupil with a highlight.
- Cutter:
  - eyes are empty double rings, 0.4-0.6 mm apart × 22 mm at (34, 33) and (53, 33);
  - **the nose and mouth become a stick plus a tongue again**;
  - stripe stubs.

**7 sleepcat: drawing FAIL, cutter FAIL. Gate correct (no longer busy). Better.**
- Drawing: much cleaner. A single keyboard frame, 4 key lines plus 1 bar, closed eyes kept closed. The one fault is the nose and mouth: they are about 2 mm, crammed less than 1 mm from the chin line (D5, D9).
- Cutter (`sleepcat_Z_face.png`):
  - the nose and mouth become a "V" spur on the chin line;
  - the inner line of the front ear is dropped.
- The customer accepts it (it reads at arm's length).

### Food

**8 strawberry2: drawing FAIL, cutter FAIL. Gate MISSED (run 2 flagged it thin). Worse.**
- Drawing: **a new sticker halo around both berries** (the no-halo rule was ignored), and the calyx is still spiky.
- Cutter:
  - the halo's inner line becomes **a ridge 0.2 mm from the wall over 76 mm** at (75, 73), which looks like a doubled wall;
  - the calyx is scrambled into loops and dashes.

**9 pear: drawing FAIL, cutter FAIL. Gate MISSED. Same.**
- Drawing: the stem is **still two parallel lines** (the stem rule was ignored for the third time), and the leaf veins cross.
- Cutter:
  - stem 4.9 mm at (60, 15);
  - pointed wall notch where the leaf meets the body (38, 40);
  - leaf join gaps.

**10 grapes: drawing FAIL, cutter FAIL. Gate MISSED. Same.**
- The drawing is identical to runs 1 and 2 (IoU 0.99), and so is the honeycomb cutter.

**11 cherries: drawing FAIL, cutter FAIL. Gate MISSED (halo). Same.**
- Drawing: **the halo is still there**, the stems are kept, and the halo is drawn with a thicker stroke.
- Cutter:
  - a ⊗ knot where the stems meet (84, 51);
  - the cherry circles are not round.
- The customer still accepts it.

**12 apple: drawing PASS (soft), cutter FAIL. Gate MISSED. Drawing better, cutter worse.**
- Drawing: **now faithful** to the oval fruit with its single leaf (run 2 drew a stock apple). There is a small kink at (40, 51).
- Cutter:
  - **the leaf's inner edge is dropped**, so the leaf merges into the outline and reads as a whale tail;
  - leaf tip 3.3 mm at (100, 30).
- The customer would reject it.

**13 cake: drawing PASS, cutter FAIL. Gate fine. Better.**
- Drawing: **the cherry is a plain circle** (the new rule works), and the rest is clean.
- Cutter (`cake_Z_cherry.png`):
  - the cherry's top half becomes an outline bump with onion shoulders, so it is not round (C11);
  - the lower half is a ridge;
  - the rest is faithful (`cake_Z_right.png`).
- The customer accepts it.

**14 pudding: drawing PASS, cutter FAIL. Gate fine. Better.**
- Drawing: **the stem is gone and the cherry is a circle**. In run 2 the stem was a single line.
- Cutter (`pudding_Z_cherry.png`):
  - the cherry is pinched at the waist (45 and 54, y 30);
  - a straight chord bar lies against the top wall at (45-54, 31.5), with a cream gap of about 0 (C5);
  - there is no peak any more.
- The customer accepts it.

**15 icecream: drawing FAIL, cutter FAIL. Gate busy, right. Same (busier).**
- Drawing: a double bowl rim and about 30 drizzle loops.

### Faces/people

**16 pose: drawing FAIL, cutter FAIL. Gate MISSED. Same.**
- **The crop rule was ignored**: this is still a full figure with a face about 10 % of the width, drawn in fine pen.
- Cutter: one eye is a dot, the other eye is lost, and the mouth is scrambled.

**17 redpants: drawing FAIL, cutter FAIL. Gate right (open 18 %, busy). Better.**
- Drawing:
  - **cropped to head and shoulders** (the rule works);
  - but it has eyeliner/lash wings, fine pen, and shoulder lines that run off the picture.
- Cutter:
  - the eyes become closed "fish" loops with no pupil;
  - the shoulder is cut off arbitrarily;
  - 37 gaps under 2 mm.

**18 portrait: drawing FAIL, cutter FAIL. Gate right (thin). Better.**
- Drawing: cropped and closed, but with lash flicks and fine pen.
- Cutter:
  - the right eye is an empty almond, and the left eye merges into the outline;
  - collar spike 4.7 mm at (37, 64);
  - 25 gaps.

**19 face: drawing FAIL, cutter FAIL. Gate right (runs off the picture). Better (the gate is now right).**
- Drawing: cropped, but it runs off the bottom and has lash flicks.
- Cutter:
  - empty almond eyes;
  - the left eye merges into the outline at (31, 40);
  - the neck becomes an invented tube;
  - tip 3.1 mm at (78, 67).

### Objects

**20 cocktail: drawing FAIL, cutter FAIL. Gate MISSED (run 2 flagged it thin). Same.**
- Drawing: **the straw is still a hollow tube**, crossing the glass and sticking out (the straw rule was ignored).
- Cutter:
  - straw arm 5.4 mm at (92, 28);
  - the straw is drawn as twin ridges inside the glass;
  - foot tips 5.4 mm.

**21 deodorant: drawing FAIL, cutter FAIL. Gate fine. Same.**
- Drawing: a double cup rim and a double collar band (one-line-per-edge was ignored).
- Cutter:
  - collar ridges 1.2 mm apart × 20 mm at (36, 23);
  - the cup's inner rim is dropped;
  - notches where the cup meets the bottle at (47, 53) and (47, 76).

**22 popper: drawing FAIL, cutter FAIL. Gate busy, right. Same.**
- Drawing: a halo again, a confetti cloud, and a doubled string.
- Cutter: speck dots and 36 narrow gaps.

**23 coffee: drawing PASS, cutter FAIL. Gate fine. Same.**
- Cutter (`coffee_Z_heart.png`): **the heart still has a round U bottom** instead of its point, and only a shallow cleft.
- The customer accepts it.

**24 bell: drawing PASS, cutter FAIL (minor). Gate fine. Better.**
- Cutter (`bell_Z_mouth.png`):
  - the clapper is now a smooth arc (run 2: faceted, with a flat bottom);
  - the only fault left is a wobble of about 0.3 mm on the top of the mouth ellipse between the clapper joins (47-66, 70).
- One fix away from passing. The customer accepts it.

**25 bishop: drawing FAIL, cutter PASS. Gate fine. Same.**
- Drawing: the inner copy of the band is still there (the one-edge check was ignored for the third time).
- Cutter: faithful.
- The customer accepts it.

### Symbols

**26 trans: drawing PASS, cutter PASS. Gate fine. Same.**
- Accepted.

**27 mfsymbol: drawing FAIL, cutter FAIL. Gate right (open 57 %). Cutter worse.**
- Drawing:
  - **the "=" is two separate bars now** (the rule works);
  - but ♀, = and ♂ are three disconnected parts, the ♂ is cut off at the canvas edge, and the rings still carry inner copies.
- Cutter: **only the ♀ is kept**, so the subject is lost.
- The customer would reject it.

### Scenes/plants

**28 flytrap: drawing FAIL, cutter FAIL. Gate right (open 63 %). Same.**
- Drawing: three disconnected pods with doubled bands.
- Cutter: keeps one pod.

**29 goose: drawing FAIL, cutter FAIL. Gate right. Same.**
- Drawing: an odd looped beak and tulips at the base.
- Cutter: a hooked head and spiky feet; thin parts of 3.8-5.8 mm.

**30 fallcat: drawing FAIL, cutter FAIL. Gate right. Drawing better.**
- Drawing:
  - **the cat now has a face** (closed eyes kept);
  - but whisker strokes are kept, the leaves float apart from the cat, and it is fine pen.
- Cutter:
  - the face is scrambled;
  - a leaf star is embedded in the outline at (76, 67);
  - thin parts of 3.6 mm.

---

## 1. Pass rates per category, runs 1 → 2 → 3

| category | n | drawing pass | cutter pass | both pass | a customer would accept the cutter as-is |
|---|---|---|---|---|---|
| animals | 7 | 1 → 3 → 2 (frog, rabbit) | 1 → 1 → **0** | 0 → 1 → **0** | 0 → 2 → **3** (frog, rabbit, sleepcat) |
| food | 8 | 0 → 0 → **3** (apple, cake, pudding) | 0 → 1 → 0 | 0 → 0 → 0 | 0 → 2 → **3** (cherries, cake, pudding) |
| faces/people | 4 | 0 → 0 → 0 | 0 → 0 → 0 | 0 → 0 → 0 | 0 → 0 → 0 |
| objects | 6 | 2 → 2 → 2 (coffee, bell) | 1 → 1 → 1 (bishop) | 0 → 0 → 0 | 3 → 3 → 3 (coffee, bell, bishop) |
| symbols | 2 | 1 → 1 → 1 (trans) | 1 → 2 → **1** (trans) | 1 → 1 → 1 (trans) | 1 → 1 → 1 (trans) |
| scenes/plants | 3 | 0 → 0 → 0 | 0 → 0 → 0 | 0 → 0 → 0 | 0 → 0 → 0 |
| **total** | 30 | **4 → 6 → 8** (27 %) | **3 → 5 → 2** (7 %) | **1 → 2 → 1** (3 %) | **4 → 8 → 9** (30 %) |

Reading the table:
- Drawings improved again (+2).
- Strict cutter passes fell from 5 to 2. Two causes:
  - Gemini put highlights back into the frog's pupils, and the conversion handles a pupil with a highlight badly;
  - the cutter that passed in run 2 lost its subject (mfsymbol: Gemini split the symbol into three loose parts).
- Customer acceptance moved up by 1.
- **The 4 drawings that pass and only miss on the cutter (cake, pudding, coffee, bell) all fail on the same conversion fault: a round loop with a junction is not kept round.**

**Gate:**
- It flagged 10, with no false alarms.
- It now catches face, redpants and portrait, through the crop side effects.
- It misses 8: panda (fills), strawberry2 (halo), pear (4.9 mm stem), grapes, cherries (halo), apple (3.3 mm tip), cocktail (5.4 mm straw) and pose (tiny face).
- The thin check is effectively off below about 10 mm² (cocktail, apple, dog and pear were not flagged).

## 2. New rules: took effect or ignored

| rule | verdict | evidence |
|---|---|---|
| Leave out stems, strings, straws, whiskers | **Partial (3 of 7)** | Pudding stem gone, cake stem gone, whiskers still gone (rabbit, cat). **Ignored:** pear (double stem, third run), cocktail (straw tube), popper (string), cherries (stems). Fallcat has whisker strokes. |
| A cake cherry is a plain circle | **Worked (2 of 2)** | cake, pudding |
| No halo or border | **Ignored (0 of 3, plus 1 new)** | Cherries and popper still haloed; strawberry2 **gained** a halo. |
| One line per edge (delete the inner line; "=" stays two bars) | **Ignored, except the "=" clause** | Bishop inner copy (third run), mfsymbol ring copies, deodorant double rims, icecream double rim, cocktail straw band, flytrap bands. The "=" is two separate bars, but the symbol fell apart into 3 loose parts. |
| Open eyes stay open, closed stay closed | **Worked** | Dog eyes open again; sleepcat and fallcat closed. |
| No lashes | **Ignored on people (0 of 4)** | Eyeliner wings or lash flicks on redpants, portrait, face and pose. The "no highlight" rule for animal pupils was also ignored (frog, rabbit, cat, dog, panda). |
| Crop small human faces to head and shoulders | **Worked (3 of 4)** | redpants, portrait, face. Ignored on pose. The cropped drawings then run off the canvas or end open (face, redpants). |
| Conversion: along-wall pull only within 2.8 mm | **Neutral to slightly negative** | The panda drawing changed, so the run-2 body-line case cannot be retested; the arm lines are kept. But the halo's inner line now survives as a ridge 0.2 mm from the wall (strawberry2), and the rabbit ear ridge still floats about 1 mm from the wall. |

New regressions caused by Gemini, not by the rules:
- solid black fills (panda);
- the symbol split into loose parts (mfsymbol, flytrap).

## 3. Stable faults and random Gemini variation

**Stable across all 3 runs** (fix these, they will not go away by resampling):
- Drawing:
  - grapes (identical drawing, honeycomb);
  - pear double stem;
  - bishop inner copy;
  - cocktail straw tube;
  - deodorant double rims;
  - icecream rim and drizzle;
  - popper confetti and halo;
  - fox ear crowding;
  - cat stripes;
  - goose;
  - fine-pen human faces with lash flicks;
  - cherries halo (runs 2 and 3).
- Conversion:
  - **loops with junctions are not round** (cake and pudding cherries, cherries, bell ellipse, coffee heart point);
  - **eyes with a solid pupil plus highlight turn into empty or lumpy rings** (cat, dog, fox, frog, panda, all humans);
  - **a ridge near a junction or the wall ends floating 0.2-1.5 mm away** (rabbit ear Y, fox, deodorant, strawberry2 halo);
  - a free ridge end is cut flat;
  - the cat nose and mouth become a stick plus a tongue.

**Random Gemini variation** (changes run to run regardless of the rules):
- panda: outline vs solid fills;
- frog: pupil highlight there or not;
- apple: stock icon vs faithful;
- strawberry2: halo appears;
- mfsymbol: joined vs loose parts;
- dog: expression;
- sleepcat: busy vs clean;
- fallcat: face present or not;
- portrait and face: framing.

About 40 % of the verdict churn between runs 2 and 3 is this kind of variation.

## 4. Top 3 fixes, ranked by flips

**Conversion**
1. **Junction-tolerant circle, ellipse and corner fitting.**
   - Split each loop at its T and Y junctions. Fit circle or ellipse arcs to the pieces (residual under 3 % of R). Re-join at the drawn junction points.
   - Keep drawn corners over 60° (the heart point and cleft).
   - Where a circle sits on the outline (cake and pudding cherries), keep the circle's own lower arc and do not add a chord bar.
   - **Flips cake, pudding, bell and coffee to both pass (+4)**; cherries becomes round.
2. **Junction and near-wall resolution.**
   - A ridge end within 1.5 mm of a line or the wall is extended to meet it with a G1 blend.
   - A ridge running within 2 mm of the wall over more than 5 mm is merged into the wall, not kept.
   - Never drop the leaf's inner edge where it meets the body.
   - Round all free ends.
   - **Flips rabbit (+1) and apple (+1, with the leaf tip widened to 6 mm)**; fixes strawberry2's double wall and the deodorant notches.
3. **Pupil handling.**
   - Fill highlight holes inside solid blobs under about 10 mm.
   - Emit each pupil as a circle-fitted ring (opening 2.5 mm or more) centred on the blob's centroid, or as a single dot.
   - Treat any filled area larger than about 10 mm² as "outline only".
   - **Flips frog (+1)**; restores the gaze on dog, cat and fox, and makes panda usable.
4. (Gate, no quality flips, but it should be done.) Thin-part check at 6 mm width regardless of area; halo detection (an outline-parallel ridge within 3 mm over more than 30 % of the perimeter); filled-area check; human face width under 1/3. This would correct all 8 misses.

**Rules**
1. **Make the thin-part rule per-subject and absolute**:
   > "Fruit: never draw a stem. Cherries = two touching circles plus one leaf. Pear = body plus one leaf, no stem. A drink = glass only, no straw. A strawberry calyx = one rounded cap with 3 to 5 round lobes. Never outline the whole subject a second time."
   - Flips the cherries drawing (both pass with conversion fix 1) and the pear drawing (cutter likely passes). Helps strawberry2, cocktail and popper.
   - **+2 to +3.**
2. **Stop asking Gemini to un-double icon bands; route icon originals around it.**
   - When the original is a 2-3 colour flat icon (bishop, trans, mfsymbol, coffee), trace the original's outer edge plus its real holes directly, or give Gemini a pre-traced outline.
   - The one-edge rule has been ignored in 3 of 3 runs.
   - **Flips bishop (both) and mfsymbol (both): +2.**
3. **No fills, no highlights, stated as a final check**:
   > "Before you finish: the only solid black areas are pupils, and every pupil is a plain black disc with no white spot. Dark parts of the animal (panda ears, legs, patches) are outlines only."
   - Flips the panda drawing (the cutter then likely passes, as its run-2 fault came from a different drawing).
   - Removes the frog and rabbit softs and the dog and cat pupil problem.
   - **+1 to +2.**

## 5. Ceiling estimate with Gemini as the drawing model

- **Strict Bakerlogy (drawing and cutter both pass):**
  - About 9-10 of 30 (30-33 %) with the three conversion fixes plus rules 1 and 3: trans, cake, pudding, bell, coffee, rabbit, frog, cherries, apple, plus panda or pear on a good sample.
  - About 12 of 30 (40 %) if icon originals bypass Gemini (bishop, mfsymbol).
- **Customer accepts as-is:** about 13-15 of 30 (45-50 %).
- **What Gemini will not reach:**
  - people (0 of 4 in all 3 runs: fine pen, lashes and crops ignored);
  - busy or multi-object scenes (flytrap, popper, icecream, fallcat, goose);
  - textured animals (cat, fox, dog: line counts ignored).
  - That is 12 pictures where the right outcome is the gate refusing, not a pass.
- **Best-of-3 sampling:** because about 40 % of the churn is sampling, generating 3 drawings and selecting with the gate would add roughly +2 to +3 more (frog, panda, apple, sleepcat and strawberry2 all had a good sample in some run).
- **Overall:** a realistic Gemini ceiling on this set is about **40 % strict and about 55 % customer-accept**. Past that needs a different or fine-tuned drawing model, or a dedicated human-face path.
