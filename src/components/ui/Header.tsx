import { useState } from 'react'
import { soundEffects } from '../../shared/audio/soundEffects'
import { useKitchenState } from '../../state/kitchenState'
import { storyStore, useStoryStore } from '../../state/storyStore'

export function Header() {
  const [muted, setMuted] = useState(() => soundEffects.getMuted())
  const awakened = useKitchenState((s) => s.kitchenAwakened)
  const unlockedPostcards = useStoryStore((s) => s.unlockedPostcards)
  const unlockedCount = Object.keys(unlockedPostcards).length

  const toggleSound = () => {
    const next = soundEffects.toggleMute()
    setMuted(next)
  }

  return (
    <header className="game-header">
      <div className="game-header__brand">
        <span className="game-header__emoji" role="img" aria-label="strawberry">
          🍓
        </span>
        <h1 className="game-header__title">FOOD HAS FEELINGS</h1>
        <span className={`game-header__badge${awakened ? ' is-awakened' : ''}`}>
          {awakened ? '✨ Awakened' : 'The Kitchen'}
        </span>

        {/* Collectible Postcard Stories Album Button */}
        <button
          type="button"
          className="game-header__badge is-album-btn"
          onClick={() => storyStore.openAlbum()}
          title="Open Little Kitchen Postcard Stories Album"
          aria-label="Open stories album"
        >
          💌 {unlockedCount > 0 ? `${unlockedCount}/6 Stories` : 'Stories'}
        </button>

        <button
          type="button"
          className="game-header__sound-btn"
          onClick={toggleSound}
          title={muted ? 'Unmute cozy audio' : 'Mute audio'}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      <p className="game-header__tagline">
        {awakened
          ? 'Whispers stir in the corners... the kitchen is alive.'
          : 'A cozy miniature kitchen where food is quietly waking up.'}
      </p>
    </header>
  )
}
