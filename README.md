# CUT IT. Cookie cutter studio

Draw something or upload a picture, and get a 3D-printable cookie cutter (`.stl`).

The whole app is one file, `index.html`. It runs in the browser with no server and no install.

## Use it

- Open `index.html` in a browser, or
- host it with GitHub Pages: in the repository settings, turn on Pages for the main branch and the root folder. The app is then at `https://<your-user>.github.io/<repo>/`.

## What it does

- **Just draw.** The outside of the drawing becomes the cookie; everything inside becomes a pressed line. Strokes are smoothed, gaps close, unfinished outlines are completed, and lines are joined to the edge or to each other.
- **Upload.** The picture sits behind the canvas so you can trace over it. If a redraw server is set up (`server/`, see its README), the picture is first redrawn by an image model into a simple, bold drawing, which the app then traces for you; "Trace it myself" goes back to your picture.
- **Line, pressed area or hole.** Tap a closed shape inside the cookie to choose. A hole gets its own blade.
- **Always a working cutter.** Thin parts are rounded off, narrow slots are filled, and big pressed areas get stripes so they release from the dough.
- **3D preview and download.** One watertight `.stl`, mirrored so the cookie is not backwards.

## Cutter measurements

Set automatically; the only choice is the size (XS 4 cm, Mini 5.5 cm, Regular 8 cm, Large 10.5 cm).

| | |
|---|---|
| Type | one piece: blade, pressed lines and crossbars |
| Height | 10 to 12 mm, by size |
| Cutting edge | 0.9 mm at the tip, 1.6 mm at the base |
| Rim | 3.5 mm wide, 2 mm thick |
| Dough | 5 mm, lines pressed 2 mm deep |
| Pressed line width | 1.0 to 1.5 mm, by size |

These follow common 3D-printing guidance and commercial cutters of this kind. They have not yet been confirmed with a print-and-bake test.

## Printing and baking

- PLA or PETG, 0.2 mm layers, flat rim down, no supports.
- Roll the dough to 5 mm and dip the cutter in flour before each press.
- Wash by hand and keep dough contact short. 3D prints have small gaps between layers.

## What changes outside Claude

The app was built as a Claude artifact. Hosted anywhere else it still works, with three differences:

- **Gallery:** designs are saved in the browser only, not shared between people.
- **AI helper:** the "Cookie Monster AI" check (naming, tips, clutter removal) is hidden. It needs Claude's page runtime. To have it on your own hosting you would add a small server that holds an API key and change `aiCheck` in `src/app.js` to call it.
- **Download:** the `.stl` downloads directly through the browser.

## Develop

```
python3 build.py
```

This inlines `vendor/` and `src/` into `index.html`. Edit `src/template.html` (layout and styles) and `src/app.js` (everything else), then rebuild. `src/data.js` holds the example images.

## Notes

- "CUT IT." is a working title, and "Cookie Monster" is a Sesame Street character name. Pick your own names before publishing this widely.
- No licence has been chosen for the app's own code. Add a `LICENSE` file if you want others to reuse it.
- Third-party libraries in `vendor/`: Clipper (Angus Johnson, Boost Software License, see the header of `clipper.js`), earcut (ISC), three.js r128 (MIT), manifold-3d 3.5.4 (Apache 2.0). Their licence files are alongside.
