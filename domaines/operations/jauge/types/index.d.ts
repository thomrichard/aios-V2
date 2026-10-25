/** Une limite d'usage : laquelle (`five_hour`, `seven_day`), le pourcentage utilisé (0 à 100), la remise à zéro (ISO 8601). */
export type Fenetre = { kind: string; percentUsed: number; resetsAt?: string }

/** Le contexte : pourcentage rempli et tokens relus par la prochaine requête ; absents avant la première réponse. */
export type Contexte = { percent?: number; tokens?: number }

/**
 * Ce que la jauge sait du cache : l'heure de la dernière requête du fil
 * principal (millisecondes de `$.clock.now()`), le modèle qui l'a reçue, et,
 * pour une session reprise, la taille du contexte à recacher.
 */
export type Cache = { lastAt: number; model: string | null; tokens?: number }

/** Abonnement (cache d'une heure) ou clé API (cache de 5 minutes). */
export type Plan = 'abonnement' | 'api'

/**
 * Les relances de la pause en cours : combien, ce qu'elles ont coûté en
 * dollars au prix public, le coût de la dernière, les échecs d'affilée, et si
 * la jauge a cessé de relancer (seuil atteint, cache trouvé froid, échecs).
 */
export type Relance = { n: number; depense: number; derniere?: number; echecs: number; stop: boolean }

declare module 'claude-code' {
  interface PluginState {
    jauge: { limits: Fenetre[]; context: Contexte; cache: Cache | null; plan: Plan | null; relance: Relance }
  }
}
