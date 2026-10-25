"""Schémas de la vidéo « Optimiser ses tokens » : les leçons gardées du module, sans numéro, et les nouvelles.

Usage : python3 generateur.py [dossier de sortie]   puis   python3 <module>/generateur/exporter.py <dossier>
"""
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
MODULE = os.path.abspath(os.path.join(ICI, "..", "..", "communaute", "economiser-tes-tokens", "generateur"))
sys.path.insert(0, MODULE)
from moteur import *  # noqa: E402,F403
import lecons  # noqa: E402  (remplit lecons.LECONS)

SORTIE = sys.argv[1] if len(sys.argv) > 1 else ICI
APP = "App et Claude Code"
CC = "Claude Code"


def etiquette(sc, texte, droite, y):
    c = PIN if texte == APP else AMBRE
    w = largeur(texte, 19) + 28
    sc.rect(droite - w, y, w, 32, stroke=c)
    sc.texte(texte, droite - w / 2, y + 4, 19, c, "center")


def fond(sc):
    sc.rect(0, 0, W, H, stroke=BG, bg=BG, rough=0, rond=False)
    sc.rect(22, 22, W - 44, H - 44, stroke=MUTED, ss="dashed", op=55)


def cadre_video(sc, partie, tag, titre, etapes, choc, note=None, entete="À mettre en place"):
    """Le cadre des leçons, sans numéro : la partie à gauche, l'étiquette app ou Claude Code à droite."""
    assert not sc.els, "cadre_video() doit être dessiné avant le visuel"
    fond(sc)
    sc.texte(partie, 60, 44, 20, MUTED)
    etiquette(sc, tag, W - 60, 38)
    taille = 50
    while largeur(titre, taille) > 1420:
        taille -= 2
    sc.texte(titre, W / 2, 84, taille, PAPER, "center")
    px = 960
    sc.texte(entete, px, 182, 30, AMBRE)
    sc.ligne([(px, 226), (px + largeur(entete, 30), 226)], stroke=AMBRE)
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


# ---------- Les nouveaux visuels (zone x 70-900, y 160-710) ----------

def v_equation(sc):
    sc.texte("un message, décomposé", 485, 172, 22, MUTED, "center")
    lignes = [("tout ce qu'il relit", PIN, "× 0,1 ou moins", "si le cache est chaud"),
              ("ce qu'il lit de neuf", PAPER, "× 1", "le prix normal"),
              ("ce qu'il écrit", AMBRE, "× 5", "5 fois le prix de lecture")]
    y = 225
    for i, (t, c, facteur, legende) in enumerate(lignes):
        if i:
            sc.texte("+", 245, y - 62, 40, MUTED, "center")
        sc.boite(90, y, 310, 70, t, c=c, taille=24, tc=PAPER)
        sc.texte(facteur, 440, y + 6, 30, c)
        sc.texte(legende, 440, y + 44, 18, MUTED)
        y += 140
    sc.ligne([(90, 608), (880, 608)], stroke=MUTED)
    sc.texte("= ta consommation, message après message", 485, 626, 24, PAPER, "center")


def v_contexte(sc):
    sc.texte("ta fenêtre de contexte (exemple)", 280, 166, 20, MUTED, "center")
    x, w = 90, 380
    parts = [("consignes système", 46, "les règles de Claude Code"),
             ("outils", 46, "lire, écrire, chercher, lancer"),
             ("outils MCP", 40, "tes connecteurs, chargés à la demande"),
             ("fichiers mémoire", 46, "CLAUDE.md et MEMORY.md"),
             ("skills", 46, "le nom et la description de chaque skill"),
             ("messages", 180, "toute la discussion, qui grossit à chaque échange"),
             ("espace libre", 66, "ce qui reste avant le compactage")]
    y = 200
    for nom, h, desc in parts:
        if nom == "messages":
            sc.rect(x, y, w, h, stroke=AMBRE, bg=AMBRE, fill="hachure", rond=False)
            sc.texte(nom, x + 16, y + h / 2 - 14, 24, PAPER)
            sc.texte(desc, 500, y + h / 2 - 24, 20, AMBRE, maxi=380)
        elif nom == "espace libre":
            sc.rect(x, y, w, h, stroke=MUTED, ss="dashed", rond=False)
            sc.texte(nom, x + 16, y + h / 2 - 12, 20, MUTED)
            sc.texte(desc, 500, y + h / 2 - 11, 18, MUTED, maxi=380)
        else:
            sc.rect(x, y, w, h, stroke=PAPER, rond=False)
            sc.texte(nom, x + 16, y + h / 2 - 12, 20, PAPER)
            sc.texte(desc, 500, y + h / 2 - 11, 18, MUTED, maxi=380)
        y += h


def v_cache_froid(sc):
    sc.texte("trois causes", 485, 172, 22, MUTED, "center")
    cartes = [("une longue pause", "plus d'1 h avec\nun abonnement,\n5 min avec une clé API"),
              ("un changement\nde modèle", "le cache appartient\nà un modèle"),
              ("les sous-agents\net le compactage", "5 minutes, même\navec un abonnement")]
    for i, (titre, desc) in enumerate(cartes):
        x0, y0, w = 90 + i * 270, 215, 250
        sc.rect(x0, y0, w, 270, stroke=PAPER, op=70)
        cx = x0 + w / 2
        if i == 0:
            sc.horloge(cx, y0 + 62, 32, PAPER)
        elif i == 1:
            sc.boite(x0 + 14, y0 + 40, 92, 44, "Sonnet", c=PAPER, taille=18)
            sc.fleche([(x0 + 110, y0 + 62), (x0 + 140, y0 + 62)], stroke=AMBRE)
            sc.boite(x0 + 144, y0 + 40, 92, 44, "Opus", c=PAPER, taille=18)
        else:
            for k in range(3):
                sc.doc(x0 + 67 + k * 40, y0 + 36, 36, 50, c=MUTED, lignes=2)
        sc.texte(titre, cx, y0 + 112, 22, PAPER, "center")
        sc.texte(desc, cx, y0 + 186, 18, MUTED, "center")
    sc.fleche([(485, 495), (485, 538)], stroke=AMBRE)
    sc.boite(150, 546, 670, 64, "le message suivant relit tout au prix fort", c=AMBRE, taille=24, tc=PAPER)


def v_modele(sc):
    sc.texte("prix de 1 million de tokens lus (tarif API)", 485, 172, 21, MUTED, "center")
    rangs = [("Haiku 5.5", 0.10, "0,10 $", "trier, reformuler, corriger", PIN),
             ("Sonnet 5.5", 2, "2 $", "le travail de tous les jours", PIN),
             ("Opus 5.5", 4, "4 $", "réfléchir, décider, construire", AMBRE)]
    for i, (nom, prix, valeur, usage, c) in enumerate(rangs):
        y = 230 + i * 120
        sc.texte(nom, 250, y + 8, 24, PAPER, "right")
        bw = max(500 * prix / 4, 10)
        sc.rect(270, y, bw, 44, stroke=c, bg=c, fill="hachure", rond=False)
        sc.texte(valeur, 270 + bw + 14, y + 8, 24, PAPER)
        sc.texte(usage, 270, y + 56, 18, MUTED)
    h = sc.code("/model sonnet", 90, 598, 22)
    sc.texte("dans l'app : le sélecteur de modèle", 322, 598 + h / 2 - 12, 20, MUTED)


def v_systeme(sc):
    sc.texte("ce qu'un AIOS règle une fois pour toutes", 485, 166, 21, MUTED, "center")
    cartes = [("une carte", "CLAUDE.md et un routeur par domaine : Claude va droit au bon fichier"),
              ("du texte simple", "un en-tête par fichier, une ligne par image : pas de base vectorielle"),
              ("une correction, une fois", "/note et /calibrate : la skill ou la mémoire change"),
              ("des routines légères", "passives, avec un plafond, et sans IA quand rien n'est à juger")]
    for i, (titre, desc) in enumerate(cartes):
        x0 = 90 + (i % 2) * 410
        y0 = 205 + (i // 2) * 230
        sc.rect(x0, y0, 380, 205, stroke=AMBRE if i == 0 else PAPER, op=100 if i == 0 else 80)
        sc.texte(titre, x0 + 24, y0 + 24, 25, PAPER)
        sc.texte(desc, x0 + 24, y0 + 72, 20, MUTED, maxi=330)


# ---------- Les slides sans cadre de leçon ----------

def couverture(sc):
    fond(sc)
    sc.texte("Club SMART", 60, 44, 20, MUTED)
    sc.texte("Optimiser ses tokens", W / 2, 300, 96, PAPER, "center")
    sc.ligne([(W / 2 - 160, 440), (W / 2 + 160, 440)], stroke=AMBRE, sw=4)
    sc.texte("Ce que Claude relit, ce que ça te coûte, et comment payer moins", W / 2, 480, 32, MUTED, "center")
    etiquette(sc, APP, W / 2 - 16, 600)
    etiquette(sc, CC, W / 2 + 16 + largeur(CC, 19) + 28, 600)


def pour_ce_soir(sc):
    fond(sc)
    sc.texte("Pour ce soir", 60, 44, 20, MUTED)
    sc.texte("Trois réglages pour ce soir", W / 2, 84, 50, PAPER, "center")
    cartes = [("Une tâche, une discussion", "Change de sujet ? Ouvre une discussion neuve.", APP),
              ("Le bon modèle, dès le début", "Sonnet au quotidien, Opus pour réfléchir.", APP),
              ("Tape /usage", "Repère la skill qui pèse le plus sur 7 jours.", CC)]
    for i, (titre, desc, tag) in enumerate(cartes):
        x0, y0, w = 80 + i * 490, 200, 440
        sc.rect(x0, y0, w, 440, stroke=AMBRE if i == 0 else PAPER, op=100 if i == 0 else 80)
        sc.cercle(x0 + 62, y0 + 66, 30, stroke=AMBRE)
        sc.texte(str(i + 1), x0 + 62, y0 + 47, 34, AMBRE, "center")
        sc.texte(titre, x0 + 32, y0 + 130, 32, PAPER, maxi=380)
        sc.texte(desc, x0 + 32, y0 + 230, 24, MUTED, maxi=380)
        etiquette(sc, tag, x0 + 32 + largeur(tag, 19) + 28, y0 + 370)
    sc.texte("Le module complet est dans la classroom Agentic AI du Club SMART.", W / 2, 752, 36, AMBRE, "center")


# ---------- La suite de la vidéo ----------

NOUVELLES = {
    "ce-que-coute-un-message": dict(
        partie="Comprendre", tag=APP, titre="Ce que coûte un message", entete="En clair", visuel=v_equation,
        etapes=["Ce qu'il relit coûte 10 fois moins, ou mieux, tant que le cache est chaud.",
                "Ce qu'il lit pour la première fois coûte le prix normal.",
                "Ce qu'il écrit coûte 5 fois plus cher que ce qu'il lit."],
        choc="Plus la discussion est longue, plus chaque message pèse.",
        note="Rapports tirés du tarif de l'API Claude (octobre 2026). Avec un abonnement, ta limite se compte "
             "en usage, sur 5 heures et sur la semaine."),
    "ce-que-claude-relit": dict(
        partie="Comprendre", tag=CC, titre="Ce que Claude relit à chaque message", entete="Pour la voir",
        visuel=v_contexte,
        etapes=["Dans Claude Code, tape /context.",
                "Dans l'onglet Code de l'app, ouvre la carte Contexte.",
                "Regarde la part des messages : c'est elle qui grossit."],
        choc="À chaque message, Claude relit toute la pile.",
        note="Les noms exacts des parts changent selon ta version : reprends ceux de ton /context."),
    "ce-qui-refroidit-le-cache": dict(
        partie="Le cache", tag=CC, titre="Ce qui refroidit le cache", visuel=v_cache_froid,
        etapes=["Garde le même modèle pendant toute la discussion.",
                "Tu veux changer de modèle ? Fais-le au début d'une discussion neuve.",
                "Après une longue pause, repars d'une discussion neuve avec un résumé."],
        choc="Un cache froid, c'est toute la discussion repayée.",
        note="Durées de Claude Code, doc officielle d'octobre 2026. Au-delà de ta limite, avec des crédits "
             "d'usage, le cache passe aussi à 5 minutes."),
    "le-bon-modele-pour-la-discussion": dict(
        partie="Les modèles", tag=APP, titre="Le bon modèle pour la discussion", visuel=v_modele,
        etapes=["Choisis le modèle au début de la discussion, pas au milieu.",
                "Sonnet pour le travail courant, Opus quand il faut vraiment réfléchir.",
                "Claude Code : /model. L'app : le sélecteur de modèle."],
        choc="Le plus gros modèle n'est pas le bon pour tout.",
        note="Tarif de l'API Claude, octobre 2026. Haiku 5.5 : 0,10 $ jusqu'à 100 000 tokens par demande, "
             "0,50 $ au-delà."),
    "et-dans-un-systeme": dict(
        partie="Et ensuite", tag=CC, titre="Et dans un système ?", entete="Ce que ça change", visuel=v_systeme,
        etapes=["Claude lit une carte au lieu de fouiller tes fichiers.",
                "Une correction donnée une fois ne revient plus.",
                "Ce qui tourne sans IA ne coûte aucun token."],
        choc="Ce que tu ranges une fois, Claude ne le cherche plus."),
}

# Leçons gardées du module : la partie, l'étiquette, et une note remplacée quand elle renvoyait à un numéro
GARDEES = {
    "pourquoi-chaque-message-coute-plus-cher": ("Comprendre", APP,
                                                "Le cache réduit le prix de cette relecture : on y vient juste après."),
    "le-context-rot": ("Comprendre", APP, None),
    "le-cache-de-prompt": ("Le cache", CC, None),
    "garder-le-cache-chaud": ("Le cache", CC, None),
    "voir-sa-consommation": ("Mesurer", CC, None),
    "compacter-avec-une-intention": ("La discussion", CC, None),
    "trouver-les-skills-qui-coutent": ("Mesurer", CC, None),
    "lancer-une-skill-sans-discussion": ("Les skills", CC, None),
    "choisir-la-connexion-la-plus-legere": ("Les connexions", CC, None),
    "les-mods-de-claude-code": ("Sortir du chat", CC, None),
}

SUITE = ["couverture", "ce-que-coute-un-message", "ce-que-claude-relit",
         "pourquoi-chaque-message-coute-plus-cher", "le-context-rot", "le-cache-de-prompt",
         "garder-le-cache-chaud", "ce-qui-refroidit-le-cache", "voir-sa-consommation",
         "compacter-avec-une-intention", "le-bon-modele-pour-la-discussion", "trouver-les-skills-qui-coutent",
         "lancer-une-skill-sans-discussion", "choisir-la-connexion-la-plus-legere", "les-mods-de-claude-code",
         "et-dans-un-systeme", "pour-ce-soir"]


if __name__ == "__main__":
    os.makedirs(SORTIE, exist_ok=True)
    par_slug = {l["slug"]: l for l in lecons.LECONS}
    for n, slug in enumerate(SUITE, 1):
        sc = Scene()
        if slug == "couverture":
            couverture(sc)
        elif slug == "pour-ce-soir":
            pour_ce_soir(sc)
        elif slug in NOUVELLES:
            d = NOUVELLES[slug]
            cadre_video(sc, d["partie"], d["tag"], d["titre"], d["etapes"], d["choc"], d.get("note"),
                        d.get("entete", "À mettre en place"))
            d["visuel"](sc)
        else:
            partie, tag, note = GARDEES[slug]
            l = par_slug[slug]
            cadre_video(sc, partie, tag, l["titre"], l["etapes"], l["choc"], note or l["note"])
            l["visuel"](sc)
        nom = f"{n:02d}-{slug}"
        sauver(sc, os.path.join(SORTIE, nom + ".excalidraw"))
        print(nom)
