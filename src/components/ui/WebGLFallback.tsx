export function WebGLFallback({ message }: { message?: string }) {
  return (
    <div className="webgl-fallback">
      <div className="webgl-fallback__card">
        <span className="webgl-fallback__emoji" role="img" aria-label="sad toast">
          🍞
        </span>
        <h2 className="webgl-fallback__title">WebGL is Unavailable</h2>
        <p className="webgl-fallback__text">
          {message ||
            'FOOD HAS FEELINGS needs hardware-accelerated 3D graphics (WebGL) to render the kitchen. Please ensure WebGL is enabled in your browser settings.'}
        </p>
      </div>
    </div>
  )
}
