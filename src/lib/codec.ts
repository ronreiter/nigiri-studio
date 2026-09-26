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
 * Share links come in two flavors:
 * - v2 (current): `v2.` + lz-string-compressed JSON. Carries recipe notes.
 * - v1 (legacy): base64url of a compact packed string. Decode only.
 */
const V2_PREFIX = 'v2.'
const LEGACY_VERSION = '1'
const LEGACY_SEPARATOR = '.'

const fishIdByCode = new Map<string, FishId>(FISH.map((fish) => [fish.code as string, fish.id]))
const sauceIdByCode = new Map<string, SauceId>(SAUCES.map((sauce) => [sauce.code as string, sauce.id]))
const riceExtraIdByCode = new Map<string, RiceExtraId>(RICE_EXTRAS.map((extra) => [extra.code as string, extra.id]))
const toppingIdByCode = new Map<string, ToppingId>(TOPPINGS.map((topping) => [topping.code as string, topping.id]))

export function encodeSet(set: SetData): string {
  const payload = {
    name: sanitizeName(set.name),
    base: cleanRecipe(set.base),
    pieces: set.pieces.slice(0, MAX_PIECES).map(normalizePiece),
  }
  return V2_PREFIX + compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeSet(code: string): SetData | null {
  if (code.startsWith(V2_PREFIX)) {
    try {
      const json = decompressFromEncodedURIComponent(code.slice(V2_PREFIX.length))
      if (!json) return null
      return coerceSet(JSON.parse(json))
    } catch {
      return null
    }
  }
  return decodeLegacySet(code)
}

function coerceText(value: unknown, maxLength: number): string | undefined {
  return typeof value === 'string' ? value.slice(0, maxLength) : undefined
}

function coerceLines(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .filter((line): line is string => typeof line === 'string')
    .slice(0, 40)
    .map((line) => line.slice(0, 1000))
}

export function coerceRecipe(value: unknown): PieceRecipe | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
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

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function decodeLegacySet(code: string): SetData | null {
  try {
    const payload = new TextDecoder().decode(base64UrlToBytes(code))
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
