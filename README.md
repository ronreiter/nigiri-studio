# Nigiri Studio

Build your own nigiri, piece by piece — the fish, the sauce on the rice, wasabi or
shiso under the fish, an aburi torch pass, and what goes on top — then share the
whole set as a single link.

No accounts and no backend: a set lives in the URL and in your browser's local
storage.

## What it does

- **Design each nigiri** from real components: 10 fish (including toro salmon,
  toro tuna, and hamachi), 8 rice sauces — each with a note on what it is made
  of — wasabi and shiso under the fish, a torch toggle, and 5 toppings.
- **See it illustrated.** Every piece is drawn as a layered SVG: rice, sauce
  tint, wasabi peeking out, the fish with its own colors and texture, char marks
  when torched, and the toppings on top. Pieces get menu-style names with their
  Japanese names, like "Aburi Toro Tuna with Yuzukosho · 炙り中トロ 柚子胡椒".
- **Surprise me** samples from a pairing chart rather than flat dice — see
  [The pairing chart](#the-pairing-chart-the-science) below.
- **Build a set** of up to 24 kinds, with quantities up to 6 per kind, reorder
  pieces, merge duplicates, edit, and remove.
- **Share a link.** The set is packed with a compact schema (catalog ids,
  bitmasks, omitted defaults) and compressed with the smaller of gzip and
  lz-string, then carried in the URL hash (`#/s/v3g...`). Whoever opens it gets
  a read-only recipe page with an option to edit a copy.
- **Carry hand-written recipes.** Any piece (and the set as a whole, as a "base
  preparation") can hold freeform notes: dish name, type of fish, cut, rice per
  piece, how to make the sauce, an explicit ingredient list, before/after steps,
  and comments. When present they are shown verbatim, markdown-ish formatting
  included, instead of the generated text — so a link can reproduce a written
  recipe without losing detail.
- **Save sets** in `localStorage` and reopen them later (`My sets`).
- **Cook from it.** Every piece gets an ingredient list, step-by-step assembly
  instructions that follow your exact choices, and the set gets an aggregated
  shopping list. The recipe view is print-friendly: the base preparation comes
  first, then every fish starts on its own page, with the shopping list last.

## Run it

```bash
npm install
npm run dev      # dev server
npm test         # unit + component tests
npm run check    # typecheck, lint, tests (what CI runs)
npm run lint     # oxlint
npm run build    # tsc + vite build to dist/
npm run preview  # serve the build
```

There is also a [Taskfile](Taskfile.yml) (`task --list`): `task setup`, `task
dev`, `task check`, `task build`, `task preview`, `task deploy`, `task clean`.

## The pairing chart (the science)

"Surprise me" does not roll flat dice. It samples from `src/data/pairings.ts`, a
pure-data chart of how each fish likes to be dressed:

- `sauces` are relative weights; only listed sauces can ever be chosen.
- `torch`, `riceExtras`, and `toppings` are probabilities in 0..1, so torching a
  scallop or shrimp has weight 0.
- `note` is the one-line reason, shown as a toast when a piece is rolled.

Eel leans unagi tare, sesame, and shichimi; saba leans amazu and shiso; hamachi
leans yuzukosho; toro leans toward the torch and away from soy. Wasabi never
appears both under the fish and on top, and at most three toppings land.

The sampler in `src/lib/surprise.ts` is a thin weighted-pick engine, so tuning
the science means editing the chart, not the code. The chart is typed as
`Record<FishId, FishPairing>`, so adding a fish without pairing data is a type
error, and `src/lib/surprise.test.ts` enforces the chart's rules over thousands
of seeded rolls.

## How sharing works

A set is packed with a schema tuned to this app — catalog ids, bitmasks for
rice extras and toppings, omitted defaults, one-letter keys for recipe notes —
and then compressed with whichever is smaller, gzip (`v3g.`) or lz-string
(`v3l.`), and put in the URL fragment. Each flavor tries the codec's own
`encodeSet` on the way out; `decodeSet` handles all of them:

- `#/s/v3g.<base64url>`: gzip of the compact schema (usual winner),
- `#/s/v3l.<lz>`: lz-string of the compact schema (wins on tiny sets),
- `#/s/v2.<lz>`: legacy full-JSON shape,
- `#/s/<code>`: the original packed v1 format.

Nothing is uploaded anywhere, and the app is a static site, so links keep
working as long as the page is hosted. Very large sets still make long URLs, but
a nine-recipe course with a base preparation lands around 3.5 KB, roughly half
of what generic JSON + lz-string produced.

On load, the app also writes your working draft to
`localStorage["nigiri-studio.draft.v1"]` and saved sets to
`localStorage["nigiri-studio.sets.v1"]`.

## Project layout

```
src/data/options.ts        catalog: fish, sauces, rice extras, toppings, types
src/data/pairings.ts       the pairing chart behind Surprise me (pure data)
src/data/instructions.ts   ingredients, steps, shopping list generation
src/components/NigiriSvg.tsx  the layered SVG illustration
src/components/BuilderPanel.tsx  option pickers for one piece
src/components/RecipeFields.tsx  freeform recipe-note editor
src/components/SetTray.tsx       the set being built
src/components/SetViewer.tsx     shared/preview recipe page
src/components/SavedSets.tsx     localStorage drawer
src/lib/codec.ts           share-link encoding, decoding, validation
src/lib/surprise.ts        weighted sampler for Surprise me
src/lib/storage.ts         localStorage read/write
```

Test people and fish are invented; no data leaves the browser.

## Deploying

A GitHub Pages workflow is included
(`.github/workflows/deploy.yml`). Push to `main`, enable
**Settings → Pages → Source: GitHub Actions**, and it deploys `dist/`.
Because `base` is relative and routing is hash-based, the build also works from
any static host or subdirectory.

## License

MIT — see [LICENSE](LICENSE).