#!/usr/bin/env python3
"""Lit un compte Kit (newsletter) par l'API v4, en lecture seule : le script ne fait que des GET.

Usage : python3 systeme/scripts/kit.py tester
          lit le compte et vérifie chaque accès (abonnés, envois, stats, tags, séquences, formulaires).
        python3 systeme/scripts/kit.py point [--jours 30] [--envois 5]
          le point de la newsletter : abonnés, croissance sur la période, derniers envois et leurs stats.
        python3 systeme/scripts/kit.py lire <chemin> [--tout]
          n'importe quelle lecture de l'API v4, en JSON (ex. « subscribers?status=active », « sequences »).
          --tout suit les pages et rassemble la liste.

Clé : KIT_API_KEY dans .env (Kit : Settings, Developer, clé API v4). Elle ne s'affiche jamais.
Les chemins de l'API : https://developers.kit.com/api-reference/overview
"""
import argparse
import datetime
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV = os.path.join(RACINE, ".env")
API = "https://api.kit.com/v4/"
CERTIFICATS = "/etc/ssl/cert.pem"
CONTEXTE = ssl.create_default_context(cafile=CERTIFICATS if os.path.exists(CERTIFICATS) else None)


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


def cle_api():
    cle = lire_env().get("KIT_API_KEY")
    if not cle:
        sys.exit("Il manque KIT_API_KEY dans .env : crée une clé API v4 dans Kit (Settings, Developer) "
                 "et colle la ligne KIT_API_KEY=… dans .env.")
    return cle


def appel(chemin, cle):
    """GET sur l'API v4 ; renvoie le JSON, ou {"_erreur": code, "_message": texte}."""
    chemin = re.sub(r"^/?(v4/)?", "", chemin)
    requete = urllib.request.Request(API + chemin, headers={
        "X-Kit-Api-Key": cle, "Accept": "application/json", "User-Agent": "aios-kit"})
    try:
        with urllib.request.urlopen(requete, timeout=60, context=CONTEXTE) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            erreurs = json.load(e).get("errors")
        except (ValueError, AttributeError):
            erreurs = None
        return {"_erreur": e.code, "_message": "; ".join(erreurs) if erreurs else e.reason}


def toutes_pages(chemin, cle):
    """Suit les pages d'une liste et la rassemble : {nom_de_la_liste: [...]}."""
    elements, curseur = [], None
    while True:
        url = chemin + (("&" if "?" in chemin else "?") + "after=" + urllib.parse.quote(curseur) if curseur else "")
        r = appel(url, cle)
        if "_erreur" in r:
            return r
        liste = next((k for k, v in r.items() if isinstance(v, list)), None)
        if liste is None:
            return r
        elements += r[liste]
        page = r.get("pagination", {})
        if not page.get("has_next_page"):
            return {liste: elements}
        curseur = page["end_cursor"]


def nombre(n, decimales=0):
    return f"{n:,.{decimales}f}".replace(",", " ").replace(".", ",")


def tester():
    cle = cle_api()
    compte = appel("account", cle)
    if "_erreur" in compte:
        sys.exit(f"Compte : {compte['_erreur']} · {compte['_message']}")
    a = compte["account"]
    print(f"Compte : OK · {a['name']} · plan {a['plan_type']}")
    abonnes = appel("subscribers?include_total_count=true&per_page=1", cle)
    print("Abonnés : " + (f"OK · {nombre(abonnes['pagination']['total_count'])} actifs" if "_erreur" not in abonnes
                          else f"{abonnes['_erreur']} · {abonnes['_message']}"))
    for nom, chemin in [("Envois", "broadcasts?per_page=1"), ("Stats des envois", "broadcasts/stats?per_page=1"),
                        ("Tags", "tags?per_page=1"), ("Séquences", "sequences?per_page=1"), ("Formulaires", "forms?per_page=1")]:
        r = appel(chemin, cle)
        print(f"{nom} : " + ("OK" if "_erreur" not in r else f"{r['_erreur']} · {r['_message']}"))


def point(jours, combien):
    cle = cle_api()
    fin = datetime.date.today()
    debut = fin - datetime.timedelta(days=jours)
    r = appel(f"account/growth_stats?starting={debut}&ending={fin}", cle)
    if "_erreur" in r:
        sys.exit(f"Croissance : {r['_erreur']} · {r['_message']}")
    s = r["stats"]
    print(f"Abonnés : {nombre(s['subscribers'])}")
    print(f"Sur {jours} jours ({debut} au {fin}) : {nombre(s['new_subscribers'])} nouveaux, "
          f"{nombre(abs(s['cancellations']))} départs, net {s['net_new_subscribers']:+d}")

    r = toutes_pages("broadcasts/stats?per_page=100", cle)
    if "_erreur" in r:
        sys.exit(f"Stats des envois : {r['_erreur']} · {r['_message']}")
    envois = sorted((b for b in r["broadcasts"] if b.get("send_at")), key=lambda b: b["send_at"], reverse=True)[:combien]
    if not envois:
        print("\nAucun envoi.")
        return
    print(f"\n| Envoyé le | Sujet | Destinataires | Ouverture | Clics | Désabonnements |\n|---|---|---|---|---|---|")
    for b in envois:
        st = b["stats"]
        print(f"| {b['send_at'][:10]} | {b['subject'].strip()} | {nombre(st['recipients'])} | {nombre(st['open_rate'], 1)} % "
              f"| {nombre(st['click_rate'], 1)} % | {nombre(st['unsubscribes'])} |")


def main():
    parseur = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sous = parseur.add_subparsers(dest="commande", required=True)
    sous.add_parser("tester")
    p = sous.add_parser("point")
    p.add_argument("--jours", type=int, default=30, help="période de la croissance, en jours")
    p.add_argument("--envois", type=int, default=5, help="nombre de derniers envois à montrer")
    l = sous.add_parser("lire")
    l.add_argument("chemin", help="chemin de l'API v4, ex. « subscribers?status=active »")
    l.add_argument("--tout", action="store_true", help="suit les pages et rassemble la liste")
    args = parseur.parse_args()
    if args.commande == "tester":
        tester()
    elif args.commande == "point":
        point(args.jours, args.envois)
    else:
        r = toutes_pages(args.chemin, cle_api()) if args.tout else appel(args.chemin, cle_api())
        print(json.dumps(r, ensure_ascii=False, indent=2))
        if "_erreur" in r:
            sys.exit(1)


if __name__ == "__main__":
    main()
