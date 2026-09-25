import { FISH, normalizePiece, type FishId, type Piece, type RiceExtraId, type ToppingId } from '../data/options'
import { PAIRINGS, SURPRISE_RULES, type WeightTable } from '../data/pairings'

export type RandomFn = () => number

/**
 * Draw one option from a weight table. Relative weights, so they do not need
 * to sum to 1. Returns null when every weight is zero.
 */
export function weightedPick<T extends string>(weights: WeightTable<T>, random: RandomFn): T | null {
  const entries = Object.entries(weights).filter((entry): entry is [T, number] => {
    const weight = entry[1]
    return typeof weight === 'number' && weight > 0
  })
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  if (total <= 0) return null

  let roll = random() * total
  for (const [id, weight] of entries) {
    roll -= weight
    if (roll < 0) return id
  }
  return entries[entries.length - 1][0]
}

function chance(probability: number, random: RandomFn): boolean {
  return probability > 0 && random() < probability
}

function pickFish(random: RandomFn): FishId {
  return FISH[Math.floor(random() * FISH.length)].id
}

function pickRiceExtras(weights: WeightTable<RiceExtraId>, random: RandomFn): RiceExtraId[] {
  const picked: RiceExtraId[] = []
  for (const [id, weight] of Object.entries(weights) as [RiceExtraId, number][]) {
    if (chance(weight, random)) picked.push(id)
  }
  return picked
}

function pickToppings(weights: WeightTable<ToppingId>, riceExtras: RiceExtraId[], random: RandomFn): ToppingId[] {
  const rolled: { id: ToppingId; weight: number; key: number }[] = []
  for (const [id, weight] of Object.entries(weights) as [ToppingId, number][]) {
    if (SURPRISE_RULES.avoidWasabiTwice && id === 'wasabi' && riceExtras.includes('wasabi')) continue
    if (chance(weight, random)) rolled.push({ id, weight, key: random() })
  }
  rolled.sort((a, b) => b.weight - a.weight || b.key - a.key)
  return rolled.slice(0, SURPRISE_RULES.maxToppings).map((entry) => entry.id)
}

/**
 * Roll a piece that follows the pairing chart. The fish is uniform so every
 * fish gets airtime; everything else is sampled from `PAIRINGS`. Quantity is
 * carried over from the base piece, because surprise is about the recipe,
 * not the order size.
 */
export function surprisePiece(base: Piece, random: RandomFn = Math.random): Piece {
  const fish = pickFish(random)
  const pairing = PAIRINGS[fish]
  const sauce = weightedPick(pairing.sauces, random) ?? 'none'
  const riceExtras = pickRiceExtras(pairing.riceExtras, random)
  const toppings = pickToppings(pairing.toppings, riceExtras, random)

  return normalizePiece({
    fish,
    sauce,
    riceExtras,
    torched: chance(pairing.torch, random),
    toppings,
    qty: base.qty,
  })
}
