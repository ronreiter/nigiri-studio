import type { PieceRecipe } from '../data/options'

type Props = {
  value?: PieceRecipe
  label: string
  onChange: (recipe: PieceRecipe | undefined) => void
}

const asText = (value?: string) => value ?? ''
const asLines = (value?: string[]) => (value ?? []).join('\n')
const fromLines = (value: string) => value.split('\n').map((line) => line.trim())

export function RecipeFields({ value, label, onChange }: Props) {
  const recipe = value ?? {}
  const set = (field: keyof PieceRecipe, fieldValue: string | string[]) => {
    onChange({ ...recipe, [field]: fieldValue })
  }

  return (
    <details className="recipe-notes">
      <summary>{label}</summary>
      <div className="recipe-fields">
        <label className="field">
          <span>Dish name</span>
          <input value={asText(recipe.title)} placeholder="Tuna Zuke Nigiri" onChange={(event) => set('title', event.target.value)} />
        </label>
        <label className="field">
          <span>Type of fish</span>
          <input value={asText(recipe.fish)} placeholder="Tuna / maguro." onChange={(event) => set('fish', event.target.value)} />
        </label>
        <div className="recipe-fields-row">
          <label className="field">
            <span>Cut</span>
            <input value={asText(recipe.cut)} placeholder="5 mm thick" onChange={(event) => set('cut', event.target.value)} />
          </label>
          <label className="field">
            <span>Rice per piece</span>
            <input value={asText(recipe.rice)} placeholder="13–15 g" onChange={(event) => set('rice', event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>How to make the sauce</span>
          <textarea
            rows={4}
            value={asText(recipe.sauce)}
            placeholder={'### Nikiri\n- 3 tbsp soy sauce\n- 1 tbsp mirin\n\nSimmer 30–60 seconds, then cool.'}
            onChange={(event) => set('sauce', event.target.value)}
          />
        </label>
        <label className="field">
          <span>Ingredients (one per line)</span>
          <textarea rows={4} value={asLines(recipe.ingredients)} onChange={(event) => set('ingredients', fromLines(event.target.value))} />
        </label>
        <label className="field">
          <span>Before placing the fish (one step per line)</span>
          <textarea rows={4} value={asLines(recipe.before)} onChange={(event) => set('before', fromLines(event.target.value))} />
        </label>
        <label className="field">
          <span>After placing the fish (one step per line)</span>
          <textarea rows={4} value={asLines(recipe.after)} onChange={(event) => set('after', fromLines(event.target.value))} />
        </label>
        <label className="field">
          <span>Comments (one per line)</span>
          <textarea rows={3} value={asLines(recipe.comments)} onChange={(event) => set('comments', fromLines(event.target.value))} />
        </label>
      </div>
    </details>
  )
}
