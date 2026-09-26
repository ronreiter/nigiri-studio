import { describe, expect, it } from 'vitest'
import { compressToEncodedURIComponent } from 'lz-string'
import { coerceSet, decodeSet, encodeSet } from './codec'
import { RICE_EXTRAS, TOPPINGS, normalizePiece, sanitizeName, type SetData } from '../data/options'

const sample: SetData = {
  name: 'Omakase for one',
  pieces: [
    { fish: 'salmon', sauce: 'nikiri', riceExtras: ['wasabi'], torched: false, toppings: ['scallion'], qty: 2 },
    { fish: 'tuna', sauce: 'shoyu', riceExtras: ['wasabi', 'shiso'], torched: true, toppings: ['sesame', 'shichimi'], qty: 1 },
    { fish: 'eel', sauce: 'none', riceExtras: [], torched: false, toppings: [], qty: 6 },
  ],
}

const written: SetData = {
  name: 'Course notes',
  base: {
    title: 'Sushi Rice & Basic Sauces',
    fish: 'Base preparation — works for all fish.',
    sauce: '### Rice seasoning\nFor about 48 nigiri:\n\n- 3 tbsp rice vinegar\n- 1 tsp fine salt',
    ingredients: ['1½ cups sushi rice', 'Flaky sea salt'],
    before: ['Wash the rice 4–5 times', 'Shape about 13–15 g rice per nigiri'],
    after: ['Serve each piece promptly'],
    comments: ['Use fish suitable for raw consumption'],
  },
  pieces: [
    {
      fish: 'tuna',
      sauce: 'zuke',
      riceExtras: ['wasabi'],
      torched: false,
      toppings: ['seaSalt'],
      qty: 1,
      recipe: {
        title: 'Tuna Zuke Nigiri',
        fish: 'Tuna / maguro.',
        cut: 'about 5 mm thick',
        rice: '13–15 g per piece',
        sauce: '### Zuke marinade\n- 3 tbsp soy sauce\n\nMarinate for about **5–8 minutes**, then blot gently.',
        ingredients: ['Tuna', 'Sushi rice', 'Wasabi', 'Zuke marinade', 'Optional: scallion'],
        before: ['Prepare and cool the zuke marinade.', 'Marinate the sliced tuna for 5–8 minutes.'],
        after: ['Place 1 slice of marinated tuna over the rice.', 'Do not add extra soy sauce.'],
        comments: ['Serve after the classic tuna piece.', 'Do not marinate too long.'],
      },
    },
  ],
}

const encoded = (set: SetData) => 'v2.' + compressToEncodedURIComponent(JSON.stringify(set))

describe('encodeSet / decodeSet', () => {
  it('round-trips a set', async () => {
    const decoded = await decodeSet(await encodeSet(sample))
    expect(decoded).toEqual({
      name: sample.name,
      pieces: sample.pieces.map(normalizePiece),
    })
  })

  it('round-trips recipe notes and a base preparation exactly', async () => {
    const decoded = await decodeSet(await encodeSet(written))
    expect(decoded).toEqual({
      name: written.name,
      pieces: written.pieces.map(normalizePiece),
      base: written.base,
    })
  })

  it('round-trips unicode set names', async () => {
    const set: SetData = { ...sample, name: 'おまかせ №1 — Ron’s 鮨' }
    const decoded = await decodeSet(await encodeSet(set))
    expect(decoded?.name).toBe(sanitizeName(set.name))
  })

  it('emits a v3 link with a URL-safe payload', async () => {
    const code = await encodeSet(sample)
    expect(code).toMatch(/^v3[gl]\./)
    if (code.startsWith('v3g.')) {
      expect(code.slice(4)).toMatch(/^[A-Za-z0-9_-]+$/)
    } else {
      expect(code.slice(4)).toMatch(/^[A-Za-z0-9+$-]+$/)
    }
  })

  it('keeps a recipe-heavy set link under 1.5k characters', async () => {
    expect((await encodeSet(written)).length).toBeLessThan(1500)
  })

  it('beats the old JSON format even on small sets', async () => {
    const code = await encodeSet(sample)
    expect(code.length).toBeLessThan(encoded(sample).length)
  })

  it('clamps quantities on the way back in', async () => {
    const decoded = await decodeSet(await encodeSet({ name: 'x', pieces: [{ ...sample.pieces[0], qty: 99 }] }))
    expect(decoded?.pieces[0].qty).toBe(6)
  })

  it('decodes v2 links', async () => {
    const decoded = await decodeSet(encoded(sample))
    expect(decoded).toEqual({ name: sample.name, pieces: sample.pieces.map(normalizePiece) })
  })

  it('still decodes compact v1 links', async () => {
    const legacy =
      'MXxSb24ncyUyMG9tYWthc2V8c2Eubi53LjEueS4yO2ViLnAuLS4wLmMuMTt1bi4wLi0uMC5ldC4xO3R1LnMud2guMC53LjE'
    const decoded = await decodeSet(legacy)
    expect(decoded?.name).toBe("Ron's omakase")
    expect(decoded?.pieces).toHaveLength(4)
    expect(decoded?.pieces[0]).toEqual({
      fish: 'salmon',
      sauce: 'nikiri',
      riceExtras: ['wasabi'],
      torched: true,
      toppings: ['yuzukosho'],
      qty: 2,
    })
  })

  it('returns null for garbage input', async () => {
    expect(await decodeSet('not-a-real-code')).toBeNull()
    expect(await decodeSet('')).toBeNull()
    expect(await decodeSet('%%%')).toBeNull()
    expect(await decodeSet('v2.not-real-compressed-data!!')).toBeNull()
    expect(await decodeSet('v3g.not-base64!!')).toBeNull()
    expect(await decodeSet('v3l.not-real-compressed-data!!')).toBeNull()
  })
})

describe('wire format stability', () => {
  it('pins the bitmask order for rice extras and toppings', () => {
    expect(RICE_EXTRAS.map((extra) => extra.id)).toEqual(['wasabi', 'shiso'])
    expect(TOPPINGS.map((topping) => topping.id)).toEqual([
      'scallion',
      'wasabi',
      'yuzukosho',
      'sesame',
      'shichimi',
      'yuzu',
      'seaSalt',
      'truffle',
    ])
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

  it('keeps only string fields and lines inside a recipe', () => {
    const coerced = coerceSet({
      name: 'x',
      pieces: [{ fish: 'salmon', recipe: { title: 42, comments: ['ok', 7, null], before: 'nope' } }],
    })
    expect(coerced?.pieces[0].recipe?.title).toBeUndefined()
    expect(coerced?.pieces[0].recipe?.comments).toEqual(['ok'])
    expect(coerced?.pieces[0].recipe?.before).toBeUndefined()
  })

  it('drops an empty recipe entirely', () => {
    const coerced = coerceSet({ name: 'x', pieces: [{ fish: 'salmon', recipe: { title: '   ' } }] })
    expect(coerced?.pieces[0].recipe).toBeUndefined()
  })

  it('round-trips a set that is only a base preparation', async () => {
    const onlyBase: SetData = { name: 'Rice', pieces: [], base: { title: 'Rice', before: ['Wash the rice'] } }
    expect(await decodeSet(await encodeSet(onlyBase))).toEqual(onlyBase)
  })

  it('truncates over-long text and caps the number of lines', () => {
    const coerced = coerceSet({
      name: 'x',
      pieces: [
        {
          fish: 'salmon',
          recipe: {
            title: 'a'.repeat(500),
            sauce: 'b'.repeat(9000),
            comments: Array.from({ length: 60 }, (_, index) => `note ${index}`),
          },
        },
      ],
    })
    const recipe = coerced?.pieces[0].recipe
    expect(recipe?.title).toHaveLength(200)
    expect(recipe?.sauce).toHaveLength(8000)
    expect(recipe?.comments).toHaveLength(40)
  })
})
