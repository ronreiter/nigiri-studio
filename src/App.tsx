import { useCallback, useEffect, useRef, useState } from 'react'
import { BuilderPanel } from './components/BuilderPanel'
import { NigiriSvg } from './components/NigiriSvg'
import { SavedSets } from './components/SavedSets'
import { SetTray } from './components/SetTray'
import { SetViewer } from './components/SetViewer'
import {
  DEFAULT_PIECE,
  MAX_PIECES,
  MAX_QTY,
  fishOf,
  normalizePiece,
  pieceKey,
  pieceSubtitle,
  pieceTitle,
  pieceTitleJp,
  sanitizeName,
  type Piece,
  type PieceRecipe,
  type SetData,
} from './data/options'
import { PAIRINGS } from './data/pairings'
import { pieceIngredients, pieceNote, pieceSteps } from './data/instructions'
import { decodeSet, encodeSet } from './lib/codec'
import { copyText } from './lib/clipboard'
import { surprisePiece } from './lib/surprise'
import { loadDraft, loadSets, removeSet, saveDraft, upsertSet, type SavedSet } from './lib/storage'

type Route = { kind: 'builder' } | { kind: 'loading' } | { kind: 'viewer'; set: SetData; preview: boolean }

const SAMPLE_SET: SetData = {
  name: 'Omakase for one',
  pieces: [
    { fish: 'salmon', sauce: 'nikiri', riceExtras: ['wasabi'], torched: false, toppings: ['scallion'], qty: 2 },
    { fish: 'tuna', sauce: 'shoyu', riceExtras: ['wasabi'], torched: true, toppings: ['sesame'], qty: 1 },
    { fish: 'eel', sauce: 'none', riceExtras: [], torched: false, toppings: ['sesame', 'shichimi'], qty: 1 },
  ],
}

function hashHasSet(): boolean {
  return window.location.hash.startsWith('#/s/')
}

async function resolveHash(): Promise<Route> {
  const match = window.location.hash.match(/^#\/s\/(.+)$/)
  if (!match) return { kind: 'builder' }
  const set = await decodeSet(match[1])
  return set ? { kind: 'viewer', set, preview: false } : { kind: 'builder' }
}

function Seal() {
  return (
    <svg className="seal" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="1.5" y="1.5" width="37" height="37" rx="10" fill="#c0392b" />
      <rect x="5" y="5" width="30" height="30" rx="7" fill="none" stroke="#fdfaf3" strokeOpacity="0.45" strokeWidth="1" />
      <text x="20" y="28.5" textAnchor="middle" fontSize="20" fill="#fdfaf3">
        鮨
      </text>
    </svg>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => (hashHasSet() ? { kind: 'loading' } : { kind: 'builder' }))
  const [name, setName] = useState(() => (loadDraft() ?? SAMPLE_SET).name)
  const [pieces, setPieces] = useState<Piece[]>(() => (loadDraft() ?? SAMPLE_SET).pieces)
  const [baseRecipe, setBaseRecipe] = useState<PieceRecipe | undefined>(() => (loadDraft() ?? SAMPLE_SET).base)
  const [draftPiece, setDraftPiece] = useState<Piece>(DEFAULT_PIECE)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [savedSets, setSavedSets] = useState<SavedSet[]>(() => loadSets())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    saveDraft({ name: sanitizeName(name), pieces, base: baseRecipe })
  }, [name, pieces, baseRecipe])

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      const next = await resolveHash()
      if (!cancelled) setRoute(next)
    }
    void sync()
    const onHash = () => {
      setRoute(hashHasSet() ? { kind: 'loading' } : { kind: 'builder' })
      void sync()
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      cancelled = true
      window.removeEventListener('hashchange', onHash)
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const loadSetIntoBuilder = (set: SetData, message: string) => {
    setName(set.name)
    setPieces(set.pieces)
    setBaseRecipe(set.base)
    setEditingIndex(null)
    setRoute({ kind: 'builder' })
    if (window.location.hash) window.location.hash = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(message)
  }

  const newSet = () => {
    setName('')
    setPieces([])
    setBaseRecipe(undefined)
    setDraftPiece(DEFAULT_PIECE)
    setEditingIndex(null)
    setRoute({ kind: 'builder' })
    if (window.location.hash) window.location.hash = ''
    showToast('New set started')
  }

  const submitPiece = () => {
    const next = normalizePiece(draftPiece)
    if (editingIndex !== null) {
      setPieces((prev) => prev.map((piece, index) => (index === editingIndex ? next : piece)))
      setEditingIndex(null)
      showToast('Piece updated')
      return
    }
    const existing = pieces.findIndex((piece) => pieceKey(piece) === pieceKey(next))
    if (existing >= 0 && pieces[existing].qty + next.qty <= MAX_QTY) {
      setPieces((prev) =>
        prev.map((piece, index) => (index === existing ? { ...piece, qty: piece.qty + next.qty } : piece)),
      )
      showToast('Merged into the matching piece')
      return
    }
    if (pieces.length >= MAX_PIECES) {
      showToast(`The board holds ${MAX_PIECES} pieces`)
      return
    }
    setPieces((prev) => [...prev, next])
    showToast('Added to the set')
  }

  const editPiece = (index: number) => {
    setDraftPiece(pieces[index])
    setEditingIndex(index)
    document.querySelector('.panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const duplicatePiece = (index: number) => {
    if (pieces.length >= MAX_PIECES) {
      showToast(`The board holds ${MAX_PIECES} pieces`)
      return
    }
    setPieces((prev) => [...prev.slice(0, index + 1), { ...prev[index] }, ...prev.slice(index + 1)])
    showToast('Piece duplicated')
  }

  const removePiece = (index: number) => {
    setPieces((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const changeQty = (index: number, delta: number) => {
    setPieces((prev) =>
      prev.map((piece, i) =>
        i === index ? { ...piece, qty: Math.min(MAX_QTY, Math.max(1, piece.qty + delta)) } : piece,
      ),
    )
  }

  const movePiece = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= pieces.length) return
    setPieces((prev) => {
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })
    if (editingIndex === index) {
      setEditingIndex(target)
    } else if (editingIndex === target) {
      setEditingIndex(index)
    }
  }

  const randomizePiece = () => {
    const next = surprisePiece(draftPiece)
    setDraftPiece(next)
    showToast(PAIRINGS[next.fish].note)
  }

  const currentSet = (): SetData => ({ name: sanitizeName(name), pieces, base: baseRecipe })

  const saveCurrent = () => {
    if (pieces.length === 0) {
      showToast('Add a piece first')
      return
    }
    setSavedSets(upsertSet(currentSet()))
    showToast('Set saved')
  }

  const copyLinkFor = async (set: SetData) => {
    const code = await encodeSet(set)
    const url = `${window.location.origin}${window.location.pathname}#/s/${code}`
    const copied = await copyText(url)
    if (copied) {
      showToast('Share link copied')
      return
    }
    window.location.hash = `#/s/${code}`
    showToast('Link is in the address bar')
  }

  const shareCurrent = () => {
    if (pieces.length === 0) {
      showToast('Add a piece first')
      return
    }
    void copyLinkFor(currentSet())
  }

  const previewCurrent = () => {
    setRoute({ kind: 'viewer', set: currentSet(), preview: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewing = route.kind === 'viewer' ? route : null

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="brand"
          onClick={() => {
            setRoute({ kind: 'builder' })
            if (window.location.hash) window.location.hash = ''
          }}
        >
          <Seal />
          <span className="brand-text">
            <strong>Nigiri Studio</strong>
            <em>Build a set, share the link</em>
          </span>
        </button>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setDrawerOpen(true)}>
            My sets{savedSets.length > 0 ? ` (${savedSets.length})` : ''}
          </button>
          <button type="button" className="btn" onClick={newSet}>
            New set
          </button>
        </div>
      </header>

      {viewing ? (
        <SetViewer
          set={viewing.set}
          preview={viewing.preview}
          onEditCopy={() => loadSetIntoBuilder(viewing.set, 'Loaded a copy')}
          onSave={() => {
            setSavedSets(upsertSet(viewing.set))
            showToast('Set saved')
          }}
          onCopyLink={() => void copyLinkFor(viewing.set)}
          onBackToBuilder={() => {
            setRoute({ kind: 'builder' })
            window.scrollTo({ top: 0 })
          }}
        />
      ) : route.kind === 'loading' ? (
        <main className="loading" aria-live="polite">
          <p>Opening the set…</p>
        </main>
      ) : (
        <main className="builder">
          <BuilderPanel
            piece={draftPiece}
            editing={editingIndex !== null}
            onChange={setDraftPiece}
            onSubmit={submitPiece}
            onCancel={() => setEditingIndex(null)}
            onRandomize={randomizePiece}
          />
          <section className="preview" aria-label="Preview">
            <p className="eyebrow">Preview</p>
            <div className="preview-figure">
              <NigiriSvg piece={draftPiece} animated />
            </div>
            <h2>
              {pieceTitle(draftPiece)}
              {draftPiece.qty > 1 ? ` × ${draftPiece.qty}` : ''}
            </h2>
            <p className="piece-title-jp">{pieceTitleJp(draftPiece)}</p>
            <p className="preview-sub">{pieceSubtitle(draftPiece)}</p>
            <p className="preview-blurb">{fishOf(draftPiece.fish).blurb}</p>

            <div className="preview-recipe">
              <h3>Ingredients</h3>
              <ul className="ingredient-list">
                {pieceIngredients(draftPiece).map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    <span>{item.label}</span>
                    <em>{item.detail}</em>
                  </li>
                ))}
              </ul>

              <h3>How to make it</h3>
              <ol className="steps">
                {pieceSteps(draftPiece).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <p className="piece-note">{pieceNote(draftPiece)}</p>
            </div>
          </section>
          <SetTray
            name={name}
            pieces={pieces}
            base={baseRecipe}
            editingIndex={editingIndex}
            onNameChange={setName}
            onBaseChange={setBaseRecipe}
            onEdit={editPiece}
            onDuplicate={duplicatePiece}
            onRemove={removePiece}
            onMove={movePiece}
            onQty={changeQty}
            onSave={saveCurrent}
            onShare={shareCurrent}
            onPreview={previewCurrent}
            onClear={() => {
              setPieces([])
              setEditingIndex(null)
              showToast('Set cleared')
            }}
          />
        </main>
      )}

      <SavedSets
        open={drawerOpen}
        sets={savedSets}
        onClose={() => setDrawerOpen(false)}
        onOpen={(set) => {
          setDrawerOpen(false)
          loadSetIntoBuilder({ name: set.name, pieces: set.pieces }, 'Set loaded')
        }}
        onDelete={(id) => {
          setSavedSets(removeSet(id))
          showToast('Set deleted')
        }}
        onCopyLink={(set) => void copyLinkFor({ name: set.name, pieces: set.pieces })}
      />

      <footer className="app-footer">
        <p>No accounts, no server — every set lives in the link and in your browser.</p>
      </footer>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}