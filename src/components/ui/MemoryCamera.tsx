import { useState } from 'react'
import { soundEffects } from '../../shared/audio/soundEffects'
import { timeAtmosphereStore, useTimeAtmosphere } from '../../state/timeAtmosphereStore'

/**
 * MemoryCamera — Cozy screenshot / picture-book framing mode.
 *
 * Allows the player to:
 * - Hide game UI to admire the diorama freely.
 * - Frame the kitchen with a soft postcard viewfinder.
 * - Capture emotional moments directly from the Three.js WebGL canvas.
 * - Saves high-res postcard photo with "Food Has Feelings Memory" watermark.
 */
export function MemoryCamera() {
  const isCameraMode = useTimeAtmosphere((s) => s.isCameraMode)
  const timeAtmosphere = useTimeAtmosphere((s) => s.current)
  const lastPhoto = useTimeAtmosphere((s) => s.lastPhotoTaken)

  const [isFlashing, setIsFlashing] = useState(false)

  if (!isCameraMode) return null

  const handleCapture = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas) return

    soundEffects.playCameraShutter()
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 350)

    try {
      // Create offscreen canvas to compose postcard with polaroid frame & watermark
      const photoCanvas = document.createElement('canvas')
      const ctx = photoCanvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      const borderTop = Math.round(h * 0.04)
      const borderSide = Math.round(w * 0.04)
      const borderBottom = Math.round(h * 0.16)

      photoCanvas.width = w + borderSide * 2
      photoCanvas.height = h + borderTop + borderBottom

      // 1. Warm cream paper background
      ctx.fillStyle = '#faf4ea'
      ctx.fillRect(0, 0, photoCanvas.width, photoCanvas.height)

      // 2. Subtle watercolor inner deckle border
      ctx.strokeStyle = '#e6d8c3'
      ctx.lineWidth = Math.max(2, Math.round(w * 0.003))
      ctx.strokeRect(borderSide * 0.4, borderTop * 0.4, photoCanvas.width - borderSide * 0.8, photoCanvas.height - borderTop * 0.8)

      // 3. Draw WebGL 3D diorama canvas
      ctx.drawImage(canvas, borderSide, borderTop, w, h)

      // 4. Postcard watermark & caption
      ctx.fillStyle = '#654b38'
      ctx.font = `600 ${Math.max(18, Math.round(w * 0.024))}px Georgia, serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('Food Has Feelings Memory 🍓', borderSide + 12, h + borderTop + borderBottom * 0.4)

      // Time & mood subcaption
      const timeCapitalized = timeAtmosphere.charAt(0).toUpperCase() + timeAtmosphere.slice(1)
      const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      ctx.fillStyle = '#9b806d'
      ctx.font = `400 ${Math.max(13, Math.round(w * 0.016))}px sans-serif`
      ctx.fillText(`${dateStr} • Cozy ${timeCapitalized} in the Kitchen`, borderSide + 12, h + borderTop + borderBottom * 0.72)

      // Postcard postage stamp watermark in corner
      ctx.textAlign = 'right'
      ctx.fillStyle = '#b59379'
      ctx.font = `italic ${Math.max(13, Math.round(w * 0.016))}px Georgia, serif`
      ctx.fillText('handmade with love 💌', photoCanvas.width - borderSide - 12, h + borderTop + borderBottom * 0.55)

      const dataUrl = photoCanvas.toDataURL('image/png')
      timeAtmosphereStore.setLastPhotoTaken(dataUrl)
    } catch {
      // Fallback: direct canvas data URL
      const fallbackUrl = canvas.toDataURL('image/png')
      timeAtmosphereStore.setLastPhotoTaken(fallbackUrl)
    }
  }

  const handleDownload = () => {
    if (!lastPhoto) return
    const a = document.createElement('a')
    a.href = lastPhoto
    a.download = `food-has-feelings-memory-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleClose = () => {
    timeAtmosphereStore.setCameraMode(false)
    timeAtmosphereStore.setLastPhotoTaken(null)
  }

  return (
    <div className="camera-viewfinder" role="dialog" aria-label="Memory Camera Viewfinder">
      {/* Flash overlay */}
      {isFlashing && <div className="camera-viewfinder__flash" />}

      {/* Viewfinder Vignette & Frame */}
      <div className="camera-viewfinder__frame">
        {/* Corner alignment marks */}
        <span className="camera-viewfinder__corner is-tl" />
        <span className="camera-viewfinder__corner is-tr" />
        <span className="camera-viewfinder__corner is-bl" />
        <span className="camera-viewfinder__corner is-br" />

        {/* Top bar info */}
        <div className="camera-viewfinder__topbar">
          <span className="camera-viewfinder__badge">📷 Memory Camera</span>
          <span className="camera-viewfinder__hint">Rotate & orbit to frame your favorite moment</span>
          <button
            type="button"
            className="camera-viewfinder__close-btn"
            onClick={handleClose}
            title="Exit Camera Mode"
            aria-label="Exit Camera Mode"
          >
            ✕ Return to Kitchen
          </button>
        </div>

        {/* Bottom Postcard Caption & Shutter Trigger */}
        <div className="camera-viewfinder__bottombar">
          <div className="camera-viewfinder__caption">
            <span className="camera-viewfinder__title">Food Has Feelings Memory</span>
            <span className="camera-viewfinder__sub">
              A quiet moment together in the kitchen • {timeAtmosphere}
            </span>
          </div>

          <button
            type="button"
            className="camera-viewfinder__shutter-btn"
            onClick={handleCapture}
            title="Capture Moment"
            aria-label="Capture Moment"
          >
            📸 Capture Moment
          </button>
        </div>
      </div>

      {/* Photo Preview Modal if a picture was just taken */}
      {lastPhoto && (
        <div className="camera-preview-modal" role="dialog" aria-label="Captured Postcard Photo">
          <div className="camera-preview-modal__card">
            <h3 className="camera-preview-modal__title">Postcard Captured! ✨</h3>
            <div className="camera-preview-modal__img-wrap">
              <img src={lastPhoto} alt="Captured Kitchen Memory" className="camera-preview-modal__img" />
            </div>
            <div className="camera-preview-modal__actions">
              <button
                type="button"
                className="camera-preview-modal__btn is-save"
                onClick={handleDownload}
              >
                💾 Save Postcard Photo
              </button>
              <button
                type="button"
                className="camera-preview-modal__btn is-retake"
                onClick={() => timeAtmosphereStore.setLastPhotoTaken(null)}
              >
                📸 Take Another
              </button>
              <button
                type="button"
                className="camera-preview-modal__btn is-done"
                onClick={handleClose}
              >
                Return to Kitchen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
