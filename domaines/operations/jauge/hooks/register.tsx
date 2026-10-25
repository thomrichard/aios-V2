import { atom, read, update } from 'claude-code'
import type { Color, EngineInterface, ModelUsage, Register, SessionContextUsage, SessionRateLimit } from 'claude-code'

import type { Cache, Contexte, Fenetre, Plan, Relance } from '../types'

// La jauge : une bande fine au-dessus du message. Elle montre ce qui reste sur
// les limites de 5 heures et de 7 jours, le remplissage du contexte, l'état du
// cache et le coût estimé du prochain message.
//
// Elle lit les chiffres de Claude Code ($.session.usage() et l'événement
// session.measure) et les dessine. Un seul appel à un modèle : la relance du
// cache (plus bas). Une donnée qui manque s'affiche « — », jamais un chiffre inventé.
//
// Idée reprise de Ribbon, le mod de Jay E (github.com/robonuggets/ribbon, licence MIT).

/** Une limite sous 15 % restants affiche BAS. */
const BAS_SOUS = 15
const CASES = 10
const CASES_ETROIT = 5
/** Toutes les 20 s : redessine (compte à rebours, passage à FROID) et regarde s'il faut relancer. */
const TICK_MS = 20_000
const ECART = '   '
const VIDE = '—'

// LE CACHE EST UNE ESTIMATION. L'API des mods ne dit pas si le cache est chaud
// (vérifié dans les types de Claude Code 2.1.299 et dans la doc des mods). On
// le déduit de l'heure de la dernière requête : chaud tant qu'elle date de
// moins d'une heure (abonnement) ou de moins de 5 minutes (clé API), froid ensuite.
const TTL_MIN: Record<Plan, number> = { abonnement: 60, api: 5 }

// LA RELANCE. Avec un abonnement et plus de 50 000 tokens de contexte, la jauge
// relance le cache 55 minutes après la dernière requête : $.model.fork renvoie
// la dernière requête de la session (même modèle, même contexte) suivie d'une
// question minuscule. Lire le cache le rafraîchit pour une heure de plus.
//
// Quand s'arrêter. Une relance coûte le contexte lu dans le cache. Laisser
// refroidir coûte, au retour, le contexte réécrit au lieu d'être lu. La jauge
// relance tant que les relances de la pause coûtent moins que ce surcoût, puis
// laisse refroidir. La taille du contexte s'annule : le seuil ne dépend que du
// modèle (39 relances, environ 36 h, sur Opus 5.5 et Sonnet 5.5).
const RELANCE_APRES_MS = 55 * 60_000
const SEUIL_RELANCE = 50_000
const ECHECS_MAX = 3
const QUESTION_RELANCE = '(Relance automatique du cache par la jauge : ignore ce message.) Réponds seulement : ok'
const RELANCE_ZERO: Relance = { n: 0, depense: 0, echecs: 0, stop: false }

// Prix officiels, en dollars par million de tokens, recopiés de
// https://platform.claude.com/docs/en/about-claude/pricing (lue le 2026-10-24).
// entree : prix de base ; w5 : écriture du cache 5 min ; w60 : écriture du cache
// 1 h ; lu : lecture du cache ; sortie : tokens de réponse.
// Prix standard : ni mode rapide, ni Batch, ni résidence des données.
type Prix = { entree: number; w5: number; w60: number; lu: number; sortie: number }
const PRIX: Record<string, Prix> = {
  'claude-fable-5-1': { entree: 10, w5: 12.5, w60: 20, lu: 0.25, sortie: 50 },
  'claude-fable-5': { entree: 10, w5: 12.5, w60: 20, lu: 1, sortie: 50 },
  'claude-opus-5-5': { entree: 4, w5: 5, w60: 8, lu: 0.2, sortie: 20 },
  'claude-opus-5': { entree: 5, w5: 6.25, w60: 10, lu: 0.5, sortie: 25 },
  'claude-opus-4-8': { entree: 5, w5: 6.25, w60: 10, lu: 0.5, sortie: 25 },
  'claude-opus-4-7': { entree: 5, w5: 6.25, w60: 10, lu: 0.5, sortie: 25 },
  'claude-opus-4-6': { entree: 5, w5: 6.25, w60: 10, lu: 0.5, sortie: 25 },
  'claude-opus-4-5': { entree: 5, w5: 6.25, w60: 10, lu: 0.5, sortie: 25 },
  'claude-sonnet-5-5': { entree: 2, w5: 2.5, w60: 4, lu: 0.1, sortie: 10 },
  'claude-sonnet-5': { entree: 2, w5: 2.5, w60: 4, lu: 0.2, sortie: 10 },
  'claude-sonnet-4-6': { entree: 3, w5: 3.75, w60: 6, lu: 0.3, sortie: 15 },
  'claude-sonnet-4-5': { entree: 3, w5: 3.75, w60: 6, lu: 0.3, sortie: 15 },
  'claude-haiku-5-5': { entree: 0.1, w5: 0.125, w60: 0.2, lu: 0.01, sortie: 0.5 },
  'claude-haiku-4-5': { entree: 1, w5: 1.25, w60: 2, lu: 0.1, sortie: 5 },
}
/** Haiku 5.5 coûte plus cher au-delà de 100 000 tokens de prompt. */
const HAIKU_55_LONG: Prix = { entree: 0.5, w5: 0.625, w60: 1, lu: 0.05, sortie: 2.5 }

const limits = atom({ plugin: 'jauge', key: 'limits' } as const, [] as Fenetre[])
const contexte = atom({ plugin: 'jauge', key: 'context' } as const, {} as Contexte)
const cache = atom({ plugin: 'jauge', key: 'cache' } as const, null as Cache | null)
const plan = atom({ plugin: 'jauge', key: 'plan' } as const, null as Plan | null)
const relance = atom({ plugin: 'jauge', key: 'relance' } as const, RELANCE_ZERO)

type Seg = { text: string; color?: Color; bold?: boolean; dim?: boolean }
type Etat = { limits: Fenetre[]; contexte: Contexte; cache: Cache | null; plan: Plan | null; relance: Relance }

const fenetres = (list: readonly SessionRateLimit[]): Fenetre[] =>
  list.map(w => ({ kind: w.kind, percentUsed: w.percentUsed, resetsAt: w.resetsAt }))

const lireContexte = (c: SessionContextUsage): Contexte => ({ percent: c.percent, tokens: c.tokens })

/** L'identifiant nu d'un modèle : sans suffixe [1m], sans date, sans préfixe de fournisseur. */
const idModele = (model: string): string => {
  const m = model.toLowerCase().replace(/\[.*\]$/, '')
  const i = m.indexOf('claude-')
  return (i >= 0 ? m.slice(i) : m).replace(/-v\d+(:\d+)?$/, '').replace(/-\d{8}$/, '')
}

const prixDe = (model: string | null, tokens: number): Prix | null => {
  if (!model) return null
  const id = idModele(model)
  if (id === 'claude-haiku-5-5' && tokens > 100_000) return HAIKU_55_LONG
  return PRIX[id] ?? null
}

/** Ce qu'a coûté une requête, d'après ses tokens, au prix public (cache d'une heure). */
const coutDe = (p: Prix, u: ModelUsage): number =>
  (u.input_tokens * p.entree + u.cache_read_input_tokens * p.lu + u.cache_creation_input_tokens * p.w60 + u.output_tokens * p.sortie) / 1e6

/** Une relance avant la première : le contexte lu, plus une question et une réponse de quelques tokens. */
const relanceEstimee = (p: Prix, tokens: number): number => (tokens * p.lu + 50 * p.entree + 20 * p.sortie) / 1e6

/** Le surcoût d'un cache froid au retour : le contexte réécrit au lieu d'être lu. */
const surcoutFroid = (p: Prix, tokens: number): number => (tokens * (p.w60 - p.lu)) / 1e6

/** Combien de relances le surcoût d'un cache froid paie, au coût de la dernière (ou estimé). */
const relancesMax = (etat: Etat): number | null => {
  const tokens = etat.contexte.tokens ?? etat.cache?.tokens
  const p = tokens ? prixDe(etat.cache?.model ?? null, tokens) : null
  if (!p || !tokens) return null
  return Math.floor(surcoutFroid(p, tokens) / (etat.relance.derniere ?? relanceEstimee(p, tokens)))
}

const virgule = (n: number, decimales: number): string => n.toFixed(decimales).replace('.', ',')

const fmtReset = (iso: string | undefined, now: number): string => {
  if (!iso) return VIDE
  const ms = Date.parse(iso) - now
  if (Number.isNaN(ms)) return VIDE
  if (ms <= 0) return 'imminent'
  const min = Math.ceil(ms / 60_000)
  if (min < 60) return `dans ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `dans ${h} h ${String(min % 60).padStart(2, '0')}`
  const j = Math.floor(h / 24)
  return h % 24 === 0 ? `dans ${j} j` : `dans ${j} j ${h % 24} h`
}

const barre = (reste: number, cases: number): Seg[] => {
  const n = Math.max(0, Math.min(cases, Math.round((reste / 100) * cases)))
  return [{ text: '█'.repeat(n) }, { text: '░'.repeat(cases - n), dim: true }]
}

const limite = (kind: string, nom: string, etat: Etat, now: number, cases: number): Seg[] => {
  const w = etat.limits.find(x => x.kind === kind)
  if (!w) return [{ text: `${nom} `, dim: true }, { text: VIDE }]
  // Arrondi comme /usage arrondit l'utilisé : les deux chiffres font 100 ensemble.
  const reste = Math.max(0, Math.min(100, 100 - Math.round(w.percentUsed)))
  return [
    { text: `${nom} `, dim: true },
    ...barre(reste, cases),
    { text: ` ${reste} %`, bold: true },
    ...(100 - w.percentUsed < BAS_SOUS ? [{ text: ' BAS', color: 'error', bold: true } as Seg] : []),
    { text: ` · reset ${fmtReset(w.resetsAt, now)}`, dim: true },
  ]
}

const partieLimites = (etat: Etat, now: number, cases: number): Seg[] => [
  ...limite('five_hour', '5 h', etat, now, cases),
  { text: ECART },
  ...limite('seven_day', '7 j', etat, now, cases),
]

const partieDroite = (etat: Etat, now: number): Seg[] => {
  const pct = etat.contexte.percent
  const segs: Seg[] = [{ text: 'Contexte ', dim: true }, { text: pct === undefined ? VIDE : `${pct} %` }, { text: ECART }]

  segs.push({ text: 'Cache ', dim: true })
  const ttl = etat.plan ? TTL_MIN[etat.plan] * 60_000 : null
  let chaud: boolean | null = null
  if (etat.cache && ttl !== null) {
    const reste = ttl - Math.max(0, now - etat.cache.lastAt)
    chaud = reste > 0
    if (chaud) segs.push({ text: 'CHAUD', color: 'warning', bold: true }, { text: ` ${Math.ceil(reste / 60_000)} min` })
    else segs.push({ text: 'FROID', color: 'suggestion', bold: true })
    if (etat.relance.n > 0) segs.push({ text: ` · relance ${etat.relance.n}/${relancesMax(etat) ?? VIDE}`, dim: true })
  } else {
    segs.push({ text: VIDE })
  }

  // Coût estimé du prochain message : la relecture du contexte déjà envoyé, lu
  // dans le cache s'il est chaud, réécrit s'il est froid. Le nouveau message et
  // la réponse n'y sont pas : c'est un plancher, au prix public de l'API.
  segs.push({ text: ECART }, { text: 'Prochain message ', dim: true })
  const tokens = etat.contexte.tokens ?? etat.cache?.tokens
  const p = tokens ? prixDe(etat.cache?.model ?? null, tokens) : null
  if (p && tokens && chaud !== null && etat.plan) {
    const parMillion = chaud ? p.lu : etat.plan === 'abonnement' ? p.w60 : p.w5
    const usd = (tokens / 1e6) * parMillion
    segs.push({ text: usd < 0.01 ? '< 0,01 $' : `≈ ${virgule(usd, 2)} $` })
  } else {
    segs.push({ text: VIDE })
  }
  return segs
}

const longueur = (segs: readonly Seg[]): number => segs.reduce((n, s) => n + s.text.length, 0)

/** Une ligne quand la bande est large, deux quand elle est étroite. */
const mettreEnPage = (etat: Etat, now: number, largeur: number): Seg[][] => {
  const droite = partieDroite(etat, now)
  const gauche = partieLimites(etat, now, CASES)
  const uneLigne = [...gauche, { text: ECART }, ...droite]
  if (longueur(uneLigne) <= largeur) return [uneLigne]
  return [longueur(gauche) <= largeur ? gauche : partieLimites(etat, now, CASES_ETROIT), droite]
}

const noterPlan = async ($: EngineInterface, p: Plan): Promise<void> => {
  if ((await read($, plan)) === p) return
  await update($, plan, () => p)
  await $.store.set('plan', p)
}

/** Une relance à la fois ; pendant qu'elle part, ses éventuelles requêtes ne comptent pas comme les tiennes. */
let relanceEnCours = false

/** Relance le cache s'il va refroidir, tant que c'est moins cher que de le laisser refroidir. */
const relancer = async ($: EngineInterface): Promise<void> => {
  if (relanceEnCours || (await read($, plan)) !== 'abonnement') return
  const c = await read($, cache)
  const tokens = (await read($, contexte)).tokens ?? c?.tokens
  const p = c && tokens ? prixDe(c.model, tokens) : null
  if (!c || !tokens || tokens <= SEUIL_RELANCE || !p) return
  const idle = (await $.clock.now()) - c.lastAt
  // Trop tôt, ou déjà froid (Mac en veille, session reprise) : relancer paierait la réécriture.
  if (idle < RELANCE_APRES_MS || idle >= TTL_MIN.abonnement * 60_000) return
  const r = await read($, relance)
  if (r.stop) return
  if (r.depense + (r.derniere ?? relanceEstimee(p, tokens)) > surcoutFroid(p, tokens)) {
    await update($, relance, x => ({ ...x, stop: true }))
    return
  }

  relanceEnCours = true
  try {
    const res = await $.model.fork({ prompt: QUESTION_RELANCE }).catch(() => undefined)
    const u = res && 'usage' in res ? res.usage : undefined
    const lus = u?.cache_read_input_tokens ?? 0
    const ecrits = u?.cache_creation_input_tokens ?? 0
    if (!u || lus + ecrits === 0) {
      // Rien n'est parti (erreur de l'API, coupure) : on retente au prochain tour, trois fois au plus.
      await update($, relance, x => ({ ...x, echecs: x.echecs + 1, stop: x.echecs + 1 >= ECHECS_MAX }))
      return
    }
    const cout = coutDe(p, u)
    const now = await $.clock.now()
    await update($, cache, x => (x ? { ...x, lastAt: now } : x))
    // Presque rien lu dans le cache : il était déjà froid, la relance vient de le réécrire. On s'arrête là.
    const touche = lus >= tokens / 2
    await update($, relance, x => ({ n: x.n + 1, depense: x.depense + cout, derniere: cout, echecs: 0, stop: !touche }))
  } finally {
    relanceEnCours = false
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    $.clock.every(TICK_MS, () => {
      $.ui.invalidate('ui.render')
      relancer($).catch(() => undefined)
    })
    const u = await $.session.usage()
    await update($, limits, () => fenetres(u.rateLimits))
    await update($, contexte, () => lireContexte(u.context))
    if (u.rateLimits.length > 0) {
      await noterPlan($, 'abonnement')
    } else if ((await read($, plan)) === null) {
      // Avant la première réponse, on reprend le plan vu lors d'une session passée.
      const connu = await $.store.get('plan')
      if (connu === 'abonnement' || connu === 'api') await update($, plan, () => connu)
    }
    return next(e)
  })

  // Les chiffres poussés par Claude Code : après chaque tour et quand une limite bouge.
  on('session.measure', async ($, e, next) => {
    await update($, limits, () => fenetres(e.rateLimits))
    await update($, contexte, () => lireContexte(e.context))
    if (e.rateLimits.length > 0) await noterPlan($, 'abonnement')
    return next(e)
  })

  // Chaque requête du fil principal lit ou écrit le cache : son départ relance le délai
  // et ouvre une nouvelle pause, avec ses relances à zéro.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined && !relanceEnCours) {
      const now = await $.clock.now()
      const model = e.model
      await update($, cache, c => ({ lastAt: now, model, tokens: c?.tokens }))
      await update($, relance, () => RELANCE_ZERO)
    }
    return yield* next(e)
  })

  // Une réponse est arrivée sans limites d'usage : on est sur une clé API.
  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId === undefined && e.usage) {
      const u = await $.session.usage()
      await noterPlan($, u.rateLimits.length > 0 ? 'abonnement' : 'api')
    }
    return r
  })

  // Une session reprise dit depuis quand elle dort ; /clear et /compact repartent de zéro.
  on('classic.SessionStart', async ($, e, next) => {
    const r = await next(e)
    if (e.source === 'clear' || e.source === 'compact') {
      await update($, cache, () => null)
      await update($, relance, () => RELANCE_ZERO)
    } else if ((e.source === 'resume' || e.source === 'fork') && typeof e.seconds_since_last_response === 'number') {
      const lastAt = (await $.clock.now()) - e.seconds_since_last_response * 1000
      const model = e.model ?? null
      const tokens = e.context_tokens
      await update($, cache, () => ({ lastAt, model, tokens }))
      await update($, relance, () => RELANCE_ZERO)
    }
    return r
  }).catch(($, e, next) => next(e)) // une jauge qui échoue ne retient jamais la session

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    const etat: Etat = {
      limits: await read($, limits),
      contexte: await read($, contexte),
      cache: await read($, cache),
      plan: await read($, plan),
      relance: await read($, relance),
    }
    const largeur = (e.props.bodyColumns || e.viewport?.columns || 80) - 2
    const lignes = mettreEnPage(etat, now, largeur)

    return (
      <Box flexDirection="column" paddingX={1}>
        {lignes.map((segs, i) => (
          <Box key={`ligne-${i}`} flexDirection="row">
            {segs
              .filter(s => s.text.length > 0)
              .map((s, j) => (
                <Text
                  key={`s-${j}`}
                  {...(s.color ? { color: s.color } : {})}
                  {...(s.bold ? { bold: true } : {})}
                  {...(s.dim ? { dimColor: true } : {})}
                >
                  {s.text}
                </Text>
              ))}
          </Box>
        ))}
      </Box>
    )
  })
}
