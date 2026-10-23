#!/usr/bin/env python3
"""Génère les _index.md depuis les en-têtes des fichiers, la page outbox/index.html (sorties, process, skills),
la carte des domaines d'AGENTS.md, et les réglages de l'interface (départements, routines, applications)
depuis systeme/metadonnees.md, systeme/routines.md et systeme/connexions.md.

Usage : python3 systeme/scripts/index.py [--check]
  --check : n'écrit rien, liste les index qui ne sont plus à jour (code 1 s'il y en a).
"""
import html
import json
import os
import re
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOSSIERS = ["projets", "processus", "domaines", "savoir", "bibliotheques"]
IGNORES = {"_index.md", "_images.md"}
AVERTISSEMENT = "<!-- Généré par systeme/scripts/index.py : ne pas modifier à la main. -->"
DEBUT_CARTE = ("<!-- Début de la carte : générée par systeme/scripts/index.py depuis systeme/metadonnees.md. "
               "Change les domaines là-bas. -->")
FIN_CARTE = "<!-- Fin de la carte -->"
COULEURS = ["#00bcd4", "#e040fb", "#fdd835", "#43a047", "#f44336", "#ec407a", "#26a69a", "#8d6e63"]
ICONES = ["pen", "people", "build", "data", "pulse", "book", "visual", "clock", "api"]
COUCHES = [
    {"key": "A", "label": "Applications", "color": "#3f8fd4", "shape": "hex", "blurb": "Serveurs MCP, CLI et API que ton agent peut joindre"},
    {"key": "R", "label": "Routines", "color": "#d99a1f", "shape": "ringdot", "blurb": "Automatisations planifiées, qui tournent sans qu’on les demande"},
    {"key": "M", "label": "Mémoire", "color": "#9a66e0", "shape": "chip", "blurb": "Chaque fichier de contexte, regroupé par domaine"},
    {"key": "S", "label": "Skills", "color": "#ff6b1a", "shape": "diamond", "blurb": "Ce que ton agent peut lancer à la demande"},
]


def lire_entete(chemin):
    """Lit l'en-tête (entre deux lignes ---) d'un fichier Markdown : un dict de champs simples."""
    champs = {}
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return champs
    if not lignes or lignes[0].strip() != "---":
        return champs
    for ligne in lignes[1:]:
        if ligne.strip() == "---":
            break
        if ":" not in ligne or ligne.startswith((" ", "\t", "-")):
            continue
        cle, valeur = ligne.split(":", 1)
        valeur = valeur.split(" #", 1)[0].strip().strip("\"'")
        if valeur.startswith("[") and valeur.endswith("]"):
            valeur = ", ".join(v.strip().strip("\"'") for v in valeur[1:-1].split(",") if v.strip())
        champs[cle.strip()] = valeur
    return champs


def cellule(texte):
    return (texte or "").replace("|", "/").replace("\n", " ").strip()


def texte_html(texte):
    """Échappe le texte, et garde les `chemins` en code."""
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", html.escape(texte or ""))


def tableau(chemin, premiere_colonne):
    """Le premier tableau Markdown dont la première colonne porte ce titre : une liste de dicts."""
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return []
    entetes, rangs = None, []
    for ligne in lignes:
        if not ligne.startswith("|"):
            if entetes:
                break
            continue
        cases = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if entetes is None:
            if cases[0] == premiere_colonne:
                entetes = cases
        elif not set(cases[0]) <= set("-: "):
            rangs.append(dict(zip(entetes, cases)))
    return rangs


def tableaux(chemin, premiere_colonne):
    """Tous les tableaux Markdown dont la première colonne porte ce titre, mis bout à bout : une liste de dicts."""
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return []
    entetes, rangs = None, []
    for ligne in lignes:
        if not ligne.startswith("|"):
            entetes = None
            continue
        cases = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if entetes is None:
            entetes = cases if cases[0] == premiere_colonne else []
        elif entetes and not set(cases[0]) <= set("-: "):
            rangs.append(dict(zip(entetes, cases)))
    return rangs


def domaines():
    """Les domaines réglés dans systeme/metadonnees.md, ceux du socle puis ceux du workspace : (nom, ce qu'il couvre)."""
    trouves = {}
    for r in tableaux(os.path.join(RACINE, "systeme", "metadonnees.md"), "Domaine"):
        nom = r.get("Domaine", "").strip("`")
        if nom and nom not in trouves:
            trouves[nom] = r.get("Ce qu'il couvre", "")
    return list(trouves.items())


def carte_agents():
    """AGENTS.md, avec la carte des domaines régénérée entre ses deux balises ; None si les balises manquent."""
    with open(os.path.join(RACINE, "AGENTS.md"), encoding="utf-8") as f:
        texte = f.read()
    debut, fin = texte.find(DEBUT_CARTE), texte.find(FIN_CARTE)
    if debut < 0 or fin < debut:
        return None
    lignes = [DEBUT_CARTE, "", "| Domaine | Ce qu'il couvre | Routeur |", "|---|---|---|"]
    lignes += [f"| {nom} | {cellule(couvre)} | `routers/{nom}.md` |" for nom, couvre in domaines()]
    return texte[:debut] + "\n".join(lignes) + "\n\n" + texte[fin:]


def etapes(chemin):
    """Le tableau des étapes d'un process : (étape, skills, ce qu'on décide, qui décide) par ligne."""
    trouvees = []
    try:
        with open(chemin, encoding="utf-8") as f:
            lignes = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return trouvees
    for ligne in lignes:
        if not ligne.startswith("|"):
            continue
        cases = [c.strip() for c in ligne.strip().strip("|").split("|")]
        if len(cases) < 4 or cases[0] == "Étape" or set(cases[0]) <= set("-: "):
            continue
        noms = [n.strip().strip("`") for n in cases[1].split(",")]
        trouvees.append((cases[0], [n for n in noms if n and n not in ("—", "-")], cases[2], cases[3]))
    return trouvees


def les_processus():
    """Chaque process : son nom, son en-tête, ses étapes."""
    depart = os.path.join(RACINE, "processus")
    if not os.path.isdir(depart):
        return []
    return [(nom[:-3], lire_entete(os.path.join(depart, nom)), etapes(os.path.join(depart, nom)))
            for nom in sorted(os.listdir(depart)) if nom.endswith(".md") and nom not in IGNORES]


def skills_utilisees(liste_etapes):
    vues = []
    for _, noms, _, _ in liste_etapes:
        vues += [n for n in noms if n not in vues]
    return vues


def passages():
    """Les passages notés dans journal/log.md (« processus <nom> | <sujet> »), du plus récent au plus ancien."""
    trouves = {}
    chemin = os.path.join(RACINE, "journal", "log.md")
    if not os.path.exists(chemin):
        return trouves
    with open(chemin, encoding="utf-8") as f:
        for ligne in f:
            m = re.match(r"- (\d{4}-\d{2}-\d{2}) · processus ([a-z0-9-]+) \| (.*)", ligne.strip())
            if m:
                trouves.setdefault(m.group(2), []).insert(0, (m.group(1), m.group(3)))
    return trouves


def index_dossier(dossier):
    """Contenu de l'_index.md d'un dossier."""
    relatif = os.path.relpath(dossier, RACINE)
    entrees = sorted(os.listdir(dossier))
    sous_dossiers = [e for e in entrees if os.path.isdir(os.path.join(dossier, e)) and not e.startswith(".")]
    fichiers = [e for e in entrees if e.endswith(".md") and e not in IGNORES]
    lignes = [f"# {relatif} · index", "", AVERTISSEMENT, ""]

    if not fichiers:
        lignes.append("Aucun fichier pour l'instant.")
    elif relatif == "projets":
        lignes += ["| Projet | Domaine | Statut | Échéance | Prochaine étape |", "|---|---|---|---|---|"]
        projets = [(f, lire_entete(os.path.join(dossier, f))) for f in fichiers]
        projets.sort(key=lambda p: (p[1].get("statut") == "clos", p[0]))
        for nom, e in projets:
            lignes.append(f"| [{nom[:-3]}]({nom}) | {cellule(e.get('domaine'))} | {cellule(e.get('statut'))} "
                          f"| {cellule(e.get('echeance'))} | {cellule(e.get('prochaine_etape'))} |")
    elif relatif == "processus":
        lignes += ["| Process | Domaine | Skills | Déclencheur | Statut |", "|---|---|---|---|---|"]
        for nom, e, liste in les_processus():
            lignes.append(f"| [{nom}]({nom}.md) | {cellule(e.get('domaine'))} | {cellule(', '.join(skills_utilisees(liste)))} "
                          f"| {cellule(e.get('declencheur'))} | {cellule(e.get('statut'))} |")
    else:
        lignes += ["| Fichier | Résumé | Statut | Projet | Maj |", "|---|---|---|---|---|"]
        notes = [(f, lire_entete(os.path.join(dossier, f))) for f in fichiers]
        notes.sort(key=lambda n: (n[1].get("maj", ""), n[0]), reverse=True)
        for nom, e in notes:
            lignes.append(f"| [{nom}]({nom}) | {cellule(e.get('resume'))} | {cellule(e.get('statut'))} "
                          f"| {cellule(e.get('projet'))} | {cellule(e.get('maj'))} |")

    if sous_dossiers:
        lignes += ["", "## Dossiers", ""]
        lignes += [f"- [{d}/]({d}/_index.md)" for d in sous_dossiers]
    if os.path.exists(os.path.join(dossier, "_images.md")):
        lignes += ["", "Images : [_images.md](_images.md)"]
    return "\n".join(lignes) + "\n"


def tous_les_dossiers():
    for base in DOSSIERS:
        depart = os.path.join(RACINE, base)
        if not os.path.isdir(depart):
            continue
        for dossier, sous, _ in os.walk(depart):
            sous[:] = sorted(s for s in sous if not s.startswith("."))
            yield dossier


def livrables():
    """Fichiers des domaines à montrer dans l'outbox : statut a-valider, ou type livrable."""
    trouves = []
    depart = os.path.join(RACINE, "domaines")
    for dossier, sous, fichiers in os.walk(depart):
        sous[:] = [s for s in sous if not s.startswith(".")]
        for nom in fichiers:
            if not nom.endswith(".md") or nom in IGNORES:
                continue
            chemin = os.path.join(dossier, nom)
            e = lire_entete(chemin)
            if e.get("statut") == "a-valider" or e.get("type") == "livrable":
                trouves.append((e.get("maj", ""), os.path.relpath(chemin, RACINE), e))
    return sorted(trouves, reverse=True)


def skills():
    """Chaque skill : son nom, la première phrase de sa description, son fichier."""
    trouvees = []
    depart = os.path.join(RACINE, "skills")
    if not os.path.isdir(depart):
        return trouvees
    for nom in sorted(os.listdir(depart)):
        fichier = os.path.join(depart, nom, "SKILL.md")
        if os.path.exists(fichier):
            e = lire_entete(fichier)
            description = e.get("description", "")
            premiere = description.split(". ")[0].rstrip(".") + "." if description else ""
            trouvees.append((e.get("name", nom), premiere, f"{nom}/SKILL.md"))
    return trouvees


def index_skills():
    lignes = ["# skills · index", "", AVERTISSEMENT, "",
              "Chaque skill vit dans `skills/<nom>/SKILL.md` : le dossier porte son nom.", ""]
    liste = skills()
    if not liste:
        lignes.append("Aucune skill pour l'instant.")
    else:
        lignes += ["| Skill | Ce qu'elle fait | Fichier |", "|---|---|---|"]
        for nom, description, fichier in liste:
            lignes.append(f"| {cellule(nom)} | {cellule(description)} | [{fichier}]({fichier}) |")
    return "\n".join(lignes) + "\n"


def ligne_processus(nom, e, liste, derniers):
    """Une ligne du tableau des process de l'outbox."""
    items = []
    for etape, noms, decision, qui in liste:
        item = texte_html(etape)
        if noms:
            item += " · <code>" + html.escape(", ".join(noms)) + "</code>"
        if decision not in ("—", "-", ""):
            item += " · " + texte_html(decision)
        items.append(f'<li>{item} <span class="qui">({html.escape(qui)})</span></li>')
    infos = [e.get("domaine", ""), e.get("declencheur", "")]
    if e.get("statut") and e.get("statut") != "actif":
        infos.append(e["statut"])
    passes = "<br>".join(f"{html.escape(d)} · {texte_html(s)}" for d, s in derniers[:3]) or "—"
    return (f'<tr><td><a href="../processus/{html.escape(nom)}.md">{html.escape(nom)}</a><br>'
            f'<span class="qui">{html.escape(" · ".join(i for i in infos if i))}</span></td>'
            f'<td><ol>{"".join(items)}</ol></td><td>{passes}</td></tr>')


def page_outbox():
    points_dir = os.path.join(RACINE, "outbox", "points")
    points = sorted((p for p in os.listdir(points_dir) if p.endswith(".md")), reverse=True) \
        if os.path.isdir(points_dir) else []
    lignes = []
    for p in points:
        lignes.append(f'<tr><td>{html.escape(p[:-3])}</td><td>Point du jour</td>'
                      f'<td><a href="points/{html.escape(p)}">{html.escape(p)}</a></td><td></td></tr>')
    for maj, chemin, e in livrables():
        lignes.append(f'<tr><td>{html.escape(maj)}</td><td>{html.escape(e.get("resume", ""))}</td>'
                      f'<td><a href="../{html.escape(chemin)}">{html.escape(chemin)}</a></td>'
                      f'<td>{html.escape(e.get("statut", ""))}</td></tr>')
    corps = "\n".join(lignes) or '<tr><td colspan="4">Rien pour l\'instant.</td></tr>'
    corps_skills = "\n".join(
        f'<tr><td>{html.escape(nom)}</td><td>{html.escape(description)}</td>'
        f'<td><a href="../skills/{html.escape(fichier)}">skills/{html.escape(fichier)}</a></td></tr>'
        for nom, description, fichier in skills()) or '<tr><td colspan="3">Aucune skill.</td></tr>'
    tous_passages = passages()
    corps_processus = "\n".join(
        ligne_processus(nom, e, liste, tous_passages.get(nom, []))
        for nom, e, liste in les_processus()) or '<tr><td colspan="3">Aucun process.</td></tr>'
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Outbox</title>
<!-- Généré par systeme/scripts/index.py : ne pas modifier à la main. -->
<style>
body {{ font-family: system-ui, sans-serif; margin: 24px; color: #1e1e1e; background: #fafafa; }}
h1 {{ font-size: 22px; }} h2 {{ font-size: 17px; margin-top: 28px; }}
input {{ width: 100%; max-width: 480px; padding: 8px; font-size: 15px; margin-bottom: 16px; }}
table {{ border-collapse: collapse; width: 100%; background: #fff; }}
td, th {{ border-bottom: 1px solid #e5e5e5; padding: 8px; text-align: left; font-size: 14px; vertical-align: top; }}
ol {{ margin: 0; padding-left: 18px; }} li {{ margin-bottom: 4px; }} code {{ font-size: 13px; }}
.qui {{ color: #777; font-size: 13px; }}
@media (prefers-color-scheme: dark) {{
  body {{ color: #eee; background: #161616; }} table {{ background: #1f1f1f; }} td, th {{ border-color: #333; }}
  a {{ color: #8ab4ff; }} .qui {{ color: #999; }}
}}
</style>
</head>
<body>
<h1>Outbox</h1>
<input id="q" placeholder="Rechercher (sans IA)" autofocus>
<table>
<thead><tr><th>Date</th><th>Quoi</th><th>Fichier</th><th>Statut</th></tr></thead>
<tbody id="lignes">
{corps}
</tbody>
</table>
<h2>Process</h2>
<table>
<thead><tr><th>Process</th><th>Étapes · skill · ce qu'on décide (qui)</th><th>Derniers passages</th></tr></thead>
<tbody id="processus">
{corps_processus}
</tbody>
</table>
<h2>Skills</h2>
<table>
<thead><tr><th>Skill</th><th>Ce qu'elle fait</th><th>Fichier</th></tr></thead>
<tbody id="skills">
{corps_skills}
</tbody>
</table>
<script>
document.getElementById('q').addEventListener('input', function () {{
  var t = this.value.toLowerCase();
  document.querySelectorAll('#lignes tr, #processus tr, #skills tr').forEach(function (r) {{
    r.style.display = r.textContent.toLowerCase().indexOf(t) === -1 ? 'none' : '';
  }});
}});
</script>
</body>
</html>
"""


def departements_interface():
    """config/departments.json de l'interface : un département par domaine de systeme/metadonnees.md."""
    noms = [nom for nom, _ in domaines()]
    departements, regles = [], []
    for i, nom in enumerate(noms):
        icone = "coin" if nom == "operations" else ICONES[i % len(ICONES)]
        departements.append({"key": nom, "label": nom.capitalize(), "color": COULEURS[i % len(COULEURS)], "icon": icone})
        regles += [{"prefix": f"domaines/{nom}/", "dept": nom}, {"prefix": f"routers/{nom}.md", "dept": nom}]
    for dossier in ("projets", "processus"):
        depart = os.path.join(RACINE, dossier)
        for f in sorted(os.listdir(depart)) if os.path.isdir(depart) else []:
            if f.endswith(".md") and f not in IGNORES:
                domaine = lire_entete(os.path.join(depart, f)).get("domaine")
                if domaine in noms:
                    regles.append({"prefix": f"{dossier}/{f}", "dept": domaine})
    contenu = {
        "_note": "Généré par systeme/scripts/index.py depuis les domaines de systeme/metadonnees.md et l'en-tête "
                 "des projets et des process : ne pas modifier à la main.",
        "departments": departements, "layers": COUCHES, "projectPrefixes": {}, "pathRules": regles,
        "memoryKeywords": [], "default": "operations" if "operations" in noms or not noms else noms[0],
    }
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def routines_interface():
    """snapshots/routines.json de l'interface, depuis le tableau de systeme/routines.md."""
    routines = []
    for r in tableau(os.path.join(RACINE, "systeme", "routines.md"), "Routine"):
        skill, etat = r.get("Skill", "").strip("`").strip("—-"), r.get("État", "").lower()
        directe = r.get("Commande", "").strip("`").strip("—-")
        routine = {"id": skill or r["Routine"].lower().replace(" ", "-"), "name": r["Routine"], "source": "planificateur",
                   "desc": " · ".join(x for x in (r.get("Quand", ""), f"skill {skill}" if skill else "",
                                                  "sans IA" if directe else "", r.get("Type", "")) if x),
                   "status": "active" if etat.startswith("en place") else "ondemand" if "demande" in etat else "paused"}
        cron = r.get("Cron", "").strip("`")
        if cron and cron not in ("—", "-"):
            routine["cron"] = cron
        routines.append(routine)
    contenu = {
        "_note": "Généré par systeme/scripts/index.py depuis systeme/routines.md : ne pas modifier à la main.",
        "timezone": "", "sources": [{"key": "planificateur", "label": "PLANIFICATEUR"}], "routines": routines,
    }
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def apps_interface():
    """config/apps.json de l'interface, depuis le tableau de systeme/connexions.md."""
    genres = {"cli": "cli", "api": "api", "mcp": "mcp"}
    apps = []
    for r in tableau(os.path.join(RACINE, "systeme", "connexions.md"), "Outil"):
        outil = r.get("Outil", "").strip("`")
        if not outil:
            continue
        genre = genres.get(r.get("Méthode", "").strip("`").lower(), "app")
        app = {"id": "app:" + re.sub(r"[^a-z0-9]+", "-", outil.lower()).strip("-"), "label": outil, "kind": genre,
               "access": "local", "status": "live", "desc": r.get("Pourquoi", "")}
        # Plusieurs noms séparés par des virgules : un même service branché deux fois (MCP local et connecteur du compte)
        noms = [n.strip().strip("`") for n in r.get("Commande", "").split(",")]
        noms = [n for n in noms if n and n not in ("—", "-")]
        if noms:
            app["mcp" if genre == "mcp" else "command"] = noms if genre == "mcp" and len(noms) > 1 else noms[0]
        apps.append(app)
    contenu = {"_note": "Généré par systeme/scripts/index.py depuis systeme/connexions.md : ne pas modifier à la main.",
               "apps": apps}
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def espace_interface():
    """config/workspace.json de l'interface : chaque dossier de domaines/ s'affiche ouvert sur la carte, sans clic."""
    chemin = os.path.join(RACINE, "interface", "config", "workspace.json")
    with open(chemin, encoding="utf-8") as f:
        contenu = json.load(f)
    visibles = [d for d in contenu.get("visibleRoots", []) if not d.startswith("domaines/")]
    depart = os.path.join(RACINE, "domaines")
    for dossier, sous, _ in os.walk(depart):
        sous[:] = sorted(s for s in sous if not s.startswith("."))
        if dossier != depart:
            visibles.append(os.path.relpath(dossier, RACINE).replace(os.sep, "/"))
    contenu["visibleRoots"] = visibles
    return json.dumps(contenu, indent=2, ensure_ascii=False) + "\n"


def cibles():
    """Chaque fichier généré et son contenu attendu."""
    for dossier in tous_les_dossiers():
        yield os.path.join(dossier, "_index.md"), index_dossier(dossier)
    if os.path.isdir(os.path.join(RACINE, "skills")):
        yield os.path.join(RACINE, "skills", "_index.md"), index_skills()
    if os.path.isdir(os.path.join(RACINE, "outbox")):
        yield os.path.join(RACINE, "outbox", "index.html"), page_outbox()
    carte = carte_agents() if os.path.exists(os.path.join(RACINE, "AGENTS.md")) else None
    if carte is not None:
        yield os.path.join(RACINE, "AGENTS.md"), carte
    if os.path.isdir(os.path.join(RACINE, "interface", "config")):
        yield os.path.join(RACINE, "interface", "config", "departments.json"), departements_interface()
        yield os.path.join(RACINE, "interface", "snapshots", "routines.json"), routines_interface()
        if os.path.exists(os.path.join(RACINE, "interface", "config", "workspace.json")):
            yield os.path.join(RACINE, "interface", "config", "workspace.json"), espace_interface()
        yield os.path.join(RACINE, "interface", "config", "apps.json"), apps_interface()


def main():
    verifier_seulement = "--check" in sys.argv
    perimes = []
    for chemin, contenu in cibles():
        actuel = None
        if os.path.exists(chemin):
            with open(chemin, encoding="utf-8") as f:
                actuel = f.read()
        if actuel == contenu:
            continue
        perimes.append(os.path.relpath(chemin, RACINE))
        if not verifier_seulement:
            with open(chemin, "w", encoding="utf-8") as f:
                f.write(contenu)
    if verifier_seulement:
        for p in perimes:
            print(f"Index pas à jour : {p}")
        return 1 if perimes else 0
    print(f"{len(perimes)} fichier(s) généré(s) ou mis à jour.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
