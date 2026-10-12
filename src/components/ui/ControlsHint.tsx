export function ControlsHint() {
  return (
    <aside className="game-hint" aria-label="Camera and interaction controls">
      <div className="game-hint__item">
        <span className="game-hint__icon">🖱️</span>
        <span className="game-hint__text">Drag to orbit</span>
      </div>
      <span className="game-hint__divider">•</span>
      <div className="game-hint__item">
        <span className="game-hint__icon">✋</span>
        <span className="game-hint__text">Hold & drag objects</span>
      </div>
      <span className="game-hint__divider">•</span>
      <div className="game-hint__item">
        <span className="game-hint__icon">👆</span>
        <span className="game-hint__text">Click to talk</span>
      </div>
    </aside>
  )
}
