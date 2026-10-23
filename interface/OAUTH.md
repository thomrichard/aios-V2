# OAUTH.md - brancher le widget agenda

Le widget agenda reflète ta propre vue Google Calendar : tous les agendas cochés dans la barre latérale de Google Calendar, fusionnés, les plus proches d'abord. Coche ou décoche dans Google Calendar, et l'OS suit.

Il passe par `tools/google-calendar.js`, qui se connecte une fois avec ton compte Google, puis récupère les événements sur cet ordinateur.

**Horloges mondiales.** Les trois petites horloges du widget viennent de `"clocks"` dans `os-config.json` : chacune a une étiquette (12 caractères au plus) et un fuseau horaire IANA, par exemple `{ "label": "TOKYO", "tz": "Asia/Tokyo" }`. Par défaut : USA PT, USA ET et Londres. Redémarre l'OS après un changement. La grande horloge affiche toujours l'heure de cet ordinateur.

## Ce que fait ton agent (une fois, environ 10 minutes)

### 1. Créer un client OAuth Google (gratuit)

1. Va sur https://console.cloud.google.com et crée un projet (n'importe quel nom).
2. API et services > Activer des API > active **Google Calendar API**.
3. API et services > Écran de consentement OAuth > Externe > remplis les deux champs obligatoires > ajoute-toi comme utilisateur test.
4. API et services > Identifiants > Créer des identifiants > **ID client OAuth** > type **Application Web** > ajoute `http://localhost:3847/oauth2callback` dans URI de redirection autorisés.
5. Enregistre l'ID client et le code secret dans un fichier nommé `.google-creds.json`, à côté de `server.js` :

```json
{ "client_id": "xxxxxxxx.apps.googleusercontent.com", "client_secret": "xxxxxxxx" }
```

6. Installe le seul paquet dont l'outil a besoin, dans le dossier de l'OS : `npm install googleapis`.

### 2. Se connecter

```
node tools/google-calendar.js auth
```

Un navigateur s'ouvre. Choisis le compte Google dont tu utilises la vue d'agenda, et clique sur Autoriser. Un fichier de token (`.google-calendar-token.json`) est enregistré à côté de l'OS, et cette étape ne se refait jamais.

### 3. Vérifier

```
node tools/google-calendar.js next
```

Tu dois voir tes vrais événements, en JSON. À partir de là, l'OS les récupère toutes les 2 minutes. L'OS ne commence à appeler l'outil qu'une fois que `.google-creds.json` existe.

## Dépannage

- **« API has not been used in project... »** : l'API Calendar de l'étape 1.2 est désactivée, ou encore en cours d'activation. Ouvre le lien de l'erreur, active-la, attends une minute.
- **« Accès bloqué : application non validée »** : clique sur Paramètres avancés > continuer. C'est ta propre app ; la validation ne concerne que les apps publiques.
- **Le widget est vide :** il affiche les événements du jour de tes agendas cochés. Décoche les agendas trop bavards (jours fériés, anniversaires) dans Google Calendar.

## Pas sur Google Calendar ?

Demande à ton agent d'écrire `snapshots/calendar.json` à partir de n'importe quel agenda qu'il peut lire :

```json
{ "source": "my-calendar", "fetched": "2026-01-01T00:00:00Z",
  "events": [ { "title": "Appel d'équipe", "start": "2026-01-02T14:00:00+10:00", "allDay": false, "link": null, "meet": null } ] }
```

Le widget traite ce fichier comme une récupération en direct (seuls les liens `http` et `https` s'ouvrent).
