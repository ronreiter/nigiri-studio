import { describe, expect, it } from 'vitest'
import { DEFAULT_PIECE, FISH, type Piece } from '../data/options'
import { PAIRINGS } from '../data/pairings'
import { surprisePiece, weightedPick } from './surprise'

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('weightedPick', () => {
  it('returns null when every weight is zero', () => {
    expect(weightedPick({ a: 0, b: 0 }, () => 0.5)).toBeNull()
  })

  it('respects relative weights', () => {
    expect(weightedPick({ a: 3, b: 1 }, () => 0.5)).toBe('a')
    expect(weightedPick({ a: 3, b: 1 }, () => 0.9)).toBe('b')
  })

  it('ignores zero-weight options entirely', () => {
    const picks = Array.from({ length: 50 }, () => weightedPick({ a: 1, b: 0 }, () => 0.999))
    expect(picks.every((pick) => pick === 'a')).toBe(true)
  })
})

describe('pairing chart', () => {
  it('has a complete, sane entry for every fish', () => {
    expect(Object.keys(PAIRINGS)).toHaveLength(FISH.length)
    for (const [fish, pairing] of Object.entries(PAIRINGS)) {
      expect(Object.keys(pairing.sauces).length, fish).toBeGreaterThanOrEqual(2)
      expect(Object.keys(pairing.toppings).length, fish).toBeGreaterThanOrEqual(2)
      expect(pairing.torch, fish).toBeGreaterThanOrEqual(0)
      expect(pairing.torch, fish).toBeLessThanOrEqual(1)
      for (const [id, weight] of Object.entries(pairing.sauces)) {
        expect(weight, `${fish}/${id}`).toBeGreaterThan(0)
      }
      for (const weight of Object.values(pairing.riceExtras)) {
        expect(weight, fish).toBeGreaterThanOrEqual(0)
        expect(weight, fish).toBeLessThanOrEqual(1)
      }
      for (const weight of Object.values(pairing.toppings)) {
        expect(weight, fish).toBeGreaterThanOrEqual(0)
        expect(weight, fish).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('surprisePiece', () => {
  const random = mulberry32(20260925)
  const pieces: Piece[] = Array.from({ length: 4000 }, () => surprisePiece(DEFAULT_PIECE, random))

  it('stays inside the pairing chart', () => {
    for (const piece of pieces) {
      const pairing = PAIRINGS[piece.fish]
      expect(pairing.sauces[piece.sauce], `${piece.fish}/${piece.sauce}`).toBeGreaterThan(0)
      for (const id of piece.riceExtras) {
        expect(pairing.riceExtras[id], `${piece.fish}/${id}`).toBeGreaterThan(0)
      }
      for (const id of piece.toppings) {
        expect(pairing.toppings[id], `${piece.fish}/${id}`).toBeGreaterThan(0)
      }
      if (piece.torched) expect(pairing.torch, piece.fish).toBeGreaterThan(0)
    }
  })

  it('never torches a scallop or a shrimp', () => {
    const cold = pieces.filter((piece) => piece.fish === 'scallop' || piece.fish === 'shrimp')
    expect(cold.length).toBeGreaterThan(0)
    expect(cold.every((piece) => !piece.torched)).toBe(true)
  })

  it('never puts wasabi both under the fish and on top', () => {
    expect(
      pieces.every(
        (piece) => !(piece.riceExtras.includes('wasabi') && piece.toppings.includes('wasabi')),
      ),
    ).toBe(true)
  })

  it('never exceeds the topping cap', () => {
    expect(pieces.every((piece) => piece.toppings.length <= 3)).toBe(true)
  })

  it('keeps the quantity from the base piece', () => {
    const rolled = surprisePiece({ ...DEFAULT_PIECE, qty: 4 }, mulberry32(7))
    expect(rolled.qty).toBe(4)
  })

  it('gives every fish some airtime', () => {
    const seen = new Set(pieces.map((piece) => piece.fish))
    expect(seen.size).toBe(FISH.length)
  })
})
