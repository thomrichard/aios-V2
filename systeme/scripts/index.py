#!/usr/bin/env python3
"""Génère les _index.md depuis les en-têtes des fichiers, et la page outbox/index.html.

Usage : python3 systeme/scripts/index.py [--check]
  --check : n'écrit rien, liste les index qui ne sont plus à jour (code 1 s'il y en a).
"""
import html
import os
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOSSIERS = ["projets", "domaines", "savoir", "bibliotheques"]
IGNORES = {"_index.md", "_images.md"}
AVERTISSEMENT = "<!-- Généré par systeme/scripts/index.py : ne pas modifier à la main. -->"


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
td, th {{ border-bottom: 1px solid #e5e5e5; padding: 8px; text-align: left; font-size: 14px; }}
@media (prefers-color-scheme: dark) {{
  body {{ color: #eee; background: #161616; }} table {{ background: #1f1f1f; }} td, th {{ border-color: #333; }}
  a {{ color: #8ab4ff; }}
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
  document.querySelectorAll('#lignes tr, #skills tr').forEach(function (r) {{
    r.style.display = r.textContent.toLowerCase().indexOf(t) === -1 ? 'none' : '';
  }});
}});
</script>
</body>
</html>
"""


def cibles():
    """Chaque fichier généré et son contenu attendu."""
    for dossier in tous_les_dossiers():
        yield os.path.join(dossier, "_index.md"), index_dossier(dossier)
    if os.path.isdir(os.path.join(RACINE, "skills")):
        yield os.path.join(RACINE, "skills", "_index.md"), index_skills()
    if os.path.isdir(os.path.join(RACINE, "outbox")):
        yield os.path.join(RACINE, "outbox", "index.html"), page_outbox()


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
