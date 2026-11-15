#!/usr/bin/env python3
"""Builds the single-file app: inlines the libraries, data and app code into index.html."""
from pathlib import Path
root = Path(__file__).parent
t = (root / "src/template.html").read_text()
parts = {
    "/*CLIPPER*/": "vendor/clipper.js",
    "/*EARCUT*/": "vendor/earcut.min.js",
    "/*THREE*/": "vendor/three.min.js",
    "/*ORBIT*/": "vendor/OrbitControls.js",
    "/*WASM*/": "vendor/manifold_wasm_b64.js",
    "/*MANIFOLD*/": "vendor/manifold_classic.js",
    "/*DATA*/": "src/data.js",
    "/*APP*/": "src/app.js",
}
for key, f in parts.items():
    t = t.replace(key, (root / f).read_text().replace("</script", "<\\/script"), 1)
(root / "index.html").write_text(t)
print(f"index.html written ({len(t):,} characters)")
