"""Les 22 leçons « Économiser tes tokens » : un visuel par leçon (zone x 70-900, y 160-710)."""
import os
import sys
from moteur import *

SORTIE = sys.argv[1] if len(sys.argv) > 1 else "."
LECONS = []


def lecon(slug, chapitre, titre, etapes, choc, note=None):
    def deco(f):
        LECONS.append(dict(slug=slug, chapitre=chapitre, titre=titre, etapes=etapes, choc=choc, note=note, visuel=f))
        return f
    return deco


# ---------- Chapitre 1 · Comprendre ----------

@lecon("pourquoi-chaque-message-coute-plus-cher", "Comprendre",
       "Pourquoi chaque message coûte plus cher ?",
       ["Une tâche, une discussion.",
        "Change de sujet ? Ouvre une nouvelle discussion.",
        "Colle un extrait plutôt qu'un fichier entier quand ça suffit."],
       "Claude relit toute la discussion à chaque message.",
       "Le cache réduit le prix de cette relecture : voir la leçon 3.")
def v01(sc):
    sc.texte("ce que Claude lit, message après message", 485, 178, 22, MUTED, "center")
    base = 610
    for i in range(1, 6):
        x = 95 + (i - 1) * 160
        for j in range(i):
            y = base - (j + 1) * 56
            if j == i - 1:
                sc.rect(x, y, 120, 46, stroke=PAPER)
            else:
                sc.rect(x, y, 120, 46, stroke=AMBRE, bg=AMBRE, fill="hachure")
        sc.texte(f"message {i}", x + 60, base + 12, 20, MUTED, "center")
    sc.rect(250, 668, 30, 24, stroke=AMBRE, bg=AMBRE, fill="hachure")
    sc.texte("relu", 292, 668, 20, PAPER)
    sc.rect(400, 668, 30, 24, stroke=PAPER)
    sc.texte("nouveau", 442, 668, 20, PAPER)


@lecon("le-context-rot", "Comprendre",
       "Pourquoi Claude oublie quand la discussion dure ?",
       ["Nouvelle tâche ? Repars d'une discussion neuve.",
        "Avant de partir, demande un résumé des décisions prises.",
        "Colle ce résumé au début de la nouvelle discussion."],
       "Plus la fenêtre est pleine, moins Claude est précis.",
       "Anthropic appelle ce phénomène le « context rot » : plus il y a de tokens, plus le rappel baisse.")
def v02(sc):
    for x, part, haut, bas, ok in [(100, 0.2, "remplie à 20 %", "il retrouve ta consigne", True),
                                   (560, 0.85, "remplie à 85 %", "ta consigne se perd", False)]:
        y0, w, h = 235, 300, 340
        sc.texte(haut, x + w / 2, 190, 22, PAPER, "center")
        sc.rect(x, y0, w, h, stroke=PAPER)
        fh = (h - 24) * part
        sc.rect(x + 12, y0 + h - 12 - fh, w - 24, fh, stroke=AMBRE, bg=AMBRE, fill="hachure", rond=False)
        cy = y0 + 30 if ok else y0 + 150
        sc.boite(x + 50, cy, 200, 50, "ta consigne", c=PAPER if ok else MUTED, taille=22,
                 bg=BG if not ok else "transparent", ss="solid" if ok else "dashed", op=100 if ok else 70)
        if ok:
            sc.coche(x + 40, 620, 1, PIN)
        else:
            sc.texte("?", x + 40, 602, 34, MUTED, "center")
        sc.texte(bas, x + 62, 605, 22, PAPER if ok else MUTED)
    sc.fleche([(415, 405), (545, 405)], stroke=MUTED)
    sc.texte("le temps passe", 480, 365, 18, MUTED, "center")


@lecon("le-cache-de-prompt", "Comprendre",
       "C'est quoi, le cache ?",
       ["Enchaîne tes messages tant que la discussion est chaude.",
        "Après une longue pause, demande-toi si une discussion neuve ne vaut pas mieux.",
        "Garde les grosses discussions pour du travail suivi."],
       "Après une longue pause, tu repaies toute la discussion.",
       "Durée du cache dans Claude Code : 1 heure avec un abonnement, 5 minutes avec une clé API.")
def v03(sc):
    sc.texte("ce que coûte la relecture de la discussion", 485, 180, 22, MUTED, "center")
    axe = 560
    sc.fleche([(100, axe), (880, axe)], stroke=MUTED)
    sc.cercle(180, axe, 10, stroke=PAPER, bg=PAPER, fill="solid")
    sc.texte("ton message", 180, axe + 75, 20, MUTED, "center")
    sc.horloge(180, axe + 42, 18, MUTED)
    for x, h, c, etat, prix, quand in [(470, 40, PIN, "cache chaud", "10 % du prix, ou moins", "2 min après"),
                                       (770, 250, AMBRE, "cache froid", "tout est repayé", "2 h après")]:
        sc.rect(x - 50, axe - 22 - h, 100, h, stroke=c, bg=c, fill="hachure", rond=False)
        sc.texte(etat, x, axe - 22 - h - 66, 24, c, "center")
        sc.texte(prix, x, axe - 22 - h - 36, 19, PAPER, "center")
        sc.horloge(x, axe + 42, 18, MUTED)
        sc.texte(quand, x, axe + 75, 20, MUTED, "center")


# ---------- Chapitre 2 · La discussion ----------

@lecon("compacter-avec-une-intention", "La discussion",
       "Compacter, oui. Mais avec une intention.",
       ["Tape /compact suivi de ce qu'il faut garder.",
        "Nomme ce qui compte : décisions, gabarits, chemins des fichiers.",
        "Écris-le une fois pour toutes dans une section « Compact Instructions » de ton CLAUDE.md."],
       "Si tu ne dis pas quoi garder, Claude choisit seul.",
       "Claude Code compacte aussi tout seul, quand la discussion approche de la limite.")
def v04(sc):
    items = [("décision", True), ("essai raté", False), ("gabarit", True), ("hésitation", False),
             ("chemin de fichier", True), ("vieux brouillon", False), ("digression", False)]
    for i, (t, garde) in enumerate(items):
        y = 190 + i * 50
        sc.boite(90, y, 230, 40, t, c=AMBRE if garde else MUTED, taille=19, ss="solid" if garde else "dashed",
                 tc=PAPER if garde else MUTED)
    sc.ligne([(375, 250), (575, 250), (505, 370), (505, 450), (445, 450), (445, 370), (375, 250)], stroke=PAPER,
             ferme=True)
    sc.fleche([(330, 330), (385, 300)], stroke=MUTED)
    sc.fleche([(515, 420), (605, 380)], stroke=AMBRE)
    for i, t in enumerate(["décisions", "gabarits", "chemins de fichiers"]):
        sc.boite(615, 300 + i * 52, 240, 42, t, c=AMBRE, taille=19)
    sc.texte("ta consigne", 475, 470, 19, MUTED, "center")
    sc.code("/compact garde les décisions et les chemins des fichiers", 95, 578, 20)


@lecon("garder-le-cache-chaud", "La discussion",
       "Garder le cache chaud : utile ou pas ?",
       ["Repère les grosses discussions où tu reviens souvent.",
        "Pour celles-là, une relance chaque heure garde le cache chaud.",
        "Pour les autres, compacte ou repars d'une discussion neuve."],
       "Chaque relance coûte aussi : garde-la pour les discussions où tu reviens.",
       "Jay estime avoir économisé 437 $ en 30 jours, au prix de l'API (non vérifié). Utile avec le cache d'une heure des abonnements.")
def v05(sc):
    sc.texte("Jay relance ses discussions chaque heure, pendant 4 heures", 485, 180, 22, MUTED, "center")
    axe = 420
    xs = [110 + i * 185 for i in range(5)]
    sc.texte("le cache reste chaud", 480, 262, 22, PIN, "center")
    sc.rect(110, 300, 740, 36, stroke=PIN, bg=PIN, fill="hachure", rond=False)
    sc.ligne([(100, axe), (870, axe)], stroke=MUTED)
    for i, x in enumerate(xs):
        sc.ligne([(x, axe - 8), (x, axe + 8)], stroke=MUTED)
        sc.texte(f"{i} h", x, axe + 16, 18, MUTED, "center")
        if i:
            sc.cercle(x, axe, 11, stroke=AMBRE, bg=AMBRE, fill="hachure")
    sc.texte("relance", xs[1], axe - 50, 18, AMBRE, "center")
    sc.boite(95, 510, 370, 130, "une relance\nrelit la discussion\nau prix du cache", c=AMBRE, taille=22)
    sc.boite(505, 510, 370, 130, "une reprise à froid\nla réécrit en cache\nau prix fort", c=MUTED, taille=22,
             tc=PAPER)


@lecon("voir-sa-consommation", "La discussion",
       "Vois ce que tu consommes, en direct",
       ["Tape /statusline et décris ce que tu veux voir.",
        "Demande : la fenêtre remplie, tes limites de 5 h et de 7 jours, l'état du cache.",
        "Ou installe Ribbon, le mod open source de Jay."],
       "Tu ne peux pas économiser ce que tu ne vois pas.",
       "Limites : abonnés Pro et Max. État du cache : Claude Code 2.1.251 ou plus. Ribbon : github.com/robonuggets/ribbon")
def v06(sc):
    sc.fenetre(90, 190, 790, 450, titre="Claude Code")
    for i, (x, w) in enumerate([(120, 420), (330, 520), (120, 360), (330, 460), (120, 300)]):
        sc.ligne([(x, 260 + i * 44), (x + w, 260 + i * 44)], stroke=MUTED, op=60)
    sc.rect(105, 500, 760, 120, stroke=AMBRE, sw=3)
    sc.jauge(230, 518, 170, 24, 0.62, label="5 h", valeur="62 %")
    sc.jauge(600, 518, 170, 24, 0.35, label="7 jours", valeur="35 %")
    sc.jauge(230, 568, 170, 24, 0.40, c=PIN, label="contexte", valeur="40 %")
    sc.texte("cache : chaud, 41 min", 520, 566, 21, PIN)
    sc.texte("ta barre d'état (exemple)", 485, 660, 22, AMBRE, "center")


# ---------- Chapitre 3 · La mémoire ----------

@lecon("donner-une-carte-a-claude", "La mémoire",
       "Donne une carte à Claude",
       ["Dans CLAUDE.md, liste tes grands domaines et le fichier qui décrit chacun.",
        "Un fichier routeur par domaine, qui pointe vers ses fichiers.",
        "Garde MEMORY.md court : une ligne par souvenir, avec un lien."],
       "Claude lit la carte au lieu de fouiller chaque étagère.",
       "Claude Code charge CLAUDE.md et les 200 premières lignes de MEMORY.md au début de chaque session.")
def v07(sc):
    sc.texte("chargés au début de chaque session", 590, 182, 20, MUTED, "center")
    sc.boite(330, 225, 200, 58, "CLAUDE.md", c=AMBRE, taille=24)
    sc.boite(650, 225, 220, 58, "MEMORY.md", c=PIN, taille=24)
    sc.ligne([(530, 254), (650, 254)], stroke=MUTED, ss="dashed")
    sc.texte("une ligne par souvenir", 760, 292, 18, MUTED, "center")
    for i, nom in enumerate(["contenu.md", "club.md", "perso.md"]):
        cx = 235 + i * 190
        sc.ligne([(430, 283), (cx, 380)], stroke=AMBRE)
        sc.boite(cx - 85, 380, 170, 50, nom, c=PAPER, taille=20)
        for j in range(3):
            dx = cx - 70 + j * 52
            sc.ligne([(cx, 430), (dx + 18, 490)], stroke=MUTED)
            sc.doc(dx, 490, 36, 46, c=MUTED, lignes=2)
    sc.texte("routeurs", 70, 345, 18, MUTED)
    sc.texte("la carte renvoie aux routeurs, les routeurs aux fichiers", 485, 600, 20, MUTED, "center")


@lecon("du-texte-simple-plutot-qu-une-base-vectorielle", "La mémoire",
       "Du texte simple bat une base vectorielle",
       ["Écris en Markdown, avec des titres clairs.",
        "Donne un en-tête à chaque fichier : type, résumé, date.",
        "Décris chaque image en une ligne : ce qu'elle montre, à quoi elle sert."],
       "Un bon nom et un en-tête valent mieux qu'une base vectorielle.",
       "Anthropic : Claude Code retrouve les fichiers au moment voulu avec des recherches simples, sans index à tenir à jour.")
def v08(sc):
    sc.texte("des fichiers texte bien nommés", 270, 190, 22, PAPER, "center")
    sc.dossier(130, 250, 230, 160, c=PAPER)
    for i in range(3):
        sc.doc(155 + i * 62, 290, 48, 62, c=PAPER, lignes=2)
    sc.loupe(370, 300, 30, AMBRE)
    sc.coche(150, 470, 1, PIN)
    sc.texte("Claude cherche par nom\net par mot", 178, 452, 21, PAPER)
    sc.ligne([(485, 200), (485, 580)], stroke=MUTED, ss="dashed", op=50)
    sc.texte("une base vectorielle", 700, 190, 22, MUTED, "center")
    sc.doc(670, 240, 60, 74, c=MUTED, ss="dashed", op=70)
    sc.fleche([(700, 322), (700, 362)], stroke=MUTED, op=70)
    for i in range(4):
        for j in range(2):
            sc.cercle(655 + i * 30, 380 + j * 26, 7, stroke=MUTED, op=70)
    sc.fleche([(700, 430), (700, 470)], stroke=MUTED, op=70)
    sc.cylindre(645, 478, 110, 90, c=MUTED, ss="dashed", op=70)
    sc.texte("pas nécessaire pour commencer", 700, 590, 19, MUTED, "center")
    sc.texte("Jay : 420 000 fichiers, aucune base vectorielle", 485, 650, 25, AMBRE, "center")


@lecon("une-memoire-qui-s-ameliore", "La mémoire",
       "Une correction donnée deux fois, c'est un échec",
       ["/note : mets un retour de côté sans casser ton travail en cours.",
        "En fin de semaine, demande à Claude d'appliquer toutes les notes.",
        "/calibrate : une correction importante, enregistrée tout de suite."],
       "Corriger deux fois la même chose, c'est un échec de la mémoire.",
       "/note et /calibrate sont des skills à créer, pas des commandes livrées avec Claude.")
def v09(sc):
    sc.boite(375, 205, 220, 56, "tu corriges Claude", c=PAPER, taille=21)
    sc.boite(620, 400, 230, 56, "/note ou /calibrate", c=AMBRE, taille=21)
    sc.boite(335, 595, 300, 56, "la skill ou la mémoire change", c=PIN, taille=21)
    sc.boite(110, 400, 220, 56, "Claude fait juste", c=PAPER, taille=21)
    sc.fleche([(600, 235), (700, 280), (730, 392)], stroke=AMBRE, courbe=True)
    sc.fleche([(735, 465), (705, 560), (640, 610)], stroke=AMBRE, courbe=True)
    sc.fleche([(330, 615), (250, 560), (225, 465)], stroke=AMBRE, courbe=True)
    sc.fleche([(225, 392), (255, 285), (368, 238)], stroke=AMBRE, courbe=True)
    sc.texte("une correction,\nune seule fois", 485, 395, 24, AMBRE, "center")


# ---------- Chapitre 4 · Les skills ----------

@lecon("un-modele-par-skill", "Les skills",
       "Le bon modèle pour chaque skill",
       ["Ajoute « model: haiku » dans l'en-tête du SKILL.md.",
        "Haiku pour les tâches simples aux étapes claires, Opus pour réfléchir.",
        "Le modèle change le temps de la skill, puis ta session reprend le sien."],
       "Pas besoin du plus gros modèle pour corriger une faute.",
       "Claude Code seulement. Dans l'app Claude, la ligne model: empêche d'ajouter la skill : retire-la avant.")
def v10(sc):
    modeles = [("Haiku", 150, 56, 2), ("Sonnet", 200, 70, 3), ("Opus", 250, 86, 4)]
    ys = [205, 300, 410]
    for i, (skill, (nom, w, h, ep)) in enumerate(zip(["/grammaire", "/résumé", "/stratégie"], modeles)):
        y = ys[i]
        sc.boite(100, y + (h - 52) / 2, 210, 52, skill, c=PAPER, taille=21, famille=3)
        sc.fleche([(320, y + h / 2), (545, y + h / 2)], stroke=AMBRE)
        sc.rect(560, y, w, h, stroke=AMBRE, sw=ep)
        sc.texte(nom, 560 + w / 2, y + h / 2 - 15, 24, PAPER, "center")
    hc = sc.code("---\nname: grammaire\nmodel: haiku\n---", 100, 545, 20)
    sc.fleche([(420, 610), (318, 610)], stroke=MUTED)
    sc.texte("dans l'en-tête\ndu SKILL.md", 432, 585, 20, MUTED)


@lecon("laisser-un-petit-modele-aiguiller", "Les skills",
       "Laisser un petit modèle choisir le modèle",
       ["Niveau avancé : un petit modèle rapide lit chaque demande avant Claude.",
        "Il envoie les demandes simples vers Haiku, les autres plus haut.",
        "Teste une semaine : si tu ne sens pas la différence, garde-le."],
       "Si tu ne sens pas la baisse de qualité, l'économie est gratuite.",
       "Jay utilise Jev, le modèle de décision de TypeSafe AI (pas un modèle d'Anthropic). Ses chiffres ne sont pas vérifiés.")
def v11(sc):
    sc.boite(85, 400, 175, 60, "ta demande", c=PAPER, taille=22)
    sc.fleche([(262, 430), (330, 430)], stroke=MUTED)
    sc.losange(330, 350, 180, 160, stroke=AMBRE)
    sc.texte("aiguilleur", 420, 415, 22, AMBRE, "center")
    sc.texte("un petit modèle rapide", 420, 522, 18, MUTED, "center")
    for nom, cy, c in [("Haiku", 250, AMBRE), ("Sonnet", 430, PAPER), ("Opus", 610, PAPER)]:
        sc.fleche([(512, 430), (640, cy)], stroke=c, sw=3 if c == AMBRE else 2)
        sc.boite(650, cy - 30, 190, 60, nom, c=c, taille=24, tc=PAPER)
    sc.texte("4 demandes sur 10", 745, 290, 19, AMBRE, "center")
    sc.texte("Chiffres de Jay : 4 451 aiguillages pour 0,18 $", 485, 675, 21, MUTED, "center")


@lecon("trouver-les-skills-qui-coutent", "Les skills",
       "Trouve les skills qui coûtent cher",
       ["Tape /usage : la part de chaque skill sur 24 h ou 7 jours.",
        "Tape /skill-doctor : le coût en contexte de chaque skill et son usage.",
        "Allège les plus chères, archive celles qui ne servent plus."],
       "Tu ne peux alléger que ce que tu mesures.",
       "/usage : offres Pro, Max, Team et Enterprise. /skill-doctor : Claude Code 2.1.252 ou plus récent.")
def v12(sc):
    sc.texte("exemple : la part de chaque skill sur 7 jours", 485, 182, 21, MUTED, "center")
    lignes = [("/animer", 0.38, "38 %", "à alléger"), ("/montage", 0.21, "21 %", None),
              ("/résumé", 0.09, "9 %", None), ("/grammaire", 0.02, "2 %", None), ("/ancienne", 0, "0 %", "à archiver")]
    for i, (nom, part, val, tag) in enumerate(lignes):
        y = 245 + i * 72
        sc.texte(nom, 290, y + 5, 21, PAPER, "right", famille=3)
        if part:
            sc.rect(310, y, 1000 * part, 38, stroke=AMBRE if i == 0 else PIN, bg=AMBRE if i == 0 else PIN,
                    fill="hachure", rond=False)
        else:
            sc.rect(310, y, 90, 38, stroke=MUTED, ss="dashed", rond=False)
        fin = 310 + max(1000 * part, 90 if not part else 0) + 14
        sc.texte(val, fin, y + 6, 21, PAPER)
        if tag:
            sc.texte(tag, fin + 62, y + 6, 21, AMBRE)
    sc.texte("/skill-doctor ajoute le coût en contexte de chaque skill", 485, 625, 20, MUTED, "center")


@lecon("lancer-une-skill-sans-discussion", "Les skills",
       "Lance une skill sans ouvrir de discussion",
       ["Dans un terminal : claude -p \"/nom-de-la-skill\".",
        "Ajoute --model haiku pour choisir le modèle.",
        "Mets la commande dans un Raccourci macOS : tu as un bouton."],
       "Pas de discussion ouverte, pas d'historique à relire.",
       "Une seule skill par commande : avec -p, Claude Code ne charge que la première.")
def v13(sc):
    sc.boite(330, 195, 310, 64, "Nettoyer mon Mac", c=AMBRE, taille=24, tc=PAPER)
    sc.texte("un Raccourci macOS", 655, 216, 19, MUTED)
    sc.fleche([(485, 265), (485, 320)], stroke=MUTED)
    t = 'claude -p "/nettoyage" --model haiku'
    w = largeur(t, 22, 3) + 36
    sc.code(t, 485 - w / 2, 328, 22)
    sc.fleche([(485, 400), (485, 452)], stroke=MUTED)
    sc.doc(445, 460, 80, 100, c=PIN, lignes=3)
    sc.texte("le rapport arrive, sans discussion ouverte", 485, 580, 21, PAPER, "center")


@lecon("une-bibliotheque-de-composants", "Les skills",
       "Une bibliothèque de composants",
       ["Réunis tes couleurs, tes polices et tes blocs dans une skill de design.",
        "Ajoute les composants que tu réutilises : boutons, cartes, en-têtes.",
        "Demande à Claude de partir de cette bibliothèque, jamais de zéro."],
       "Un bloc déjà fait, c'est un bloc que Claude ne réécrit pas.")
def v14(sc):
    sc.rect(90, 200, 330, 420, stroke=PAPER, ss="dashed")
    sc.texte("ta bibliothèque", 255, 214, 22, AMBRE, "center")
    sc.boite(115, 265, 125, 42, "Bouton", c=AMBRE, taille=19, tc=PAPER)
    sc.rect(115, 330, 125, 30, stroke=AMBRE, bg=AMBRE, fill="hachure", rond=False)
    sc.texte("en-tête", 178, 366, 16, MUTED, "center")
    sc.rect(265, 262, 130, 95, stroke=PAPER)
    sc.ligne([(280, 290), (375, 290)], stroke=PAPER)
    sc.ligne([(280, 315), (350, 315)], stroke=MUTED)
    sc.texte("carte", 330, 366, 16, MUTED, "center")
    for i, h in enumerate([30, 55, 40, 70]):
        sc.rect(125 + i * 28, 500 - h, 20, h, stroke=PIN, bg=PIN, fill="hachure", rond=False)
    sc.texte("graphique", 178, 510, 16, MUTED, "center")
    sc.cercle(330, 450, 34, stroke=PAPER)
    sc.texte("pastille", 330, 492, 16, MUTED, "center")
    sc.rect(265, 545, 130, 36, stroke=PAPER)
    sc.texte("champ", 330, 588, 16, MUTED, "center")
    sc.fleche([(430, 410), (520, 410)], stroke=AMBRE)
    sc.texte("réutilisés", 475, 372, 18, MUTED, "center")
    sc.fenetre(530, 200, 340, 420)
    sc.rect(550, 252, 300, 30, stroke=AMBRE, bg=AMBRE, fill="hachure", rond=False)
    for x in (550, 710):
        sc.rect(x, 300, 140, 95, stroke=PAPER)
        sc.ligne([(x + 15, 328), (x + 120, 328)], stroke=PAPER)
        sc.ligne([(x + 15, 353), (x + 95, 353)], stroke=MUTED)
    for i, h in enumerate([30, 55, 40, 70]):
        sc.rect(560 + i * 28, 520 - h, 20, h, stroke=PIN, bg=PIN, fill="hachure", rond=False)
    sc.boite(710, 470, 125, 42, "Bouton", c=AMBRE, taille=19, tc=PAPER)
    sc.texte("une page montée avec les mêmes blocs", 700, 640, 19, MUTED, "center")


# ---------- Chapitre 5 · Les routines ----------

@lecon("routines-actives-ou-passives", "Les routines",
       "Routines actives ou passives",
       ["Active : elle te livre un résultat à relire à chaque passage.",
        "Passive : elle tourne en silence et ne t'alerte que si besoin.",
        "Rends passives tes routines de surveillance."],
       "50 routines actives, c'est 50 choses à relire.")
def v15(sc):
    sc.ligne([(485, 190), (485, 650)], stroke=MUTED, ss="dashed", op=50)
    sc.texte("Active", 280, 185, 30, AMBRE, "center")
    sc.calendrier(235, 250, 90, 80)
    sc.fleche([(280, 342), (280, 402)], stroke=MUTED)
    for i in range(4):
        sc.doc(222 + i * 16, 412 + i * 10, 60, 76, c=PAPER, bg=BG, lignes=2)
    sc.texte("un résultat à relire,\nà chaque passage", 280, 532, 21, PAPER, "center")
    sc.texte("ex. : le résumé de tes mails", 280, 606, 18, MUTED, "center")
    sc.texte("Passive", 690, 185, 30, AMBRE, "center")
    for r in (20, 40, 60):
        sc.cercle(690, 292, r, stroke=MUTED, ss="dashed", op=80)
    sc.ligne([(690, 292), (734, 251)], stroke=AMBRE, sw=3)
    sc.fleche([(690, 362), (690, 402)], stroke=MUTED, ss="dashed")
    sc.doc(660, 425, 60, 76, c=AMBRE, lignes=2)
    sc.texte("!", 735, 425, 34, AMBRE)
    sc.texte("elle ne parle que si\nelle trouve quelque chose", 690, 532, 21, PAPER, "center")
    sc.texte("ex. : ta marque copiée en ligne", 690, 606, 18, MUTED, "center")


@lecon("plafonner-ses-routines", "Les routines",
       "Mets un plafond à chaque routine",
       ["Classe tes routines selon ce qu'elles coûtent chaque semaine.",
        "Fixe un plafond à chacune.",
        "Si une routine dépasse, demande à Claude de l'alléger, ou passe-la sur un modèle plus léger."],
       "Une routine qu'on ne mesure pas finit par coûter cher.",
       "Exemple de Jay : une routine ramenée de 10 $ à 4 $ par semaine.")
def v16(sc):
    sc.texte("ce que coûte chaque routine sur une semaine (exemple)", 485, 182, 21, MUTED, "center")
    base, cap = 580, 380
    sc.ligne([(110, base), (870, base)], stroke=MUTED)
    for i, (nom, h) in enumerate([("veille", 120), ("mails", 300), ("rangement", 90), ("stats", 170),
                                  ("point du jour", 60)]):
        x = 140 + i * 150
        hb = min(h, base - cap)
        sc.rect(x, base - hb, 90, hb, stroke=PIN, bg=PIN, fill="hachure", rond=False)
        if h > base - cap:
            sc.rect(x, base - h, 90, h - (base - cap), stroke=AMBRE, bg=AMBRE, fill="hachure", rond=False)
        sc.texte(nom, x + 45, base + 14, 18, MUTED, "center")
    sc.ligne([(110, cap), (870, cap)], stroke=AMBRE, ss="dashed", sw=3)
    sc.texte("plafond", 115, cap - 36, 22, AMBRE)
    sc.fleche([(400, 290), (400, 368)], stroke=AMBRE)
    sc.texte("à alléger", 412, 296, 21, AMBRE)


@lecon("une-routine-qui-propose-des-routines", "Les routines",
       "Une routine qui te propose des routines",
       ["Chaque vendredi, une routine relit tes sessions de la semaine.",
        "Elle repère les tâches que tu refais à la main.",
        "Elle te propose des routines, tu valides celles qui valent le coup."],
       "Les meilleures routines sont des tâches que tu fais déjà.")
def v17(sc):
    jours = [("lun", ["export stats", "mails", "post"]), ("mar", ["mails", "devis", "réunion"]),
             ("mer", ["export stats", "facture", "mails"]), ("jeu", ["post", "mails", "appel"]),
             ("ven", ["export stats", "mails", "bilan"])]
    for i, (j, taches) in enumerate(jours):
        x = 95 + i * 160
        sc.texte(j, x + 65, 186, 20, MUTED, "center")
        sc.rect(x, 220, 130, 200, stroke=MUTED, op=70)
        for k, t in enumerate(taches):
            rep = t == "export stats"
            sc.boite(x + 10, 235 + k * 58, 110, 42, t, c=AMBRE if rep else MUTED, taille=16,
                     tc=PAPER if rep else MUTED)
    sc.loupe(790, 445, 22, AMBRE)
    sc.fleche([(485, 432), (485, 492)], stroke=AMBRE)
    sc.rect(130, 500, 710, 120, stroke=AMBRE)
    sc.texte("Idée de routine : exporter tes stats", 160, 520, 23, PAPER)
    sc.texte("chaque lundi, sans y penser", 160, 556, 23, PAPER)
    sc.boite(690, 537, 120, 46, "valider", c=PIN, taille=20, tc=PAPER)


# ---------- Chapitre 6 · Les connexions ----------

@lecon("choisir-la-connexion-la-plus-legere", "Les connexions",
       "Choisis la connexion la plus légère",
       ["Cherche d'abord l'outil officiel de l'application.",
        "Sinon une CLI : une commande courte, une réponse courte.",
        "Puis l'API, et un MCP de la communauté en dernier."],
       "Ce que Claude lit, tu le paies.",
       "Nuance : Claude Code ne charge plus que le nom des outils MCP au démarrage, le détail arrive à la demande.")
def v18(sc):
    base = 560
    sc.texte("ce que Claude doit lire", 470, 300, 20, MUTED, "center")
    cols = [("1. Officiel", None, "fait par l'éditeur"), ("2. CLI", 50, "une commande, une réponse courte"),
            ("3. API", 140, "des réponses longues"), ("4. MCP", 230, "des outils à décrire à Claude")]
    sc.ligne([(80, base), (870, base)], stroke=MUTED)
    for i, (nom, h, legende) in enumerate(cols):
        cx = 170 + i * 200
        sc.boite(cx - 85, 205, 170, 62, nom, c=AMBRE if i == 0 else PAPER, taille=24, tc=PAPER)
        if h:
            sc.rect(cx - 50, base - h, 100, h, stroke=AMBRE, bg=AMBRE, fill="hachure", rond=False)
        else:
            sc.coche(cx, 480, 1.3, PIN)
            sc.texte("le plus fiable", cx, 515, 20, PIN, "center")
        sc.texte(legende, cx, base + 16, 18, MUTED, "center", maxi=180)


# ---------- Chapitre 7 · Sortir du chat ----------

@lecon("les-mods-de-claude-code", "Sortir du chat",
       "Les mods : changer Claude Code lui-même",
       ["Un mod est un plugin qui change l'apparence et le comportement de Claude Code.",
        "Il s'installe comme un plugin, avec /plugin install.",
        "Commence par un mod qui affiche ton usage, comme Ribbon."],
       "Ce qui tourne en code ne passe pas par Claude.",
       "Mods actifs depuis Claude Code 2.1.287 (terminal) et 2.1.286 (app de bureau). Un mod qui appelle un modèle consomme ton usage.")
def v19(sc):
    sc.fenetre(90, 195, 790, 445, titre="Claude Code")
    for i, (x, w) in enumerate([(120, 380), (220, 340), (120, 300), (220, 320)]):
        sc.ligne([(x, 262 + i * 44), (x + w, 262 + i * 44)], stroke=MUTED, op=60)
    sc.rect(600, 245, 255, 245, stroke=AMBRE, sw=3)
    sc.texte("mod : panneau", 727, 258, 20, AMBRE, "center")
    sc.jauge(690, 315, 140, 22, 0.62, label="5 h")
    sc.jauge(690, 360, 140, 22, 0.35, label="7 j")
    sc.texte("cache : chaud", 727, 412, 19, PIN, "center")
    sc.rect(115, 505, 740, 42, stroke=AMBRE, sw=3)
    sc.texte("mod : bandeau au-dessus du message", 485, 514, 19, AMBRE, "center")
    sc.rect(115, 562, 740, 56, stroke=MUTED)
    sc.texte("ton message…", 135, 578, 19, MUTED)


@lecon("les-extensions-chrome", "Sortir du chat",
       "Ton navigateur aussi a des mods",
       ["Demande à Claude de coder une extension Chrome pour ton besoin.",
        "Ouvre chrome://extensions et active le mode développeur.",
        "Clique sur « Charger l'extension non empaquetée » et choisis le dossier."],
       "Un clic droit au lieu d'un prompt.")
def v20(sc):
    sc.fenetre(90, 195, 520, 400, titre="YouTube")
    for j in range(2):
        for i in range(3):
            x, y = 112 + i * 162, 255 + j * 165
            c = AMBRE if (i, j) == (1, 0) else MUTED
            sc.rect(x, y, 150, 86, stroke=c, op=100 if c == AMBRE else 70)
            sc.ligne([(x, y + 102), (x + 130, y + 102)], stroke=MUTED, op=70)
            sc.ligne([(x, y + 122), (x + 90, y + 122)], stroke=MUTED, op=70)
    sc.rect(375, 320, 290, 140, stroke=PAPER, bg=BG)
    sc.texte("Enregistrer la miniature", 395, 338, 20, AMBRE)
    sc.texte("Enregistrer le titre", 395, 378, 20, PAPER)
    sc.texte("Les deux", 395, 418, 20, PAPER)
    sc.fleche([(672, 350), (712, 350)], stroke=AMBRE)
    sc.dossier(718, 300, 160, 115, c=AMBRE)
    sc.texte("tes références", 798, 430, 20, PAPER, "center")
    sc.texte("(une skill)", 798, 460, 18, MUTED, "center")
    sc.texte("tu ne quittes jamais YouTube", 350, 620, 20, MUTED, "center")


@lecon("retrouver-ses-documents-sans-claude", "Sortir du chat",
       "Retrouve tes documents sans demander à Claude",
       ["Range chaque document produit par Claude au même endroit.",
        "Ajoute une page avec une barre de recherche : Claude peut la coder.",
        "Cherche toi-même : c'est instantané et gratuit."],
       "Chercher toi-même ne coûte aucun token.")
def v21(sc):
    sc.bulle(100, 190, 330, 100, "Claude, retrouve\nle deck client…", c=MUTED, taille=20, ss="dashed")
    sc.croix(480, 240, 1.4, MUTED)
    sc.texte("chercher dans le chat\ncoûte des tokens", 525, 215, 20, MUTED)
    sc.fenetre(100, 345, 770, 280, titre="tes documents")
    sc.rect(130, 395, 380, 46, stroke=AMBRE)
    sc.cercle(156, 416, 10, stroke=AMBRE)
    sc.ligne([(163, 423), (172, 432)], stroke=AMBRE)
    sc.texte("deck client", 182, 404, 20, PAPER)
    for i in range(6):
        c = AMBRE if i == 2 else MUTED
        sc.doc(145 + i * 118, 470, 62, 80, c=c, lignes=2)
    sc.coche(335, 575, 1, PIN)
    sc.texte("trouvé en une seconde", 360, 562, 20, PIN)


@lecon("une-micro-app-pour-les-gros-travaux", "Sortir du chat",
       "Une micro-app pour les gros travaux",
       ["Repère une tâche longue que tu refais chaque semaine dans le chat.",
        "Demande à Claude une petite app locale pour la faire : relire, commenter, valider.",
        "Tes retours partent groupés vers Claude, en un seul message."],
       "Le chat n'est pas toujours la meilleure interface.")
def v22(sc):
    sc.fenetre(90, 195, 300, 440, titre="le chat")
    for i in range(7):
        gauche = i % 2 == 0
        x = 110 if gauche else 190
        sc.rect(x, 250 + i * 52, 180, 36, stroke=MUTED, op=60)
    sc.texte("tout passe par le chat", 240, 650, 20, MUTED, "center")
    sc.fleche([(405, 415), (505, 415)], stroke=AMBRE)
    sc.texte("sortir\ndu chat", 455, 360, 18, MUTED, "center")
    sc.fenetre(520, 195, 360, 440, titre="ta micro-app")
    sc.rect(545, 248, 310, 160, stroke=PAPER)
    sc.ligne([(685, 300), (685, 356), (730, 328), (685, 300)], stroke=PAPER, ferme=True)
    sc.rect(545, 428, 310, 22, stroke=MUTED, rond=False)
    for k, x in enumerate([590, 690, 800], 1):
        sc.cercle(x, 439, 12, stroke=AMBRE, bg=BG)
        sc.texte(str(k), x, 429, 16, AMBRE, "center")
    for k, t in enumerate(["1 · plan trop long", "2 · zoom ici", "3 · couper la fin"]):
        sc.texte(t, 550, 470 + k * 30, 18, PAPER)
    sc.boite(545, 573, 310, 44, "Envoyer à Claude", c=AMBRE, taille=20, tc=PAPER)
    sc.texte("tes retours partent en un seul message", 700, 650, 18, MUTED, "center")




if __name__ == "__main__":
    os.makedirs(SORTIE, exist_ok=True)
    seuls = sys.argv[2:] if len(sys.argv) > 2 else None
    for n, l in enumerate(LECONS, 1):
        nom = f"{n:02d}-{l['slug']}"
        if seuls and f"{n:02d}" not in seuls:
            continue
        sc = Scene()
        cadre(sc, n, l["chapitre"], l["titre"], l["etapes"], l["choc"], l["note"])
        l["visuel"](sc)
        sauver(sc, os.path.join(SORTIE, nom + ".excalidraw"))
        print(nom)
