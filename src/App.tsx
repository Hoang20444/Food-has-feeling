import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PCFShadowMap } from 'three'
import { CAMERA } from './config/scene'
import { AwakeningBanner } from './components/ui/AwakeningBanner'
import { ControlsHint } from './components/ui/ControlsHint'
import { FriendshipToast } from './components/ui/FriendshipToast'
import { HandHint } from './components/ui/HandHint'
import { Header } from './components/ui/Header'
import { InspectCard } from './components/ui/InspectCard'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { PostcardAlbum } from './components/ui/PostcardAlbum'
import { StoryDialogueToast } from './components/ui/StoryDialogueToast'
import { WebGLFallback } from './components/ui/WebGLFallback'
import { KitchenScene } from './scene/KitchenScene'
import { useGrabState } from './interaction/GrabSystem'
import { interaction, recordPointerDown, wasDrag } from './state/interactionStore'

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}

export default function App() {
  const [hasWebGL] = useState<boolean>(() => checkWebGLSupport())

  const isDragging = useGrabState((s) => s.isDragging)

  if (hasWebGL === false) {
    return <WebGLFallback />
  }

  return (
    <main className="game-viewport">
      {/* 3D Canvas */}
      <Canvas
        className="game-canvas"
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 2]}
        camera={{
          position: CAMERA.position,
          fov: CAMERA.fov,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onPointerDown={(e) => recordPointerDown(e.clientX, e.clientY)}
        onPointerMissed={(e) => {
          // If the click did not drag the camera or object, clear selection
          if (!isDragging && !wasDrag(e.clientX, e.clientY)) {
            interaction.clearSelection()
          }
        }}
      >
        <Suspense fallback={null}>
          <KitchenScene />
        </Suspense>
      </Canvas>

      {/* Initial load screen */}
      <LoadingScreen />

      {/* Minimal UI Overlay */}
      <div className="game-ui">
        <Header />
        <AwakeningBanner />
        <HandHint />
        <StoryDialogueToast />
        <FriendshipToast />
        <ControlsHint />
      </div>

      {/* Selected Item Inspection Dock */}
      <InspectCard />

      {/* Collectible Postcard Stories Album Modal */}
      <PostcardAlbum />
    </main>
  )
}
