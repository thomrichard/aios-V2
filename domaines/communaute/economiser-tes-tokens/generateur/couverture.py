"""Couverture de la classroom Agentic AI (1460 x 752, format des couvertures Skool), charte vert pin."""
import os, sys
from moteur import *

CW, CH = 1460, 752
sc = Scene()
sc.rect(0, 0, CW, CH, stroke=BG, bg=BG, rough=0, rond=False)
sc.rect(22, 22, CW - 44, CH - 44, stroke=MUTED, ss="dashed", op=55)
sc.texte("Club SMART", 60, 46, 26, MUTED)
sc.texte("Agentic AI", CW / 2, 110, 150, PAPER, "center")
sc.texte("Fais travailler des agents IA pour toi", CW / 2, 318, 44, AMBRE, "center")

# Un agent au centre, relié à ses outils
cx, cy = CW / 2, 560
for x, y in [(368, 560), (566, 500), (880, 498), (1075, 555)]:
    sc.ligne([(cx, cy), (x, y)], stroke=MUTED, op=80)
sc.cercle(cx, cy, 70, stroke=AMBRE, bg=BG)
sc.cercle(cx, cy, 70, stroke=AMBRE, bg=AMBRE, fill="hachure")
sc.texte("agent", cx, cy - 20, 32, PAPER, "center")
sc.doc(295, 515, 70, 90, c=PAPER, bg=BG, lignes=3)
sc.calendrier(475, 430, 90, 80, c=PAPER)
sc.rect(880, 432, 120, 76, stroke=DIM, bg=CODE, rough=0)
sc.texte(">_", 900, 452, 30, PAPER, famille=3)
sc.ellipse(1075, 520, 110, 70, stroke=PAPER, bg=BG)
sc.ligne([(1100, 584), (1092, 612), (1118, 588)], stroke=PAPER)
for i in range(3):
    sc.cercle(1103 + i * 27, 555, 5, stroke=PAPER, bg=PAPER)

sauver(sc, sys.argv[1])
print("ok")
