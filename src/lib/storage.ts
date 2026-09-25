import { MAX_PIECES, type SetData } from '../data/options'
import { coerceSet } from './codec'

export type SavedSet = SetData & {
  id: string
  createdAt: number
  updatedAt: number
}

const SETS_KEY = 'nigiri-studio.sets.v1'
const DRAFT_KEY = 'nigiri-studio.draft.v1'

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

function readJson(key: string): unknown {
  const store = storage()
  if (!store) return null
  const raw = store.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or blocked; nothing sensible to do
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `set-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadSets(): SavedSet[] {
  const raw = readJson(SETS_KEY)
  if (!Array.isArray(raw)) return []
  const sets: SavedSet[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const set = coerceSet(record)
    if (!set) continue
    sets.push({
      id: typeof record.id === 'string' ? record.id : newId(),
      name: set.name,
      pieces: set.pieces.slice(0, MAX_PIECES),
      createdAt: typeof record.createdAt === 'number' ? record.createdAt : Date.now(),
      updatedAt: typeof record.updatedAt === 'number' ? record.updatedAt : Date.now(),
    })
  }
  return sets.sort((a, b) => b.updatedAt - a.updatedAt)
}

function persist(sets: SavedSet[]): void {
  writeJson(SETS_KEY, sets)
}

export function upsertSet(input: SetData & { id?: string }): SavedSet[] {
  const sets = loadSets()
  const now = Date.now()
  const existing = input.id ? sets.find((set) => set.id === input.id) : undefined
  if (existing) {
    existing.name = input.name
    existing.pieces = input.pieces
    existing.updatedAt = now
  } else {
    sets.push({
      id: newId(),
      name: input.name,
      pieces: input.pieces,
      createdAt: now,
      updatedAt: now,
    })
  }
  sets.sort((a, b) => b.updatedAt - a.updatedAt)
  persist(sets)
  return sets
}

export function removeSet(id: string): SavedSet[] {
  const sets = loadSets().filter((set) => set.id !== id)
  persist(sets)
  return sets
}

export function loadDraft(): SetData | null {
  return coerceSet(readJson(DRAFT_KEY))
}

export function saveDraft(set: SetData): void {
  writeJson(DRAFT_KEY, set)
}
