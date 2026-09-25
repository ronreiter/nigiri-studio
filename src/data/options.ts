export const FISH = [
  {
    id: 'salmon',
    code: 'sa',
    en: 'Salmon',
    jp: 'サーモン',
    romaji: 'sāmon',
    swatch: ['#ffc39a', '#f2824b', '#df5a2a'],
    grams: 12,
    blurb: 'Buttery and mellow, the friendliest slice on the board.',
    prep: 'Slice a 3 mm drape at a 45° angle so the white fat lines run across the piece.',
    note: 'The rich fats bead up beautifully under a torch.',
  },
  {
    id: 'toroSalmon',
    code: 'ts',
    en: 'Toro Salmon',
    jp: 'トロサーモン',
    romaji: 'toro sāmon',
    swatch: ['#ffe3cf', '#f9b98f', '#ef9a6a'],
    grams: 13,
    blurb: 'The belly cut: softer, sweeter, and twice as rich.',
    prep: 'Slice the belly 4 mm so the wide white fat bands run across the piece, and keep it cold.',
    note: 'Melts on contact. It barely needs the torch.',
  },
  {
    id: 'tuna',
    code: 'tu',
    en: 'Tuna',
    jp: 'マグロ',
    romaji: 'maguro',
    swatch: ['#e25050', '#c22f39', '#8e1b26'],
    grams: 12,
    blurb: 'Clean, mineral, and serious. Akami, the lean cut.',
    prep: 'Slice the akami against the grain, 4 mm, in one long pull of the knife.',
    note: 'Keep it cold; warm tuna goes mealy.',
  },
  {
    id: 'toroTuna',
    code: 'tt',
    en: 'Toro Tuna',
    jp: '中トロ',
    romaji: 'chūtoro',
    swatch: ['#fbd0c8', '#ee8f88', '#cf5f5c'],
    grams: 13,
    blurb: 'Tuna belly, marbled pink and melting.',
    prep: 'Slice the chūtoro 5 mm across the grain, marbling facing up.',
    note: 'The marbling is the point — go easy on the soy.',
  },
  {
    id: 'yellowtail',
    code: 'ha',
    en: 'Hamachi',
    jp: 'ハマチ',
    romaji: 'hamachi',
    swatch: ['#fbe3d2', '#f0bfa5', '#d99a7e'],
    grams: 11,
    blurb: 'Young yellowtail, silky with a clean snap.',
    prep: 'Slice 3 mm and leave a thin silver-blue band of skin along the top edge.',
    note: 'Loves a dab of yuzukosho.',
  },
  {
    id: 'shrimp',
    code: 'eb',
    en: 'Shrimp',
    jp: 'エビ',
    romaji: 'ebi',
    swatch: ['#ffd0a8', '#f7a06e', '#e57b4b'],
    grams: 10,
    blurb: 'Sweet, snappy, and always dressed for the occasion.',
    prep: 'Butterfly the ebi, devein it, straighten it gently, and keep the fan tail on.',
    note: 'The tail should stand up off the rice like a sail.',
  },
  {
    id: 'eel',
    code: 'un',
    en: 'Eel',
    jp: 'ウナギ',
    romaji: 'unagi',
    swatch: ['#c08a4e', '#8a5527', '#4c2b12'],
    grams: 13,
    blurb: 'Smoky, sticky, lacquered with sweet tare.',
    prep: 'Warm the fillet through and brush it with tare just before it goes on the rice.',
    note: 'Already cooked, so the torch is only for char.',
  },
  {
    id: 'mackerel',
    code: 'sb',
    en: 'Mackerel',
    jp: 'サバ',
    romaji: 'saba',
    swatch: ['#cfe0ea', '#8fb0c4', '#516f86'],
    grams: 11,
    blurb: 'Oily, bright, a little wild. The vinegar cure tames it.',
    prep: 'Cure the saba in salt and rice vinegar for 20 minutes, then peel the skin and slice 4 mm.',
    note: 'Gari on the side is not optional.',
  },
  {
    id: 'scallop',
    code: 'ho',
    en: 'Scallop',
    jp: 'ホタテ',
    romaji: 'hotate',
    swatch: ['#fff8ec', '#f4e4c9', '#e2c9a2'],
    grams: 12,
    blurb: 'A cool, custardy bite that tastes like the sea.',
    prep: 'Slice the hotate crosswise 4 mm and score a shallow crosshatch so it lies flat.',
    note: 'A squeeze of yuzu wakes it right up.',
  },
  {
    id: 'seabream',
    code: 'ta',
    en: 'Sea bream',
    jp: 'タイ',
    romaji: 'tai',
    swatch: ['#ffe9e4', '#f8c8c1', '#e39a93'],
    grams: 11,
    blurb: 'Delicate, pink, and celebratory, the good-luck fish.',
    prep: 'Slice tai 3 mm and let it temper for five minutes so the flesh relaxes.',
    note: 'A classic for celebrations and weddings.',
  },
] as const

export type FishId = (typeof FISH)[number]['id']
export type FishOption = (typeof FISH)[number]

export const SAUCES = [
  {
    id: 'none',
    code: '0',
    en: 'None',
    jp: 'なし',
    romaji: 'nashi',
    blurb: 'Let the rice speak for itself.',
    color: null,
    ingredients: [],
    ingredient: '',
    step: '',
  },
  {
    id: 'nikiri',
    code: 'n',
    en: 'Nikiri shoyu',
    jp: '煮切り醤油',
    romaji: 'nikiri shōyu',
    blurb: 'Soy simmered with sake and mirin until glossy and sweet.',
    color: '#8a4b1f',
    ingredients: ['soy sauce', 'sake', 'mirin', 'kombu'],
    ingredient: 'Nikiri shoyu — one light brush',
    step: 'Brush the top of the shari with nikiri shoyu and give it a moment to soak in.',
  },
  {
    id: 'shoyu',
    code: 's',
    en: 'Soy sauce',
    jp: '醤油',
    romaji: 'shōyu',
    blurb: 'Straight, salty, and bracing.',
    color: '#5a2d12',
    ingredients: ['good soy sauce'],
    ingredient: 'Soy sauce — a few drops',
    step: 'Dot the shari with soy sauce; a little goes a long way.',
  },
  {
    id: 'ponzu',
    code: 'p',
    en: 'Ponzu',
    jp: 'ポン酢',
    romaji: 'ponzu',
    blurb: 'Citrus and vinegar cut through oily fish.',
    color: '#b0782f',
    ingredients: ['citrus juice', 'rice vinegar', 'soy sauce', 'dashi'],
    ingredient: 'Ponzu — a light brush',
    step: 'Brush the shari with ponzu for a bright, citrus edge.',
  },
  {
    id: 'yuzuShio',
    code: 'y',
    en: 'Yuzu shio',
    jp: '柚子塩',
    romaji: 'yuzu shio',
    blurb: 'Salt rubbed with yuzu peel: fragrant and bright.',
    color: '#b9a94a',
    ingredients: ['yuzu peel', 'sea salt'],
    ingredient: 'Yuzu shio — a light brush',
    step: 'Brush the shari with yuzu shio for a salty citrus lift.',
  },
  {
    id: 'amazu',
    code: 'a',
    en: 'Amazu',
    jp: '甘酢',
    romaji: 'amazu',
    blurb: 'Sweet rice vinegar, the classic partner for saba.',
    color: '#c98a4b',
    ingredients: ['rice vinegar', 'sugar', 'salt'],
    ingredient: 'Amazu — a light brush',
    step: 'Brush the shari with amazu; it is the classic partner for mackerel.',
  },
  {
    id: 'umeShoyu',
    code: 'u',
    en: 'Ume shoyu',
    jp: '梅醤油',
    romaji: 'ume shōyu',
    blurb: 'Pickled plum and soy: tart, salty, and deep.',
    color: '#8e3b4a',
    ingredients: ['umeboshi', 'soy sauce', 'mirin'],
    ingredient: 'Ume shoyu — a light brush',
    step: 'Brush the shari with ume shoyu for a tart, savory edge.',
  },
  {
    id: 'unagiTare',
    code: 't',
    en: 'Unagi tare',
    jp: 'うなぎのタレ',
    romaji: 'unagi no tare',
    blurb: 'The sweet, glossy glaze that belongs on eel.',
    color: '#6b3410',
    ingredients: ['soy sauce', 'mirin', 'sake', 'sugar'],
    ingredient: 'Unagi tare — a light brush',
    step: 'Brush the shari with unagi tare; it is sweet, glossy, and made for eel.',
  },
] as const

export type SauceId = (typeof SAUCES)[number]['id']
export type SauceOption = (typeof SAUCES)[number]

export const RICE_EXTRAS = [
  {
    id: 'wasabi',
    code: 'w',
    en: 'Wasabi',
    jp: 'わさび',
    romaji: 'wasabi',
    color: '#7fa84a',
    ingredient: 'Fresh wasabi — a pea-sized dab',
    step: 'Dab a pea-sized amount of wasabi on the shari, right where the fish will sit.',
  },
  {
    id: 'shiso',
    code: 'h',
    en: 'Shiso leaf',
    jp: '紫蘇',
    romaji: 'shiso',
    color: '#4e7d3a',
    ingredient: 'Shiso leaf — 1, trimmed',
    step: 'Lay a shiso leaf over the shari, shiny side down, and press it flat.',
  },
] as const

export type RiceExtraId = (typeof RICE_EXTRAS)[number]['id']
export type RiceExtraOption = (typeof RICE_EXTRAS)[number]

export const TOPPINGS = [
  {
    id: 'scallion',
    code: 'c',
    en: 'Scallions',
    jp: 'ネギ',
    romaji: 'negi',
    color: '#5f9e4a',
    ingredient: 'Scallions — a pinch, sliced into thin rings',
    step: 'Scatter the scallion rings across the fish.',
  },
  {
    id: 'wasabi',
    code: 'w',
    en: 'Wasabi',
    jp: 'わさび',
    romaji: 'wasabi',
    color: '#8cb34a',
    ingredient: 'Fresh wasabi — a small dab',
    step: 'Finish with a small dab of grated wasabi on top.',
  },
  {
    id: 'yuzukosho',
    code: 'y',
    en: 'Yuzukosho',
    jp: '柚子胡椒',
    romaji: 'yuzu kosho',
    color: '#d9762e',
    ingredient: 'Yuzukosho — a pinch',
    step: 'Dot the fish with yuzukosho; it is fiery, so keep it to a pinch.',
  },
  {
    id: 'sesame',
    code: 'e',
    en: 'Sesame',
    jp: '胡麻',
    romaji: 'goma',
    color: '#d9b98a',
    ingredient: 'Toasted sesame seeds — a pinch, white and black',
    step: 'Sprinkle toasted sesame over the top.',
  },
  {
    id: 'shichimi',
    code: 't',
    en: 'Shichimi',
    jp: '七味唐辛子',
    romaji: 'shichimi tōgarashi',
    color: '#cf3f24',
    ingredient: 'Shichimi togarashi — a dusting',
    step: 'Dust with shichimi togarashi just before serving.',
  },
] as const

export type ToppingId = (typeof TOPPINGS)[number]['id']
export type ToppingOption = (typeof TOPPINGS)[number]

export type Piece = {
  fish: FishId
  sauce: SauceId
  riceExtras: RiceExtraId[]
  torched: boolean
  toppings: ToppingId[]
  qty: number
}

export type SetData = {
  name: string
  pieces: Piece[]
}

export const MAX_QTY = 6
export const MAX_PIECES = 24
export const MAX_NAME = 80
export const RICE_GRAMS_PER_PIECE = 18

export const DEFAULT_PIECE: Piece = {
  fish: 'salmon',
  sauce: 'nikiri',
  riceExtras: ['wasabi'],
  torched: false,
  toppings: ['scallion'],
  qty: 1,
}

const fishById = new Map<string, FishOption>(FISH.map((f) => [f.id, f]))
const sauceById = new Map<string, SauceOption>(SAUCES.map((s) => [s.id, s]))
const riceExtraById = new Map<string, RiceExtraOption>(RICE_EXTRAS.map((r) => [r.id, r]))
const toppingById = new Map<string, ToppingOption>(TOPPINGS.map((t) => [t.id, t]))

export function fishOf(id: FishId): FishOption {
  return fishById.get(id) ?? FISH[0]
}

export function sauceOf(id: SauceId): SauceOption {
  return sauceById.get(id) ?? SAUCES[0]
}

export function riceExtraOf(id: RiceExtraId): RiceExtraOption {
  return riceExtraById.get(id) ?? RICE_EXTRAS[0]
}

export function toppingOf(id: ToppingId): ToppingOption {
  return toppingById.get(id) ?? TOPPINGS[0]
}

const OPTION_ORDER = {
  fish: FISH.map((f) => f.id as string),
  sauce: SAUCES.map((s) => s.id as string),
  riceExtras: RICE_EXTRAS.map((r) => r.id as string),
  toppings: TOPPINGS.map((t) => t.id as string),
}

function sortByOrder<T extends string>(ids: T[], order: string[]): T[] {
  return [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

export function normalizePiece(piece: Piece): Piece {
  return {
    fish: piece.fish,
    sauce: piece.sauce,
    riceExtras: sortByOrder([...new Set(piece.riceExtras)], OPTION_ORDER.riceExtras),
    torched: piece.torched,
    toppings: sortByOrder([...new Set(piece.toppings)], OPTION_ORDER.toppings),
    qty: Math.min(MAX_QTY, Math.max(1, Math.round(piece.qty) || 1)),
  }
}

export function pieceTitle(piece: Piece): string {
  const fish = fishOf(piece.fish)
  const base = piece.torched ? `Aburi ${fish.en}` : fish.en
  const highlights = nameHighlights(piece).map((item) => item.en)
  return highlights.length > 0 ? `${base} with ${joinWords(highlights)}` : base
}

export function pieceTitleJp(piece: Piece): string {
  const fish = fishOf(piece.fish)
  const fishPart = piece.torched ? `炙り${fish.jp}` : fish.jp
  return [fishPart, ...nameHighlights(piece).map((item) => item.jp)].join(' ')
}

function nameHighlights(piece: Piece): { en: string; jp: string }[] {
  const highlights: { en: string; jp: string }[] = []
  const add = (en: string, jp: string) => {
    if (!highlights.some((item) => item.en === en)) highlights.push({ en, jp })
  }

  for (const id of piece.toppings) {
    if (id === 'wasabi') continue
    add(toppingOf(id).en, toppingOf(id).jp)
  }
  for (const id of piece.riceExtras) {
    if (id === 'wasabi') continue
    add(riceExtraOf(id).en, riceExtraOf(id).jp)
  }
  if (highlights.length === 0 && piece.sauce !== 'none') {
    add(sauceOf(piece.sauce).en, sauceOf(piece.sauce).jp)
  }
  return highlights.slice(0, 2)
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words[0] ?? ''
  return `${words.slice(0, -1).join(', ')} & ${words[words.length - 1]}`
}

export function pieceSubtitle(piece: Piece): string {
  const parts: string[] = []
  const sauce = sauceOf(piece.sauce)
  if (sauce.id !== 'none') parts.push(sauce.en)
  for (const id of piece.riceExtras) parts.push(riceExtraOf(id).en)
  for (const id of piece.toppings) parts.push(toppingOf(id).en)
  return parts.length ? parts.join(' · ') : 'Plain'
}

export function pieceKey(piece: Piece): string {
  return [
    piece.fish,
    piece.sauce,
    piece.riceExtras.join(''),
    piece.torched ? '1' : '0',
    piece.toppings.join(''),
  ].join('-')
}

export function totalPieces(pieces: Piece[]): number {
  return pieces.reduce((sum, p) => sum + p.qty, 0)
}

export function sanitizeName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME)
}

export function isFishId(id: unknown): id is FishId {
  return typeof id === 'string' && fishById.has(id)
}

export function isSauceId(id: unknown): id is SauceId {
  return typeof id === 'string' && sauceById.has(id)
}

export function isRiceExtraId(id: unknown): id is RiceExtraId {
  return typeof id === 'string' && riceExtraById.has(id)
}

export function isToppingId(id: unknown): id is ToppingId {
  return typeof id === 'string' && toppingById.has(id)
}
