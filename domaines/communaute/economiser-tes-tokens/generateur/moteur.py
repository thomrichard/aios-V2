"""Moteur de dessin Excalidraw : style tableau de formation, charte vert pin."""
import json
import random

W, H = 1600, 900
BG = "#0C1A15"      # pin 950
PAPER = "#FAF8F3"   # papier
MUTED = "#8DA399"   # neutre verdi
AMBRE = "#D9A441"   # accent
PIN = "#83BBA4"     # vert clair
CODE = "#10241C"    # pin 900, blocs de code
DIM = "#2E4A3C"     # traits discrets

random.seed(7)

# Largeurs Excalifont mesurées dans le navigateur, pour 100 px
WID = {"0": 66.4, "1": 42.7, "2": 70, "3": 60.8, "4": 58.5, "5": 61.8, "6": 64, "7": 55.8, "8": 63.6, "9": 62.9,
       " ": 40, "!": 31.4, "\"": 37.1, "#": 78.3, "$": 72.1, "%": 92.8, "&": 71.8, "'": 21.8, "(": 44.1, ")": 40.2,
       "*": 52.5, "+": 55, ",": 25.7, "-": 41.1, ".": 27.4, "/": 56.1, ":": 26.4, ";": 29.8, "<": 55, "=": 55,
       ">": 55, "?": 46.6, "@": 82.9, "A": 67.6, "B": 76.1, "C": 62.9, "D": 78, "E": 70.7, "F": 66.1, "G": 78,
       "H": 57.3, "I": 54.5, "J": 56.9, "K": 61.3, "L": 54.3, "M": 76.6, "N": 63.2, "O": 76.7, "P": 69.8, "Q": 76.8,
       "R": 73.6, "S": 62.2, "T": 85.7, "U": 73, "V": 59.2, "W": 78.6, "X": 62.8, "Y": 56.4, "Z": 83.2, "[": 47.2,
       "]": 49.7, "_": 67, "a": 57.6, "b": 55.5, "c": 50.4, "d": 60.5, "e": 53.7, "f": 49.7, "g": 55.5, "h": 56.7,
       "i": 24.4, "j": 32.8, "k": 53.3, "l": 22.5, "m": 66.3, "n": 52.6, "o": 60, "p": 53.7, "q": 53.9, "r": 41.2,
       "s": 54.3, "t": 55.3, "u": 54.8, "v": 52.5, "w": 69.3, "x": 59.1, "y": 53, "z": 57.2, "«": 64.9, "»": 66.8,
       "°": 41.2, "·": 20, "À": 67.6, "Ç": 62.9, "È": 70.7, "É": 70.7, "×": 55, "à": 54.2, "â": 54.2, "ç": 50.4,
       "è": 55.1, "é": 55.1, "ê": 55.1, "ë": 55.1, "î": 24.4, "ï": 24.4, "ô": 56.1, "ö": 56.1, "ù": 50.8, "û": 50.8,
       "ü": 50.8, "–": 70.2, "—": 93.5, "’": 30.4, "…": 70.9, "€": 71.3}


def largeur(texte, taille, famille=5):
    if famille == 3:
        return len(texte) * taille * 0.6
    return sum(WID.get(c, 56) for c in texte) * taille / 100


def couper(texte, taille, maxi, famille=5):
    lignes, cour = [], ""
    for mot in texte.split(" "):
        essai = (cour + " " + mot).strip()
        if largeur(essai, taille, famille) <= maxi or not cour:
            cour = essai
        else:
            lignes.append(cour)
            cour = mot
    lignes.append(cour)
    return "\n".join(lignes)


class Scene:
    def __init__(self):
        self.els = []
        self.n = 0

    def _base(self, typ, x, y, w, h, stroke=PAPER, bg="transparent", fill="solid", sw=2, ss="solid",
              rough=1, op=100, rond=None):
        self.n += 1
        e = dict(id=f"e{self.n}", type=typ, x=round(x, 1), y=round(y, 1), width=round(w, 1), height=round(h, 1),
                 angle=0, strokeColor=stroke, backgroundColor=bg, fillStyle=fill, strokeWidth=sw, strokeStyle=ss,
                 roughness=rough, opacity=op, groupIds=[], frameId=None, roundness=rond,
                 seed=random.randint(1, 2 ** 31 - 1), version=1, versionNonce=random.randint(1, 2 ** 31 - 1),
                 isDeleted=False, boundElements=[], updated=1, link=None, locked=False)
        self.els.append(e)
        return e

    # Formes
    def rect(self, x, y, w, h, stroke=PAPER, bg="transparent", fill="solid", sw=2, ss="solid", rough=1, op=100,
             rond=True):
        return self._base("rectangle", x, y, w, h, stroke, bg, fill, sw, ss, rough, op, {"type": 3} if rond else None)

    def ellipse(self, x, y, w, h, stroke=PAPER, bg="transparent", fill="solid", sw=2, ss="solid", rough=1, op=100):
        return self._base("ellipse", x, y, w, h, stroke, bg, fill, sw, ss, rough, op)

    def cercle(self, cx, cy, r, **k):
        return self.ellipse(cx - r, cy - r, 2 * r, 2 * r, **k)

    def losange(self, x, y, w, h, stroke=PAPER, bg="transparent", fill="solid", sw=2, ss="solid", rough=1, op=100):
        return self._base("diamond", x, y, w, h, stroke, bg, fill, sw, ss, rough, op)

    def _chemin(self, typ, pts, stroke, sw, ss, op, bg="transparent", fill="solid", rough=1, courbe=False):
        x0, y0 = pts[0]
        rel = [[round(px - x0, 1), round(py - y0, 1)] for px, py in pts]
        xs = [p[0] for p in rel]
        ys = [p[1] for p in rel]
        e = self._base(typ, x0, y0, max(xs) - min(xs), max(ys) - min(ys), stroke, bg, fill, sw, ss, rough, op,
                       {"type": 2} if courbe else None)
        e.update(points=rel, lastCommittedPoint=None, startBinding=None, endBinding=None)
        return e

    def ligne(self, pts, stroke=PAPER, sw=2, ss="solid", op=100, bg="transparent", fill="solid", ferme=False,
              courbe=False):
        e = self._chemin("line", pts, stroke, sw, ss, op, bg, fill, courbe=courbe)
        e.update(startArrowhead=None, endArrowhead=None, polygon=ferme)
        return e

    def fleche(self, pts, stroke=AMBRE, sw=2, ss="solid", op=100, courbe=False, debut=None, fin="arrow"):
        e = self._chemin("arrow", pts, stroke, sw, ss, op, courbe=courbe)
        e.update(startArrowhead=debut, endArrowhead=fin, elbowed=False)
        return e

    # Texte
    def texte(self, s, x, y, taille=24, couleur=PAPER, align="left", famille=5, op=100, maxi=None):
        if maxi:
            s = couper(s, taille, maxi, famille)
        lignes = s.split("\n")
        if len(lignes) > 1 and align != "left":
            # Une ligne par élément : le canevas ne centre pas les lignes entre elles
            for i, l in enumerate(lignes):
                e = self.texte(l, x, y + i * taille * 1.25, taille, couleur, align, famille, op)
            return e
        w = max(largeur(l, taille, famille) for l in lignes) + 2
        if align == "center":
            x -= w / 2
        elif align == "right":
            x -= w
        e = self._base("text", x, y, w, len(lignes) * taille * 1.25, couleur, op=op)
        e.update(text=s, originalText=s, fontSize=taille, fontFamily=famille, textAlign=align, verticalAlign="top",
                 containerId=None, lineHeight=1.25, autoResize=True)
        return e

    def code(self, s, x, y, taille=22, w=None, pad=18):
        lignes = s.split("\n")
        lw = max(largeur(l, taille, 3) for l in lignes)
        w = w or lw + 2 * pad
        h = len(lignes) * taille * 1.25 + 2 * pad
        self.rect(x, y, w, h, stroke=DIM, bg=CODE, rough=0)
        self.texte(s, x + pad, y + pad, taille, PAPER, famille=3)
        return h

    # Pictos
    def personne(self, cx, haut, s=1.0, c=AMBRE):
        self.cercle(cx, haut + 18 * s, 18 * s, stroke=c, bg=c, fill="hachure")
        self.rect(cx - 32 * s, haut + 42 * s, 64 * s, 44 * s, stroke=c, bg=c, fill="hachure")

    def doc(self, x, y, w=70, h=90, c=PAPER, bg="transparent", fill="solid", lignes=3, op=100, ss="solid"):
        self.rect(x, y, w, h, stroke=c, bg=bg, fill=fill, op=op, ss=ss, rond=False)
        for i in range(lignes):
            ly = y + h * 0.25 + i * h * 0.2
            self.ligne([(x + w * 0.18, ly), (x + w * (0.82 if i < lignes - 1 else 0.55), ly)], stroke=c, op=op)

    def fenetre(self, x, y, w, h, c=PAPER, titre=None, op=100):
        self.rect(x, y, w, h, stroke=c, op=op)
        self.ligne([(x, y + 34), (x + w, y + 34)], stroke=c, op=op)
        for i in range(3):
            self.cercle(x + 20 + i * 20, y + 17, 5, stroke=c, op=op)
        if titre:
            self.texte(titre, x + w / 2, y + 7, 18, MUTED, "center")

    def horloge(self, cx, cy, r=26, c=PAPER):
        self.cercle(cx, cy, r, stroke=c)
        self.ligne([(cx, cy), (cx, cy - r * 0.65)], stroke=c)
        self.ligne([(cx, cy), (cx + r * 0.5, cy + r * 0.1)], stroke=c)

    def loupe(self, cx, cy, r=26, c=AMBRE):
        self.cercle(cx, cy, r, stroke=c, sw=3)
        self.ligne([(cx + r * 0.7, cy + r * 0.7), (cx + r * 1.6, cy + r * 1.6)], stroke=c, sw=4)

    def coche(self, cx, cy, s=1.0, c=PIN):
        self.ligne([(cx - 14 * s, cy), (cx - 4 * s, cy + 12 * s), (cx + 16 * s, cy - 12 * s)], stroke=c, sw=4)

    def croix(self, cx, cy, s=1.0, c=MUTED):
        self.ligne([(cx - 12 * s, cy - 12 * s), (cx + 12 * s, cy + 12 * s)], stroke=c, sw=3)
        self.ligne([(cx - 12 * s, cy + 12 * s), (cx + 12 * s, cy - 12 * s)], stroke=c, sw=3)

    def dossier(self, x, y, w, h, c=PAPER, bg="transparent", fill="solid"):
        self.ligne([(x, y + 14), (x, y + h), (x + w, y + h), (x + w, y + 14), (x + w * 0.45, y + 14),
                    (x + w * 0.38, y), (x, y), (x, y + 14)], stroke=c, bg=bg, fill=fill, ferme=True)

    def cylindre(self, x, y, w, h, c=MUTED, ss="solid", op=100):
        self.ellipse(x, y, w, 24, stroke=c, ss=ss, op=op)
        self.ligne([(x, y + 12), (x, y + h - 12)], stroke=c, ss=ss, op=op)
        self.ligne([(x + w, y + 12), (x + w, y + h - 12)], stroke=c, ss=ss, op=op)
        self.ligne([(x, y + h - 12), (x + w * 0.25, y + h - 2), (x + w * 0.75, y + h - 2), (x + w, y + h - 12)],
                   stroke=c, ss=ss, op=op, courbe=True)

    def jauge(self, x, y, w, h, part, c=AMBRE, label=None, valeur=None):
        self.rect(x, y, w, h, stroke=MUTED, rond=False)
        if part > 0:
            self.rect(x, y, w * part, h, stroke=c, bg=c, fill="hachure", rond=False)
        if label:
            self.texte(label, x - 12, y + h / 2 - 12, 20, PAPER, "right")
        if valeur:
            self.texte(valeur, x + w + 12, y + h / 2 - 12, 20, MUTED)

    def bulle(self, x, y, w, h, s, c=PAPER, taille=22, ss="solid", op=100):
        self.ellipse(x, y, w, h, stroke=c, ss=ss, op=op)
        self.ligne([(x + w * 0.3, y + h * 0.92), (x + w * 0.22, y + h + 30), (x + w * 0.42, y + h * 0.97)],
                   stroke=c, ss=ss, op=op)
        self.texte(s, x + w / 2, y + h / 2 - taille * 0.62, taille, c, "center", op=op)

    def calendrier(self, x, y, w=90, h=80, c=PAPER):
        self.rect(x, y, w, h, stroke=c, rond=False)
        self.rect(x, y, w, 20, stroke=c, bg=c, fill="hachure", rond=False)
        for i in range(3):
            for j in range(2):
                self.rect(x + 10 + i * 26, y + 30 + j * 24, 16, 14, stroke=c, rond=False, sw=1)

    def boite(self, x, y, w, h, s, c=PAPER, taille=22, bg="transparent", fill="solid", famille=5, ss="solid",
              tc=None, op=100):
        self.rect(x, y, w, h, stroke=c, bg=bg, fill=fill, ss=ss, op=op)
        n = s.count("\n") + 1
        self.texte(s, x + w / 2, y + h / 2 - n * taille * 0.625, taille, tc or (PAPER if c != MUTED else MUTED),
                   "center", famille, op=op)


def cadre(sc, num, chapitre, titre, etapes, choc, note=None):
    """Le cadre commun : fond, titre, étapes à mettre en place, phrase choc, note. À appeler en premier."""
    assert not sc.els, "cadre() doit être dessiné avant le visuel"
    sc.rect(0, 0, W, H, stroke=BG, bg=BG, rough=0, rond=False)
    sc.rect(22, 22, W - 44, H - 44, stroke=MUTED, ss="dashed", op=55)
    sc.texte(f"Leçon {num} · {chapitre}", 60, 44, 20, MUTED)
    sc.texte("Club SMART · Économiser tes tokens", W - 60, 44, 20, MUTED, "right")
    taille = 50
    while largeur(titre, taille) > 1420:
        taille -= 2
    sc.texte(titre, W / 2, 84, taille, PAPER, "center")
    px = 960
    sc.texte("À mettre en place", px, 182, 30, AMBRE)
    sc.ligne([(px, 226), (px + largeur("À mettre en place", 30), 226)], stroke=AMBRE)
    y = 252
    for i, e in enumerate(etapes, 1):
        sc.cercle(px + 19, y + 17, 19, stroke=AMBRE)
        sc.texte(str(i), px + 19, y + 3, 24, AMBRE, "center")
        t = couper(e, 25, 520)
        sc.texte(t, px + 52, y + 1, 25, PAPER)
        y += (t.count("\n") + 1) * 25 * 1.25 + 30
    assert y < 735, f"étapes trop longues ({y}) : {titre}"
    taille = 36
    while largeur(choc, taille) > 1440:
        taille -= 2
    sc.texte(choc, W / 2, 752, taille, AMBRE, "center")
    if note:
        sc.texte(note, W / 2, 818, 19, MUTED, "center", maxi=1400)


def sauver(sc, chemin):
    data = {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com", "elements": sc.els,
            "appState": {"gridSize": None, "viewBackgroundColor": BG}, "files": {}}
    with open(chemin, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
