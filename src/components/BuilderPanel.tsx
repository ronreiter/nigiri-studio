import { FISH, MAX_QTY, RICE_EXTRAS, SAUCES, TOPPINGS, sauceOf, type Piece } from '../data/options'
import { RecipeFields } from './RecipeFields'

type Props = {
  piece: Piece
  editing: boolean
  onChange: (piece: Piece) => void
  onSubmit: () => void
  onCancel: () => void
  onRandomize: () => void
}

function toggle<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

export function BuilderPanel({ piece, editing, onChange, onSubmit, onCancel, onRandomize }: Props) {
  const sauce = sauceOf(piece.sauce)
  return (
    <section className="panel" aria-label="Nigiri options">
      <div className="panel-head">
        <h2>Build a nigiri</h2>
        <button type="button" className="btn btn-ghost btn-small" onClick={onRandomize}>
          Surprise me
        </button>
      </div>

      <div className="panel-section">
        <h3>Fish</h3>
        <div className="fish-grid">
          {FISH.map((fish) => (
            <button
              key={fish.id}
              type="button"
              className="fish-btn"
              aria-pressed={piece.fish === fish.id}
              onClick={() => onChange({ ...piece, fish: fish.id })}
            >
              <span
                className="fish-swatch"
                style={{ background: `linear-gradient(140deg, ${fish.swatch[0]}, ${fish.swatch[1]} 55%, ${fish.swatch[2]})` }}
              />
              <span className="fish-label">
                <strong>{fish.en}</strong>
                <em>{fish.jp}</em>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3>Sauce on the rice</h3>
        <div className="chip-row">
          {SAUCES.map((option) => (
            <button
              key={option.id}
              type="button"
              className="chip"
              aria-pressed={piece.sauce === option.id}
              onClick={() => onChange({ ...piece, sauce: option.id })}
            >
              {option.en}
              <em className="chip-jp">{option.jp}</em>
            </button>
          ))}
        </div>
        {sauce.ingredients.length > 0 ? (
          <p className="sauce-recipe">
            <span className="sauce-recipe-label">Made from</span>
            {sauce.ingredients.join(' · ')}
          </p>
        ) : (
          <p className="sauce-recipe">No sauce — the rice stands on its own.</p>
        )}
      </div>

      <div className="panel-section">
        <h3>Between rice and fish</h3>
        <div className="chip-row">
          {RICE_EXTRAS.map((extra) => (
            <button
              key={extra.id}
              type="button"
              className="chip"
              aria-pressed={piece.riceExtras.includes(extra.id)}
              onClick={() => onChange({ ...piece, riceExtras: toggle(piece.riceExtras, extra.id) })}
            >
              {extra.en}
              <em className="chip-jp">{extra.jp}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section panel-section-row">
        <div>
          <h3>Aburi</h3>
          <p className="hint">Torch the fish until the fats bead.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={piece.torched}
          aria-label="Torch the fish"
          className="switch"
          onClick={() => onChange({ ...piece, torched: !piece.torched })}
        >
          <span className="switch-knob" />
        </button>
      </div>

      <div className="panel-section">
        <h3>On top</h3>
        <div className="chip-row">
          {TOPPINGS.map((topping) => (
            <button
              key={topping.id}
              type="button"
              className="chip"
              aria-pressed={piece.toppings.includes(topping.id)}
              onClick={() => onChange({ ...piece, toppings: toggle(piece.toppings, topping.id) })}
            >
              {topping.en}
              <em className="chip-jp">{topping.jp}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section panel-section-row">
        <h3>Quantity</h3>
        <div className="qty qty-lg">
          <button
            type="button"
            className="icon-btn"
            aria-label="Fewer pieces"
            disabled={piece.qty <= 1}
            onClick={() => onChange({ ...piece, qty: Math.max(1, piece.qty - 1) })}
          >
            −
          </button>
          <span aria-live="polite">{piece.qty}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label="More pieces"
            disabled={piece.qty >= MAX_QTY}
            onClick={() => onChange({ ...piece, qty: Math.min(MAX_QTY, piece.qty + 1) })}
          >
            +
          </button>
        </div>
      </div>

      <div className="panel-section">
        <RecipeFields
          value={piece.recipe}
          label="Recipe notes (optional)"
          onChange={(recipe) => onChange({ ...piece, recipe })}
        />
      </div>

      <div className="panel-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={onSubmit}>
          {editing ? 'Update piece' : 'Add to set'}
        </button>
        {editing && (
          <button type="button" className="btn btn-ghost btn-block" onClick={onCancel}>
            Cancel editing
          </button>
        )}
      </div>
    </section>
  )
}