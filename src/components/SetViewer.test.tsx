// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { SetViewer } from './SetViewer'
import type { SetData } from '../data/options'

afterEach(cleanup)

const set: SetData = {
  name: 'Course notes',
  base: {
    title: 'Sushi Rice & Basic Sauces',
    fish: 'Base preparation — works for all fish.',
    sauce: '### Rice seasoning\nFor about 48 nigiri:\n\n- 3 tbsp rice vinegar\n- 1 tsp fine salt',
    ingredients: ['1½ cups sushi rice', 'Water and rice vinegar for tezu'],
    before: ['Wash the rice 4–5 times, until the water is **mostly clear**.'],
    after: ['Serve each piece promptly after finishing it.'],
    comments: ['Use fish that has been handled and sold as suitable for raw consumption.'],
  },
  pieces: [
    {
      fish: 'tuna',
      sauce: 'zuke',
      riceExtras: ['wasabi'],
      torched: false,
      toppings: ['seaSalt'],
      qty: 1,
      recipe: {
        title: 'Tuna Zuke Nigiri',
        fish: 'Tuna / maguro.',
        cut: 'about 5 mm thick',
        rice: '13–15 g per piece',
        sauce: '### Zuke marinade\n- 3 tbsp soy sauce\n\nMarinate sliced tuna for about **5–8 minutes**, then remove and blot gently.',
        ingredients: ['Tuna, sliced about 5 mm thick', 'Optional: very thin scallion slices'],
        before: ['Marinate the sliced tuna for 5–8 minutes.'],
        after: ['Do not add extra soy sauce.'],
        comments: ['Do not marinate too long or the tuna can become overly salty and firm.'],
      },
    },
  ],
}

function renderViewer() {
  render(
    <SetViewer
      set={set}
      preview={false}
      onEditCopy={vi.fn()}
      onSave={vi.fn()}
      onCopyLink={vi.fn()}
      onBackToBuilder={vi.fn()}
    />,
  )
}

describe('SetViewer', () => {
  it('shows the hand-written title instead of a generated name', () => {
    renderViewer()
    expect(screen.getByRole('heading', { name: 'Tuna Zuke Nigiri' })).toBeTruthy()
  })

  it('renders the base preparation at the top with its sauce recipe and comments', () => {
    renderViewer()
    const top = document.querySelector('.rice-guide--top') as HTMLElement
    expect(within(top).getByRole('heading', { name: 'Sushi Rice & Basic Sauces' })).toBeTruthy()
    expect(within(top).getByText('3 tbsp rice vinegar')).toBeTruthy()
    expect(
      within(top).getByText('Use fish that has been handled and sold as suitable for raw consumption.'),
    ).toBeTruthy()
  })

  it('renders bold text inside numbered steps', () => {
    renderViewer()
    const top = document.querySelector('.rice-guide--top') as HTMLElement
    expect(within(top).getByText('mostly clear').tagName).toBe('STRONG')
  })

  it('renders a recipe exactly: meta, optionals, steps and bold text', () => {
    renderViewer()
    expect(screen.getByText('Type of fish')).toBeTruthy()
    expect(screen.getByText('Tuna / maguro.')).toBeTruthy()
    expect(screen.getByText('about 5 mm thick')).toBeTruthy()
    expect(screen.getByText('13–15 g per piece')).toBeTruthy()
    expect(screen.getByText('Optional: very thin scallion slices')).toBeTruthy()
    expect(screen.getByText('Marinate the sliced tuna for 5–8 minutes.')).toBeTruthy()
    expect(screen.getByText('Do not add extra soy sauce.')).toBeTruthy()
    expect(screen.getByText('Do not marinate too long or the tuna can become overly salty and firm.')).toBeTruthy()
    expect(screen.getByText('5–8 minutes').tagName).toBe('STRONG')
  })

  it('keeps generated steps out of a hand-written recipe card', () => {
    renderViewer()
    expect(screen.queryByText(/Wet your hands with tezu/)).toBeNull()
  })

  it('shows the base preparation full width at the top and keeps a print copy in the sidebar', () => {
    renderViewer()
    const top = document.querySelector('.rice-guide--top') as HTMLElement
    const aside = document.querySelector('.rice-guide--aside') as HTMLElement
    expect(within(top).getByRole('heading', { name: 'Sushi Rice & Basic Sauces' })).toBeTruthy()
    expect(within(aside).getByText('3 tbsp rice vinegar')).toBeTruthy()
  })

  it('falls back to “How to make the rice” when the base has no title', () => {
    render(
      <SetViewer
        set={{ name: 'Rice only', pieces: [], base: { before: ['Wash the rice'] } }}
        preview={false}
        onEditCopy={vi.fn()}
        onSave={vi.fn()}
        onCopyLink={vi.fn()}
        onBackToBuilder={vi.fn()}
      />,
    )
    const top = document.querySelector('.rice-guide--top') as HTMLElement
    expect(within(top).getByRole('heading', { name: 'How to make the rice' })).toBeTruthy()
  })
})
