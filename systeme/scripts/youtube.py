#!/usr/bin/env python3
"""Lit une chaîne YouTube par les API officielles (Data v3 et Analytics v2), en lecture seule.

Usage : python3 systeme/scripts/youtube.py connecter --client <client_secret.json>
          une fois : ouvre Google dans le navigateur ; connecte-toi avec le compte qui possède la chaîne.
          Le client OAuth (type « bureau ») et le jeton vont dans .env, sans jamais s'afficher.
        python3 systeme/scripts/youtube.py tester
          lit la chaîne et vérifie chaque accès (Data, Analytics, revenus).
        python3 systeme/scripts/youtube.py fiches [--dossier D] [--transcriptions T] [--maj] [--essai]
          une fiche par vidéo longue publique : infos, stats (7 et 30 premiers jours, total), liens entre
          vidéos, description, transcription par chapitre. Les transcriptions viennent de yt-dlp, gardées
          dans T (par défaut un dossier temporaire). Sans --maj, une fiche existante n'est pas réécrite.
          Avec --maj, elle garde sa transcription et sa section « ## Notes » écrite à la main.
"""
import argparse
import base64
import datetime
import hashlib
import http.server
import json
import os
import re
import secrets
import shutil
import ssl
import subprocess
import sys
import tempfile
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import webbrowser

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV = os.path.join(RACINE, ".env")
AUTORISATIONS = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
]
CERTIFICATS = "/etc/ssl/cert.pem"
CONTEXTE = ssl.create_default_context(cafile=CERTIFICATS if os.path.exists(CERTIFICATS) else None)
DATA = "https://www.googleapis.com/youtube/v3/"
ANALYTICS = "https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE"
MESURES = ["views", "engagedViews", "estimatedMinutesWatched", "subscribersGained", "estimatedRevenue"]
LIEN_VIDEO = re.compile(r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|shorts/|live/|embed/))([A-Za-z0-9_-]{11})")
LIEN = re.compile(r"https?://[^\s)>\]]+")
CHAPITRE = re.compile(r"^\s*\(?((?:\d{1,2}:)?\d{1,2}:\d{2})\)?\s*[-–—:·|]?\s*(.+?)\s*$")
SANS_SOUS_TITRES = "Pas de sous-titres sur YouTube"


def lire_env():
    valeurs = {}
    if os.path.exists(ENV):
        with open(ENV, encoding="utf-8") as f:
            for ligne in f:
                ligne = ligne.strip()
                if ligne and not ligne.startswith("#") and "=" in ligne:
                    cle, valeur = ligne.split("=", 1)
                    valeurs[cle.strip()] = valeur.strip().strip("\"'")
    return valeurs


def ecrire_env(nouvelles):
    """Met à jour ou ajoute des clés dans .env, sans toucher aux autres lignes."""
    lignes = open(ENV, encoding="utf-8").read().splitlines() if os.path.exists(ENV) else []
    restantes = dict(nouvelles)
    for i, ligne in enumerate(lignes):
        cle = ligne.split("=", 1)[0].strip()
        if cle in restantes and not ligne.lstrip().startswith("#"):
            lignes[i] = f"{cle}={restantes.pop(cle)}"
    lignes += [f"{cle}={valeur}" for cle, valeur in restantes.items()]
    with open(ENV, "w", encoding="utf-8") as f:
        f.write("\n".join(lignes) + "\n")


def appel(url, donnees=None, jeton=None):
    """GET (ou POST si données) ; renvoie le JSON, ou {"_erreur": code, "_message": texte}."""
    corps = urllib.parse.urlencode(donnees).encode() if donnees else None
    requete = urllib.request.Request(url, data=corps)
    if jeton:
        requete.add_header("Authorization", "Bearer " + jeton)
    try:
        with urllib.request.urlopen(requete, timeout=60, context=CONTEXTE) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            erreur = json.load(e)
        except ValueError:
            return {"_erreur": e.code, "_message": e.reason}
        detail = erreur.get("error")
        message = detail.get("message") if isinstance(detail, dict) else f"{detail} {erreur.get('error_description', '')}"
        return {"_erreur": e.code, "_message": message.strip()}


def jeton_acces():
    env = lire_env()
    manquantes = [c for c in ("YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN") if not env.get(c)]
    if manquantes:
        sys.exit(f"Il manque {', '.join(manquantes)} dans .env : lance d'abord « youtube.py connecter ».")
    reponse = appel("https://oauth2.googleapis.com/token", {
        "client_id": env["YOUTUBE_CLIENT_ID"], "client_secret": env["YOUTUBE_CLIENT_SECRET"],
        "refresh_token": env["YOUTUBE_REFRESH_TOKEN"], "grant_type": "refresh_token"})
    if "access_token" not in reponse:
        sys.exit(f"Jeton refusé ({reponse.get('_message')}) : relance « youtube.py connecter ».")
    return reponse["access_token"]


def connecter(chemin_client):
    with open(os.path.expanduser(chemin_client), encoding="utf-8") as f:
        client = json.load(f)
    if "installed" not in client:
        sys.exit("Ce client OAuth n'est pas de type « bureau » (installed) : crée-en un dans Google Cloud.")
    client_id, client_secret = client["installed"]["client_id"], client["installed"]["client_secret"]

    verificateur = secrets.token_urlsafe(64)
    defi = base64.urlsafe_b64encode(hashlib.sha256(verificateur.encode()).digest()).rstrip(b"=").decode()
    etat = secrets.token_urlsafe(16)
    recu = {}

    class Retour(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            recu.update(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query))
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write("<p>C'est bon, tu peux fermer cet onglet.</p>".encode())

        def log_message(self, *args):
            pass

    serveur = http.server.HTTPServer(("127.0.0.1", 0), Retour)
    redirection = f"http://127.0.0.1:{serveur.server_port}"
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": client_id, "redirect_uri": redirection, "response_type": "code",
        "scope": " ".join(AUTORISATIONS), "access_type": "offline", "prompt": "select_account consent",
        "code_challenge": defi, "code_challenge_method": "S256", "state": etat})
    print("Connecte-toi avec le compte qui possède la chaîne. Si le navigateur ne s'ouvre pas, ouvre ce lien :")
    print(url, flush=True)
    webbrowser.open(url)
    serveur.timeout = 600
    serveur.handle_request()
    serveur.server_close()

    if recu.get("state", [""])[0] != etat or "code" not in recu:
        sys.exit(f"Autorisation non reçue : {recu.get('error', ['délai dépassé'])[0]}")
    reponse = appel("https://oauth2.googleapis.com/token", {
        "client_id": client_id, "client_secret": client_secret, "code": recu["code"][0],
        "code_verifier": verificateur, "redirect_uri": redirection, "grant_type": "authorization_code"})
    if "refresh_token" not in reponse:
        sys.exit(f"Pas de jeton durable reçu : {reponse.get('_message', 'réponse inattendue')}")
    ecrire_env({"YOUTUBE_CLIENT_ID": client_id, "YOUTUBE_CLIENT_SECRET": client_secret,
                "YOUTUBE_REFRESH_TOKEN": reponse["refresh_token"]})
    print("Jeton enregistré dans .env.")
    tester()


def tester():
    jeton = jeton_acces()
    chaine = appel("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true", jeton=jeton)
    if not chaine.get("items"):
        sys.exit(f"Data API v3 : {chaine.get('_message', 'aucune chaîne sur ce compte')}")
    c = chaine["items"][0]
    print(f"Data API v3 : OK · {c['snippet']['title']} ({c['id']}) · "
          f"{c['statistics'].get('subscriberCount')} abonnés · {c['statistics'].get('videoCount')} vidéos")
    base = ("https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=2005-01-01"
            f"&endDate={datetime.date.today()}")
    for nom, mesures in [("Analytics v2", "views,engagedViews,subscribersGained"), ("Revenus", "estimatedRevenue")]:
        r = appel(base + "&metrics=" + mesures, jeton=jeton)
        print(f"{nom} : " + (f"OK · {mesures} = {r['rows'][0]}" if r.get("rows") else r.get("_message", "aucune donnée")))


def data(jeton, ressource, **parametres):
    """Toutes les pages d'une liste de l'API Data v3."""
    elements, page = [], None
    while True:
        if page:
            parametres["pageToken"] = page
        r = appel(DATA + ressource + "?" + urllib.parse.urlencode(parametres), jeton=jeton)
        if "_erreur" in r:
            sys.exit(f"Data API v3 ({ressource}) : {r['_message']}")
        elements += r.get("items", [])
        page = r.get("nextPageToken")
        if not page:
            return elements


def analytics(jeton, debut, fin, **parametres):
    """Les lignes d'un rapport Analytics v2, chacune en dict."""
    url = f"{ANALYTICS}&startDate={debut}&endDate={fin}&" + urllib.parse.urlencode(parametres)
    r = appel(url, jeton=jeton)
    if "_erreur" in r:
        sys.exit(f"Analytics v2 : {r['_message']}")
    noms = [h["name"] for h in r.get("columnHeaders", [])]
    return [dict(zip(noms, ligne)) for ligne in r.get("rows") or []]


def secondes(iso):
    """Durée ISO 8601 (PT1H2M3S) en secondes."""
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    j, h, mi, s = (int(x or 0) for x in m.groups()) if m else (0, 0, 0, 0)
    return ((j * 24 + h) * 60 + mi) * 60 + s


def duree(s):
    s = int(round(s or 0))
    h, m, s = s // 3600, s % 3600 // 60, s % 60
    return (f"{h} h " if h else "") + (f"{m} min " if h or m else "") + f"{s} s"


def nombre(n, decimales=0):
    texte = f"{n:,.{decimales}f}".replace(",", " ").replace(".", ",")
    return texte


def slug(texte, longueur=60):
    texte = unicodedata.normalize("NFKD", texte.replace("’", "'")).encode("ascii", "ignore").decode().lower()
    texte = re.sub(r"[^a-z0-9]+", "-", texte).strip("-")
    if len(texte) > longueur:
        texte = texte[:longueur].rsplit("-", 1)[0]
    return texte or "video"


def sans_symboles(texte):
    """Garde lettres, chiffres, ponctuation et espaces : retire emoji et pictogrammes."""
    garde = "".join(c for c in texte if unicodedata.category(c)[0] in "LNPZ" or c in "'’%€$+")
    return re.sub(r"\s+", " ", garde).strip()


def resume(description, titre, communes=()):
    """La première vraie phrase de la description : ni lien, ni titre de rubrique, ni bloc répété d'une vidéo à l'autre."""
    for ligne in description.splitlines():
        ligne = sans_symboles(ligne)
        lettres = [c for c in ligne if c.isalpha()]
        majuscules = sum(c.isupper() for c in lettres) / max(len(lettres), 1)
        if (len(lettres) >= 20 and ligne not in communes and not LIEN.search(ligne)
                and not ligne.endswith(":") and majuscules < 0.5):
            break
    else:
        ligne = titre
    ligne = ligne.replace(" #", " ")
    return ligne if len(ligne) <= 160 else ligne[:157].rsplit(" ", 1)[0] + "…"


def chapitres(description):
    """Les chapitres de la description [(secondes, titre)], si elle en a au moins trois dont un à 0:00."""
    trouves = []
    for ligne in description.splitlines():
        m = CHAPITRE.match(ligne)
        if m:
            parties = [int(p) for p in m.group(1).split(":")]
            debut = sum(p * 60 ** i for i, p in enumerate(reversed(parties)))
            trouves.append((debut, sans_symboles(m.group(2))))
    if len(trouves) >= 3 and trouves[0][0] == 0:
        return trouves
    return []


def transcription(video_id, langue, dossier):
    """Les répliques [(secondes, texte)] des sous-titres YouTube (automatiques d'origine d'abord)."""
    candidats = [f"{video_id}.{langue}-orig.json3", f"{video_id}.{langue}.json3"]
    if not any(os.path.exists(os.path.join(dossier, c)) for c in candidats) and shutil.which("yt-dlp"):
        subprocess.run(["yt-dlp", "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs",
                        f"{langue}-orig,{langue}", "--sub-format", "json3", "-o", os.path.join(dossier, "%(id)s.%(ext)s"),
                        "--", video_id], capture_output=True, timeout=300)
    for candidat in candidats:
        chemin = os.path.join(dossier, candidat)
        if os.path.exists(chemin):
            with open(chemin, encoding="utf-8") as f:
                evenements = json.load(f).get("events", [])
            repliques = []
            for e in evenements:
                texte = "".join(s.get("utf8", "") for s in e.get("segs", []))
                texte = re.sub(r"\[[^\]]*\]", " ", texte)
                texte = re.sub(r"\s+", " ", texte).strip()
                if texte:
                    repliques.append((e.get("tStartMs", 0) / 1000, texte))
            return repliques
    return []


def paragraphes(repliques, pas=60):
    """Regroupe les répliques en paragraphes d'environ une minute."""
    blocs, courant, debut = [], [], None
    for t, texte in repliques:
        if debut is None:
            debut = t
        courant.append(texte)
        if t - debut >= pas and texte.endswith((".", "?", "!")):
            blocs.append(" ".join(courant))
            courant, debut = [], None
    if courant:
        blocs.append(" ".join(courant))
    return blocs


def sections(chemin):
    """Les sections « ## Titre » d'une fiche existante : {titre: lignes}, sans les blancs autour."""
    if not os.path.exists(chemin):
        return {}
    trouvees, titre, dans_code = {}, None, False
    with open(chemin, encoding="utf-8") as f:
        for ligne in f.read().splitlines():
            if ligne.startswith("```"):
                dans_code = not dans_code
            if ligne.startswith("## ") and not dans_code:
                titre = ligne[3:].strip()
                trouvees[titre] = []
            elif titre:
                trouvees[titre].append(ligne)
    for lignes in trouvees.values():
        while lignes and not lignes[0].strip():
            lignes.pop(0)
        while lignes and not lignes[-1].strip():
            lignes.pop()
    return trouvees


def horodatage(s):
    s = int(s)
    return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}" if s >= 3600 else f"{s // 60}:{s % 60:02d}"


def stats_periode(jeton, video_id, debut, jours, dernier_jour):
    """Somme des mesures sur les `jours` premiers jours, ou None si la période n'est pas encore close."""
    fin = debut + datetime.timedelta(days=jours - 1)
    if fin > dernier_jour:
        return None
    lignes = analytics(jeton, debut, fin, dimensions="day", filters=f"video=={video_id}", metrics=",".join(MESURES))
    return {m: sum(l[m] for l in lignes) for m in MESURES}


def cellules_stats(s):
    if s is None:
        return ["en cours"] * 5
    return [nombre(s["views"]), nombre(s["engagedViews"]), nombre(s["estimatedMinutesWatched"] / 60, 1),
            nombre(s["subscribersGained"]), nombre(s["estimatedRevenue"], 2) + " $"]


def fiches(dossier, dossier_transcriptions, maj, essai):
    jeton = jeton_acces()
    aujourd_hui = datetime.date.today()
    parties = dossier.strip("/").split("/")
    domaine = parties[1] if len(parties) > 1 and parties[0] == "domaines" else "contenu"
    dossier = os.path.join(RACINE, dossier)
    dossier_transcriptions = dossier_transcriptions or tempfile.mkdtemp(prefix="youtube-")
    os.makedirs(dossier_transcriptions, exist_ok=True)

    # Les vidéos longues publiques de la chaîne.
    chaine = data(jeton, "channels", part="contentDetails", mine="true")[0]
    envois = chaine["contentDetails"]["relatedPlaylists"]["uploads"]
    ids = [i["contentDetails"]["videoId"] for i in data(jeton, "playlistItems", part="contentDetails", playlistId=envois, maxResults=50)]
    videos = []
    for i in range(0, len(ids), 50):
        videos += data(jeton, "videos", part="snippet,contentDetails,status", id=",".join(ids[i:i + 50]), maxResults=50)
    shorts = {l["video"] for l in analytics(jeton, "2005-01-01", aujourd_hui, dimensions="video",
                                             filters="creatorContentType==shorts", metrics="views", sort="-views", maxResults=200)}
    videos = [v for v in videos if v["status"]["privacyStatus"] == "public" and v["id"] not in shorts
              and secondes(v["contentDetails"]["duration"]) > 60]
    videos.sort(key=lambda v: v["snippet"]["publishedAt"])

    # Playlists, stats totales, dernier jour disponible dans Analytics.
    playlists = {}
    for p in data(jeton, "playlists", part="snippet,status", mine="true", maxResults=50):
        for item in data(jeton, "playlistItems", part="contentDetails", playlistId=p["id"], maxResults=50):
            playlists.setdefault(item["contentDetails"]["videoId"], []).append(p)
    totaux = {l["video"]: l for l in analytics(
        jeton, "2005-01-01", aujourd_hui, dimensions="video", sort="-views", maxResults=200,
        metrics=",".join(MESURES + ["averageViewDuration", "averageViewPercentage", "likes", "comments"]))}
    jours = analytics(jeton, aujourd_hui - datetime.timedelta(days=10), aujourd_hui, dimensions="day", metrics="views")
    dernier_jour = max((datetime.date.fromisoformat(l["day"]) for l in jours), default=aujourd_hui - datetime.timedelta(days=3))

    # Noms des fiches : celles qui existent déjà gardent le leur.
    existantes = {}
    if os.path.isdir(dossier):
        for nom in os.listdir(dossier):
            if nom.endswith(".md") and not nom.startswith("_"):
                m = re.search(r"watch\?v=([A-Za-z0-9_-]{11})", open(os.path.join(dossier, nom), encoding="utf-8").read())
                if m:
                    existantes[m.group(1)] = nom
    noms = {}
    for v in videos:
        nom = existantes.get(v["id"]) or f"{v['snippet']['publishedAt'][:10]}-{slug(v['snippet']['title'])}.md"
        noms[v["id"]] = nom if nom not in noms.values() else nom[:-3] + f"-{v['id'].lower()}.md"

    # Les lignes présentes dans au moins trois descriptions sont des blocs répétés, pas un résumé.
    compte = {}
    for v in videos:
        for ligne in {sans_symboles(x) for x in v["snippet"].get("description", "").splitlines()}:
            compte[ligne] = compte.get(ligne, 0) + 1
    communes = {ligne for ligne, n in compte.items() if n >= 3}

    # Liens entre vidéos, dans les deux sens.
    cite = {v["id"]: list(dict.fromkeys(LIEN_VIDEO.findall(v["snippet"].get("description", "")))) for v in videos}
    citee_par = {}
    for source, cibles in cite.items():
        for cible in cibles:
            if cible != source:
                citee_par.setdefault(cible, []).append(source)

    ecrites = sautees = 0
    for v in videos:
        vid, sn = v["id"], v["snippet"]
        chemin = os.path.join(dossier, noms[vid])
        if os.path.exists(chemin) and not maj:
            sautees += 1
            continue
        description = sn.get("description", "")
        publiee = datetime.date.fromisoformat(sn["publishedAt"][:10])
        langue = (sn.get("defaultAudioLanguage") or sn.get("defaultLanguage") or "en").split("-")[0]
        miniatures = sn.get("thumbnails", {})
        miniature = next((miniatures[k]["url"] for k in ("maxres", "standard", "high", "medium", "default") if k in miniatures), "")
        total = totaux.get(vid)
        cibles = [c for c in cite[vid] if c != vid]
        liees = [noms[c] for c in cibles if c in noms] + [noms[s] for s in citee_par.get(vid, []) if s in noms]

        l = ["---", "type: video", f"resume: {resume(description, sn['title'], communes)}", "statut: publie", f"domaine: {domaine}",
             f"cree: {publiee}", f"maj: {aujourd_hui}", f"liens: [{', '.join(dict.fromkeys(liees))}]", "---", f"# {sn['title']}", "",
             f"- Vidéo : https://www.youtube.com/watch?v={vid}", f"- Miniature : {miniature}",
             f"- Publiée le : {publiee}", f"- Durée : {duree(secondes(v['contentDetails']['duration']))}"]
        if playlists.get(vid):
            l.append("- Playlists : " + ", ".join(
                p["snippet"]["title"] + ("" if p["status"]["privacyStatus"] == "public" else " (non publique)") for p in playlists[vid]))
        if sn.get("tags"):
            l.append("- Tags : " + ", ".join(sn["tags"]))

        anciennes = sections(chemin)
        if anciennes.get("Notes"):
            l += ["", "## Notes", "", *anciennes["Notes"]]

        l += ["", "## Stats", "", f"YouTube Analytics, données jusqu'au {dernier_jour}. Revenus estimés en dollars US. "
              "Depuis le 27 août 2026, YouTube compte une vue dès la première image : pour comparer avant et après, "
              "regarder les vues engagées.", "",
              "| | 7 premiers jours | 30 premiers jours | Depuis la sortie |", "|---|---|---|---|"]
        j7 = stats_periode(jeton, vid, publiee, 7, dernier_jour)
        j30 = stats_periode(jeton, vid, publiee, 30, dernier_jour)
        colonnes = zip(cellules_stats(j7), cellules_stats(j30), cellules_stats(total) if total else ["à vérifier"] * 5)
        for libelle, (a, b, c) in zip(["Vues", "Vues engagées", "Heures regardées", "Abonnés gagnés", "Revenus estimés"], colonnes):
            l.append(f"| {libelle} | {a} | {b} | {c} |")
        if total:
            l.append(f"| Durée moyenne regardée | | | {duree(total['averageViewDuration'])} "
                     f"({nombre(total['averageViewPercentage'], 1)} %) |")
            l.append(f"| J'aime · commentaires | | | {nombre(total['likes'])} · {nombre(total['comments'])} |")

        l += ["", "## Liens", ""]
        for c in cibles:
            l.append(f"- Cite : [{noms[c][:-3]}]({noms[c]})" if c in noms else f"- Cite : https://www.youtube.com/watch?v={c} (short ou vidéo non publique)")
        for s in citee_par.get(vid, []):
            if s in noms:
                l.append(f"- Citée par : [{noms[s][:-3]}]({noms[s]})")
        autres = [u.rstrip(".,;") for u in LIEN.findall(description) if not LIEN_VIDEO.search(u)]
        for u in dict.fromkeys(autres):
            l.append(f"- Description : {u}")
        if l[-1] == "":
            l.append("Aucun lien.")

        l += ["", "## Description", "", "```text", description.strip(), "```", "", "## Transcription", ""]
        # Une transcription déjà écrite est gardée : seules les nouvelles vidéos passent par yt-dlp.
        deja = anciennes.get("Transcription", [])
        if deja and not deja[0].startswith(SANS_SOUS_TITRES):
            l += deja
        elif not (repliques := transcription(vid, langue, dossier_transcriptions)):
            l.append(SANS_SOUS_TITRES + " pour cette vidéo.")
        else:
            l += ["Sous-titres automatiques de YouTube, non corrigés.", ""]
            decoupe = chapitres(description) or [(0, "")]
            for i, (debut, titre) in enumerate(decoupe):
                fin = decoupe[i + 1][0] if i + 1 < len(decoupe) else float("inf")
                morceau = [r for r in repliques if debut <= r[0] < fin]
                if titre:
                    l += [f"### {horodatage(debut)} · {titre}", ""]
                for p in paragraphes(morceau):
                    l += [p, ""]
        texte = "\n".join(l).rstrip() + "\n"
        if essai:
            print(f"--- {noms[vid]}\n{texte}")
            return
        os.makedirs(dossier, exist_ok=True)
        with open(chemin, "w", encoding="utf-8") as f:
            f.write(texte)
        ecrites += 1
        print(f"{noms[vid]}", flush=True)
    print(f"{ecrites} fiches écrites, {sautees} déjà là, sur {len(videos)} vidéos longues publiques.")


def main():
    parseur = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sous = parseur.add_subparsers(dest="commande", required=True)
    sous.add_parser("connecter").add_argument("--client", required=True, help="client_secret.json d'un client OAuth « bureau »")
    sous.add_parser("tester")
    f = sous.add_parser("fiches")
    f.add_argument("--dossier", default="domaines/contenu/videos", help="dossier des fiches, depuis la racine")
    f.add_argument("--transcriptions", help="dossier où garder les sous-titres téléchargés")
    f.add_argument("--maj", action="store_true", help="réécrit aussi les fiches existantes")
    f.add_argument("--essai", action="store_true", help="affiche la première fiche sans rien écrire")
    args = parseur.parse_args()
    if args.commande == "connecter":
        connecter(args.client)
    elif args.commande == "tester":
        tester()
    else:
        fiches(args.dossier, args.transcriptions, args.maj, args.essai)


if __name__ == "__main__":
    main()
