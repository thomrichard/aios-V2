#!/usr/bin/env python3
"""Assemble les vidéos codées en un tableau, puis croise l'écriture et la performance.

Usage : python3 -I domaines/contenu/analyse-concurrents/consolider.py
  Lit chaque <chaine>/<video>/ (video.json, metriques.json, codage.json, vidiq.json ou analytics.json) et écrit :
  - videos.csv et videos.json : une ligne par vidéo, mesures, codes et performance ;
  - segments.csv : une ligne par segment codé, avec la rétention de début et de fin pour la chaîne de Thomas ;
  - croisements.json : pour chaque technique et chaque mesure, la performance des vidéos qui l'ont ou non.
  La performance est lue dans la chaîne : vues à 7 jours divisées par la médiane des vues à 7 jours de la chaîne.
"""
import csv
import datetime
import json
import math
import os
import statistics

ICI = os.path.dirname(os.path.abspath(__file__))
PROPRIETAIRE = "thom-richard"
TECHNIQUES = ["ap_alignement_5s", "ap_boucle_curiosite", "ap_effort_montre", "ap_setup_progress_payoff",
              "ap_contraste_rythme", "ap_montrer_sans_son", "ali_douleur_histoire", "ali_coeur_unique", "alx_pont",
              "alx_pull_paint_point", "alx_nom_idee", "alx_phrase_finale", "alx_douleur_reve", "alx_cta_tot",
              "ed_intro_courte", "ed_hook", "ed_probleme_preuve_consignes", "ed_tension_relancee",
              "ed_histoire_vecue", "ed_sans_surexplication", "ed_niveau_simple", "tous_video_suivante"]
MESURES = ["duree_s", "titre_caracteres", "mots_par_minute", "seconde_premier_point", "premier_payoff_seconde",
           "changements_premiere_minute", "changements_minute_milieu", "plan_moyen_s", "relances_par_minute",
           "part_segments_ppp", "nb_histoires", "miniature_texte_mots", "part_face", "part_ecran", "part_motion",
           "premier_cta_offre_seconde"]


def lire(chemin, defaut=None):
    try:
        with open(chemin, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return defaut


def date(texte):
    return datetime.datetime.fromisoformat(texte.replace("Z", "+00:00"))


def vues_a(serie, publie, jours):
    """Vues interpolées à publie + jours, dans une série [(datetime, vues)] ; None si la série ne va pas jusque-là."""
    cible = publie + datetime.timedelta(days=jours)
    for (t1, v1), (t2, v2) in zip(serie, serie[1:]):
        if t1 <= cible <= t2:
            part = (cible - t1).total_seconds() / max(1, (t2 - t1).total_seconds())
            return round(v1 + (v2 - v1) * part)
    return None


def performance(dossier, video):
    """Vues à 1 et 7 jours, depuis VidIQ (concurrents) ou YouTube Analytics (chaîne de Thomas)."""
    publie = date(video["publie"])
    if video["chaine"] == PROPRIETAIRE:
        a = lire(os.path.join(dossier, "analytics.json"), {})
        jours = a.get("jours") if isinstance(a.get("jours"), list) else []
        cumul, total = {}, 0
        for ligne in jours:
            total += ligne["views"]
            cumul[(datetime.date.fromisoformat(ligne["day"]) - publie.date()).days] = total
        return {"vues_j1": cumul.get(1), "vues_j7": cumul.get(6), "breakout_vidiq": None, "source_vues": "analytics"}
    v = lire(os.path.join(dossier, "vidiq.json"), {})
    serie = sorted((date(p["timestamp"]), p["views"]) for p in v.get("stats_jour") or [] if p.get("views") is not None)
    return {"vues_j1": vues_a(serie, publie, 1), "vues_j7": vues_a(serie, publie, 7),
            "breakout_vidiq": v.get("breakout"), "source_vues": "vidiq" if serie else None}


def retention(dossier, duree):
    """La courbe de rétention [(seconde, part restante)] de la chaîne de Thomas, ou []."""
    a = lire(os.path.join(dossier, "analytics.json"), {})
    lignes = a.get("retention") if isinstance(a.get("retention"), list) else []
    return [(l["elapsedVideoTimeRatio"] * duree, l["audienceWatchRatio"]) for l in lignes]


def a_seconde(courbe, s):
    for (s1, r1), (s2, r2) in zip(courbe, courbe[1:]):
        if s1 <= s <= s2:
            return r1 + (r2 - r1) * (s - s1) / max(1e-9, s2 - s1)
    return courbe[-1][1] if courbe and s > courbe[-1][0] else (courbe[0][1] if courbe else None)


def ligne_video(dossier):
    video = lire(os.path.join(dossier, "video.json"))
    m = lire(os.path.join(dossier, "metriques.json"), {})
    c = lire(os.path.join(dossier, "codage.json"), {})
    code = bool(c)
    if not isinstance(c.get("titre"), dict):  # premiers codages : la clé titre en double, le texte a pu gagner
        c["titre"] = {}
    stats = video["api"]["statistics"]
    vues = int(stats.get("viewCount", 0))
    duree = video["duree_s"]
    s = c.get("structure", {})
    segments = s.get("segments") or []
    points = [g for g in segments if g.get("role") in ("point", "demo")]
    fin = c.get("fin", {})
    offres = [x["seconde"] for x in fin.get("ctas") or [] if x.get("type") not in
              ("abonnement", "like-commentaire", "video-suivante", "autre") and x.get("seconde") is not None]
    hab = c.get("habillage", {})
    ligne = {
        "chaine": video["chaine"], "video_id": video["id"], "dossier": os.path.relpath(dossier, ICI),
        "titre": video["titre"], "titre_ytdlp_different": video.get("titre_ytdlp") not in (None, video["titre"]),
        "publie": video["publie"][:10], "vues": vues, "likes_1000": round(int(stats.get("likeCount", 0)) / max(1, vues) * 1000, 1),
        "commentaires_1000": round(int(stats.get("commentCount", 0)) / max(1, vues) * 1000, 2),
        **performance(dossier, video),
        "duree_s": duree, "titre_caracteres": m.get("titre_caracteres"), "mots_par_minute": m.get("mots_par_minute"),
        "changements_premiere_minute": m.get("changements_premiere_minute"),
        "changements_minute_milieu": m.get("changements_minute_milieu"), "plan_moyen_s": m.get("plan_moyen_s"),
        "code": code,
        "format": c.get("identite", {}).get("format"), "format_secondaire": c.get("identite", {}).get("format_secondaire"),
        "niveau": c.get("identite", {}).get("niveau"),
        "titre_schema": c.get("titre", {}).get("schema"), "titre_registre": c.get("titre", {}).get("registre"),
        "titre_audace": c.get("titre", {}).get("audace"), "titre_marqueurs": "|".join(c.get("titre", {}).get("marqueurs") or []),
        "titre_briques": "|".join(c.get("titre", {}).get("briques") or []),
        "miniature_visage": c.get("miniature", {}).get("visage"),
        "miniature_texte_mots": c.get("miniature", {}).get("texte_mots"),
        "miniature_gap": c.get("miniature", {}).get("curiosity_gap"),
        "intro_ouverture": "|".join(c.get("intro", {}).get("ouverture") or []),
        "seconde_premier_point": c.get("intro", {}).get("seconde_premier_point"),
        "boucle_vers_la_fin": (c.get("intro", {}).get("boucle_vers_la_fin") or {}).get("presente"),
        "attente_tenue": c.get("intro", {}).get("attente_tenue"),
        "structure_modele": s.get("modele"), "nb_segments": len(segments),
        "part_segments_ppp": round(len([g for g in points if g.get("pull") and g.get("paint") and g.get("point")])
                                   / len(points), 2) if points else None,
        "relances_par_minute": round(len(s.get("relances") or []) / (duree / 60), 2) if c else None,
        "nb_histoires": len(s.get("histoires") or []) if c else None,
        "premier_payoff_seconde": s.get("premier_payoff_seconde"),
        "part_face": (hab.get("parts") or {}).get("face"), "part_ecran": (hab.get("parts") or {}).get("ecran"),
        "part_motion": (hab.get("parts") or {}).get("motion"),
        "sous_titres_incrustes": hab.get("sous_titres_incrustes"),
        "habillage_elements": "|".join(hab.get("elements") or []), "textes_ecran": hab.get("textes_ecran"),
        "rythme": hab.get("rythme"),
        "premier_cta_offre_seconde": min(offres) if offres else None,
        "sponsor": (fin.get("sponsor") or {}).get("present"), "video_suivante_precise": fin.get("video_suivante_precise"),
        "signal_promesse": c.get("commentaires", {}).get("signal_promesse"),
    }
    for t in TECHNIQUES:
        ligne[t] = (c.get("techniques", {}).get(t) or {}).get("note")
    courbe = retention(dossier, duree)
    if courbe:
        ligne["retention_30s"] = round(a_seconde(courbe, 30), 3)
        ligne["retention_moitie"] = round(a_seconde(courbe, duree / 2), 3)
        totaux = lire(os.path.join(dossier, "analytics.json"), {}).get("totaux")
        if isinstance(totaux, list) and totaux:
            ligne["vue_moyenne_pct"] = totaux[0].get("averageViewPercentage")
        ctr = lire(os.path.join(dossier, "analytics.json"), {}).get("ctr")
        if isinstance(ctr, list) and ctr:
            ligne["ctr_pct"] = ctr[0].get("videoThumbnailImpressionsClickRate")
    lignes_segments = []
    for g in segments:
        ls = {"chaine": video["chaine"], "video_id": video["id"], **{k: g.get(k) for k in
              ("debut", "fin", "titre", "role", "pull", "paint", "point", "nom", "phrase_finale", "probleme", "preuve",
               "consignes", "payoff", "relance_sortie")}}
        if courbe and g.get("fin") and g.get("debut") is not None and g["fin"] > g["debut"]:
            r1, r2 = a_seconde(courbe, g["debut"]), a_seconde(courbe, g["fin"])
            ls.update(ret_debut=round(r1, 3), ret_fin=round(r2, 3),
                      perte_par_minute=round((r1 - r2) / ((g["fin"] - g["debut"]) / 60), 4))
        lignes_segments.append(ls)
    return ligne, lignes_segments


def rangs(valeurs):
    ordre = sorted(range(len(valeurs)), key=lambda i: valeurs[i])
    r = [0.0] * len(valeurs)
    i = 0
    while i < len(ordre):
        j = i
        while j + 1 < len(ordre) and valeurs[ordre[j + 1]] == valeurs[ordre[i]]:
            j += 1
        for k in range(i, j + 1):
            r[ordre[k]] = (i + j) / 2
        i = j + 1
    return r


def spearman(x, y):
    if len(x) < 5:
        return None
    rx, ry = rangs(x), rangs(y)
    mx, my = statistics.mean(rx), statistics.mean(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = math.sqrt(sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry))
    return round(num / den, 2) if den else None


def croiser(lignes):
    """Sur les concurrents codés qui ont une perf : chaque technique (0, 1, 2) et chaque mesure face à la perf."""
    base = [l for l in lignes if l["chaine"] != PROPRIETAIRE and l["code"] and l.get("perf_log2") is not None]
    resultats = {"n_videos": len(base), "techniques": {}, "mesures": {}, "formats": {}}
    for groupe, filtre in (("tout", lambda l: True), ("hors_actu", lambda l: l["format"] != "actu")):
        sous = [l for l in base if filtre(l)]
        for t in TECHNIQUES:
            par_note = {}
            for note in (0, 1, 2):
                perfs = [l["perf_log2"] for l in sous if l.get(t) == note]
                par_note[str(note)] = {"n": len(perfs), "perf_mediane": round(statistics.median(perfs), 2) if perfs else None,
                                       "x_mediane": round(2 ** statistics.median(perfs), 2) if perfs else None}
            resultats["techniques"].setdefault(t, {})[groupe] = par_note
        for mesure in MESURES:
            paires = [(l[mesure], l["perf_log2"]) for l in sous if isinstance(l.get(mesure), (int, float))]
            resultats["mesures"].setdefault(mesure, {})[groupe] = {
                "n": len(paires), "spearman": spearman([a for a, _ in paires], [b for _, b in paires])}
    for f in sorted({l["format"] for l in base if l["format"]}):
        perfs = [l["perf_log2"] for l in base if l["format"] == f]
        resultats["formats"][f] = {"n": len(perfs), "x_mediane": round(2 ** statistics.median(perfs), 2)}
    # Les attributs : chaque valeur d'une liste (marqueurs de titre, ouvertures...) ou d'un champ, présente ou absente.
    resultats["attributs"] = {}
    for champ in ATTRIBUTS:
        valeurs = sorted({v for l in base for v in valeurs_de(l, champ)})
        for valeur in valeurs:
            avec = [l["perf_log2"] for l in base if valeur in valeurs_de(l, champ)]
            sans = [l["perf_log2"] for l in base if valeur not in valeurs_de(l, champ)]
            if len(avec) >= 3 and len(sans) >= 3:
                resultats["attributs"][f"{champ}={valeur}"] = {
                    "n_avec": len(avec), "x_avec": round(2 ** statistics.median(avec), 2),
                    "n_sans": len(sans), "x_sans": round(2 ** statistics.median(sans), 2)}
    return resultats


ATTRIBUTS = ["titre_marqueurs", "titre_briques", "titre_registre", "titre_audace", "miniature_visage", "miniature_gap",
             "intro_ouverture", "boucle_vers_la_fin", "structure_modele", "habillage_elements", "textes_ecran",
             "sous_titres_incrustes", "rythme", "sponsor", "video_suivante_precise", "niveau", "attente_tenue"]


def valeurs_de(ligne, champ):
    v = ligne.get(champ)
    if isinstance(v, str) and "|" in v:
        return set(v.split("|"))
    return {str(v)} if v not in (None, "") else set()


def main():
    lignes, segments = [], []
    for chaine in sorted(os.listdir(ICI)):
        racine = os.path.join(ICI, chaine)
        if not os.path.isdir(racine):
            continue
        for nom in sorted(os.listdir(racine)):
            dossier = os.path.join(racine, nom)
            if os.path.exists(os.path.join(dossier, "video.json")):
                ligne, segs = ligne_video(dossier)
                lignes.append(ligne)
                segments += segs
    for chaine in {l["chaine"] for l in lignes}:
        de_la_chaine = [l for l in lignes if l["chaine"] == chaine and l["vues_j7"]]
        mediane = statistics.median([l["vues_j7"] for l in de_la_chaine]) if de_la_chaine else None
        for l in lignes:
            if l["chaine"] == chaine:
                l["perf_j7"] = round(l["vues_j7"] / mediane, 2) if mediane and l["vues_j7"] else None
                l["perf_log2"] = round(math.log2(l["perf_j7"]), 3) if l["perf_j7"] else None
    colonnes = list(dict.fromkeys(k for l in lignes for k in l))
    with open(os.path.join(ICI, "videos.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, colonnes)
        w.writeheader()
        w.writerows(lignes)
    with open(os.path.join(ICI, "videos.json"), "w", encoding="utf-8") as f:
        json.dump(lignes, f, ensure_ascii=False, indent=1)
    colonnes_s = list(dict.fromkeys(k for l in segments for k in l))
    with open(os.path.join(ICI, "segments.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, colonnes_s)
        w.writeheader()
        w.writerows(segments)
    croisements = croiser(lignes)
    with open(os.path.join(ICI, "croisements.json"), "w", encoding="utf-8") as f:
        json.dump(croisements, f, ensure_ascii=False, indent=1)
    codees = len([l for l in lignes if l["code"]])
    avec_perf = len([l for l in lignes if l.get("perf_j7")])
    print(f"{len(lignes)} vidéos, {codees} codées, {avec_perf} avec vues à 7 jours, {len(segments)} segments")


if __name__ == "__main__":
    main()
