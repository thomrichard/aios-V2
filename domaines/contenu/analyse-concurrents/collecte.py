#!/usr/bin/env python3
"""Collecte la matière brute de l'analyse des concurrents : les N dernières vidéos longues de chaque chaîne.

Usage : python3 -I domaines/contenu/analyse-concurrents/collecte.py [--chaines a,b] [--n 10] [--age-min 7]
          [--travail DOSSIER] [--paralleles 4]
  Pour chaque chaîne : liste les vidéos (yt-dlp), lit leurs stats (API YouTube v3 via systeme/scripts/youtube.py),
  garde les N plus récentes qui ont au moins AGE_MIN jours, puis écrit dans <chaine>/<slug-du-titre>/ :
  video.json, transcription.txt, mots.json, commentaires.json, metriques.json, miniature.jpg, trois planches
  d'images et _images.md. Pour la chaîne de Thomas, ajoute analytics.json (rétention, CTR, vues jour par jour).
  La vidéo est téléchargée en 720p sans le son dans TRAVAIL, hors du dépôt, le temps de tirer les images.
  Une vidéo déjà collectée (metriques.json présent) est sautée.
"""
import argparse
import concurrent.futures
import datetime
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import time
import urllib.request

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(os.path.dirname(ICI)))
sys.path.insert(0, os.path.join(RACINE, "systeme", "scripts"))
import youtube as yt  # noqa: E402

CHAINES = {
    "nate-herk": {"handle": "@nateherk", "langue": "en"},
    "robonuggets": {"handle": "@RoboNuggets", "langue": "en"},
    "tristen-obrien": {"handle": "@Tristen_OBrien", "langue": "en"},
    "jad-mh": {"handle": "@JadM.H", "langue": "en"},
    "simon-scrapes": {"handle": "@simonscrapes", "langue": "en"},
    "thom-richard": {"handle": "@thomasrichard1978", "langue": "fr", "proprietaire": True},
}
SEUIL_PLAN = 0.06      # seuil de changement de scène de ffmpeg, calibré à l'œil sur une vidéo test
FUSION_PLAN = 1.0      # deux détections à moins d'une seconde = un seul changement (transition animée)
AUJOURDHUI = datetime.datetime.now(datetime.timezone.utc)


def lancer(commande, delai=900):
    return subprocess.run(commande, capture_output=True, text=True, timeout=delai)


def lister(handle, combien=40):
    """Les identifiants des dernières vidéos longues de l'onglet Vidéos."""
    r = lancer(["yt-dlp", "--flat-playlist", "--playlist-end", str(combien), "-J",
                f"https://www.youtube.com/{handle}/videos"])
    return [e["id"] for e in json.loads(r.stdout).get("entries", [])]


def stats_api(jeton, ids):
    elements = []
    for i in range(0, len(ids), 50):
        elements += yt.data(jeton, "videos", part="snippet,statistics,contentDetails", id=",".join(ids[i:i + 50]),
                            maxResults=50)
    return elements


def publie(item):
    return datetime.datetime.fromisoformat(item["snippet"]["publishedAt"].replace("Z", "+00:00"))


def choisir(items, n, age_min):
    """Les n plus récentes, publiées, longues et âgées d'au moins age_min jours."""
    gardees = [i for i in items if i["snippet"].get("liveBroadcastContent", "none") == "none"
               and yt.secondes(i["contentDetails"]["duration"]) >= 120
               and (AUJOURDHUI - publie(i)).days >= age_min]
    return sorted(gardees, key=publie, reverse=True)[:n]


def rapport(jeton, debut, fin, **parametres):
    """Un rapport Analytics v2 en lignes, ou {"_erreur": ...} sans arrêter le script."""
    import urllib.parse
    url = f"{yt.ANALYTICS}&startDate={debut}&endDate={fin}&" + urllib.parse.urlencode(parametres)
    r = yt.appel(url, jeton=jeton)
    if "_erreur" in r:
        return {"_erreur": r["_message"]}
    noms = [h["name"] for h in r.get("columnHeaders", [])]
    return [dict(zip(noms, ligne)) for ligne in r.get("rows") or []]


def mots_json3(chemin):
    """Les mots [(seconde, mot)] d'un fichier de sous-titres json3."""
    with open(chemin, encoding="utf-8") as f:
        evenements = json.load(f).get("events", [])
    mots = []
    for e in evenements:
        debut = e.get("tStartMs", 0) / 1000
        for s in e.get("segs") or []:
            texte = re.sub(r"\[[^\]]*\]", " ", s.get("utf8", "")).strip()
            for mot in texte.split():
                mots.append((round(debut + s.get("tOffsetMs", 0) / 1000, 2), mot))
    return mots


def phrases(mots):
    """Le texte en lignes « [mm:ss] phrase », coupées en fin de phrase ou après 40 mots."""
    lignes, courante, debut = [], [], None
    for t, mot in mots:
        if debut is None:
            debut = t
        courante.append(mot)
        if mot[-1:] in ".?!" or len(courante) >= 40:
            lignes.append(f"[{int(debut // 60):02d}:{int(debut % 60):02d}] " + " ".join(courante))
            courante, debut = [], None
    if courante:
        lignes.append(f"[{int(debut // 60):02d}:{int(debut % 60):02d}] " + " ".join(courante))
    return "\n".join(lignes) + "\n"


def planche(video, debut, duree, filtre, sortie):
    lancer(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(max(0, debut)), "-t", str(duree), "-i", video,
            "-vf", filtre, "-frames:v", "1", "-q:v", "8", "-y", sortie])
    return os.path.exists(sortie)


def changements_plan(video):
    """Les secondes où le visuel change (détection de scène sur 4 images par seconde, fusionnées)."""
    r = lancer(["ffmpeg", "-hide_banner", "-i", video, "-vf",
                f"fps=4,scale=320:-1,select='gt(scene,{SEUIL_PLAN})',showinfo", "-an", "-f", "null", "-"], 3600)
    brutes = [float(x) for x in re.findall(r"pts_time:([0-9.]+)", r.stderr)]
    fusion = []
    for t in brutes:
        if not fusion or t - fusion[-1] > FUSION_PLAN:
            fusion.append(round(t, 2))
    return fusion


def par_minute(temps, duree):
    minutes = [0] * (int(duree // 60) + 1)
    for t in temps:
        if t < duree:
            minutes[int(t // 60)] += 1
    return minutes


def metriques(item, info, mots, plans, source_sous_titres):
    duree = yt.secondes(item["contentDetails"]["duration"])
    titre = item["snippet"]["title"]
    milieu = duree / 2
    ecarts = [b[0] - a[0] for a, b in zip(mots, mots[1:])]
    chapitres = info.get("chapters") or []
    return {
        "duree_s": duree,
        "titre_caracteres": len(titre),
        "titre_mots": len(titre.split()),
        "titre_mots_majuscules": len([m for m in re.findall(r"[A-Za-z']+", titre) if len(m) > 1 and m.isupper()]),
        "transcription": source_sous_titres,
        "nb_mots": len(mots),
        "mots_par_minute": round(len(mots) / (duree / 60), 1) if duree else None,
        "mots_par_minute_detail": par_minute([t for t, _ in mots], duree),
        "pauses_1_5s": len([e for e in ecarts if e >= 1.5]),
        "nb_chapitres": len(chapitres),
        "seconde_2e_chapitre": chapitres[1]["start_time"] if len(chapitres) > 1 else None,
        "changements_plan": plans,
        "changements_plan_total": len(plans),
        "changements_par_minute": par_minute(plans, duree),
        "changements_premiere_minute": len([t for t in plans if t < 60]),
        "changements_minute_milieu": len([t for t in plans if milieu - 30 <= t < milieu + 30]),
        "plan_moyen_s": round(duree / (len(plans) + 1), 1),
        "plan_moyen_premiere_minute_s": round(60 / (len([t for t in plans if t < 60]) + 1), 1),
        "intro_texte": " ".join(m for t, m in mots if t < 60),
        "fin_texte": " ".join(m for t, m in mots if t >= duree - 60),
        "heatmap": bool(info.get("heatmap")),
    }


def images_md(dossier, titre, milieu):
    date = AUJOURDHUI.date().isoformat()
    m, s = int(milieu // 60), int(milieu % 60)
    lignes = [
        f"# {os.path.basename(dossier)} · images", "",
        "Une ligne par image. Cet index fait foi pour les images du dossier : écris la ligne dès que l'image arrive.", "",
        "| Fichier | Ce qu'elle montre | Origine | Sert à |", "|---|---|---|---|",
        f"| `miniature.jpg` | La miniature de « {titre} » | YouTube (i.ytimg.com), récupérée le {date} par `collecte.py` "
        "| Coder la miniature (`../../codage.md`, partie 3) |",
        "| `planche-intro.jpg` | 30 images de 0:00 à 1:00, une toutes les 2 secondes | Tirée de la vidéo avec ffmpeg "
        f"le {date} | Coder l'intro et l'habillage |",
        f"| `planche-milieu.jpg` | 30 images sur la minute centrée sur {m}:{s:02d}, une toutes les 2 secondes "
        f"| Tirée de la vidéo avec ffmpeg le {date} | Coder l'habillage et le rythme |",
        "| `planche-video.jpg` | 48 images réparties sur toute la vidéo | Tirée de la vidéo avec ffmpeg "
        f"le {date} | Estimer les parts face caméra, écran, motion design |",
    ]
    with open(os.path.join(dossier, "_images.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lignes) + "\n")


def analytics_video(jeton, video_id, date_publie):
    """Pour la chaîne de Thomas : rétention, totaux, CTR, vues des 30 premiers jours."""
    debut, fin = date_publie, AUJOURDHUI.date().isoformat()
    jour30 = (datetime.date.fromisoformat(date_publie) + datetime.timedelta(days=30)).isoformat()
    filtre = f"video=={video_id}"
    return {
        "retention": rapport(jeton, debut, fin, metrics="audienceWatchRatio,relativeRetentionPerformance",
                             dimensions="elapsedVideoTimeRatio", filters=filtre),
        "totaux": rapport(jeton, debut, fin, metrics="views,estimatedMinutesWatched,averageViewDuration,"
                          "averageViewPercentage,likes,comments,shares,subscribersGained", filters=filtre),
        "ctr": rapport(jeton, debut, fin, metrics="videoThumbnailImpressions,videoThumbnailImpressionsClickRate",
                       filters=filtre),
        "jours": rapport(jeton, debut, min(jour30, fin), metrics="views", dimensions="day", filters=filtre,
                         sort="day"),
    }


def collecter(chaine, reglages, item, travail, jeton):
    video_id, titre = item["id"], item["snippet"]["title"]
    dossier = os.path.join(ICI, chaine, yt.slug(titre, 50))
    if os.path.exists(os.path.join(dossier, "metriques.json")):
        return f"{chaine} {video_id} déjà collectée"
    os.makedirs(dossier, exist_ok=True)
    tmp = os.path.join(travail, "tmp", video_id)
    os.makedirs(tmp, exist_ok=True)
    langue = reglages["langue"]

    # Infos et commentaires, puis les sous-titres à part : YouTube répond souvent 429 sur les sous-titres.
    infos_json = os.path.join(tmp, f"{video_id}.info.json")
    for essai in range(3):
        lancer(["yt-dlp", "--skip-download", "--write-info-json", "--write-comments", "--extractor-args",
                "youtube:max_comments=100,all,0,0;comment_sort=top", "-o", os.path.join(tmp, "%(id)s.%(ext)s"),
                "--", video_id])
        if os.path.exists(infos_json):
            break
        time.sleep(10 * (essai + 1))
    with open(infos_json, encoding="utf-8") as f:
        info = json.load(f)

    sous_titres = None
    for suffixe, source in ((f"{langue}-orig", "auto"), (langue, "createur")):
        chemin = os.path.join(tmp, f"{video_id}.{suffixe}.json3")
        for essai in range(4):
            if os.path.exists(chemin):
                break
            r = lancer(["yt-dlp", "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", suffixe,
                        "--sub-format", "json3", "-o", os.path.join(tmp, "%(id)s.%(ext)s"), "--", video_id])
            if "429" not in r.stderr:
                break
            time.sleep(20 * (essai + 1))
        if os.path.exists(chemin):
            sous_titres = (chemin, source)
            break
    mots = mots_json3(sous_titres[0]) if sous_titres else []

    garde = ("id", "title", "description", "chapters", "tags", "categories", "heatmap", "upload_date", "duration",
             "channel", "channel_id", "channel_follower_count", "thumbnail", "view_count", "like_count",
             "comment_count")
    fiche = {"id": video_id, "url": f"https://www.youtube.com/watch?v={video_id}", "chaine": chaine,
             "titre": titre, "titre_ytdlp": info.get("title"), "publie": item["snippet"]["publishedAt"],
             "duree_s": yt.secondes(item["contentDetails"]["duration"]), "collecte_le": AUJOURDHUI.isoformat(),
             "api": item, "ytdlp": {k: info.get(k) for k in garde}}
    with open(os.path.join(dossier, "video.json"), "w", encoding="utf-8") as f:
        json.dump(fiche, f, ensure_ascii=False, indent=1)
    with open(os.path.join(dossier, "mots.json"), "w", encoding="utf-8") as f:
        json.dump(mots, f, ensure_ascii=False)
    with open(os.path.join(dossier, "transcription.txt"), "w", encoding="utf-8") as f:
        f.write(phrases(mots) if mots else "(pas de sous-titres)\n")
    commentaires = [{"texte": c.get("text"), "likes": c.get("like_count") or 0, "epingle": bool(c.get("is_pinned")),
                     "createur": bool(c.get("author_is_uploader")), "auteur": c.get("author"),
                     "date": c.get("timestamp"), "parent": c.get("parent")}
                    for c in info.get("comments") or []]
    with open(os.path.join(dossier, "commentaires.json"), "w", encoding="utf-8") as f:
        json.dump(sorted(commentaires, key=lambda c: -c["likes"]), f, ensure_ascii=False, indent=1)

    # Miniature.
    for nom in ("maxresdefault.jpg", "hqdefault.jpg"):
        try:
            with urllib.request.urlopen(f"https://i.ytimg.com/vi/{video_id}/{nom}", timeout=60,
                                        context=yt.CONTEXTE) as r, \
                    open(os.path.join(dossier, "miniature.jpg"), "wb") as f:
                f.write(r.read())
            break
        except Exception:
            continue

    # Vidéo 720p sans le son, hors du dépôt, puis les images.
    video = os.path.join(travail, "videos", chaine, f"{video_id}.mp4")
    os.makedirs(os.path.dirname(video), exist_ok=True)
    if not os.path.exists(video):
        lancer(["yt-dlp", "-f", "bv*[height<=720][ext=mp4]/bv*[height<=720]/b[height<=720]", "--remux-video", "mp4",
                "-o", video, "--", video_id], 1800)
    duree = fiche["duree_s"]
    milieu = duree / 2
    planche(video, 0, 60, "fps=1/2,scale=384:-1,tile=6x5:padding=4", os.path.join(dossier, "planche-intro.jpg"))
    planche(video, milieu - 30, 60, "fps=1/2,scale=384:-1,tile=6x5:padding=4",
            os.path.join(dossier, "planche-milieu.jpg"))
    planche(video, 0, duree, f"fps={48 / duree:.5f},scale=256:-1,tile=8x6:padding=4",
            os.path.join(dossier, "planche-video.jpg"))
    images_md(dossier, titre, milieu)
    plans = changements_plan(video) if os.path.exists(video) else []

    if reglages.get("proprietaire"):
        with open(os.path.join(dossier, "analytics.json"), "w", encoding="utf-8") as f:
            json.dump(analytics_video(jeton, video_id, item["snippet"]["publishedAt"][:10]), f, ensure_ascii=False,
                      indent=1)

    with open(os.path.join(dossier, "metriques.json"), "w", encoding="utf-8") as f:
        json.dump(metriques(item, info, mots, plans, sous_titres[1] if sous_titres else None), f, ensure_ascii=False,
                  indent=1)
    return f"{chaine} {video_id} ok · {len(mots)} mots · {len(plans)} changements de plan · " \
           f"{len(commentaires)} commentaires · vidéo {'ok' if os.path.exists(video) else 'ABSENTE'}"


def main():
    parseur = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parseur.add_argument("--chaines", default=",".join(CHAINES))
    parseur.add_argument("--n", type=int, default=10)
    parseur.add_argument("--age-min", type=int, default=7)
    parseur.add_argument("--travail", required=True, help="dossier hors du dépôt pour les vidéos et les fichiers bruts")
    parseur.add_argument("--paralleles", type=int, default=4)
    args = parseur.parse_args()
    for outil in ("yt-dlp", "ffmpeg"):
        if not shutil.which(outil):
            sys.exit(f"{outil} manque")
    jeton = yt.jeton_acces()

    taches, selection = [], {}
    for chaine in args.chaines.split(","):
        reglages = CHAINES[chaine]
        items = choisir(stats_api(jeton, lister(reglages["handle"])), args.n, args.age_min)
        vues = [int(i["statistics"].get("viewCount", 0)) for i in items]
        print(f"{chaine} : {len(items)} vidéos, du {items[-1]['snippet']['publishedAt'][:10]} au "
              f"{items[0]['snippet']['publishedAt'][:10]}, médiane {statistics.median(vues):.0f} vues", flush=True)
        selection[chaine] = [{"id": i["id"], "titre": i["snippet"]["title"], "dossier": yt.slug(i["snippet"]["title"], 50),
                              "publie": i["snippet"]["publishedAt"]} for i in items]
        taches += [(chaine, reglages, i) for i in items]
    with open(os.path.join(ICI, "selection.json"), "w", encoding="utf-8") as f:
        json.dump({"collecte_le": AUJOURDHUI.isoformat(), "n": args.n, "age_min_jours": args.age_min,
                   "chaines": selection}, f, ensure_ascii=False, indent=1)

    with concurrent.futures.ThreadPoolExecutor(args.paralleles) as pool:
        futurs = {pool.submit(collecter, c, r, i, args.travail, jeton): (c, i["id"]) for c, r, i in taches}
        for futur in concurrent.futures.as_completed(futurs):
            try:
                print(futur.result(), flush=True)
            except Exception as e:
                print(f"{futurs[futur][0]} {futurs[futur][1]} ERREUR {type(e).__name__}: {e}", flush=True)


if __name__ == "__main__":
    main()
