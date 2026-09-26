import type { ReactNode } from 'react'
import { pieceIngredients, pieceNote, pieceSteps, shoppingList } from '../data/instructions'
import {
  pieceKey,
  pieceSubtitle,
  pieceTitle,
  pieceTitleJp,
  totalPieces,
  type Piece,
  type PieceRecipe,
  type SetData,
} from '../data/options'
import { NigiriSvg } from './NigiriSvg'

type Props = {
  set: SetData
  preview: boolean
  onEditCopy: () => void
  onSave: () => void
  onCopyLink: () => void
  onBackToBuilder: () => void
}

function bold(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part))
}

function RecipeText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: string[] = []
  const flush = (key: string) => {
    if (list.length === 0) return
    blocks.push(
      <ul key={key} className="recipe-text-list">
        {list.map((item, index) => (
          <li key={index}>{bold(item)}</li>
        ))}
      </ul>,
    )
    list = []
  }

  text.split('\n').forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ')) {
      list.push(trimmed.slice(2))
      return
    }
    flush(`list-${index}`)
    if (!trimmed) return
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={index} className="recipe-text-heading">
          {trimmed.slice(4)}
        </h4>,
      )
      return
    }
    blocks.push(<p key={index}>{bold(trimmed)}</p>)
  })
  flush('list-end')

  return <div className="recipe-text">{blocks}</div>
}

function RecipeExtras({ recipe }: { recipe: PieceRecipe }) {
  return (
    <>
      {recipe.sauce && (
        <>
          <h3 className="recipe-heading">How to make the sauce</h3>
          <RecipeText text={recipe.sauce} />
        </>
      )}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <>
          <h3 className="recipe-heading">Ingredients</h3>
          <ul className="ingredient-list">
            {recipe.ingredients.map((line, index) => (
              <li key={index}>
                <span>{bold(line)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {recipe.before && recipe.before.length > 0 && (
        <>
          <h3 className="recipe-heading">Before placing the fish</h3>
          <ol className="steps">
            {recipe.before.map((step, index) => (
              <li key={index}>{bold(step)}</li>
            ))}
          </ol>
        </>
      )}
      {recipe.after && recipe.after.length > 0 && (
        <>
          <h3 className="recipe-heading">After placing the fish</h3>
          <ol className="steps">
            {recipe.after.map((step, index) => (
              <li key={index}>{bold(step)}</li>
            ))}
          </ol>
        </>
      )}
      {recipe.comments && recipe.comments.length > 0 && (
        <>
          <h3 className="recipe-heading">Comments</h3>
          <ul className="recipe-comments">
            {recipe.comments.map((line, index) => (
              <li key={index}>{bold(line)}</li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function PieceCard({ piece }: { piece: Piece }) {
  const recipe = piece.recipe
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

        {recipe ? (
          <>
            {(recipe.fish || recipe.cut || recipe.rice) && (
              <ul className="recipe-meta">
                {recipe.fish && (
                  <li>
                    <span>Type of fish</span>
                    <em>{recipe.fish}</em>
                  </li>
                )}
                {recipe.cut && (
                  <li>
                    <span>Cut</span>
                    <em>{recipe.cut}</em>
                  </li>
                )}
                {recipe.rice && (
                  <li>
                    <span>Rice per piece</span>
                    <em>{recipe.rice}</em>
                  </li>
                )}
              </ul>
            )}
            <RecipeExtras recipe={recipe} />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </article>
  )
}

function BaseCard({ recipe, variant }: { recipe: PieceRecipe; variant: 'top' | 'aside' }) {
  return (
    <section
      className={`rice-guide rice-guide--${variant}`}
      aria-labelledby={`rice-guide-heading-${variant}`}
      aria-hidden={variant === 'aside' ? true : undefined}
    >
      <p className="eyebrow">Base preparation</p>
      <h2 id={`rice-guide-heading-${variant}`}>{recipe.title ?? 'How to make the rice'}</h2>
      {recipe.fish && <p className="piece-sub">{recipe.fish}</p>}
      {(recipe.cut || recipe.rice) && (
        <ul className="recipe-meta">
          {recipe.cut && (
            <li>
              <span>Cut</span>
              <em>{recipe.cut}</em>
            </li>
          )}
          {recipe.rice && (
            <li>
              <span>Rice per piece</span>
              <em>{recipe.rice}</em>
            </li>
          )}
        </ul>
      )}
      <div className="rice-columns">
        <RecipeExtras recipe={recipe} />
      </div>
    </section>
  )
}

export function SetViewer({ set, preview, onEditCopy, onSave, onCopyLink, onBackToBuilder }: Props) {
  const items = shoppingList(set.pieces)
  const total = totalPieces(set.pieces)
  const hasCustomRecipes = Boolean(set.base) || set.pieces.some((piece) => piece.recipe)

  return (
    <main className="viewer">
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

      <div className="viewer-main">
        {set.base && <BaseCard recipe={set.base} variant="top" />}

        {set.pieces.length === 0 ? (
          <p className="empty">This set is empty.</p>
        ) : (
          set.pieces.map((piece, index) => <PieceCard key={`${pieceKey(piece)}-${index}`} piece={piece} />)
        )}
      </div>

      <aside className="shopping" aria-label="Shopping list and base preparation">
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
        <p className="fine">
          Quantities assume 18 g of seasoned shari per piece.
          {hasCustomRecipes ? ' Custom recipes carry their own amounts — check each card.' : ''}
        </p>
        {set.base && <BaseCard recipe={set.base} variant="aside" />}
      </aside>
    </main>
  )
}
