import { useEffect } from 'react'
import { kitchenState, useKitchenState } from '../../state/kitchenState'

/**
 * Secret kitchen awakening notification banner.
 *
 * Triggered after interacting with several objects in the kitchen,
 * establishing the secret presence of our first friend!
 */
export function AwakeningBanner() {
  const visible = useKitchenState((s) => s.awakenedNoticeVisible)

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      kitchenState.dismissAwakeningNotice()
    }, 7000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <aside className="awakening-banner" role="alert" aria-live="assertive">
      <div className="awakening-banner__card">
        <span className="awakening-banner__icon">✨</span>
        <div className="awakening-banner__text">
          <strong className="awakening-banner__title">The Kitchen is Waking Up</strong>
          <span className="awakening-banner__subtitle">
            Did you hear that? The pantry shelf softly rustled... someone is watching.
          </span>
        </div>
        <button
          type="button"
          className="awakening-banner__close"
          onClick={() => kitchenState.dismissAwakeningNotice()}
          aria-label="Dismiss notice"
        >
          ✕
        </button>
      </div>
    </aside>
  )
}
