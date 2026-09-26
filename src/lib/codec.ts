import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import {
  FISH,
  MAX_PIECES,
  RICE_EXTRAS,
  SAUCES,
  TOPPINGS,
  cleanRecipe,
  isFishId,
  isRiceExtraId,
  isSauceId,
  isToppingId,
  normalizePiece,
  sanitizeName,
  type FishId,
  type Piece,
  type PieceRecipe,
  type RiceExtraId,
  type SauceId,
  type SetData,
  type ToppingId,
} from '../data/options'

/**
 * Share links, newest first:
 *
 * - v3 (current): a compact schema tuned to this app, then the shorter of
 *   gzip (`v3g.`) and lz-string (`v3l.`), base64url / URI-safe.
 * - v2 (legacy): lz-string over the full JSON shape (`v2.`). Decode only.
 * - v1 (legacy): base64url of the packed `1|name|pieces` string. Decode only.
 *
 * v3's compact schema:
 * - catalog ids are kept as strings so adding fish/toppings never invalidates
 *   old links;
 * - rice extras and toppings collapse into bitmasks in catalog order (new
 *   options must be appended, never inserted — see the order test);
 * - defaults are omitted, recipe notes use one-letter keys and arrays;
 * - recipe fields are positional-free objects so unknown keys are ignored.
 */
const V3_GZIP = 'v3g.'
const V3_LZ = 'v3l.'
const V2_PREFIX = 'v2.'
const LEGACY_VERSION = '1'
const LEGACY_SEPARATOR = '.'

type CompactRecipe = {
  t?: string
  f?: string
  c?: string
  r?: string
  s?: string
  i?: string[]
  b?: string[]
  a?: string[]
  m?: string[]
}

type CompactPiece = [
  fish: string,
  sauce: string,
  extrasMask: number,
  qty: number,
  toppingsMask: number,
  torched: 0 | 1,
  recipe?: CompactRecipe,
]

type CompactSet = {
  n: string
  b?: CompactRecipe
  p: CompactPiece[]
}

/* ---------- packing ---------- */

function packRecipe(recipe: PieceRecipe | undefined): CompactRecipe | undefined {
  const clean = cleanRecipe(recipe)
  if (!clean) return undefined
  const compact: CompactRecipe = {}
  if (clean.title) compact.t = clean.title
  if (clean.fish) compact.f = clean.fish
  if (clean.cut) compact.c = clean.cut
  if (clean.rice) compact.r = clean.rice
  if (clean.sauce) compact.s = clean.sauce
  if (clean.ingredients) compact.i = clean.ingredients
  if (clean.before) compact.b = clean.before
  if (clean.after) compact.a = clean.after
  if (clean.comments) compact.m = clean.comments
  return compact
}

function maskOf<T extends string>(catalog: ReadonlyArray<{ id: T }>, ids: readonly T[]): number {
  let mask = 0
  catalog.forEach((option, index) => {
    if (index < 31 && ids.includes(option.id)) mask |= 1 << index
  })
  return mask
}

function idsFromMask<T extends string>(catalog: ReadonlyArray<{ id: T }>, mask: number): T[] {
  const ids: T[] = []
  catalog.forEach((option, index) => {
    if (index < 31 && ((mask >> index) & 1) === 1) ids.push(option.id)
  })
  return ids
}

function packSet(set: SetData): CompactSet {
  const compact: CompactSet = { n: sanitizeName(set.name), p: [] }
  const base = packRecipe(set.base)
  if (base) compact.b = base
  compact.p = set.pieces.slice(0, MAX_PIECES).map((input) => {
    const piece = normalizePiece(input)
    const tuple: CompactPiece = [
      piece.fish,
      piece.sauce,
      maskOf(RICE_EXTRAS, piece.riceExtras),
      piece.qty,
      maskOf(TOPPINGS, piece.toppings),
      piece.torched ? 1 : 0,
    ]
    const recipe = packRecipe(piece.recipe)
    if (recipe) tuple.push(recipe)
    return tuple
  })
  return compact
}

/* ---------- unpacking (untrusted input) ---------- */

function unpackRecipe(value: unknown): PieceRecipe | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const text = (input: unknown) => (typeof input === 'string' ? input : undefined)
  const lines = (input: unknown) =>
    Array.isArray(input) ? input.filter((line): line is string => typeof line === 'string') : undefined
  return cleanRecipe({
    title: text(record.t),
    fish: text(record.f),
    cut: text(record.c),
    rice: text(record.r),
    sauce: text(record.s),
    ingredients: lines(record.i),
    before: lines(record.b),
    after: lines(record.a),
    comments: lines(record.m),
  })
}

function unpackPiece(value: unknown): unknown {
  if (!Array.isArray(value)) return null
  const [fish, sauce, extras, qty, toppings, torched, recipe] = value
  return {
    fish,
    sauce,
    riceExtras: typeof extras === 'number' ? idsFromMask(RICE_EXTRAS, extras) : [],
    qty: typeof qty === 'number' ? qty : 1,
    toppings: typeof toppings === 'number' ? idsFromMask(TOPPINGS, toppings) : [],
    torched: torched === 1,
    recipe: unpackRecipe(recipe),
  }
}

function unpackSet(json: string): SetData | null {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Record<string, unknown>
    if (!Array.isArray(record.p)) return null
    return coerceSet({
      name: typeof record.n === 'string' ? record.n : '',
      base: unpackRecipe(record.b),
      pieces: record.p.map(unpackPiece).filter((piece) => piece !== null),
    })
  } catch {
    return null
  }
}

/* ---------- compression ---------- */

async function gzipText(text: string): Promise<Uint8Array | null> {
  if (typeof CompressionStream === 'undefined') return null
  try {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
    return new Uint8Array(await new Response(stream).arrayBuffer())
  } catch {
    return null
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function gunzipText(bytes: Uint8Array): Promise<string | null> {
  if (typeof DecompressionStream === 'undefined') return null
  try {
    const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream('gzip'))
    return await new Response(stream).text()
  } catch {
    return null
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

/* ---------- public API ---------- */

export async function encodeSet(set: SetData): Promise<string> {
  const compact = JSON.stringify(packSet(set))
  const lzLink = V3_LZ + compressToEncodedURIComponent(compact)
  const gzipped = await gzipText(compact)
  if (!gzipped) return lzLink
  const gzipLink = V3_GZIP + bytesToBase64Url(gzipped)
  return gzipLink.length <= lzLink.length ? gzipLink : lzLink
}

export async function decodeSet(code: string): Promise<SetData | null> {
  if (code.startsWith(V3_GZIP)) {
    const bytes = base64UrlToBytes(code.slice(V3_GZIP.length))
    if (!bytes) return null
    const json = await gunzipText(bytes)
    return json ? unpackSet(json) : null
  }
  if (code.startsWith(V3_LZ)) {
    const json = decompressFromEncodedURIComponent(code.slice(V3_LZ.length))
    return json ? unpackSet(json) : null
  }
  if (code.startsWith(V2_PREFIX)) {
    try {
      const json = decompressFromEncodedURIComponent(code.slice(V2_PREFIX.length))
      return json ? coerceSet(JSON.parse(json)) : null
    } catch {
      return null
    }
  }
  return decodeLegacySet(code)
}

export function coerceRecipe(value: unknown): PieceRecipe | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const coerceText = (input: unknown, maxLength: number) =>
    typeof input === 'string' ? input.slice(0, maxLength) : undefined
  const coerceLines = (input: unknown) => {
    if (!Array.isArray(input)) return undefined
    return input
      .filter((line): line is string => typeof line === 'string')
      .slice(0, 40)
      .map((line) => line.slice(0, 1000))
  }
  return cleanRecipe({
    title: coerceText(record.title, 200),
    fish: coerceText(record.fish, 200),
    cut: coerceText(record.cut, 300),
    rice: coerceText(record.rice, 100),
    sauce: coerceText(record.sauce, 8000),
    ingredients: coerceLines(record.ingredients),
    before: coerceLines(record.before),
    after: coerceLines(record.after),
    comments: coerceLines(record.comments),
  })
}

export function coercePiece(value: unknown): Piece | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (!isFishId(record.fish)) return null
  return normalizePiece({
    fish: record.fish,
    sauce: isSauceId(record.sauce) ? record.sauce : 'none',
    riceExtras: Array.isArray(record.riceExtras) ? record.riceExtras.filter(isRiceExtraId) : [],
    torched: record.torched === true,
    toppings: Array.isArray(record.toppings) ? record.toppings.filter(isToppingId) : [],
    qty: typeof record.qty === 'number' ? record.qty : 1,
    recipe: coerceRecipe(record.recipe),
  })
}

export function coerceSet(value: unknown): SetData | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (!Array.isArray(record.pieces)) return null
  const pieces = record.pieces
    .slice(0, MAX_PIECES)
    .map(coercePiece)
    .filter((piece): piece is Piece => piece !== null)
  return {
    name: typeof record.name === 'string' ? sanitizeName(record.name) : '',
    pieces,
    base: coerceRecipe(record.base),
  }
}

/* ---------- legacy v1 decoding ---------- */

const fishIdByCode = new Map<string, FishId>(FISH.map((fish) => [fish.code as string, fish.id]))
const sauceIdByCode = new Map<string, SauceId>(SAUCES.map((sauce) => [sauce.code as string, sauce.id]))
const riceExtraIdByCode = new Map<string, RiceExtraId>(RICE_EXTRAS.map((extra) => [extra.code as string, extra.id]))
const toppingIdByCode = new Map<string, ToppingId>(TOPPINGS.map((topping) => [topping.code as string, topping.id]))

function decodeList<T extends string>(value: string | undefined, lookup: Map<string, T>): T[] {
  if (!value || value === '-') return []
  const ids: T[] = []
  for (const char of value) {
    const id = lookup.get(char)
    if (id) ids.push(id)
  }
  return ids
}

function decodeLegacyPiece(raw: string): Piece | null {
  const [fishCode, sauceCode, extrasRaw, torchedRaw, toppingsRaw, qtyRaw] = raw.split(LEGACY_SEPARATOR)
  const fish = fishIdByCode.get(fishCode)
  if (!fish) return null
  return normalizePiece({
    fish,
    sauce: sauceIdByCode.get(sauceCode) ?? 'none',
    riceExtras: decodeList(extrasRaw, riceExtraIdByCode),
    torched: torchedRaw === '1',
    toppings: decodeList(toppingsRaw, toppingIdByCode),
    qty: Number(qtyRaw) || 1,
  })
}

function decodeLegacySet(code: string): SetData | null {
  const bytes = base64UrlToBytes(code)
  if (!bytes) return null
  try {
    const payload = new TextDecoder().decode(bytes)
    const [version, nameRaw, piecesRaw] = payload.split('|')
    if (version !== LEGACY_VERSION) return null
    const pieces = (piecesRaw ?? '')
      .split(';')
      .filter(Boolean)
      .slice(0, MAX_PIECES)
      .map(decodeLegacyPiece)
      .filter((piece): piece is Piece => piece !== null)
    return {
      name: sanitizeName(decodeURIComponent(nameRaw ?? '')),
      pieces,
    }
  } catch {
    return null
  }
}
