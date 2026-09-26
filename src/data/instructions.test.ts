import { describe, expect, it } from 'vitest'
import { pieceIngredients, pieceSteps, shoppingList } from './instructions'
import type { Piece } from './options'

const salmon: Piece = {
  fish: 'salmon',
  sauce: 'nikiri',
  riceExtras: ['wasabi'],
  torched: true,
  toppings: ['scallion'],
  qty: 2,
}

const tuna: Piece = {
  fish: 'tuna',
  sauce: 'none',
  riceExtras: ['wasabi'],
  torched: false,
  toppings: ['wasabi'],
  qty: 1,
}

describe('pieceSteps', () => {
  it('includes the torch step only for aburi', () => {
    expect(pieceSteps(salmon).join(' ')).toMatch(/torch/i)
    expect(pieceSteps(tuna).join(' ')).not.toMatch(/torch/i)
  })

  it('mentions every chosen component', () => {
    const text = pieceSteps(salmon).join(' ')
    expect(text).toContain('nikiri')
    expect(text).toContain('wasabi')
    expect(text).toContain('scallion')
  })
})

describe('pieceIngredients', () => {
  it('lists the fish with its weight', () => {
    expect(pieceIngredients(salmon)).toContainEqual({ label: 'Salmon', detail: '1 drape, about 12 g' })
  })

  it('skips the sauce when none is chosen', () => {
    const labels = pieceIngredients(tuna).map((item) => item.label)
    expect(labels).not.toContain('Nikiri shoyu')
    expect(labels).not.toContain('Soy sauce')
  })
})

describe('shoppingList', () => {
  it('aggregates shari by piece count', () => {
    const shari = shoppingList([salmon, tuna]).find((item) => item.key === 'shari')
    expect(shari?.detail).toBe('3 pc · about 54 g')
  })

  it('separates wasabi used under the fish from wasabi on top', () => {
    const list = shoppingList([salmon, tuna])
    expect(list.find((item) => item.key === 'extra:wasabi')?.detail).toContain('under the fish')
    expect(list.find((item) => item.key === 'topping:wasabi')?.detail).toContain('on top')
  })

  it('aggregates fish weight across pieces', () => {
    const salmonLine = shoppingList([salmon, { ...salmon, qty: 1 }]).find((item) => item.key === 'fish:salmon')
    expect(salmonLine?.detail).toBe('3 drapes · about 36 g')
  })

  it('returns an empty list for an empty set', () => {
    expect(shoppingList([])).toEqual([])
  })
})

describe('newer components', () => {
  it('walks through marinating when zuke is chosen', () => {
    expect(pieceSteps({ ...tuna, sauce: 'zuke' }).join(' ')).toMatch(/marinate/i)
    expect(pieceIngredients({ ...tuna, sauce: 'zuke' })).toContainEqual({
      label: 'Zuke marinade',
      detail: 'to taste',
    })
  })

  it('lists yuzu juice and sea salt when they are chosen', () => {
    const labels = pieceIngredients({ ...tuna, toppings: ['yuzu', 'seaSalt'] }).map((item) => item.label)
    expect(labels).toContain('Yuzu juice')
    expect(labels).toContain('Sea salt')
  })

  it('aggregates yuzu and sea salt into the shopping list', () => {
    const list = shoppingList([{ ...tuna, toppings: ['yuzu', 'seaSalt'] }])
    expect(list.find((item) => item.key === 'topping:yuzu')?.detail).toContain('on top')
    expect(list.find((item) => item.key === 'topping:seaSalt')?.detail).toContain('on top')
  })

  it('lists and shaves truffle when it is chosen', () => {
    const piece: Piece = { ...salmon, toppings: ['truffle', 'seaSalt'] }
    expect(pieceIngredients(piece).map((item) => item.label)).toContain('Truffle')
    expect(pieceSteps(piece).join(' ')).toMatch(/shave a few thin slices of black truffle/i)
    expect(shoppingList([piece]).find((item) => item.key === 'topping:truffle')?.detail).toContain('on top')
  })
})
