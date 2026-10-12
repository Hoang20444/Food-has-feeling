import { useEffect, useState } from 'react'

/**
 * Gentle loading splash screen displayed briefly while WebGL initializes,
 * then smoothly fades away to reveal the 3D kitchen diorama.
 */
export function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true)
      const removeTimer = setTimeout(() => {
        setVisible(false)
      }, 500)
      return () => clearTimeout(removeTimer)
    }, 450)

    return () => clearTimeout(fadeTimer)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`game-loading${fading ? ' is-fading' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading kitchen"
    >
      <div className="game-loading__box">
        <span className="game-loading__icon" role="img" aria-label="pan">
          🍳
        </span>
        <span className="game-loading__text">Warming up the stove...</span>
      </div>
    </div>
  )
}
