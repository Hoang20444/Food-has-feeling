import { useEffect } from 'react'
import { INTERACTABLES } from '../../config/interactables'
import { interaction, useInteraction } from '../../state/interactionStore'
import { kitchenState, useKitchenState } from '../../state/kitchenState'
import { characterInteraction, useCharacterState } from '../../shared/interactions/characterInteraction'
import { BerryBehavior } from '../../characters/Berry/BerryBehavior'

export function InspectCard() {
  const selectedId = useInteraction((s) => s.selectedId)
  const selectedCharacterId = useCharacterState((s) => s.selectedCharacterId)
  const berryState = useCharacterState((s) => s.characters.berry)

  const whisperIndex = useKitchenState((s) => (selectedId ? s.whisperIndices[selectedId] || 0 : 0))
  const isRadioPlaying = useKitchenState((s) => s.radioPlaying)
  const isToasterPopped = useKitchenState((s) => s.toasterPopped)
  const isKettleHeating = useKitchenState((s) => s.kettleHeating)
  const isMugWarmed = useKitchenState((s) => s.mugWarmed)

  useEffect(() => {
    if (!selectedId && !selectedCharacterId) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        interaction.clearSelection()
        characterInteraction.clearSelection()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, selectedCharacterId])

  // --- Living Character Selection (Berry) ---
  if (selectedCharacterId === 'berry') {
    const dialogue = berryState.dialogue
    return (
      <div className="inspect-dock" role="status" aria-live="polite">
        <div className="inspect-dock__card">
          <div className="inspect-dock__badge-group">
            <span className="inspect-dock__mood-badge">
              <span className="inspect-dock__emoji">{dialogue?.emoji || '🍓'}</span>
              <span className="inspect-dock__mood-text">{dialogue?.mood || 'Shy'}</span>
            </span>
            <span className="inspect-dock__personality-tag">The First Friend</span>
          </div>

          <div className="inspect-dock__content">
            <h2 className="inspect-dock__title">Berry</h2>
            <p className="inspect-dock__note">“{dialogue?.text || 'Oh... you found me.'}”</p>
          </div>

          <button
            type="button"
            className="inspect-dock__action-btn"
            onClick={() => BerryBehavior.handleClick(berryState.interactionCount)}
            aria-label="Talk to Berry"
          >
            🍓 Talk to Berry
          </button>

          <button
            type="button"
            className="inspect-dock__close"
            onClick={() => characterInteraction.clearSelection()}
            aria-label="Deselect item"
            title="Deselect (Esc)"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // --- Regular Interactable Objects ---
  if (!selectedId) return null

  const info = INTERACTABLES[selectedId]
  const currentWhisper = info.whispers[whisperIndex % info.whispers.length] || info.note

  const handleAction = () => {
    kitchenState.recordInspection(selectedId)
    if (selectedId === 'radio') {
      kitchenState.toggleRadio()
    } else if (selectedId === 'toaster') {
      kitchenState.triggerToaster()
    } else if (selectedId === 'kettle') {
      kitchenState.triggerKettle()
    } else if (selectedId === 'mug') {
      kitchenState.triggerMug()
    } else if (selectedId === 'plate') {
      kitchenState.triggerPlate()
    }
  }

  // Contextual action label
  let actionText = info.actionLabel || 'Interact'
  if (selectedId === 'radio') {
    actionText = isRadioPlaying ? '📻 Turn Off' : '📻 Turn On'
  } else if (selectedId === 'toaster') {
    actionText = isToasterPopped ? '🍞 Popping!' : '🍞 Press Lever'
  } else if (selectedId === 'kettle') {
    actionText = isKettleHeating ? '🫖 Simmering...' : '🫖 Warm Up'
  } else if (selectedId === 'mug') {
    actionText = isMugWarmed ? '☕ Warming...' : '☕ Share Warmth'
  }

  return (
    <div className="inspect-dock" role="status" aria-live="polite">
      <div className="inspect-dock__card">
        {/* Mood & Personality Badges */}
        <div className="inspect-dock__badge-group">
          <span className="inspect-dock__mood-badge">
            <span className="inspect-dock__emoji">{info.moodEmoji}</span>
            <span className="inspect-dock__mood-text">{info.mood}</span>
          </span>
          <span className="inspect-dock__personality-tag">{info.personality}</span>
        </div>

        {/* Content */}
        <div className="inspect-dock__content">
          <h2 className="inspect-dock__title">{info.name}</h2>
          <p className="inspect-dock__note">“{currentWhisper}”</p>
        </div>

        {/* Action button */}
        <button
          type="button"
          className="inspect-dock__action-btn"
          onClick={handleAction}
          aria-label={actionText}
        >
          {actionText}
        </button>

        {/* Close button */}
        <button
          type="button"
          className="inspect-dock__close"
          onClick={() => interaction.clearSelection()}
          aria-label="Deselect item"
          title="Deselect (Esc)"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
