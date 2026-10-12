import { STORY_EVENTS } from '../../story/storyEvents'
import { storyStore, useStoryStore } from '../../state/storyStore'

export function PostcardAlbum() {
  const isOpen = useStoryStore((s) => s.postcardAlbumOpen)
  const unlocked = useStoryStore((s) => s.unlockedPostcards)

  if (!isOpen) return null

  const unlockedCount = Object.keys(unlocked).length
  const totalCount = STORY_EVENTS.length

  return (
    <div className="postcard-overlay" role="dialog" aria-modal="true" aria-label="Little Kitchen Memory Album">
      <div className="postcard-album">
        {/* Header */}
        <div className="postcard-album__header">
          <div className="postcard-album__title-group">
            <span className="postcard-album__icon">💌</span>
            <h2 className="postcard-album__title">Little Kitchen Stories</h2>
            <span className="postcard-album__counter">
              {unlockedCount} of {totalCount} Moments
            </span>
          </div>
          <button
            type="button"
            className="postcard-album__close"
            onClick={() => storyStore.closeAlbum()}
            aria-label="Close memory album"
          >
            ✕
          </button>
        </div>

        <p className="postcard-album__subtitle">
          Cherished memories and quiet moments discovered with your little kitchen friends.
        </p>

        {/* Postcards Grid */}
        <div className="postcard-album__grid">
          {STORY_EVENTS.map((event) => {
            const memory = unlocked[event.id]
            const isUnlocked = Boolean(memory)
            const cardData = isUnlocked ? memory : event.sequence.postcard

            return (
              <div
                key={event.id}
                className={`postcard-card${isUnlocked ? ' is-unlocked' : ' is-locked'}`}
              >
                {/* Vintage postal stamp */}
                <div
                  className="postcard-card__stamp"
                  style={{ borderColor: isUnlocked ? cardData.accentColor : undefined }}
                >
                  <span className="postcard-card__stamp-emoji">
                    {isUnlocked ? cardData.stampEmoji : '❓'}
                  </span>
                  <div className="postcard-card__stamp-postmark">KITCHEN • AM</div>
                </div>

                {/* Content */}
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
    </div>
  )
}
