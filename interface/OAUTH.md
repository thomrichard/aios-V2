# OAUTH.md - wire the calendar widget

The calendar widget mirrors your own Google Calendar view: every calendar ticked in your Google Calendar sidebar, merged, soonest first. Tick or untick in Google Calendar and the OS follows.

It works through `tools/google-calendar.js`, which signs in once with your Google account and then pulls events on this computer.

**World clocks.** The widget's three small clocks come from `"clocks"` in `os-config.json`: a label (up to 12 characters) and an IANA time zone each, for example `{ "label": "TOKYO", "tz": "Asia/Tokyo" }`. The defaults are USA PT, USA ET and London. Restart the OS after a change. The big clock always shows this computer's own time.

## What your agent does (once, about 10 minutes)

### 1. Create a Google OAuth client (free)

1. Go to https://console.cloud.google.com and create a project (any name).
2. APIs and Services > Enable APIs > enable **Google Calendar API**.
3. APIs and Services > OAuth consent screen > External > fill the two required fields > add yourself as a test user.
4. APIs and Services > Credentials > Create credentials > **OAuth client ID** > type **Web application** > add `http://localhost:3847/oauth2callback` under Authorized redirect URIs.
5. Save the client ID and secret in a file named `.google-creds.json` next to `server.js`:

```json
{ "client_id": "xxxxxxxx.apps.googleusercontent.com", "client_secret": "xxxxxxxx" }
```

6. Install the one package the tool needs, inside the OS folder: `npm install googleapis`.

### 2. Sign in

```
node tools/google-calendar.js auth
```

A browser opens. Pick the Google account whose calendar view you use and click Allow. A token file (`.google-calendar-token.json`) is saved next to the OS, and this step never runs again.

### 3. Check it

```
node tools/google-calendar.js next
```

You should see your real events as JSON. From now on the OS pulls them every 2 minutes. The OS only starts calling the tool once `.google-creds.json` exists.

## Troubleshooting

- **"API has not been used in project..."**: the Calendar API from step 1.2 is off, or still switching on. Open the link in the error, enable it, wait a minute.
- **"Access blocked - app not verified"**: click Advanced > continue. It is your own app; verification is only for public apps.
- **The widget is empty**: it shows today's events across your ticked calendars. Untick noisy calendars (holidays, birthdays) in Google Calendar.

## Not on Google Calendar?

Ask your agent to write `snapshots/calendar.json` from whatever calendar it can read:

```json
{ "source": "my-calendar", "fetched": "2026-01-01T00:00:00Z",
  "events": [ { "title": "Team call", "start": "2026-01-02T14:00:00+10:00", "allDay": false, "link": null, "meet": null } ] }
```

The widget treats that file like a live pull (only `http` and `https` links open).
