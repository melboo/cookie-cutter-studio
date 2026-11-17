# Round 7 review: new test set (10 contemporary feminist illustrations), drawing and cutter

**Method:**
- I read the rubric in /home/claude/review/rubric.md, with the Bakerlogy references in /home/claude/review/ref/ as the standard.
- I checked the full-size drawings (/tmp/gz/png) and the cutter SVGs (/tmp/gz/out). Each SVG was rendered with rsvg-convert at up to 6x.
- I registered each SVG to its drawing: SVG coordinates = drawing px + about 21 px of padding, scale 1.00 (`round7_work/reg7.json`).
- Side-by-side zooms are in /home/claude/review/round7_work/: `NAME_Z_*.png` (left = drawing, right = cutter) and `NAME_pair.png`.
- Scale: widest side = 80 mm, about 6.2-8.7 drawing px per mm.
- **Coordinates below are drawing pixels** (/tmp/gz/png/NAME.png).
- "Drawing fault" means the fix is in the Gemini rules. "Conversion fault" means the fix is in the app.

## Faults common to all 10 cutters (conversion)

These apply to every cutter, so **no cutter passes**:

1. **Stair-stepped, faceted outlines and ridges** (C1/C11 Hard, C14 Hard).
   - The SVG paths are pixel-boundary polylines: 22-42% of all segments are 1-px axis steps (for example `L 116.5 150 L 117.5 151 L 128.5 152 ...`), with only a handful of Q curves.
   - At 4-6x zoom every curve shows steps and notches, and many joins show square stubs. Examples: uterus fallopian tube and ligament, pad top, venus ring (`venus_Z_left.png`).
2. **Corner knobs.** At concave corners the wall has small round bumps about 0.7-1 mm. They come from round line joins on tiny back-and-forth path segments. Example: all eight stem/cross corners on venus (`venus_Z_neck.png`), against clean corners in the drawing (C14).
3. **The wall is no thicker than the ridges** (C3 Hard).
   - Every SVG uses `stroke-width` 5.6-7.8 px, which is **0.85-0.92 mm**. Inner ridges measure 0.75-1.1 mm (median 0.9 mm).
   - The round-6 change (wall about 1.4 mm) is not in this pipeline.
4. **Small enclosed gaps turned into solid blobs** (C7/C9/C14). Wherever two drawn features sit closer than about 2 mm (lip opening, eye plus lashes, a fingertip touching a petal, nail filings, dress-fold slivers), the gap is filled solid dark. The result is filled black areas 2-5 mm across that are not in the drawing.
5. **No bridge layer** in the SVG, so C10 (floating ridges supported) can't be checked.

## Per-image verdicts

| # | Image | Drawing | Cutter | Main cause |
|---|---|---|---|---|
| 1 | uterus | FAIL (minor) | FAIL | conversion (common faults); drawing spacing |
| 2 | pad | FAIL | FAIL | drawing (wrong subject); conversion |
| 3 | lotus | FAIL | FAIL | both |
| 4 | nails | FAIL | FAIL | drawing (spike, filings); conversion makes a blob |
| 5 | hearts | FAIL | FAIL | drawing (far too detailed and thin) |
| 6 | stylish | FAIL | FAIL | drawing (lashes); conversion blobs |
| 7 | duo | FAIL | FAIL | drawing (open silhouette); conversion didn't reject it |
| 8 | heart | FAIL | FAIL | drawing (hairline, cluttered, 3D rim) |
| 9 | hands | FAIL | FAIL | drawing (thin connectors, crowded strands) |
| 10 | venus | **PASS** | FAIL | conversion only (steps, corner knobs, wall width) |

Summary: drawings 1/10 PASS; cutters 0/10 PASS.

### 1. uterus

**Drawing: FAIL (minor).** The silhouette is closed, the strokes are clean and even (0.82 mm), and the subject is instantly readable and symmetric. Two faults:
- **D5/D6, ligament** (both sides, about (150, 245) and (420, 245)): two parallel lines only about 1.5 mm apart, making a dough strip about 1.5 mm wide (the minimum is 3 mm spacing, 6 mm for parts). *Drawing fault.* Draw the ligament as one line, or omit it.
- **D5, vaginal rungs** (250-330, 400-590): six rungs with gaps of about 2.4 mm (minimum 3 mm). Use 4 rungs. *Drawing fault.*

**Cutter: FAIL.**
- **C14:** where the ligament meets the ovary and the uterus wall (about (150-180, 245-275)), there is a solid jagged block about 2 mm, not the drawing's clean thin joins (`uterus_Z_lig.png`). *Conversion.*
- **C1/C11:** stair-steps on the whole outline, the tube curls and the rungs (`uterus_Z_top.png`, `uterus_Z_vag.png`). *Conversion.*
- **C3:** the wall is the same width as the ridges. *Conversion.*

### 2. pad

**Drawing: FAIL.**
- **D11:** Gemini turned the winged pad into a cat-head/shield silhouette with two ears. The wings and pad outline are lost, so it no longer reads as a pad. *Drawing fault:* keep the source silhouette and invent nothing.
- **D3:** the outer stroke is about 2x the inner strokes (p90/p10 = 1.94).
- **D4/D5:** the stains are wobbly, irregular blobs, 6 of them; busy.
- **D7:** the inner pad outline merges tangentially into the outer outline at the top (about (230, 110)) and bottom right (about (470, 590)), leaving long tapering white slivers.

**Cutter: FAIL.**
- **C14 top merge:** at (180-320, 100-130) the merge becomes a stepped thick block (`pad_Z_top.png`).
- **C14 bottom merge:** at about (500, 590) the inner ridge ends in a square stub against the wall, with a notch (`pad_Z_bot.png`).
- Stair-steps on all stain loops (`pad_Z_blob.png`).
- Wall width = ridge width.

These are *conversion* faults, made worse by the drawing's tangent merges.

### 3. lotus

**Drawing: FAIL.**
- **D6:** the fingers at (30-110, 300-360) are about 3.5-4.5 mm wide (minimum 6 mm).
- **D7:** a tiny enclosed sliver between a fingertip and the petal base at about (105, 320), and a small petal lobe pocket at (450-470, 330-355); both near-misses under 1.5 mm.
- **D11 (soft):** the flower reads more like a pinecone or artichoke than a lotus. Petals should be pointed and spread, not stacked scales.
- *Drawing faults.* Merge fingers into a mitten shape, and keep features 3 mm apart.

**Cutter: FAIL.**
- The fingertip sliver is filled into a solid dark blob about 3 mm (`lotus_Z_fing.png`).
- The wall is lumpy around the fingertips; the petal lobe at (440, 340) is thickened.
- Stair-steps everywhere.
- Wall width = ridge width.

*Conversion* (blob fill, steps), triggered by the drawing's near-misses.

### 4. nails

**Drawing: FAIL.**
- **D6:** the right forearm tapers to a sharp spike at about (540, 440), and the nail-file tip overhangs as a thin sliver at about (440, 205).
- **D9:** the "filings" are a row of about 6 tiny spikes and triangles at (340-440, 245-280).
- **D11 (soft):** it reads as two hands, but the filing action is unclear.
- *Drawing faults:* omit the filings, end the arm with a blunt 6 mm+ edge, and keep the file inside the silhouette.

**Cutter: FAIL.**
- The filings became one solid, jagged dark mass about 3 x 15 mm on the cutting edge (`nails_Z_filings.png`): C9/C14. *Conversion.*
- The spike survives as a sharp cutter point: C8, from the drawing.
- Stair-steps; wall width = ridge width.

### 5. hearts (woman curled up, hair flying)

**Drawing: FAIL** (badly; this is not Bakerlogy line art).
- **D3:** 0.44 mm lines, ratio 2.0.
- **D5:** more than 30 interior strokes (dress folds, limbs, face); 36 free ends.
- **D6:** spiky hair with about 15 thin points; thin toes.
- **D9/D10:** sketchy fold lines and small closed triangles in the dress; a tiny face.
- **D11 (soft):** the hearts motif of the original is dropped.
- *Drawing faults.*

**Cutter: FAIL.**
- The face (eyelid, nose, lips) merged into one dark blob at about (375, 255) (`hearts_Z_face.png`).
- Dress-fold slivers became filled black wedges (`hearts_Z_dress.png`).
- A ridge is 0.7 mm from the wall at about (225, 477), and another 1.75 mm at about (273, 512).
- Hair spikes are kept as thin points.
- Stair-steps; the design is illegible at 300 px (C13).

Mostly a *drawing* fault; the blob fill is *conversion*.

### 6. stylish (woman, turtleneck)

**Drawing: FAIL.** This is close to good: clean single-weight portrait, closed silhouette, sparse. The faults:
- **D9:** eyelashes, about 4-5 tiny strokes per eye, and filled pupils.
- **D6:** the right-eye lashes stick out through the face outline as thin spikes at about (425-445, 175-195).
- **D7:** the lip opening is a closed sliver about 1.5 mm high at about (380, 300).
- **D3:** ratio 1.5, with thick brows and lips.
- *Drawing faults:* no lashes, an open-ring or single-dot pupil, and a mouth drawn as one line or with an opening of at least 3 mm.

**Cutter: FAIL.**
- The lashes and outline merged into a dark blob on the cutting edge (`stylish_Z_lash.png`).
- The left eye, lashes and brow merged into a blob.
- The lip opening is filled solid (`stylish_Z_lips.png`).
- A ridge is 0.96 mm from the wall at about (420, 297).
- Stair-steps; wall width = ridge width.

### 7. duo (two women)

**Drawing: FAIL.**
- **D2:** the silhouette is **open**. The right body line stops at (550, 520) and the bottom line stops at (290, 677); the lower body is not enclosed.
- **D5/D9:** fine double brows, lash flicks, filled pupils and 0.5 mm lines.
- **D3:** ratio 1.6.
- *Drawing fault.*

**Cutter: FAIL.**
- The **cutting path is not closed** (C1). The open body lines are drawn as dangling wall segments outside the cookie; the fill covers only the heads and the right shoulder (`duo_Z_body.png`). *Conversion fault:* it should reject or close the drawing, not output a dangling wall.
- The left face's eye, brow and hair line merged into a blob about 5 mm at about (150, 230); the lips are filled solid (`duo_Z_face.png`).
- A ridge fragment about 2 mm long at about (231, 213) (C9).
- Stair-steps; wall width = ridge width.

### 8. heart (crowd of women in a heart)

**Drawing: FAIL** (it should have been rejected).
- **D1:** hairline grey strokes about 0.27 mm; 98% of the ink is anti-aliased grey.
- **D2/D10:** a doubled, 3D-extruded heart rim.
- **D5:** about 11 figures and hundreds of strokes.
- **D9:** badges ("ooo"), necklace beads, a flower brooch.
- **D3:** fails.
- *Drawing fault.* This subject must be simplified to at most 3 figures, or to a heart with one or two iconic heads.

**Cutter: FAIL.**
- Faces, hair and clothes became large solid dark fills (ridge widths p90 2.7 mm).
- The double rim makes a ridge hugging the wall.
- It is illegible as a cookie (C13).
- Mostly a *drawing* fault.

### 9. hands (two hands framing a face)

**Drawing: FAIL.**
- **D6/D7:** the top hand joins the head only through a thin strand drawn as two lines about 1 mm apart, at (330-370, 190-240).
- **D2:** the head is open at the bottom (the hair ends at (240, 515) and (420, 525) stop short of the lower hand).
- **D5/D8:** about 10 parallel hair strands about 1-1.5 mm apart, many with free ends close to other lines.
- **D3:** ratio 1.6.
- *Drawing faults.*

**Cutter: FAIL.**
- The top-hand connection is a dough sliver under about 1 mm (C8, will break) (`hands_Z_neck.png`).
- The open neck area between the hair and the lower hand is filled with dough that isn't in the drawing (`hands_Z_bottom.png`). *Conversion invented this region.*
- Ridges sit 0.6-1.2 mm from the wall at 7 places along the hair and hand, for example (263, 249), (314, 253), (373, 249), (412, 306), (263, 320), (437, 411), (244, 430) (C5).
- Hair strands are 1-1.5 mm apart (C5).
- Stair-steps; wall width = ridge width.

### 10. venus (female symbol)

**Drawing: PASS.** It is one closed silhouette, with even 0.8 mm strokes, a 7 mm ring band and an 8 mm stem. It is symmetric and iconic. (The ring's hole becomes an imprinted circle, which is fine: compare the Bakerlogy teabag hole.)

**Cutter: FAIL** (conversion only):
- **C11:** stair-stepped, faceted ring (`venus_Z_left.png`). The rings must be true circles.
- **C14:** round knobs at the 8 concave corners of the stem and cross (`venus_Z_neck.png`).
- **C3:** wall 0.89 mm, the same as the ridges.

This is the cleanest test of the converter: with a perfect drawing, the cutter still fails on vectorisation alone.

## Fault ownership summary

| Fault type | Drawing (Gemini) | Conversion (app) |
|---|---|---|
| Wrong or invented subject (pad) | x | |
| Open silhouette (duo, hands) | x | x (should reject/close, not leave a dangling wall or invent fill) |
| Too much detail, thin or grey lines (heart, hearts, duo) | x | |
| Thin parts and connectors (lotus fingers, nails spike, hands strand, uterus ligament) | x | x (should flag necks under 6 mm) |
| Lashes, filled pupils, filings, near-miss slivers | x | x (fills them into blobs) |
| Stair-step vectorisation, corner knobs | | x (all 10) |
| Wall not thicker than ridges | | x (all 10) |

## Top 3 changes that would fix the most failures

1. **Conversion: replace pixel-boundary tracing with smooth curve fitting, and draw the wall properly.** This fixes C1/C11/C14 on all 10, and C3 on all 10; venus would pass.
   - Skeletonise each stroke to a centreline.
   - Fit Béziers with an error tolerance of about 0.3 px and a corner threshold (potrace-style alphamax about 1.0, or a Schneider fit after Chaikin smoothing).
   - Fit circles and ellipses to closed near-round loops.
   - Then render the inner ridges as a constant 0.9 mm stroke, and the cutting edge as a 1.4 mm constant-width offset of the smoothed outline, with mitre-limited or round joins on a path that has no back-tracking micro-segments. That removes the corner knobs.
2. **Gemini rules plus an automatic drawing gate before conversion.** This fixes the drawing fails on 9 of 10 and the blob/neck consequences in the cutters.
   - **Prompt:**
     - One closed outer silhouette, keeping the source's outline shape (no invented ears or wings).
     - Bold uniform black lines, about 1 mm at 8 cm.
     - At most about 12 interior strokes and at most 2 figures.
     - Lines at least 3 mm apart; no part narrower than 6 mm; no thin connecting strands.
     - No eyelashes, filled pupils, stubble, filings, hair strands, fold hatching or badges.
     - Mouth and eyes as one line, a ring of at least 4 mm, or a single 2 mm dot.
   - **Gate:** reject and redraw when any of these holds:
     - the silhouette is open (flood fill reaches the interior)
     - median stroke under 0.6 mm or more than 20% grey ink
     - more than 20 skeleton free ends
     - any parallel lines under 2.5 mm apart
     - any neck under 6 mm
     - the silhouette IoU with the source subject is under about 0.7
3. **Conversion: never fill gaps into solid blobs; simplify instead, and refuse open outlines.**
   - When two features are under 2.5 mm apart, keep the larger or merge them onto one centreline, and drop the small one (lashes, filings, lip opening, fingertip slivers).
   - Never output a solid dark area wider than about 2 mm, except an intentional dot.
   - If the outline can't be closed with a short bridge (under about 5 mm), fail the job (duo, hands) rather than leaving dangling wall or inventing dough.
   - Flag any dough neck under 6 mm (hands, uterus ligament, lotus fingers).

**Overall:** none of the 10 reaches Bakerlogy quality yet. venus and uterus are closest: venus needs only fix 1, and uterus needs fix 1 plus a simpler ligament and fewer rungs.
