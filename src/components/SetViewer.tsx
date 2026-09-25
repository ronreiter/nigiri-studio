import { pieceIngredients, pieceNote, pieceSteps, shoppingList } from '../data/instructions'
import { pieceKey, pieceSubtitle, pieceTitle, pieceTitleJp, totalPieces, type Piece, type SetData } from '../data/options'
import { NigiriSvg } from './NigiriSvg'

type Props = {
  set: SetData
  preview: boolean
  onEditCopy: () => void
  onSave: () => void
  onCopyLink: () => void
  onBackToBuilder: () => void
}

function PieceRecipe({ piece }: { piece: Piece }) {
  const ingredients = pieceIngredients(piece)
  const steps = pieceSteps(piece)
  return (
    <article className="piece-card">
      <div className="piece-figure">
        <NigiriSvg piece={piece} animated />
      </div>
      <div className="piece-body">
        <h2>
          {pieceTitle(piece)}
          {piece.qty > 1 ? ` × ${piece.qty}` : ''}
        </h2>
        <p className="piece-title-jp">{pieceTitleJp(piece)}</p>
        <p className="piece-sub">{pieceSubtitle(piece)}</p>
        <div className="ingredients">
          {ingredients.map((ingredient, index) => (
            <span key={`${ingredient.label}-${index}`} className="ing">
              {ingredient.label}
              <em>{ingredient.detail}</em>
            </span>
          ))}
        </div>
        <ol className="steps">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        <p className="piece-note">{pieceNote(piece)}</p>
      </div>
    </article>
  )
}

export function SetViewer({ set, preview, onEditCopy, onSave, onCopyLink, onBackToBuilder }: Props) {
  const items = shoppingList(set.pieces)
  const total = totalPieces(set.pieces)

  return (
    <main className="viewer">
      <div className="viewer-main">
        <header className="viewer-head">
          <p className="eyebrow">{preview ? 'Preview' : 'Shared set'}</p>
          <h1>{set.name || 'Untitled omakase'}</h1>
          <p className="viewer-meta">
            {set.pieces.length} kinds · {total} pieces · make them in the order below
          </p>
          <div className="viewer-actions">
            <button type="button" className="btn btn-primary" onClick={onEditCopy}>
              Edit a copy
            </button>
            <button type="button" className="btn" onClick={onSave}>
              Save to my sets
            </button>
            <button type="button" className="btn" onClick={onCopyLink}>
              Copy link
            </button>
            <button type="button" className="btn" onClick={() => window.print()}>
              Print
            </button>
            {preview && (
              <button type="button" className="btn btn-ghost" onClick={onBackToBuilder}>
                Back to builder
              </button>
            )}
          </div>
        </header>

        {set.pieces.length === 0 ? (
          <p className="empty">This set is empty.</p>
        ) : (
          set.pieces.map((piece, index) => <PieceRecipe key={`${pieceKey(piece)}-${index}`} piece={piece} />)
        )}
      </div>

      <aside className="shopping" aria-label="Shopping list">
        <h2>Shopping list</h2>
        {items.length === 0 ? (
          <p className="empty">Nothing to shop for yet.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <span>{item.label}</span>
                <em>{item.detail}</em>
              </li>
            ))}
          </ul>
        )}
        <p className="fine">Quantities assume 18 g of seasoned shari per piece.</p>
      </aside>
    </main>
  )
}