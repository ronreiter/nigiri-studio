import { describe, expect, it } from 'vitest'
import { coerceSet, decodeSet, encodeSet } from './codec'
import { normalizePiece, sanitizeName, type SetData } from '../data/options'

const sample: SetData = {
  name: 'Omakase for one',
  pieces: [
    { fish: 'salmon', sauce: 'nikiri', riceExtras: ['wasabi'], torched: false, toppings: ['scallion'], qty: 2 },
    { fish: 'tuna', sauce: 'shoyu', riceExtras: ['wasabi', 'shiso'], torched: true, toppings: ['sesame', 'shichimi'], qty: 1 },
    { fish: 'eel', sauce: 'none', riceExtras: [], torched: false, toppings: [], qty: 6 },
  ],
}

describe('encodeSet / decodeSet', () => {
  it('round-trips a set', () => {
    const decoded = decodeSet(encodeSet(sample))
    expect(decoded).toEqual({
      name: sample.name,
      pieces: sample.pieces.map(normalizePiece),
    })
  })

  it('round-trips unicode set names', () => {
    const set: SetData = { ...sample, name: 'おまかせ №1 — Ron’s 鮨' }
    const decoded = decodeSet(encodeSet(set))
    expect(decoded?.name).toBe(sanitizeName(set.name))
  })

  it('produces url-safe output', () => {
    expect(encodeSet(sample)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('clamps quantities on the way back in', () => {
    const decoded = decodeSet(encodeSet({ name: 'x', pieces: [{ ...sample.pieces[0], qty: 99 }] }))
    expect(decoded?.pieces[0].qty).toBe(6)
  })

  it('returns null for garbage input', () => {
    expect(decodeSet('not-a-real-code')).toBeNull()
    expect(decodeSet('')).toBeNull()
    expect(decodeSet('%%%')).toBeNull()
  })

  it('drops pieces with unknown fish but keeps the rest', () => {
    const valid = encodeSet(sample)
    const decoded = decodeSet(valid)
    expect(decoded?.pieces).toHaveLength(3)
  })
})

describe('coerceSet', () => {
  it('accepts a well-formed set', () => {
    expect(coerceSet(sample)).toEqual({ name: sample.name, pieces: sample.pieces.map(normalizePiece) })
  })

  it('rejects non-objects and missing pieces', () => {
    expect(coerceSet(null)).toBeNull()
    expect(coerceSet('nope')).toBeNull()
    expect(coerceSet({ name: 'x' })).toBeNull()
  })

  it('drops invalid pieces and sanitizes the name', () => {
    const coerced = coerceSet({
      name: '  spaced   out  ',
      pieces: [{ fish: 'salmon' }, { fish: 'dragon' }, null],
    })
    expect(coerced?.name).toBe('spaced out')
    expect(coerced?.pieces).toHaveLength(1)
    expect(coerced?.pieces[0].sauce).toBe('none')
  })
})
