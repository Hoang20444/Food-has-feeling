import { useEffect } from 'react'
import { soundEffects } from '../../shared/audio/soundEffects'
import { mysteryStore, useMysteryStore } from '../../state/mysteryStore'

/**
 * NoteModal — Displays the child's handwritten recipe note discovered inside the drawer.
 *
 * Establishes the emotional foundation of the chapter:
 * - Links 3:15 tea time to the clock.
 * - Links the song to the radio.
 * - Links the forgotten promise to Berry.
 */
export function NoteModal() {
  const isOpen = useMysteryStore((s) => s.noteModalOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        mysteryStore.closeNoteModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    soundEffects.playPaperRustle()
    mysteryStore.closeNoteModal()
  }

  return (
    <div
      className="note-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Forgotten Promise Note"
      onClick={handleClose}
    >
      <div
        className="note-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vintage Paper Header */}
        <div className="note-modal-card__header">
          <span className="note-modal-card__stamp">📜 Clue Discovered</span>
          <button
            type="button"
            className="note-modal-card__close"
            onClick={handleClose}
            aria-label="Close note"
          >
            ✕
          </button>
        </div>

        {/* Parchment Letter Body */}
        <div className="note-modal-card__paper">
          <div className="note-modal-card__doodle">🍓 ✨</div>
          <p className="note-modal-card__text">
            “Don’t forget our promise at tea time (3:15).
          </p>
          <p className="note-modal-card__text">
            If I’m late, play the radio song so Berry won’t be scared.
          </p>
          <p className="note-modal-card__text">
            We’ll always share breakfast.”
          </p>
          <p className="note-modal-card__signature">
            — With all my love
          </p>
        </div>

        {/* Footer info & button */}
        <div className="note-modal-card__footer">
          <span className="note-modal-card__hint">
            Recorded in your Memory Journal
          </span>
          <button
            type="button"
            className="note-modal-card__btn"
            onClick={handleClose}
          >
            Fold & Keep Note
          </button>
        </div>
      </div>
    </div>
  )
}
