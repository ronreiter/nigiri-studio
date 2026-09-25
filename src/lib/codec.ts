import {
  FISH,
  MAX_PIECES,
  RICE_EXTRAS,
  SAUCES,
  TOPPINGS,
  isFishId,
  isRiceExtraId,
  isSauceId,
  isToppingId,
  normalizePiece,
  sanitizeName,
  type FishId,
  type Piece,
  type RiceExtraId,
  type SauceId,
  type SetData,
  type ToppingId,
} from '../data/options'

const VERSION = '1'
const SEPARATOR = '.'

const fishCodeById = new Map<string, string>(FISH.map((f) => [f.id, f.code]))
const sauceCodeById = new Map<string, string>(SAUCES.map((s) => [s.id, s.code]))
const riceExtraCodeById = new Map<string, string>(RICE_EXTRAS.map((r) => [r.id, r.code]))
const toppingCodeById = new Map<string, string>(TOPPINGS.map((t) => [t.id, t.code]))

const fishIdByCode = new Map<string, FishId>(FISH.map((f) => [f.code as string, f.id]))
const sauceIdByCode = new Map<string, SauceId>(SAUCES.map((s) => [s.code as string, s.id]))
const riceExtraIdByCode = new Map<string, RiceExtraId>(RICE_EXTRAS.map((r) => [r.code as string, r.id]))
const toppingIdByCode = new Map<string, ToppingId>(TOPPINGS.map((t) => [t.code as string, t.id]))

function encodePiece(piece: Piece): string {
  const extras = piece.riceExtras.map((id) => riceExtraCodeById.get(id) ?? '').join('') || '-'
  const toppings = piece.toppings.map((id) => toppingCodeById.get(id) ?? '').join('') || '-'
  return [
    fishCodeById.get(piece.fish) ?? 'sa',
    sauceCodeById.get(piece.sauce) ?? '0',
    extras,
    piece.torched ? '1' : '0',
    toppings,
    String(piece.qty),
  ].join(SEPARATOR)
}

function decodePiece(raw: string): Piece | null {
  const [fishCode, sauceCode, extrasRaw, torchedRaw, toppingsRaw, qtyRaw] = raw.split(SEPARATOR)
  const fish = fishIdByCode.get(fishCode)
  if (!fish) return null

  const decodeList = <T extends string>(value: string | undefined, lookup: Map<string, T>): T[] => {
    if (!value || value === '-') return []
    const ids: T[] = []
    for (const char of value) {
      const id = lookup.get(char)
      if (id) ids.push(id)
    }
    return ids
  }

  return normalizePiece({
    fish,
    sauce: sauceIdByCode.get(sauceCode) ?? 'none',
    riceExtras: decodeList(extrasRaw, riceExtraIdByCode),
    torched: torchedRaw === '1',
    toppings: decodeList(toppingsRaw, toppingIdByCode),
    qty: Number(qtyRaw) || 1,
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
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeSet(set: SetData): string {
  const payload = [
    VERSION,
    encodeURIComponent(sanitizeName(set.name)),
    set.pieces.slice(0, MAX_PIECES).map(encodePiece).join(';'),
  ].join('|')
  return bytesToBase64Url(new TextEncoder().encode(payload))
}

export function decodeSet(code: string): SetData | null {
  try {
    const payload = new TextDecoder().decode(base64UrlToBytes(code))
    const [version, nameRaw, piecesRaw] = payload.split('|')
    if (version !== VERSION) return null
    const pieces = (piecesRaw ?? '')
      .split(';')
      .filter(Boolean)
      .slice(0, MAX_PIECES)
      .map(decodePiece)
      .filter((piece): piece is Piece => piece !== null)
    return {
      name: sanitizeName(decodeURIComponent(nameRaw ?? '')),
      pieces,
    }
  } catch {
    return null
  }
}
