import { MAX_NAME, pieceSubtitle, pieceTitle, pieceTitleJp, totalPieces, type Piece } from '../data/options'
import { NigiriSvg } from './NigiriSvg'

type Props = {
  name: string
  pieces: Piece[]
  editingIndex: number | null
  onNameChange: (name: string) => void
  onEdit: (index: number) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onMove: (index: number, delta: number) => void
  onQty: (index: number, delta: number) => void
  onSave: () => void
  onShare: () => void
  onPreview: () => void
  onClear: () => void
}

export function SetTray({
  name,
  pieces,
  editingIndex,
  onNameChange,
  onEdit,
  onDuplicate,
  onRemove,
  onMove,
  onQty,
  onSave,
  onShare,
  onPreview,
  onClear,
}: Props) {
  const total = totalPieces(pieces)

  return (
    <aside className="tray" aria-label="Your set">
      <div className="tray-head">
        <h2>Your set</h2>
        <span className="tray-count">
          {pieces.length} kinds · {total} pcs
        </span>
      </div>

      <label className="field">
        <span>Set name</span>
        <input
          type="text"
          value={name}
          maxLength={MAX_NAME}
          placeholder="Omakase for one"
          onChange={(event) => onNameChange(event.target.value)}
        />
      </label>

      {pieces.length === 0 ? (
        <p className="empty">No pieces yet. Pick a fish, dress the rice, and add it to the board.</p>
      ) : (
        <ul className="tray-list">
          {pieces.map((piece, index) => (
            <li key={index} className={editingIndex === index ? 'tray-row editing' : 'tray-row'}>
              <div className="tray-thumb">
                <NigiriSvg piece={piece} />
              </div>
              <div className="tray-info">
                <strong>
                  {pieceTitle(piece)}
                  {piece.qty > 1 ? ` × ${piece.qty}` : ''}
                </strong>
                <span className="tray-jp">{pieceTitleJp(piece)}</span>
                <span>{pieceSubtitle(piece)}</span>
                <div className="tray-row-actions">
                  <button
                    type="button"
                    className="link-btn move"
                    disabled={index === 0}
                    aria-label="Move earlier"
                    onClick={() => onMove(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="link-btn move"
                    disabled={index === pieces.length - 1}
                    aria-label="Move later"
                    onClick={() => onMove(index, 1)}
                  >
                    ↓
                  </button>
                  <button type="button" className="link-btn" onClick={() => onEdit(index)}>
                    Edit
                  </button>
                  <button type="button" className="link-btn" onClick={() => onDuplicate(index)}>
                    Duplicate
                  </button>
                  <button type="button" className="link-btn danger" onClick={() => onRemove(index)}>
                    Remove
                  </button>
                </div>
              </div>
              <div className="qty">
                <button type="button" className="icon-btn" aria-label="Fewer" onClick={() => onQty(index, -1)}>
                  −
                </button>
                <span>{piece.qty}</span>
                <button type="button" className="icon-btn" aria-label="More" onClick={() => onQty(index, 1)}>
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="tray-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={onShare}>
          Copy share link
        </button>
        <div className="tray-actions-row">
          <button type="button" className="btn" onClick={onSave}>
            Save set
          </button>
          <button type="button" className="btn" onClick={onPreview}>
            Preview
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-block" onClick={onClear}>
          Clear set
        </button>
      </div>
    </aside>
  )
}