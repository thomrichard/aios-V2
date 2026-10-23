#!/usr/bin/env python3
"""Garde l'interface (interface/server.js) allumée en permanence : elle démarre avec ta session
et redémarre seule si elle s'arrête.

Usage : python3 systeme/scripts/interface.py installer | retirer | etat [--essai]
  installer : démarrage automatique (macOS : launchd ; Linux : systemd --user)
  retirer   : enlève le démarrage automatique et arrête l'interface
  etat      : dit si l'interface répond, et si le démarrage automatique est en place
  --essai   : affiche ce qui serait écrit, sans rien faire
"""
import json
import os
import platform
import plistlib
import shutil
import subprocess
import sys
import time
import urllib.request

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INTERFACE = os.path.join(RACINE, "interface")
SERVEUR = os.path.join(INTERFACE, "server.js")
JOURNAL = os.path.join(INTERFACE, "os-runs", "serveur.log")
NOM = "com.sm4rt.interface"
PLIST = os.path.expanduser(f"~/Library/LaunchAgents/{NOM}.plist")
UNITE = os.path.expanduser("~/.config/systemd/user/sm4rt-interface.service")


def port():
    try:
        with open(os.path.join(INTERFACE, "os-config.json"), encoding="utf-8") as f:
            return int(json.load(f).get("port", 50000))
    except (OSError, ValueError):
        return 50000


def repond():
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port()}/api/health", timeout=2) as r:
            return r.status == 200
    except OSError:
        return False


def node():
    chemin = shutil.which("node")
    if not chemin:
        sys.exit("Node.js est introuvable : installe Node 18 ou plus (https://nodejs.org), puis relance.")
    return chemin


def installer_mac(essai):
    contenu = plistlib.dumps({
        "Label": NOM,
        "ProgramArguments": [node(), SERVEUR],
        "WorkingDirectory": INTERFACE,
        "RunAtLoad": True,
        "KeepAlive": True,
        "ThrottleInterval": 30,
        "StandardOutPath": JOURNAL,
        "StandardErrorPath": JOURNAL,
        # launchd part avec un PATH minimal : on garde le tien, pour que le lanceur trouve claude.
        "EnvironmentVariables": {"PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin")},
    })
    if essai:
        print(f"Écrirait {PLIST} :\n{contenu.decode()}")
        return
    domaine = f"gui/{os.getuid()}"
    subprocess.run(["launchctl", "bootout", domaine, PLIST], capture_output=True)
    os.makedirs(os.path.dirname(PLIST), exist_ok=True)
    with open(PLIST, "wb") as f:
        f.write(contenu)
    subprocess.run(["launchctl", "bootstrap", domaine, PLIST], check=True)


def installer_linux(essai):
    contenu = "\n".join([
        "[Unit]", "Description=SM4RT, l'interface de l'AIOS", "",
        "[Service]", f'WorkingDirectory={INTERFACE}', f'ExecStart="{node()}" "{SERVEUR}"',
        "Restart=always", "RestartSec=30", f'Environment="PATH={os.environ.get("PATH", "/usr/bin:/bin")}"',
        f"StandardOutput=append:{JOURNAL}", f"StandardError=append:{JOURNAL}", "",
        "[Install]", "WantedBy=default.target", "",
    ])
    if essai:
        print(f"Écrirait {UNITE} :\n{contenu}")
        return
    os.makedirs(os.path.dirname(UNITE), exist_ok=True)
    with open(UNITE, "w", encoding="utf-8") as f:
        f.write(contenu)
    subprocess.run(["systemctl", "--user", "daemon-reload"], check=True)
    subprocess.run(["systemctl", "--user", "enable", "--now", "sm4rt-interface.service"], check=True)


def retirer():
    if systeme() == "Darwin":
        subprocess.run(["launchctl", "bootout", f"gui/{os.getuid()}", PLIST], capture_output=True)
        if os.path.exists(PLIST):
            os.remove(PLIST)
    else:
        subprocess.run(["systemctl", "--user", "disable", "--now", "sm4rt-interface.service"], capture_output=True)
        if os.path.exists(UNITE):
            os.remove(UNITE)
            subprocess.run(["systemctl", "--user", "daemon-reload"], capture_output=True)
    print("Démarrage automatique retiré, interface arrêtée.")


def systeme():
    nom = platform.system()
    if nom not in ("Darwin", "Linux"):
        sys.exit("Windows n'est pas encore pris en charge : crée une tâche « à l'ouverture de session » "
                 f"dans le Planificateur de tâches, qui lance : node \"{SERVEUR}\"")
    return nom


def etat():
    installe = os.path.exists(PLIST) or os.path.exists(UNITE)
    print(f"Démarrage automatique : {'en place' if installe else 'absent'}")
    if repond():
        print(f"L'interface répond : http://localhost:{port()}")
    else:
        print(f"L'interface ne répond pas sur le port {port()}. Journal : {os.path.relpath(JOURNAL, RACINE)}")
    return 0


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else ""
    essai = "--essai" in sys.argv
    if action == "etat":
        return etat()
    if action == "retirer":
        retirer()
        return 0
    if action != "installer":
        print(__doc__)
        return 1
    if not essai:
        os.makedirs(os.path.dirname(JOURNAL), exist_ok=True)
    (installer_mac if systeme() == "Darwin" else installer_linux)(essai)
    if essai:
        return 0
    for _ in range(20):
        if repond():
            print(f"C'est en place : l'interface répond sur http://localhost:{port()} et redémarrera avec ta session.")
            return 0
        time.sleep(1)
    print(f"Le démarrage automatique est installé, mais l'interface ne répond pas encore. "
          f"Regarde le journal : {os.path.relpath(JOURNAL, RACINE)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
