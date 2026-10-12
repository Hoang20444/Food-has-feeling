import { useState } from 'react'
import { soundEffects } from '../../shared/audio/soundEffects'
import { useKitchenState } from '../../state/kitchenState'
import { storyStore, useStoryStore } from '../../state/storyStore'
import { timeAtmosphereStore, useTimeAtmosphere, type TimeAtmosphere } from '../../state/timeAtmosphereStore'
import { useWorldMemoryStore } from '../../state/worldMemoryStore'

const TIME_ICONS: Record<TimeAtmosphere, string> = {
  morning: '☀️ Morning',
  afternoon: '🌤️ Afternoon',
  evening: '🌙 Evening',
}

export function Header() {
  const [muted, setMuted] = useState(() => soundEffects.getMuted())
  const awakened = useKitchenState((s) => s.kitchenAwakened)
  const unlockedPostcards = useStoryStore((s) => s.unlockedPostcards)
  const unlockedCount = Object.keys(unlockedPostcards).length

  const timeAtmosphere = useTimeAtmosphere((s) => s.current)
  const welcomeBackMessage = useWorldMemoryStore((s) => s.welcomeBackMessage)

  const toggleSound = () => {
    const next = soundEffects.toggleMute()
    setMuted(next)
  }

  const handleCycleTime = () => {
    timeAtmosphereStore.cycleAtmosphere()
    const nextTime = timeAtmosphereStore.getState().current
    if (nextTime === 'morning') soundEffects.playMorningBirds()
    else if (nextTime === 'evening') soundEffects.playEveningCrickets()
    else soundEffects.playGentleTouch()
  }

  const handleOpenCamera = () => {
    soundEffects.playGentleTouch()
    timeAtmosphereStore.setCameraMode(true)
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

        {/* Time of Day Switcher (Morning, Afternoon, Evening) */}
        <button
          type="button"
          className="game-header__badge is-time-btn"
          onClick={handleCycleTime}
          title={`Current Atmosphere: ${timeAtmosphere}. Click to change time of day.`}
          aria-label="Change time atmosphere"
        >
          {TIME_ICONS[timeAtmosphere]}
        </button>

        {/* Memory Camera Button */}
        <button
          type="button"
          className="game-header__badge is-camera-btn"
          onClick={handleOpenCamera}
          title="Open Memory Camera (Framing & Screenshot Mode)"
          aria-label="Open Memory Camera"
        >
          📷 Camera
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
        {welcomeBackMessage ||
          (awakened
            ? 'Whispers stir in the corners... the kitchen is alive.'
            : 'A cozy miniature kitchen where food is quietly waking up.')}
      </p>
    </header>
  )
}
