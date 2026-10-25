import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { ModelForkResult, On, SessionUsage } from 'claude-code'

const NOW = Date.parse('2026-10-24T10:00:00Z')
const MIN = 60_000

const LIMITES = [
  { kind: 'five_hour', percentUsed: 12, resetsAt: '2026-10-24T12:10:00Z' }, // 88 % restants, reset dans 2 h 10
  { kind: 'seven_day', percentUsed: 90, resetsAt: '2026-10-28T13:00:00Z' }, // 10 % restants : BAS
]
/** Abonnement, 100 000 tokens de contexte : au-dessus du seuil de relance. */
const AVEC_ABONNEMENT: SessionUsage = {
  startedAt: 0,
  context: { window: 200_000, tokens: 100_000, percent: 50 },
  rateLimits: LIMITES,
}
/** Abonnement, 40 000 tokens de contexte : sous le seuil, pas de relance. */
const PETIT_CONTEXTE: SessionUsage = { ...AVEC_ABONNEMENT, context: { window: 200_000, tokens: 40_000, percent: 20 } }
const SANS_RIEN: SessionUsage = { startedAt: 0, context: { window: 200_000 }, rateLimits: [] }

/** Une relance qui trouve le cache chaud : 100 000 tokens lus. */
const RELANCE_CHAUDE: ModelForkResult = {
  isAnswered: true,
  text: 'ok',
  usage: { input_tokens: 30, output_tokens: 5, cache_read_input_tokens: 100_000, cache_creation_input_tokens: 0 },
}

const PROPS = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 4,
  bodyColumns: 200,
  scroll: { offset: 0, bodyRows: 4 },
  view: {},
} as const

type Depart = { usage: SessionUsage; store?: Record<string, unknown>; fork?: ModelForkResult }

/** Démarre une session dont $.session.usage() répond `usage` ; compte les relances ($.model.fork). */
const demarrer = async ($: Engine, on: On, { usage, store, fork = RELANCE_CHAUDE }: Depart) => {
  mock.store(on, store)
  const horloge = mock.clock(on, { now: NOW })
  const forks = { n: 0 }
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: usage }))
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('model.fork', () => {
    forks.n += 1
    return { value: fork }
  })
  on('turn.complete', (_$, e) => ({ text: e.answer }))
  on('turn.step', async function* (_$, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn' as const, usage: null }
  })
  on('classic.SessionStart', () => ({}))
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  return { horloge, forks }
}

/** Une requête du fil principal (ou d'un sous-agent), puis la fin du tour. */
const message = async ($: Engine, model: string, agentId?: string) => {
  const stream = $.turn.step({ turnId: 't1', index: 0, model, messageCount: 1, ...(agentId ? { agentId } : {}) })
  for await (const _ of stream) void _
  await $.turn.complete({
    answer: '',
    durationMs: 1000,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
    usage: { input_tokens: 10, output_tokens: 10, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model },
    ...(agentId ? { agentId } : {}),
  })
}

const bande = ($: Engine, surface: 'terminal' | 'desktop', bodyColumns: number = PROPS.bodyColumns) =>
  $.ui.mount({ plugin: 'jauge', surface, component: 'AbovePrompt', props: { ...PROPS, bodyColumns } })

test('les limites, le contexte et BAS, sur une ligne quand la bande est large', async ($, on) => {
  await demarrer($, on, { usage: AVEC_ABONNEMENT })
  for (const surface of ['terminal', 'desktop'] as const) {
    const b = await bande($, surface)
    expect(await b.find({ text: ' 88 %' })).toBeDefined()
    expect(await b.find({ text: ' · reset dans 2 h 10' })).toBeDefined()
    expect(await b.find({ text: ' 10 %' })).toBeDefined()
    expect(await b.find({ text: ' BAS' })).toBeDefined()
    expect(await b.find({ text: ' · reset dans 4 j 3 h' })).toBeDefined()
    expect(await b.find({ text: '50 %' })).toBeDefined()
    // Une seule BAS : la limite de 5 h a 88 % restants.
    expect((await b.findAll({ type: 'Text', text: ' BAS' })).length).toBe(1)
    expect(await b.find({ key: 'ligne-0' })).toBeDefined()
    expect(await b.find({ key: 'ligne-1' })).toBeUndefined()
    await b.unmount()
  }
})

test('deux lignes quand la bande est étroite', async ($, on) => {
  await demarrer($, on, { usage: AVEC_ABONNEMENT })
  const b = await bande($, 'desktop', 90)
  expect(await b.find({ key: 'ligne-1' })).toBeDefined()
  expect(await b.find({ text: ' 88 %' })).toBeDefined()
  await b.unmount()
})

test('une donnée qui manque affiche « — », jamais un chiffre', async ($, on) => {
  await demarrer($, on, { usage: SANS_RIEN })
  const b = await bande($, 'terminal')
  // 5 h, 7 j, contexte, cache, prochain message.
  expect((await b.findAll({ type: 'Text', text: '—' })).length).toBe(5)
  expect(await b.find({ text: /%/ })).toBeUndefined()
  await b.unmount()
})

test('session.measure met la bande à jour', async ($, on) => {
  await demarrer($, on, { usage: SANS_RIEN })
  await $.session.measure({ context: { window: 200_000, tokens: 40_000, percent: 20 }, rateLimits: LIMITES, changed: ['context', 'rateLimits'] })
  const b = await bande($, 'terminal')
  expect(await b.find({ text: ' 88 %' })).toBeDefined()
  expect(await b.find({ text: '20 %' })).toBeDefined()
  await b.unmount()
})

test('abonnement, petit contexte : pas de relance, CHAUD une heure puis FROID', async ($, on) => {
  const { horloge, forks } = await demarrer($, on, { usage: PETIT_CONTEXTE })
  await message($, 'claude-opus-5-5')
  const b = await bande($, 'desktop')
  expect(await b.find({ text: 'CHAUD' })).toBeDefined()
  expect(await b.find({ text: ' 60 min' })).toBeDefined()
  // Chaud : 40 000 tokens lus dans le cache à 0,20 $ le million.
  expect(await b.find({ text: '< 0,01 $' })).toBeDefined()

  await horloge.advance(59 * MIN)
  expect(await b.find({ text: ' 1 min' })).toBeDefined()

  await horloge.advance(1 * MIN)
  expect(await b.find({ text: 'FROID' })).toBeDefined()
  expect(await b.find({ text: 'CHAUD' })).toBeUndefined()
  // Froid : 40 000 tokens réécrits dans le cache d'une heure à 8 $ le million.
  expect(await b.find({ text: '≈ 0,32 $' })).toBeDefined()
  expect(forks.n).toBe(0)
  await b.unmount()
})

test('clé API : pas de relance, le cache passe à FROID après 5 minutes', async ($, on) => {
  const usage: SessionUsage = { startedAt: 0, context: { window: 200_000, tokens: 100_000, percent: 50 }, rateLimits: [] }
  const { horloge, forks } = await demarrer($, on, { usage })
  await message($, 'claude-opus-5-5')
  const b = await bande($, 'terminal')
  expect(await b.find({ text: ' 5 min' })).toBeDefined()

  await horloge.advance(5 * MIN)
  expect(await b.find({ text: 'FROID' })).toBeDefined()
  // Froid : 100 000 tokens réécrits dans le cache de 5 minutes à 5 $ le million.
  expect(await b.find({ text: '≈ 0,50 $' })).toBeDefined()
  expect(forks.n).toBe(0)
  await b.unmount()
})

test('la relance garde le cache chaud, et un vrai message la remet à zéro', async ($, on) => {
  const { horloge, forks } = await demarrer($, on, { usage: AVEC_ABONNEMENT })
  await message($, 'claude-opus-5-5')

  await horloge.advance(55 * MIN + 1000)
  expect(forks.n).toBe(1)
  const b = await bande($, 'terminal')
  expect(await b.find({ text: ' 60 min' })).toBeDefined()
  // Une relance de 100 000 tokens lus coûte 0,02 $ ; un cache froid, 0,78 $ de plus : 38 relances.
  expect(await b.find({ text: ' · relance 1/38' })).toBeDefined()

  await horloge.advance(55 * MIN)
  expect(forks.n).toBe(2)
  expect(await b.find({ text: ' · relance 2/38' })).toBeDefined()

  await message($, 'claude-opus-5-5')
  expect(await b.find({ text: /relance/ })).toBeUndefined()
  await b.unmount()
})

test('la jauge relance jusqu’au seuil, puis laisse refroidir', { timeoutMs: 60_000 }, async ($, on) => {
  const { horloge, forks } = await demarrer($, on, { usage: AVEC_ABONNEMENT })
  // Opus 4.8 : une relance coûte 0,05 $, un cache froid 0,95 $ de plus : 18 relances.
  await message($, 'claude-opus-4-8')
  for (let i = 0; i < 20; i++) await horloge.advance(55 * MIN + 1000)
  expect(forks.n).toBe(18)

  await horloge.advance(60 * MIN)
  const b = await bande($, 'terminal')
  expect(await b.find({ text: 'FROID' })).toBeDefined()
  expect(await b.find({ text: ' · relance 18/18' })).toBeDefined()
  await b.unmount()
})

test('une relance qui trouve le cache froid s’arrête là', async ($, on) => {
  const froide: ModelForkResult = {
    isAnswered: true,
    text: 'ok',
    usage: { input_tokens: 30, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 100_000 },
  }
  const { horloge, forks } = await demarrer($, on, { usage: AVEC_ABONNEMENT, fork: froide })
  await message($, 'claude-opus-5-5')
  await horloge.advance(55 * MIN + 1000)
  expect(forks.n).toBe(1)

  // La relance a réécrit le cache : chaud une heure encore, puis froid, sans autre relance.
  await horloge.advance(55 * MIN)
  expect(forks.n).toBe(1)
  await horloge.advance(5 * MIN)
  const b = await bande($, 'terminal')
  expect(await b.find({ text: 'FROID' })).toBeDefined()
  await b.unmount()
})

test('une relance en échec retente trois fois au plus', async ($, on) => {
  const echec: ModelForkResult = {
    isAnswered: false,
    reason: 'api-error',
    status: 529,
    error: 'overloaded',
    usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
  }
  const { horloge, forks } = await demarrer($, on, { usage: AVEC_ABONNEMENT, fork: echec })
  await message($, 'claude-opus-5-5')
  await horloge.advance(60 * MIN)
  expect(forks.n).toBe(3)
  const b = await bande($, 'terminal')
  expect(await b.find({ text: 'FROID' })).toBeDefined()
  await b.unmount()
})

test("la requête d'un sous-agent ne réchauffe pas le cache du fil principal", async ($, on) => {
  await demarrer($, on, { usage: AVEC_ABONNEMENT })
  await message($, 'claude-opus-5-5', 'agent-1')
  const b = await bande($, 'terminal')
  expect(await b.find({ text: 'CHAUD' })).toBeUndefined()
  await b.unmount()
})

test('une session reprise retrouve son cache, et le plan vu la dernière fois', async ($, on) => {
  const { horloge } = await demarrer($, on, { usage: SANS_RIEN, store: { plan: 'abonnement' } })
  await $.classic.SessionStart({ source: 'resume', seconds_since_last_response: 30 * 60, context_tokens: 40_000, model: 'claude-sonnet-5-5' })
  const b = await bande($, 'terminal')
  expect(await b.find({ text: 'CHAUD' })).toBeDefined()
  expect(await b.find({ text: ' 30 min' })).toBeDefined()
  // Chaud : 40 000 tokens à 0,10 $ le million (Sonnet 5.5).
  expect(await b.find({ text: '< 0,01 $' })).toBeDefined()

  await horloge.advance(30 * MIN)
  expect(await b.find({ text: 'FROID' })).toBeDefined()
  await b.unmount()

  await $.classic.SessionStart({ source: 'clear' })
  const apres = await bande($, 'terminal')
  expect(await apres.find({ text: 'FROID' })).toBeUndefined()
  await apres.unmount()
})

test('un modèle sans prix officiel connu : pas de coût, pas de relance', async ($, on) => {
  const { horloge, forks } = await demarrer($, on, { usage: AVEC_ABONNEMENT })
  await message($, 'claude-inconnu-9')
  const b = await bande($, 'terminal')
  expect(await b.find({ text: 'CHAUD' })).toBeDefined()
  expect(await b.find({ text: /\$/ })).toBeUndefined()
  await horloge.advance(56 * MIN)
  expect(forks.n).toBe(0)
  await b.unmount()
})

test('un reset à un jour pile s’écrit « dans 1 j »', async ($, on) => {
  await demarrer($, on, { usage: { ...AVEC_ABONNEMENT, rateLimits: [{ kind: 'seven_day', percentUsed: 21, resetsAt: '2026-10-25T10:00:00Z' }] } })
  const b = await bande($, 'terminal')
  expect(await b.find({ text: ' · reset dans 1 j' })).toBeDefined()
  expect(await b.find({ text: ' 79 %' })).toBeDefined()
  await b.unmount()
})
