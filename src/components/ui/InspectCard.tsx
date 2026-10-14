import { useEffect, useState } from 'react'
import { INTERACTABLES } from '../../config/interactables'
import { interaction, useInteraction } from '../../state/interactionStore'
import { kitchenState, useKitchenState } from '../../state/kitchenState'
import { mysteryStore, useMysteryStore } from '../../state/mysteryStore'
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
  clock: "A gentle touch against the cool porcelain. Every tick counts.",
  drawer: "The cedar wood warms under your hand. Safe and steady.",
}

export function InspectCard() {
  const selectedId = useInteraction((s) => s.selectedId)
  const selectedCharacterId = useCharacterState((s) => s.selectedCharacterId)
  const berryState = useCharacterState((s) => s.characters.berry)

  const phase = useMysteryStore((s) => s.phase)
  const clues = useMysteryStore((s) => s.clues)
  const isClockStopped = useMysteryStore((s) => s.clockStopped)
  const isDrawerOpen = useMysteryStore((s) => s.drawerOpen)
  const finalChoice = useMysteryStore((s) => s.finalChoice)

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
    const isRevelationPhase = phase === 'revelation'
    const isCompleted = phase === 'chapter_complete'

    return (
      <div className="inspect-dock" role="status" aria-live="polite">
        <div className="inspect-dock__card">
          <div className="inspect-dock__badge-group">
            <span className="inspect-dock__mood-badge">
              <span className="inspect-dock__emoji">{isCompleted ? '🌸' : isRevelationPhase ? '🥺' : '🍓'}</span>
              <span className="inspect-dock__mood-text">
                {isCompleted ? 'At Peace' : isRevelationPhase ? 'Remembering' : 'Curious'}
              </span>
            </span>
            <span className="inspect-dock__personality-tag">The First Friend</span>
          </div>

          <div className="inspect-dock__content">
            <h2 className="inspect-dock__title">Berry</h2>
            <p className="inspect-dock__note">
              {careWhisper ? (
                `“${careWhisper}”`
              ) : isCompleted ? (
                finalChoice === 'preserve_memory'
                  ? '“Thank you for keeping our song alive. I won’t be scared anymore.”'
                  : '“A quiet sleep... no more waiting. Thank you for being so gentle.”'
              ) : isRevelationPhase ? (
                '“I remember now... someone loved this kitchen. Someone loved me. But they had to leave, didn’t they?”'
              ) : (
                `“${berryState.dialogue?.text || 'Oh... you found me.'}”`
              )}
            </p>
          </div>

          {/* Revelation Climax Decision */}
          {isRevelationPhase ? (
            <div className="inspect-dock__button-row is-climax">
              <button
                type="button"
                className="inspect-dock__action-btn is-climax-btn"
                onClick={() => {
                  mysteryStore.makeFinalChoice('preserve_memory')
                  soundEffects.playMusicBoxMelody()
                }}
              >
                🌸 Keep the promise & remember together
              </button>
              <button
                type="button"
                className="inspect-dock__care-btn is-climax-btn"
                onClick={() => {
                  mysteryStore.makeFinalChoice('let_it_rest')
                  soundEffects.playCarePurr()
                }}
              >
                🌙 It’s okay to let go & rest now
              </button>
            </div>
          ) : (
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
          )}

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

  // Mystery context overrides
  let currentWhisper = careWhisper || info.whispers[whisperIndex % info.whispers.length] || info.note
  let isClueItem = false

  if (selectedId === 'radio' && phase !== 'comfort') {
    isClueItem = true
    currentWhisper =
      '“Between the frequencies... the same tune repeats. Why does it feel like a goodbye?”'
  } else if (selectedId === 'clock' && (isClockStopped || phase !== 'comfort')) {
    isClueItem = true
    currentWhisper =
      '“The hands are frozen at 3:15. A gentle scratch behind the glass marks tea time.”'
  } else if (selectedId === 'drawer') {
    isClueItem = true
    currentWhisper = isDrawerOpen
      ? '“A folded child’s recipe note rests inside the cedar wood.”'
      : '“The drawer handle is slightly loose, as if waiting to be opened.”'
  } else if (selectedId === 'mug' && phase !== 'comfort') {
    currentWhisper =
      '“The tea has grown cold... but the aroma of chamomile lingers, like 3:15 was only moments ago.”'
  } else if (selectedId === 'toaster' && phase !== 'comfort') {
    currentWhisper =
      '“The lever clicks softly... waiting for a morning breakfast that was promised long ago.”'
  } else if (selectedId === 'kettle' && phase !== 'comfort') {
    currentWhisper =
      '“The water keeps its gentle warmth, standing watch in case tea time begins again.”'
  } else if (selectedId === 'plate' && phase !== 'comfort') {
    currentWhisper =
      '“The porcelain place setting was never moved. Someone meant to come back.”'
  }

  const handleAction = () => {
    kitchenState.recordInspection(selectedId)
    mysteryStore.recordInspection(selectedId)

    if (selectedId === 'radio') {
      if (phase === 'comfort') {
        soundEffects.playNormalRadioMelody()
        kitchenState.toggleRadio()
      } else {
        soundEffects.playWarpedRadioMelody()
        mysteryStore.discoverClue('radio_melody')
      }
    } else if (selectedId === 'clock') {
      if (isClockStopped || phase !== 'comfort') {
        soundEffects.playClockStop()
        mysteryStore.discoverClue('clock_time')
      } else {
        soundEffects.playClockTick()
      }
    } else if (selectedId === 'drawer') {
      if (!isDrawerOpen) {
        mysteryStore.toggleDrawer()
        soundEffects.playPaperRustle()
      } else {
        mysteryStore.openNoteModal()
        mysteryStore.discoverClue('drawer_note')
        soundEffects.playPaperRustle()
      }
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

  // Action button label
  let actionText = info.actionLabel || 'Interact'
  if (selectedId === 'radio') {
    actionText =
      phase === 'comfort'
        ? isRadioPlaying
          ? '📻 Turn Off'
          : '📻 Play Morning Song'
        : '📻 Listen to Strange Song'
  } else if (selectedId === 'clock') {
    actionText = isClockStopped ? '🕰️ Inspect Hands at 3:15' : '🕰️ Listen to Ticking'
  } else if (selectedId === 'drawer') {
    actionText = isDrawerOpen ? '📜 Read Promise Note' : '🗄️ Pull Drawer Open'
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
          {isClueItem && (
            <span className="inspect-dock__clue-badge">
              {(selectedId === 'radio' && clues.radio_melody.discovered) ||
              (selectedId === 'clock' && clues.clock_time.discovered) ||
              (selectedId === 'drawer' && clues.drawer_note.discovered)
                ? '✅ Clue Recorded'
                : '✨ Story Clue'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="inspect-dock__content">
          <h2 className="inspect-dock__title">{info.name}</h2>
          <p className="inspect-dock__note">{currentWhisper}</p>
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
