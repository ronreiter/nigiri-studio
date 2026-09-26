import type { FishId, RiceExtraId, SauceId, ToppingId } from './options'

/**
 * The pairing chart: how each fish likes to be dressed.
 *
 * This is the whole of the "science" behind Surprise me. It is pure data, kept
 * out of the sampling engine (`src/lib/surprise.ts`) so it can be tuned like a
 * recipe book instead of like code.
 *
 * Weight semantics:
 * - `sauces`: relative weights. Only sauces listed here can ever be chosen;
 *   a bigger number simply means "more often". At least one entry must be > 0.
 * - `torch`, `riceExtras`, `toppings`: probabilities in 0..1 that the component
 *   is included. 0 means "never with this fish" (e.g. torching a scallop).
 * - `note`: the one-line reason, surfaced to the cook when a piece is rolled.
 *
 * Adding a fish to `FISH` without adding its pairing here is a type error, so
 * the chart can never silently fall out of date.
 */

export type WeightTable<T extends string> = Partial<Record<T, number>>

export type FishPairing = {
  sauces: WeightTable<SauceId>
  torch: number
  riceExtras: WeightTable<RiceExtraId>
  toppings: WeightTable<ToppingId>
  note: string
}

export const PAIRINGS: Record<FishId, FishPairing> = {
  salmon: {
    sauces: { nikiri: 0.4, yuzuShio: 0.25, shoyu: 0.2, ponzu: 0.1, none: 0.05 },
    torch: 0.5,
    riceExtras: { wasabi: 0.8, shiso: 0.1 },
    toppings: { scallion: 0.4, yuzukosho: 0.25, sesame: 0.2, yuzu: 0.15, seaSalt: 0.1, shichimi: 0.1, wasabi: 0.05 },
    note: 'Fatty salmon takes nikiri or a torch pass; scallion and sesame keep it bright.',
  },
  toroSalmon: {
    sauces: { nikiri: 0.4, yuzuShio: 0.3, none: 0.2, ponzu: 0.1, shoyu: 0.05 },
    torch: 0.55,
    riceExtras: { wasabi: 0.7, shiso: 0.15 },
    toppings: { scallion: 0.4, yuzukosho: 0.3, sesame: 0.15, yuzu: 0.15, seaSalt: 0.1, shichimi: 0.1 },
    note: 'Belly fat wants restraint: a brush of yuzu shio and a quick torch.',
  },
  tuna: {
    sauces: { nikiri: 0.35, shoyu: 0.25, zuke: 0.2, umeShoyu: 0.1, yuzuShio: 0.05, none: 0.05 },
    torch: 0.3,
    riceExtras: { wasabi: 0.9, shiso: 0.05 },
    toppings: { scallion: 0.3, sesame: 0.25, wasabi: 0.15, shichimi: 0.15, yuzu: 0.05, seaSalt: 0.1, yuzukosho: 0.05 },
    note: 'Lean akami is the wasabi-and-soy classic; zuke deepens it.',
  },
  toroTuna: {
    sauces: { nikiri: 0.45, yuzuShio: 0.3, none: 0.15, umeShoyu: 0.1 },
    torch: 0.6,
    riceExtras: { wasabi: 0.75, shiso: 0.15 },
    toppings: { scallion: 0.35, yuzukosho: 0.3, shichimi: 0.15, sesame: 0.1, wasabi: 0.1, yuzu: 0.15, seaSalt: 0.1 },
    note: 'Marbled chutoro loves the torch; go light on soy so the fat reads.',
  },
  yellowtail: {
    sauces: { nikiri: 0.3, ponzu: 0.3, yuzuShio: 0.2, amazu: 0.1, none: 0.1 },
    torch: 0.35,
    riceExtras: { wasabi: 0.6, shiso: 0.35 },
    toppings: { yuzukosho: 0.4, scallion: 0.3, yuzu: 0.2, seaSalt: 0.2, shichimi: 0.15, sesame: 0.1 },
    note: 'Hamachi and yuzukosho are an old argument that always ends well.',
  },
  intias: {
    sauces: { ponzu: 0.35, yuzuShio: 0.3, nikiri: 0.2, none: 0.15 },
    torch: 0.4,
    riceExtras: { wasabi: 0.7, shiso: 0.15 },
    toppings: { yuzu: 0.35, seaSalt: 0.3, yuzukosho: 0.2, scallion: 0.2, shichimi: 0.1 },
    note: 'Intias is lean and clean: yuzu and sea salt, ponzu after the torch.',
  },
  shrimp: {
    sauces: { ponzu: 0.35, yuzuShio: 0.3, nikiri: 0.2, none: 0.15 },
    torch: 0,
    riceExtras: { wasabi: 0.5, shiso: 0.2 },
    toppings: { sesame: 0.4, scallion: 0.3, yuzu: 0.2, seaSalt: 0.15, shichimi: 0.15, yuzukosho: 0.15 },
    note: 'Sweet ebi wants citrus, not fire.',
  },
  eel: {
    sauces: { unagiTare: 0.6, nikiri: 0.2, none: 0.15, amazu: 0.05 },
    torch: 0.25,
    riceExtras: { wasabi: 0.3, shiso: 0.1 },
    toppings: { sesame: 0.55, shichimi: 0.35, scallion: 0.1 },
    note: 'Unagi already wears tare; sesame and shichimi finish the job.',
  },
  mackerel: {
    sauces: { amazu: 0.45, yuzuShio: 0.25, ponzu: 0.2, none: 0.1 },
    torch: 0.15,
    riceExtras: { wasabi: 0.5, shiso: 0.5 },
    toppings: { scallion: 0.35, sesame: 0.3, yuzukosho: 0.25, yuzu: 0.15, seaSalt: 0.2, shichimi: 0.1 },
    note: 'Vinegar-cured saba wants amazu or shiso; the torch is for other fish.',
  },
  scallop: {
    sauces: { yuzuShio: 0.4, ponzu: 0.3, nikiri: 0.15, none: 0.15 },
    torch: 0,
    riceExtras: { wasabi: 0.4, shiso: 0.25 },
    toppings: { yuzukosho: 0.35, sesame: 0.3, yuzu: 0.25, seaSalt: 0.2, shichimi: 0.2, scallion: 0.15 },
    note: 'Cool, custardy hotate: citrus and a little heat, never the torch.',
  },
  seabream: {
    sauces: { yuzuShio: 0.35, nikiri: 0.3, umeShoyu: 0.2, ponzu: 0.15 },
    torch: 0.2,
    riceExtras: { wasabi: 0.55, shiso: 0.35 },
    toppings: { yuzukosho: 0.3, scallion: 0.3, yuzu: 0.15, seaSalt: 0.2, shichimi: 0.2, sesame: 0.2 },
    note: 'Delicate tai pairs with yuzu shio and shiso for celebrations.',
  },
}

export const SURPRISE_RULES = {
  /** At most this many toppings land on a rolled piece. */
  maxToppings: 3,
  /** Wasabi under the fish cancels wasabi on top; twice is never the answer. */
  avoidWasabiTwice: true,
} as const
