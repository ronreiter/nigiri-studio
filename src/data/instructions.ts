import {
  RICE_GRAMS_PER_PIECE,
  fishOf,
  riceExtraOf,
  sauceOf,
  toppingOf,
  type Piece,
} from './options'

export type Ingredient = {
  label: string
  detail: string
}

export type ShoppingItem = {
  key: string
  label: string
  category: 'base' | 'fish' | 'sauce' | 'extra' | 'topping'
  detail: string
}

export function pieceIngredients(piece: Piece): Ingredient[] {
  const fish = fishOf(piece.fish)
  const sauce = sauceOf(piece.sauce)
  const items: Ingredient[] = [
    { label: 'Seasoned shari', detail: `${RICE_GRAMS_PER_PIECE} g` },
    { label: fish.en, detail: `1 drape, about ${fish.grams} g` },
  ]
  if (sauce.id !== 'none') items.push({ label: sauce.en, detail: 'to taste' })
  for (const id of piece.riceExtras) items.push({ label: riceExtraOf(id).en, detail: '1 portion' })
  for (const id of piece.toppings) items.push({ label: toppingOf(id).en, detail: 'a pinch' })
  return items
}

export function pieceSteps(piece: Piece): string[] {
  const fish = fishOf(piece.fish)
  const sauce = sauceOf(piece.sauce)
  const steps: string[] = [
    `Wet your hands with tezu, take ${RICE_GRAMS_PER_PIECE} g of seasoned shari, and form a loose oval. Do not pack it tight.`,
  ]
  if (sauce.id !== 'none') steps.push(sauce.step)
  for (const id of piece.riceExtras) steps.push(riceExtraOf(id).step)
  steps.push(fish.prep)
  steps.push(`Drape the ${fish.en.toLowerCase()} over the shari and press once with two fingers to marry them.`)
  if (piece.torched) {
    steps.push(
      'Aburi: run a torch about 10 cm above the surface for 6–8 seconds, until the fats bead and the edge blisters. Let it rest 10 seconds.',
    )
  }
  for (const id of piece.toppings) steps.push(toppingOf(id).step)
  steps.push('Serve within a minute. Eat it in one bite, fish-side down.')
  return steps
}

export function pieceNote(piece: Piece): string {
  const fish = fishOf(piece.fish)
  if (piece.torched) return `Torching wakes up the aromatics in ${fish.en.toLowerCase()}. ${fish.note}`
  return fish.note
}

export function shoppingList(pieces: Piece[]): ShoppingItem[] {
  const items = new Map<string, ShoppingItem>()
  const total = pieces.reduce((sum, p) => sum + p.qty, 0)

  if (total > 0) {
    items.set('shari', {
      key: 'shari',
      label: 'Seasoned shari',
      category: 'base',
      detail: `${total} pc · about ${total * RICE_GRAMS_PER_PIECE} g`,
    })
  }

  const fishTotals = new Map<string, { label: string; qty: number; grams: number }>()
  const sauceTotals = new Map<string, { label: string; qty: number }>()
  const extraTotals = new Map<string, { label: string; qty: number }>()
  const toppingTotals = new Map<string, { label: string; qty: number }>()

  for (const piece of pieces) {
    const fish = fishOf(piece.fish)
    const fishEntry = fishTotals.get(fish.id) ?? { label: fish.en, qty: 0, grams: 0 }
    fishEntry.qty += piece.qty
    fishEntry.grams += piece.qty * fish.grams
    fishTotals.set(fish.id, fishEntry)

    if (piece.sauce !== 'none') {
      const sauce = sauceOf(piece.sauce)
      const entry = sauceTotals.get(sauce.id) ?? { label: sauce.en, qty: 0 }
      entry.qty += piece.qty
      sauceTotals.set(sauce.id, entry)
    }
    for (const id of piece.riceExtras) {
      const extra = riceExtraOf(id)
      const entry = extraTotals.get(extra.id) ?? { label: extra.en, qty: 0 }
      entry.qty += piece.qty
      extraTotals.set(extra.id, entry)
    }
    for (const id of piece.toppings) {
      const topping = toppingOf(id)
      const entry = toppingTotals.get(topping.id) ?? { label: topping.en, qty: 0 }
      entry.qty += piece.qty
      toppingTotals.set(topping.id, entry)
    }
  }

  for (const [id, entry] of fishTotals) {
    items.set(`fish:${id}`, {
      key: `fish:${id}`,
      label: entry.label,
      category: 'fish',
      detail: `${entry.qty} drape${entry.qty === 1 ? '' : 's'} · about ${entry.grams} g`,
    })
  }

  const addTotals = (
    totals: Map<string, { label: string; qty: number }>,
    category: ShoppingItem['category'],
    keyPrefix: string,
    describe: (qty: number) => string,
  ) => {
    for (const [id, entry] of totals) {
      const key = `${keyPrefix}:${id}`
      items.set(key, { key, label: entry.label, category, detail: describe(entry.qty) })
    }
  }
  addTotals(sauceTotals, 'sauce', 'sauce', (qty) => `brushed on ${qty} pc`)
  addTotals(extraTotals, 'extra', 'extra', (qty) => `under the fish · ${qty} pc`)
  addTotals(toppingTotals, 'topping', 'topping', (qty) => `on top · ${qty} pc`)

  const order: ShoppingItem['category'][] = ['base', 'fish', 'sauce', 'extra', 'topping']
  return [...items.values()].sort((a, b) => {
    const byCat = order.indexOf(a.category) - order.indexOf(b.category)
    if (byCat !== 0) return byCat
    return a.label.localeCompare(b.label)
  })
}
