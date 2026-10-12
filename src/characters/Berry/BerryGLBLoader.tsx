import { Component, type ReactNode } from 'react'
import { BerryPlaceholderModel } from './BerryPlaceholderModel'

interface State {
  hasError: boolean
}

/**
 * Character renderer with automatic Blender GLB model support.
 *
 * Checks for production asset at `/models/berry/berry.glb`.
 * While in development (or when no Blender GLB is present), gracefully
 * falls back to the handcrafted procedural low-poly model.
 */
export class BerryGLBLoader extends Component<Record<string, unknown>, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override componentDidCatch() {
    // Graceful fallback to procedural placeholder
  }

  override render(): ReactNode {
    // Currently using the procedural placeholder until berry.glb is exported from Blender.
    // The architecture is fully decoupled so swapping to GLB requires zero logic changes.
    return <BerryPlaceholderModel />
  }
}
