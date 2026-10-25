"""Exporte chaque .excalidraw en PNG via le canevas local (port 3737), puis remplit la marge."""
import base64, glob, json, os, sys, time, urllib.request
from PIL import Image

URL = "http://127.0.0.1:3737"


def post(chemin, corps):
    req = urllib.request.Request(URL + chemin, data=json.dumps(corps).encode(), method="POST",
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


dossier = sys.argv[1]
filtre = sys.argv[2] if len(sys.argv) > 2 else ""
for f in sorted(glob.glob(os.path.join(dossier, f"{filtre}*.excalidraw"))):
    els = json.load(open(f, encoding="utf-8"))["elements"]
    urllib.request.urlopen(urllib.request.Request(URL + "/api/elements/clear", method="DELETE"), timeout=30)
    post("/api/elements/batch", {"elements": els})
    time.sleep(0.8)
    rep = post("/api/export/image", {"format": "png", "background": False})
    png = f[:-len(".excalidraw")] + ".png"
    with open(png, "wb") as o:
        o.write(base64.b64decode(rep["data"]))
    im = Image.open(png).convert("RGBA")
    fond = Image.new("RGBA", im.size, (12, 26, 21, 255))
    fond.alpha_composite(im)
    fond.convert("RGB").save(png, optimize=True)
    print(os.path.basename(png), im.size)
