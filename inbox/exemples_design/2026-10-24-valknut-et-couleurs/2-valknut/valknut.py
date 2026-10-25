"""Valknut : trois triangles équilatéraux entrelacés (borroméens), symétrie d'ordre 3.

Usage : python valknut.py <dossier_sortie> [d] [w] [g]
  s = côté extérieur d'un triangle (fixé à 1000)
  d = distance centre global -> centre d'un triangle, en fraction de s
  w = largeur de la bande, en fraction de s
  g = jour entre deux bandes qui se croisent, en fraction de s
"""
import math
import sys
from pathlib import Path

from shapely.geometry import Polygon
from shapely.affinity import scale
from shapely.ops import unary_union

out = Path(sys.argv[1])
D = float(sys.argv[2]) if len(sys.argv) > 2 else 0.25
W = float(sys.argv[3]) if len(sys.argv) > 3 else 0.11
G = float(sys.argv[4]) if len(sys.argv) > 4 else 0.022

S = 1000.0
R = S / math.sqrt(3)          # rayon circonscrit
R_IN = R - 2 * W * S          # rayon circonscrit du trou (bande de largeur W*S)


def triangle(cx, cy, r):
    # pointe en haut (y vers le bas en SVG)
    return Polygon([(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
                    for a in (-90, 30, 150)])


bands = []
ROT = float(sys.argv[5]) if len(sys.argv) > 5 else 0
for a in (ROT, ROT + 120, ROT + 240):
    cx = D * S * math.cos(math.radians(a))
    cy = D * S * math.sin(math.radians(a))
    bands.append(triangle(cx, cy, R).difference(triangle(cx, cy, R_IN)))

# ordre cyclique borroméen : 0 passe sur 1, 1 sur 2, 2 sur 0
pieces = []
for i, band in enumerate(bands):
    over = bands[(i - 1) % 3]
    pieces.append(band.difference(over.buffer(G * S, join_style="mitre", mitre_limit=10)))




def path_d(geom, ox, oy):
    parts = []
    polys = geom.geoms if hasattr(geom, "geoms") else [geom]
    for p in polys:
        for ring in [p.exterior, *p.interiors]:
            pts = list(ring.coords)[:-1]
            seg = " ".join(f"{x - ox:.2f} {y - oy:.2f}".replace(".00", "") for x, y in pts)
            parts.append(f"M{seg}Z")
    return "".join(parts)


geom = unary_union(pieces)
if "--miroir" in sys.argv:
    geom = scale(geom, -1, 1, origin=(0, 0))
minx, miny, maxx, maxy = geom.bounds
d = path_d(geom, minx, miny)
vw, vh = maxx - minx, maxy - miny
out.mkdir(parents=True, exist_ok=True)
for name, color in (("encre", "#0C1A15"), ("papier", "#FAF8F3")):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw:.2f} {vh:.2f}">'
           f'<path fill="{color}" fill-rule="evenodd" d="{d}"/></svg>\n')
    (out / f"valknut-{name}.svg").write_text(svg)
print(f"viewBox {vw:.2f} x {vh:.2f}, pièces : {len(geom.geoms) if hasattr(geom, 'geoms') else 1}")
