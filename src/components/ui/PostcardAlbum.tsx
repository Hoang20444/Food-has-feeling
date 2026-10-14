import { useEffect, useState } from 'react'
import { STORY_EVENTS } from '../../story/storyEvents'
import { storyStore, useStoryStore } from '../../state/storyStore'
import { mysteryStore, useMysteryStore, type ChapterPhase } from '../../state/mysteryStore'
import { soundEffects } from '../../shared/audio/soundEffects'

const PHASE_LABELS: Record<ChapterPhase, { badge: string; desc: string; color: string }> = {
  comfort: {
    badge: 'Phase A: Cozy Comfort',
    desc: 'The miniature kitchen is waking up. Touch and explore objects around the room.',
    color: '#38a169',
  },
  something_wrong: {
    badge: 'Phase B: Something Is Wrong',
    desc: 'The porcelain clock froze at 3:15, and the radio broadcast an unexpected bittersweet tune.',
    color: '#d69e2e',
  },
  missing_memory: {
    badge: 'Phase C: Missing Memory',
    desc: 'Three forgotten clues are hidden across the kitchen. Follow their quiet echoes.',
    color: '#dd6b20',
  },
  revelation: {
    badge: 'Phase D: The Revelation',
    desc: 'All three clues are found! Talk to Berry by the counter to decide what to do with this memory.',
    color: '#e53e3e',
  },
  chapter_complete: {
    badge: 'Chapter 1 Complete',
    desc: 'You have uncovered the story behind the 3:15 tea time and chosen a path forward.',
    color: '#805ad5',
  },
}

export function PostcardAlbum() {
  const isOpen = useStoryStore((s) => s.postcardAlbumOpen)
  const activeTab = useStoryStore((s) => s.albumTab)
  const unlockedPostcards = useStoryStore((s) => s.unlockedPostcards)

  const phase = useMysteryStore((s) => s.phase)
  const clues = useMysteryStore((s) => s.clues)
  const finalChoice = useMysteryStore((s) => s.finalChoice)

  const [confirmReset, setConfirmReset] = useState(false)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        storyStore.closeAlbum()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  const unlockedCount = Object.keys(unlockedPostcards).length
  const totalPostcards = STORY_EVENTS.length

  const discoveredCluesCount = Object.values(clues).filter((c) => c.discovered).length
  const currentPhaseInfo = PHASE_LABELS[phase]

  const handleResetChapter = () => {
    mysteryStore.resetChapter()
    soundEffects.playGentleTouch()
    setConfirmReset(false)
  }

  return (
    <div
      className="postcard-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Little Kitchen Memory Journal & Clues"
    >
      <div className="postcard-album">
        {/* Header */}
        <div className="postcard-album__header">
          <div className="postcard-album__title-group">
            <span className="postcard-album__icon">📖</span>
            <h2 className="postcard-album__title">Kitchen Memory Journal</h2>
          </div>

          <button
            type="button"
            className="postcard-album__close"
            onClick={() => storyStore.closeAlbum()}
            aria-label="Close memory journal"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="journal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mystery'}
            className={`journal-tab${activeTab === 'mystery' ? ' is-active' : ''}`}
            onClick={() => storyStore.setAlbumTab('mystery')}
          >
            🔍 Chapter 1: The Song Nobody Remembers ({discoveredCluesCount}/3 Clues)
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stories'}
            className={`journal-tab${activeTab === 'stories' ? ' is-active' : ''}`}
            onClick={() => storyStore.setAlbumTab('stories')}
          >
            💌 Postcard Stories ({unlockedCount}/{totalPostcards})
          </button>
        </div>

        {/* --- TAB 1: MYSTERY DOSSIER (Chapter 1) --- */}
        {activeTab === 'mystery' && (
          <div className="mystery-dossier">
            {/* Phase Status Banner */}
            <div className="mystery-status-banner">
              <div className="mystery-status-banner__header">
                <span
                  className="mystery-status-banner__badge"
                  style={{ background: currentPhaseInfo.color }}
                >
                  {currentPhaseInfo.badge}
                </span>
                <span className="mystery-status-banner__progress">
                  {discoveredCluesCount} of 3 Clues Discovered
                </span>
              </div>
              <p className="mystery-status-banner__desc">{currentPhaseInfo.desc}</p>
            </div>

            {/* Clues Dossier Cards Grid */}
            <div className="mystery-clues-grid">
              {/* Clue 1: Radio Melody */}
              <div
                className={`mystery-clue-card${clues.radio_melody.discovered ? ' is-discovered' : ' is-hidden'}`}
              >
                <div className="mystery-clue-card__header">
                  <span className="mystery-clue-card__icon">{clues.radio_melody.icon}</span>
                  <div className="mystery-clue-card__meta">
                    <h3 className="mystery-clue-card__title">
                      {clues.radio_melody.discovered
                        ? clues.radio_melody.title
                        : 'A Melancholy Frequency'}
                    </h3>
                    <span className="mystery-clue-card__status">
                      {clues.radio_melody.discovered ? '✅ Discovered' : '🔒 Hidden Clue'}
                    </span>
                  </div>
                </div>

                <p className="mystery-clue-card__body">
                  {clues.radio_melody.discovered
                    ? clues.radio_melody.fullDescription
                    : 'Hint: Inspect the vintage radio when subtle changes begin to occur in the kitchen.'}
                </p>

                {clues.radio_melody.discovered && (
                  <div className="mystery-clue-card__actions">
                    <button
                      type="button"
                      className="mystery-clue-btn"
                      onClick={() => soundEffects.playWarpedRadioMelody()}
                    >
                      ▶️ Replay Warped Radio Melody
                    </button>
                  </div>
                )}
              </div>

              {/* Clue 2: Stopped Clock at 3:15 */}
              <div
                className={`mystery-clue-card${clues.clock_time.discovered ? ' is-discovered' : ' is-hidden'}`}
              >
                <div className="mystery-clue-card__header">
                  <span className="mystery-clue-card__icon">{clues.clock_time.icon}</span>
                  <div className="mystery-clue-card__meta">
                    <h3 className="mystery-clue-card__title">
                      {clues.clock_time.discovered
                        ? clues.clock_time.title
                        : 'The Frozen Porcelain Clock'}
                    </h3>
                    <span className="mystery-clue-card__status">
                      {clues.clock_time.discovered ? '✅ Discovered' : '🔒 Hidden Clue'}
                    </span>
                  </div>
                </div>

                <p className="mystery-clue-card__body">
                  {clues.clock_time.discovered
                    ? clues.clock_time.fullDescription
                    : 'Hint: Look closely at the round clock hanging on the kitchen wall.'}
                </p>

                {clues.clock_time.discovered && (
                  <div className="mystery-clue-card__actions">
                    <button
                      type="button"
                      className="mystery-clue-btn"
                      onClick={() => soundEffects.playClockStop()}
                    >
                      🕰️ Hear Mechanical Stillness
                    </button>
                  </div>
                )}
              </div>

              {/* Clue 3: Drawer Handwritten Note */}
              <div
                className={`mystery-clue-card${clues.drawer_note.discovered ? ' is-discovered' : ' is-hidden'}`}
              >
                <div className="mystery-clue-card__header">
                  <span className="mystery-clue-card__icon">{clues.drawer_note.icon}</span>
                  <div className="mystery-clue-card__meta">
                    <h3 className="mystery-clue-card__title">
                      {clues.drawer_note.discovered
                        ? clues.drawer_note.title
                        : 'The Forgotten Note'}
                    </h3>
                    <span className="mystery-clue-card__status">
                      {clues.drawer_note.discovered ? '✅ Discovered' : '🔒 Hidden Clue'}
                    </span>
                  </div>
                </div>

                <p className="mystery-clue-card__body">
                  {clues.drawer_note.discovered
                    ? clues.drawer_note.fullDescription
                    : 'Hint: Open the upper cedar drawer of the kitchen base cabinets.'}
                </p>

                {clues.drawer_note.discovered && (
                  <div className="mystery-clue-card__actions">
                    <button
                      type="button"
                      className="mystery-clue-btn"
                      onClick={() => {
                        mysteryStore.openNoteModal()
                        soundEffects.playPaperRustle()
                      }}
                    >
                      📜 Open Handwritten Letter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ending Resolution Banner (if complete) */}
            {phase === 'chapter_complete' && (
              <div className="mystery-resolution-card">
                <span className="mystery-resolution-card__icon">
                  {finalChoice === 'preserve_memory' ? '🌸' : '🌙'}
                </span>
                <div className="mystery-resolution-card__content">
                  <h3 className="mystery-resolution-card__title">
                    {finalChoice === 'preserve_memory'
                      ? 'Ending A: The Promise Remembered'
                      : 'Ending B: Gentle Slumber'}
                  </h3>
                  <p className="mystery-resolution-card__text">
                    {finalChoice === 'preserve_memory'
                      ? 'You decided to keep the memory alive together. Even though the child had to leave, their love remains held in the warm kitchen, and Berry hums the 3:15 lullaby without loneliness.'
                      : 'You chose to let the kitchen rest peacefully. The long wait by the window is over. Berry sleeps quietly under the warm golden lamplight, wrapped in stillness.'}
                  </p>
                </div>
              </div>
            )}

            {/* Reset / Replay Controls */}
            <div className="mystery-replay-row">
              {confirmReset ? (
                <div className="mystery-confirm-group">
                  <span>Restart Chapter 1 from the beginning?</span>
                  <button
                    type="button"
                    className="mystery-reset-confirm-btn"
                    onClick={handleResetChapter}
                  >
                    Yes, Restart
                  </button>
                  <button
                    type="button"
                    className="mystery-reset-cancel-btn"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="mystery-replay-btn"
                  onClick={() => setConfirmReset(true)}
                >
                  🔄 Replay Chapter 1
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: POSTCARD STORIES --- */}
        {activeTab === 'stories' && (
          <div>
            <p className="postcard-album__subtitle">
              Cherished memories and quiet moments discovered with your little kitchen friends.
            </p>

            <div className="postcard-album__grid">
              {STORY_EVENTS.map((event) => {
                const memory = unlockedPostcards[event.id]
                const isUnlocked = Boolean(memory)
                const cardData = isUnlocked ? memory : event.sequence.postcard

                return (
                  <div
                    key={event.id}
                    className={`postcard-card${isUnlocked ? ' is-unlocked' : ' is-locked'}`}
                  >
                    <div
                      className="postcard-card__stamp"
                      style={{ borderColor: isUnlocked ? cardData.accentColor : undefined }}
                    >
                      <span className="postcard-card__stamp-emoji">
                        {isUnlocked ? cardData.stampEmoji : '❓'}
                      </span>
                      <div className="postcard-card__stamp-postmark">KITCHEN • AM</div>
                    </div>

                    <div className="postcard-card__content">
                      <div className="postcard-card__meta">
                        <span className="postcard-card__characters">
                          {isUnlocked
                            ? cardData.characters.join(' & ')
                            : 'Secret Friends'}
                        </span>
                        <span className="postcard-card__location">
                          {isUnlocked ? cardData.locationName : 'Somewhere in the kitchen'}
                        </span>
                      </div>

                      <h3 className="postcard-card__title">
                        {isUnlocked ? cardData.title : 'Undiscovered Moment'}
                      </h3>

                      <p className="postcard-card__message">
                        {isUnlocked ? `“${cardData.message}”` : cardData.hint}
                      </p>

                      <div className="postcard-card__footer">
                        <span className="postcard-card__badge">
                          {isUnlocked ? '✨ Collected Memory' : '🔒 Waiting for a Friend'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
