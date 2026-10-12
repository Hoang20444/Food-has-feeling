import { useState } from 'react'
import { useCharacterState } from '../../shared/interactions/characterInteraction'
import { useFriendshipState } from '../../state/friendshipState'

export function HandHint() {
  const hasMovedAnyObject = useFriendshipState((s) => s.hasMovedAnyObject)
  const berryPhase = useCharacterState((s) => s.characters.berry.emergencePhase)
  const [dismissed, setDismissed] = useState(false)

  // Show only after Berry has settled, before player has moved any object
  if (hasMovedAnyObject || dismissed || berryPhase !== 'settled') {
    return null
  }

  return (
    <div className="hand-hint" role="status" aria-live="polite">
      <div className="hand-hint__pill">
        <span className="hand-hint__icon">🍓</span>
        <div className="hand-hint__text-group">
          <span className="hand-hint__quote">“Is that... a friend?”</span>
          <span className="hand-hint__instruction">Try moving something in the kitchen</span>
        </div>
        <button
          type="button"
          className="hand-hint__close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss hint"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
