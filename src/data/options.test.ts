import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PIECE,
  FISH,
  RICE_EXTRAS,
  SAUCES,
  TOPPINGS,
  pieceTitle,
  pieceTitleJp,
  type Piece,
} from './options'

const groups: Array<[string, ReadonlyArray<{ id: string; code: string }>]> = [
  ['fish', FISH],
  ['sauces', SAUCES],
  ['riceExtras', RICE_EXTRAS],
  ['toppings', TOPPINGS],
]

describe('catalog', () => {
  it('keeps ids unique within each group', () => {
    for (const [name, list] of groups) {
      const ids = list.map((item) => item.id)
      expect(new Set(ids).size, `${name} ids`).toBe(ids.length)
    }
  })

  it('keeps share-link codes unique within each group', () => {
    for (const [name, list] of groups) {
      const codes = list.map((item) => item.code)
      expect(new Set(codes).size, `${name} codes`).toBe(codes.length)
    }
  })

  it('gives every sauce except none a recipe', () => {
    for (const sauce of SAUCES) {
      if (sauce.id === 'none') {
        expect(sauce.ingredients).toHaveLength(0)
      } else {
        expect(sauce.ingredients.length, sauce.id).toBeGreaterThan(0)
      }
    }
  })
})

describe('piece naming', () => {
  const plain: Piece = {
    ...DEFAULT_PIECE,
    fish: 'salmon',
    sauce: 'none',
    riceExtras: [],
    torched: false,
    toppings: [],
  }

  it('falls back to the fish name and its Japanese name', () => {
    expect(pieceTitle(plain)).toBe('Salmon')
    expect(pieceTitleJp(plain)).toBe('サーモン')
  })

  it('prefixes aburi and names the finish', () => {
    const piece: Piece = { ...plain, torched: true, toppings: ['yuzukosho'] }
    expect(pieceTitle(piece)).toBe('Aburi Salmon with Yuzukosho')
    expect(pieceTitleJp(piece)).toBe('炙りサーモン 柚子胡椒')
  })

  it('ignores wasabi and falls back to the sauce when nothing else is chosen', () => {
    const piece: Piece = {
      ...plain,
      fish: 'eel',
      sauce: 'unagiTare',
      riceExtras: ['wasabi'],
      toppings: ['wasabi'],
    }
    expect(pieceTitle(piece)).toBe('Eel with Unagi tare')
    expect(pieceTitleJp(piece)).toBe('ウナギ うなぎのタレ')
  })

  it('caps the name at two highlights', () => {
    const piece: Piece = { ...plain, toppings: ['scallion', 'sesame', 'shichimi'] }
    expect(pieceTitle(piece)).toBe('Salmon with Scallions & Sesame')
  })
})
