import { useEffect, useState } from 'react'
import { INTERACTABLES } from '../../config/interactables'
import { interaction, useInteraction } from '../../state/interactionStore'
import { kitchenState, useKitchenState } from '../../state/kitchenState'
import { worldMemoryStore } from '../../state/worldMemoryStore'
import { soundEffects } from '../../shared/audio/soundEffects'
import { characterInteraction, useCharacterState } from '../../shared/interactions/characterInteraction'
import { BerryBehavior } from '../../characters/Berry/BerryBehavior'

const CARE_RESPONSES: Record<string, string> = {
  berry: "I feel safe whenever you're near. Thank you for taking care of me.",
  mug: "Your hands are so soothing... I feel warm right to the rim.",
  toaster: "A gentle pat! You really do care about me. I'm not lonely anymore.",
  kettle: "Ah, thank you for checking on me. Simmering quietly and happily.",
  plate: "Held with love. I'm ready for our next breakfast together.",
  radio: "Tuning into the softest morning lullaby just for you.",
}

export function InspectCard() {
  const selectedId = useInteraction((s) => s.selectedId)
  const selectedCharacterId = useCharacterState((s) => s.selectedCharacterId)
  const berryState = useCharacterState((s) => s.characters.berry)

  const activeTargetId = selectedCharacterId || selectedId
  const [careTarget, setCareTarget] = useState<{ id: string; message: string } | null>(null)
  const careWhisper = careTarget && careTarget.id === activeTargetId ? careTarget.message : null

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

  const handleCareAction = (targetId: string) => {
    soundEffects.playCarePurr()
    worldMemoryStore.recordCare()
    const msg = CARE_RESPONSES[targetId] || 'Your gentle hands bring warmth to the kitchen.'
    setCareTarget({ id: targetId, message: msg })

    if (targetId === 'berry') {
      characterInteraction.triggerReaction('berry', 'happy_bounce', {
        text: msg,
        mood: 'Loved',
        emoji: '💛',
      })
    } else if (targetId === 'mug') {
      kitchenState.triggerMug()
    } else if (targetId === 'toaster') {
      kitchenState.triggerToaster()
    } else if (targetId === 'kettle') {
      kitchenState.triggerKettle()
    } else if (targetId === 'plate') {
      kitchenState.triggerPlate()
    }
  }

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
            <p className="inspect-dock__note">
              “{careWhisper || dialogue?.text || 'Oh... you found me.'}”
            </p>
          </div>

          <div className="inspect-dock__button-row">
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
              className="inspect-dock__care-btn"
              onClick={() => handleCareAction('berry')}
              title="Give gentle warmth and comfort"
              aria-label="Comfort Berry"
            >
              💛 Comfort & Nurture
            </button>
          </div>

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
  const currentWhisper = careWhisper || info.whispers[whisperIndex % info.whispers.length] || info.note

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

        {/* Action buttons row */}
        <div className="inspect-dock__button-row">
          <button
            type="button"
            className="inspect-dock__action-btn"
            onClick={handleAction}
            aria-label={actionText}
          >
            {actionText}
          </button>

          <button
            type="button"
            className="inspect-dock__care-btn"
            onClick={() => handleCareAction(selectedId)}
            title="Nurture with gentle care and warmth"
            aria-label="Comfort item"
          >
            💛 Warm & Comfort
          </button>
        </div>

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
