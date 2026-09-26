import { useId, type ReactNode } from 'react'
import { fishOf, sauceOf, type FishOption, type Piece } from '../data/options'

type Props = {
  piece: Piece
  className?: string
  animated?: boolean
}

type IdFn = (name: string) => string

type Point = { x: number; y: number; r?: number }

const SCALLION_RINGS: Point[] = [
  { x: 92, y: 74, r: -12 },
  { x: 108, y: 67, r: 8 },
  { x: 126, y: 73, r: -4 },
  { x: 145, y: 66, r: 14 },
  { x: 86, y: 86, r: 6 },
  { x: 118, y: 84, r: -10 },
  { x: 140, y: 81, r: 4 },
  { x: 102, y: 93, r: 12 },
  { x: 160, y: 76, r: -8 },
  { x: 72, y: 78, r: 2 },
]

const SESAME_SEEDS: Point[] = [
  { x: 84, y: 70, r: -20 },
  { x: 99, y: 63, r: 30 },
  { x: 115, y: 71, r: -50 },
  { x: 132, y: 63, r: 12 },
  { x: 149, y: 72, r: -30 },
  { x: 165, y: 68, r: 45 },
  { x: 76, y: 84, r: 10 },
  { x: 93, y: 88, r: -40 },
  { x: 110, y: 80, r: 25 },
  { x: 127, y: 90, r: -15 },
  { x: 144, y: 86, r: 50 },
  { x: 158, y: 92, r: -25 },
]

const SHICHIMI_SPECKS: Point[] = [
  { x: 90, y: 68 },
  { x: 104, y: 76 },
  { x: 120, y: 66 },
  { x: 136, y: 77 },
  { x: 152, y: 68 },
  { x: 168, y: 79 },
  { x: 80, y: 90 },
  { x: 98, y: 96 },
  { x: 116, y: 88 },
  { x: 134, y: 97 },
  { x: 150, y: 92 },
  { x: 164, y: 98 },
  { x: 70, y: 74 },
  { x: 175, y: 70 },
]

const SALT_FLAKES: Point[] = [
  { x: 90, y: 64, r: 12 },
  { x: 112, y: 72, r: -20 },
  { x: 134, y: 66, r: 30 },
  { x: 154, y: 78, r: -8 },
  { x: 100, y: 90, r: 18 },
  { x: 142, y: 94, r: -25 },
  { x: 70, y: 84, r: 6 },
  { x: 164, y: 68, r: 40 },
]

const YUZU_DROPS: Point[] = [
  { x: 96, y: 68 },
  { x: 124, y: 62 },
  { x: 148, y: 72 },
  { x: 108, y: 82 },
  { x: 138, y: 86 },
  { x: 78, y: 76 },
]

const TRUFFLE_SHAVINGS: Point[] = [
  { x: 92, y: 70, r: -18 },
  { x: 112, y: 64, r: 12 },
  { x: 134, y: 72, r: 30 },
  { x: 152, y: 66, r: -8 },
  { x: 84, y: 84, r: 24 },
  { x: 106, y: 88, r: -30 },
  { x: 128, y: 80, r: 6 },
  { x: 148, y: 90, r: -14 },
]

const BLISTERS: (Point & { s: number })[] = [
  { x: 66, y: 76, r: 12, s: 1.1 },
  { x: 84, y: 64, r: -20, s: 0.7 },
  { x: 100, y: 78, r: 6, s: 1.2 },
  { x: 121, y: 64, r: -8, s: 0.85 },
  { x: 138, y: 79, r: 18, s: 1.3 },
  { x: 156, y: 68, r: -14, s: 0.8 },
  { x: 172, y: 82, r: 10, s: 0.95 },
  { x: 52, y: 92, r: -6, s: 0.65 },
  { x: 188, y: 92, r: 14, s: 0.7 },
]

const FISH_DRAPE =
  'M 38 96 C 42 72 82 58 120 58 C 158 58 198 72 202 96 C 206 108 182 118 120 118 C 58 118 34 108 38 96 Z'

const FISH_UNDERSIDE =
  'M 39 96 C 34 106 60 119 120 119 C 180 119 206 106 201 96 C 204 111 180 123 120 123 C 60 123 36 111 39 96 Z'

const FISH_INNER_SHADE =
  'M 38 96 C 58 113 182 113 202 96 C 198 109 180 118 120 118 C 60 118 42 109 38 96 Z'

const RICE_PATH =
  'M 50 118 C 44 96 56 74 80 65 C 100 58 140 58 160 65 C 184 74 196 96 190 118 C 186 136 160 145 120 145 C 80 145 54 136 50 118 Z'

const SHRIMP_BODY =
  'M 48 108 C 44 80 72 58 112 57 C 146 56 172 70 178 90 C 181 101 172 109 156 110 C 122 112 96 114 76 116 C 60 118 49 115 48 108 Z'

const SHRIMP_TAIL =
  'M 176 88 C 184 74 198 64 208 66 C 205 74 199 81 192 86 Z M 178 90 C 190 82 204 80 212 84 C 206 90 198 94 190 95 Z M 178 93 C 188 100 197 108 199 116 C 190 113 182 106 175 99 Z'

const EEL_BODY =
  'M 44 84 C 44 72 56 63 72 63 L 168 63 C 184 63 196 72 196 84 L 196 96 C 196 108 184 117 168 117 L 72 117 C 56 117 44 108 44 96 Z'

const MACKEREL_SKIN =
  'M 38 96 C 43 72 82 56 120 56 C 158 56 197 72 202 96 C 197 80 185 72 170 69 C 160 67 153 71 144 72 C 133 73 124 69 113 70 C 101 71 93 75 82 76 C 68 77 54 84 38 96 Z'

const SEABREAM_SKIN =
  'M 38 96 C 43 72 82 56 120 56 C 158 56 197 72 202 96 C 198 86 188 80 174 76 C 162 73 152 75 142 77 C 130 79 112 79 100 76 C 88 73 76 75 66 79 C 53 84 44 89 38 96 Z'

function fishClipShape(fishId: string): ReactNode {
  if (fishId === 'shrimp') {
    return (
      <>
        <path d={SHRIMP_BODY} />
        <path d={SHRIMP_TAIL} />
      </>
    )
  }
  if (fishId === 'eel') return <path d={EEL_BODY} />
  if (fishId === 'scallop') return <ellipse cx="120" cy="84" rx="74" ry="33" />
  return <path d={FISH_DRAPE} />
}

function Defs({ id, fish }: { id: IdFn; fish: FishOption }) {
  const [c1, c2, c3] = fish.swatch
  return (
    <defs>
      <linearGradient id={id('rice')} x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#fffdf7" />
        <stop offset="55%" stopColor="#f7f2e5" />
        <stop offset="100%" stopColor="#e2d8c2" />
      </linearGradient>
      <pattern id={id('riceTexture')} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)">
        <ellipse cx="2.2" cy="2.4" rx="2.4" ry="1.15" fill="#cfc4aa" opacity="0.6" />
        <ellipse cx="6.8" cy="6.4" rx="2.4" ry="1.15" fill="#c5b99d" opacity="0.5" />
      </pattern>
      <linearGradient id={id('fish')} x1="0.1" y1="0" x2="0.65" y2="1">
        <stop offset="0%" stopColor={c1} />
        <stop offset="48%" stopColor={c2} />
        <stop offset="100%" stopColor={c3} />
      </linearGradient>
      <linearGradient id={id('skin')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f2f8fb" />
        <stop offset="55%" stopColor="#b6cedd" />
        <stop offset="100%" stopColor="#7e9db3" />
      </linearGradient>
      <linearGradient id={id('gloss')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id('torch')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1f0f02" stopOpacity="0.62" />
        <stop offset="42%" stopColor="#6b3a10" stopOpacity="0.26" />
        <stop offset="100%" stopColor="#6b3a10" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={id('ember')} cx="0.5" cy="0.22" r="0.72">
        <stop offset="0%" stopColor="#ffab4a" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffab4a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('shiso')} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor="#7fae5c" />
        <stop offset="100%" stopColor="#3f6b31" />
      </linearGradient>
      <linearGradient id={id('surfaceFade')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>
      <mask id={id('surfaceMask')}>
        <rect x="28" y="52" width="184" height="68" fill={`url(#${id('surfaceFade')})`} />
      </mask>
      <pattern id={id('mackerelSkin')} width="16" height="11" patternUnits="userSpaceOnUse">
        <path d="M 0 3 C 4 0 8 6 12 3 C 14 1 15 2 16 2" stroke="#46647c" strokeWidth="1.4" fill="none" opacity="0.5" />
        <path d="M 0 8 C 4 5 8 11 12 8 C 14 6 15 7 16 7" stroke="#54748c" strokeWidth="1.2" fill="none" opacity="0.42" />
      </pattern>
      <filter id={id('blur')} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.4" />
      </filter>
      <filter id={id('softBlur')} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      <clipPath id={id('riceClip')}>
        <path d={RICE_PATH} />
      </clipPath>
      <clipPath id={id('fishClip')}>{fishClipShape(fish.id)}</clipPath>
    </defs>
  )
}

function DrapeShading({ id }: { id: IdFn }) {
  return (
    <>
      <path d={FISH_INNER_SHADE} fill="#000000" opacity="0.14" />
      <path d="M 56 74 C 46 86 44 98 48 110" stroke="#000000" strokeWidth="7" fill="none" opacity="0.12" filter={`url(#${id('softBlur')})`} />
      <path d="M 184 74 C 194 86 196 98 192 110" stroke="#000000" strokeWidth="7" fill="none" opacity="0.12" filter={`url(#${id('softBlur')})`} />
      <path d={FISH_DRAPE} fill="none" stroke="#000000" strokeOpacity="0.13" strokeWidth="2" />
      <path
        d="M 48 104 C 66 114 176 114 194 104"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.22"
      />
      <path
        d="M 56 80 C 74 66 96 61 122 60"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
        filter={`url(#${id('softBlur')})`}
      />
    </>
  )
}

function FishBase({ id, fish, clip }: { id: IdFn; fish: FishOption; clip: string }) {
  const [, , dark] = fish.swatch
  const drape = <path d={FISH_DRAPE} fill={`url(#${id('fish')})`} />

  switch (fish.id) {
    case 'shrimp':
      return (
        <g clipPath={`url(#${clip})`}>
          <path d={SHRIMP_BODY} fill={`url(#${id('fish')})`} />
          <path d={SHRIMP_TAIL} fill="#f7a06e" />
          <path d="M 176 88 C 184 74 198 64 208 66 C 205 74 199 81 192 86 Z" fill="#ef8a5f" />
          <path d="M 178 93 C 188 100 197 108 199 116 C 190 113 182 106 175 99 Z" fill="#e07a45" />
          <path d="M 198 68 C 203 70 207 73 210 78" stroke="#c9572b" strokeWidth="1.4" fill="none" opacity="0.6" />
          <path d="M 193 101 C 197 106 199 111 199 116" stroke="#c9572b" strokeWidth="1.4" fill="none" opacity="0.6" />
          <g stroke="#c9572b" strokeWidth="5" fill="none" opacity="0.45" strokeLinecap="round">
            <path d="M 70 113 C 74 101 80 93 90 87" />
            <path d="M 94 114 C 98 101 104 93 114 88" />
            <path d="M 118 114 C 122 102 128 94 138 89" />
            <path d="M 142 112 C 146 102 152 95 160 91" />
            <path d="M 164 109 C 167 101 171 96 176 93" />
          </g>
          <path d="M 58 90 C 72 78 94 70 120 69" stroke="#ffe3c6" strokeWidth="7" fill="none" opacity="0.6" strokeLinecap="round" />
          <circle cx="176" cy="90" r="4.2" fill="#d9713f" />
          <path d={SHRIMP_BODY} fill="none" stroke="#c9572b" strokeOpacity="0.35" strokeWidth="1.6" />
        </g>
      )
    case 'eel':
      return (
        <g clipPath={`url(#${clip})`}>
          <path d={EEL_BODY} fill={`url(#${id('fish')})`} />
          <path d="M 50 74 C 82 64 132 62 174 66" stroke="#f0c084" strokeWidth="9" fill="none" opacity="0.5" strokeLinecap="round" filter={`url(#${id('softBlur')})`} />
          <path d="M 54 74 C 82 66 132 64 170 68" stroke="#ffe0b0" strokeWidth="3" fill="none" opacity="0.55" strokeLinecap="round" />
          <path d="M 52 106 C 86 112 134 111 172 106" stroke="#2a1508" strokeWidth="8" fill="none" opacity="0.28" strokeLinecap="round" filter={`url(#${id('softBlur')})`} />
          <rect x="106" y="60" width="26" height="60" rx="3" fill="#1f2a1c" opacity="0.92" />
          <rect x="109" y="60" width="20" height="60" fill="#31402a" opacity="0.75" />
          <path d="M 109 66 C 116 63 124 69 129 66" stroke="#4c5c40" strokeWidth="1.6" fill="none" opacity="0.8" />
          <path d="M 109 96 C 116 93 124 99 129 96" stroke="#4c5c40" strokeWidth="1.6" fill="none" opacity="0.8" />
          <path d={EEL_BODY} fill="none" stroke="#2a1508" strokeOpacity="0.35" strokeWidth="1.6" />
        </g>
      )
    case 'scallop':
      return (
        <g clipPath={`url(#${clip})`}>
          <ellipse cx="120" cy="84" rx="74" ry="33" fill={`url(#${id('fish')})`} />
          <g opacity="0.28" stroke="#d9bd92" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M 84 100 C 94 84 104 71 116 63" />
            <path d="M 118 104 C 124 88 132 74 144 65" />
          </g>
          <path d="M 46 92 C 62 106 94 112 120 112 C 146 112 178 106 194 92 C 184 108 156 116 120 116 C 84 116 56 108 46 92 Z" fill="#d9bd92" opacity="0.42" />
          <ellipse cx="120" cy="84" rx="74" ry="33" fill="none" stroke="#e6cfa9" strokeWidth="1.6" opacity="0.85" />
          <ellipse cx="100" cy="68" rx="28" ry="9" fill={`url(#${id('gloss')})`} opacity="0.5" />
          <path
            d="M 74 70 C 88 60 106 55 122 55"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
            filter={`url(#${id('softBlur')})`}
          />
        </g>
      )
    case 'mackerel':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <path d={MACKEREL_SKIN} fill={`url(#${id('skin')})`} />
            <path d={MACKEREL_SKIN} fill={`url(#${id('mackerelSkin')})`} />
            <path d="M 41 93 C 51 81 67 73 83 70 C 96 68 106 72 118 71 C 130 70 140 67 152 69 C 168 72 188 80 199 91" stroke="#54748c" strokeWidth="1.6" fill="none" opacity="0.5" />
            <path d="M 40 94 C 45 73 83 59 120 59 C 157 59 195 73 200 94" stroke="#5d7f99" strokeWidth="2" fill="none" opacity="0.7" />
            <path d="M 58 74 C 78 64 100 60 124 59" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.4" filter={`url(#${id('softBlur')})`} />
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'seabream':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <path d={SEABREAM_SKIN} fill="#e2605c" opacity="0.9" />
            <path d="M 40 94 C 45 73 83 59 120 59 C 157 59 195 73 200 94" stroke="#f6b3ad" strokeWidth="1.8" fill="none" opacity="0.75" />
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'yellowtail':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <path d={SEABREAM_SKIN} fill="#e8a98d" opacity="0.95" />
            <path d="M 40 94 C 45 73 83 59 120 59 C 157 59 195 73 200 94" stroke="#8fa7b5" strokeWidth="2.4" fill="none" opacity="0.8" />
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'toroTuna':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <g mask={`url(#${id('surfaceMask')})`}>
              <g stroke="#ffe1da" strokeWidth="3.6" fill="none" strokeLinecap="round" opacity="0.75">
                <path d="M 48 78 C 72 64 108 57 148 57" />
                <path d="M 54 90 C 80 74 118 65 162 64" />
                <path d="M 64 102 C 90 86 130 76 176 75" />
                <path d="M 84 112 C 108 99 146 90 188 89" />
              </g>
              <g stroke="#a8343c" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.32">
                <path d="M 46 72 C 70 60 100 54 132 54" />
                <path d="M 56 94 C 84 78 120 70 164 68" />
                <path d="M 78 110 C 104 97 142 89 186 87" />
              </g>
            </g>
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'tuna':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <g mask={`url(#${id('surfaceMask')})`}>
              <g stroke="#f6b1a5" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.55">
                <path d="M 50 84 C 76 70 112 62 152 62" />
                <path d="M 62 102 C 92 86 128 76 176 76" />
              </g>
              <g stroke="#7d1220" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45">
                <path d="M 46 74 C 70 62 100 56 132 55" />
                <path d="M 56 94 C 84 78 120 70 164 68" />
                <path d="M 78 112 C 104 98 142 90 188 88" />
              </g>
            </g>
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'intias':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <path d={SEABREAM_SKIN} fill="#e9b7a5" opacity="0.9" />
            <path d="M 40 94 C 45 73 83 59 120 59 C 157 59 195 73 200 94" stroke="#9fb7c4" strokeWidth="2.2" fill="none" opacity="0.8" />
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'toroSalmon':
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <g mask={`url(#${id('surfaceMask')})`}>
              <g stroke="#fff4ea" strokeWidth="6.4" fill="none" opacity="0.8" strokeLinecap="round">
                <path d="M 42 80 C 64 64 96 56 128 55" />
                <path d="M 50 90 C 74 73 108 63 144 62" />
                <path d="M 62 100 C 86 84 122 73 160 71" />
                <path d="M 78 110 C 102 95 138 85 178 83" />
              </g>
              <g stroke="#eaa07a" strokeWidth="2.2" fill="none" opacity="0.4" strokeLinecap="round">
                <path d="M 46 85 C 68 69 100 61 134 60" />
                <path d="M 56 95 C 80 78 116 68 154 67" />
                <path d="M 70 105 C 94 89 130 78 170 77" />
              </g>
            </g>
            <DrapeShading id={id} />
          </g>
        </>
      )
    case 'salmon':
    default:
      return (
        <>
          <path d={FISH_UNDERSIDE} fill={dark} fillOpacity="0.9" />
          <g clipPath={`url(#${clip})`}>
            {drape}
            <g mask={`url(#${id('surfaceMask')})`}>
              <g stroke="#ffe9d8" strokeWidth="4" fill="none" opacity="0.6" strokeLinecap="round">
                <path d="M 42 80 C 64 64 96 56 128 55" />
                <path d="M 50 90 C 74 73 108 63 144 62" />
                <path d="M 62 100 C 86 84 122 73 160 71" />
                <path d="M 78 110 C 102 95 138 85 178 83" />
                <path d="M 98 116 C 120 105 152 96 192 94" />
              </g>
              <g stroke="#e8622c" strokeWidth="1.6" fill="none" opacity="0.35" strokeLinecap="round">
                <path d="M 46 85 C 68 69 100 61 134 60" />
                <path d="M 56 95 C 80 78 116 68 154 67" />
                <path d="M 70 105 C 94 89 130 78 170 77" />
                <path d="M 88 113 C 112 100 146 91 186 89" />
              </g>
            </g>
            <DrapeShading id={id} />
          </g>
        </>
      )
  }
}

function TorchLayer({ id }: { id: IdFn }) {
  return (
    <g clipPath={`url(#${id('fishClip')})`}>
      <rect x="28" y="44" width="184" height="80" fill={`url(#${id('torch')})`} />
      <rect x="28" y="44" width="184" height="80" fill={`url(#${id('ember')})`} />
      {BLISTERS.map((spot, index) => (
        <ellipse
          key={index}
          cx={spot.x}
          cy={spot.y}
          rx={8 * spot.s}
          ry={3.6 * spot.s}
          fill={index % 3 === 0 ? '#d4761f' : '#24130a'}
          opacity={index % 3 === 0 ? 0.5 : 0.55}
          transform={`rotate(${spot.r} ${spot.x} ${spot.y})`}
          filter={`url(#${id('softBlur')})`}
        />
      ))}
    </g>
  )
}

function ToppingLayer({ piece, id }: { piece: Piece; id: IdFn }) {
  const toppings = piece.toppings
  return (
    <g>
      {toppings.includes('sesame') &&
        SESAME_SEEDS.map((seed, index) => (
          <ellipse
            key={`s${index}`}
            cx={seed.x}
            cy={seed.y}
            rx="3"
            ry="1.6"
            fill={index % 3 === 0 ? '#4a3a2a' : '#ecd6ad'}
            transform={`rotate(${seed.r} ${seed.x} ${seed.y})`}
          />
        ))}
      {toppings.includes('shichimi') &&
        SHICHIMI_SPECKS.map((speck, index) => (
          <circle
            key={`t${index}`}
            cx={speck.x}
            cy={speck.y}
            r={index % 3 === 0 ? 1.8 : 1.3}
            fill={['#cf3f24', '#e07a2a', '#8a3b1c'][index % 3]}
            opacity="0.9"
          />
        ))}
      {toppings.includes('scallion') &&
        SCALLION_RINGS.map((ring, index) => (
          <g key={`c${index}`} transform={`rotate(${ring.r} ${ring.x} ${ring.y})`}>
            <ellipse cx={ring.x} cy={ring.y} rx="4.4" ry="3.2" fill="#5f9e4a" />
            <ellipse cx={ring.x} cy={ring.y} rx="2.2" ry="1.5" fill="#dff0c8" />
          </g>
        ))}
      {toppings.includes('wasabi') && (
        <g>
          <path
            d="M 100 62 C 108 56 118 57 121 63 C 126 61 132 65 130 71 C 128 77 116 80 108 77 C 100 74 96 67 100 62 Z"
            fill="#8cb34a"
          />
          <path d="M 102 63 C 108 59 116 59 119 63 C 115 66 107 67 102 63 Z" fill="#a9cc68" opacity="0.9" />
          <circle cx="110" cy="71" r="1" fill="#6f9438" />
          <circle cx="118" cy="69" r="1" fill="#6f9438" />
        </g>
      )}
      {toppings.includes('yuzukosho') && (
        <g>
          <path
            d="M 146 64 C 154 59 164 61 166 67 C 170 66 175 70 172 75 C 169 80 157 82 150 79 C 143 76 141 68 146 64 Z"
            fill="#d9762e"
          />
          <path d="M 149 66 C 154 62 161 63 164 67 C 159 69 153 69 149 66 Z" fill="#f2b25c" opacity="0.85" />
          <circle cx="156" cy="73" r="1.1" fill="#a83f1c" />
          <circle cx="163" cy="71" r="1" fill="#a83f1c" />
        </g>
      )}
      {toppings.includes('yuzu') &&
        YUZU_DROPS.map((drop, index) => (
          <g key={`z${index}`} transform={`translate(${drop.x} ${drop.y})`}>
            <path d="M 0 -3.6 C 2.8 -1.2 2.8 3.2 0 3.2 C -2.8 3.2 -2.8 -1.2 0 -3.6 Z" fill="#ecdb4f" opacity="0.85" />
            <circle cx="-0.9" cy="0.7" r="0.7" fill="#ffffff" opacity="0.75" />
          </g>
        ))}
      {toppings.includes('seaSalt') &&
        SALT_FLAKES.map((flake, index) => (
          <rect
            key={`sl${index}`}
            x={flake.x}
            y={flake.y}
            width="2.8"
            height="1.9"
            rx="0.5"
            fill="#f4f9fc"
            stroke="#b9c6cf"
            strokeWidth="0.4"
            opacity="0.95"
            transform={`rotate(${flake.r} ${flake.x} ${flake.y})`}
          />
        ))}
      {toppings.includes('truffle') &&
        TRUFFLE_SHAVINGS.map((shaving, index) => (
          <path
            key={`tr${index}`}
            d={`M ${shaving.x - 6} ${shaving.y} C ${shaving.x - 1} ${shaving.y - 3.4} ${shaving.x + 5} ${shaving.y - 2.6} ${shaving.x + 6.5} ${shaving.y + 0.4} C ${shaving.x + 3} ${shaving.y + 3} ${shaving.x - 3} ${shaving.y + 2.8} ${shaving.x - 6} ${shaving.y} Z`}
            fill="#3b2f26"
            stroke="#6f5a45"
            strokeWidth="0.5"
            opacity="0.95"
            transform={`rotate(${shaving.r} ${shaving.x} ${shaving.y})`}
          />
        ))}
      <path d="M 40 108 C 70 120 170 120 200 108" stroke="#2b1c10" strokeWidth="7" fill="none" opacity="0.1" filter={`url(#${id('blur')})`} />
    </g>
  )
}

export function NigiriSvg({ piece, className, animated = false }: Props) {
  const rawId = useId()
  const uid = `n${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const id: IdFn = (name) => `${uid}-${name}`
  const fish = fishOf(piece.fish)
  const sauce = piece.sauce === 'none' ? null : sauceOf(piece.sauce)
  const sauceColor = sauce?.color ?? null

  const layers: ReactNode[] = []
  layers.push(
    <ellipse key="shadow" cx="120" cy="146" rx="80" ry="10" fill="#2b241b" opacity="0.16" filter={`url(#${id('blur')})`} />,
    <g key="rice" clipPath={`url(#${id('riceClip')})`}>
      <path d={RICE_PATH} fill={`url(#${id('rice')})`} />
      <path d={RICE_PATH} fill={`url(#${id('riceTexture')})`} opacity="0.7" />
      {sauceColor && <path d={RICE_PATH} fill={sauceColor} opacity="0.34" />}
      {sauceColor && (
        <path
          d="M 56 110 C 64 126 92 136 122 136 C 152 136 180 126 188 110 C 184 129 158 140 120 140 C 82 140 60 129 56 110 Z"
          fill="#ffffff"
          opacity="0.16"
        />
      )}
      <path d="M 58 102 C 52 84 64 72 84 66 C 68 76 62 90 64 104 Z" fill="#ffffff" opacity="0.55" filter={`url(#${id('softBlur')})`} />
    </g>,
  )

  if (piece.riceExtras.includes('shiso')) {
    layers.push(
      <g key="shiso">
        <path
          d="M 58 116 C 64 98 88 90 114 94 C 106 105 101 114 99 124 C 86 131 66 128 58 116 Z"
          fill={`url(#${id('shiso')})`}
        />
        <path d="M 62 117 C 74 108 92 101 110 98" stroke="#cfe3b8" strokeWidth="1.6" fill="none" opacity="0.6" />
        <path d="M 74 118 C 76 112 78 106 82 101" stroke="#cfe3b8" strokeWidth="1.2" fill="none" opacity="0.45" />
        <path d="M 88 121 C 89 115 91 109 95 104" stroke="#cfe3b8" strokeWidth="1.2" fill="none" opacity="0.45" />
      </g>,
    )
  }

  if (piece.riceExtras.includes('wasabi')) {
    layers.push(
      <g key="wasabiPeek" fill="#7fa84a">
        <path d="M 60 112 C 60 106 66 103 71 106 C 77 109 78 116 73 119 C 67 122 60 119 60 112 Z" />
        <path d="M 168 110 C 168 104 174 101 179 104 C 185 107 186 114 181 117 C 175 120 168 117 168 110 Z" />
      </g>,
    )
  }

  layers.push(<FishBase key="fish" id={id} fish={fish} clip={id('fishClip')} />)

  if (piece.torched) layers.push(<TorchLayer key="torch" id={id} />)
  if (animated && piece.torched) {
    layers.push(
      <g key="smoke" fill="none" stroke="#8a8378" strokeWidth="3" strokeLinecap="round">
        <path className="smoke smoke-1" d="M 96 46 C 90 38 100 33 94 24" />
        <path className="smoke smoke-2" d="M 142 44 C 136 36 146 30 140 21" />
      </g>,
    )
  }

  layers.push(<ToppingLayer key="toppings" piece={piece} id={id} />)

  return (
    <svg
      className={className}
      viewBox="0 0 240 180"
      role="img"
      aria-label={`${fish.en} nigiri illustration`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Defs id={id} fish={fish} />
      {layers}
    </svg>
  )
}
