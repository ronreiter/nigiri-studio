// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('App', () => {
  it('updates the preview when a fish is picked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Toro Tuna/ }))
    expect(screen.getByRole('heading', { name: /Toro Tuna/ })).toBeTruthy()
  })

  it('merges an identical piece into the set instead of duplicating it', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to set' }))
    expect(document.querySelector('.toast')?.textContent).toContain('Merged')
    expect(document.querySelector('.tray-count')?.textContent).toContain('5 pcs')
  })

  it('keeps a surprise piece inside the pairing chart', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Surprise me' }))
    expect(document.querySelector('.preview h2')?.textContent).toBeTruthy()
    expect(document.querySelector('.piece-title-jp')?.textContent).toBeTruthy()
  })
})
