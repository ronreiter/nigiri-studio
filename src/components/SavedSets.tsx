import { totalPieces } from '../data/options'
import type { SavedSet } from '../lib/storage'

type Props = {
  open: boolean
  sets: SavedSet[]
  onClose: () => void
  onOpen: (set: SavedSet) => void
  onDelete: (id: string) => void
  onCopyLink: (set: SavedSet) => void
}

export function SavedSets({ open, sets, onClose, onOpen, onDelete, onCopyLink }: Props) {
  if (!open) return null

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Saved sets">
      <button type="button" className="drawer-backdrop" aria-label="Close saved sets" onClick={onClose} />
      <div className="drawer-panel">
        <div className="drawer-head">
          <h2>My sets</h2>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
            Close
          </button>
        </div>
        {sets.length === 0 ? (
          <p className="empty">Nothing saved yet. Build a set and hit “Save set”, or open a link someone shared with you.</p>
        ) : (
          <ul className="saved-list">
            {sets.map((set) => (
              <li key={set.id}>
                <div className="saved-info">
                  <strong>{set.name || 'Untitled omakase'}</strong>
                  <span>
                    {set.pieces.length} kinds · {totalPieces(set.pieces)} pcs · saved{' '}
                    {new Date(set.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="saved-actions">
                  <button type="button" className="btn btn-small" onClick={() => onOpen(set)}>
                    Open
                  </button>
                  <button type="button" className="btn btn-small" onClick={() => onCopyLink(set)}>
                    Link
                  </button>
                  <button type="button" className="btn btn-small btn-danger" onClick={() => onDelete(set.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}