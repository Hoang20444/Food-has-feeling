import { Component, type ErrorInfo, type ReactNode, Suspense, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { BerryPlaceholderModel } from './BerryPlaceholderModel'
import { berryWanderAI } from './BerryWanderAI'
import { useMysteryStore } from '../../state/mysteryStore'

export const BERRY_GLB_PATH = '/models/berry.glb'

// Preload production asset immediately
useGLTF.preload(BERRY_GLB_PATH)

interface BerryModelProps {
  url?: string
}

/**
 * Production Blender-created 3D Berry model renderer.
 *
 * Technical characteristics:
 * - Direct glTF import from Blender 5.2.2 LTS
 * - Height: 0.24m - 0.26m, centered at origin [0, 0, 0]
 * - Ground contact: feet planted at Y = 0.010m
 * - Orientation: facing +Z (front)
 * - Materials: 8 PBR Principled BSDF materials
 * - Rig status: No skeletal bones / armature in source model
 * - Morph target status: No facial blendshapes in source model
 * - Animation driver: Procedural transform updates on named limb nodes ('Berry_Foot_L', 'Berry_Foot_R', 'Berry_Arm_L', 'Berry_Arm_R')
 *   coupled with parent-level locomotion, hopping, waddling, and mood shivering.
 */
function BerryModel({ url = BERRY_GLB_PATH }: BerryModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(url)
  const berryMood = useMysteryStore((s) => s.berryMood)

  // Clone scene so materials/hierarchy can be safely manipulated and isolated
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  // Procedural limb animation compatible with unrigged segmented mesh hierarchy
  useFrame((state) => {
    const wander = berryWanderAI.getState()
    const isWalking = wander.isWalking
    const step = wander.stepCycle
    const t = state.clock.elapsedTime

    const footL = clonedScene.getObjectByName('Berry_Foot_L')
    const footR = clonedScene.getObjectByName('Berry_Foot_R')
    const armL = clonedScene.getObjectByName('Berry_Arm_L')
    const armR = clonedScene.getObjectByName('Berry_Arm_R')

    // 1. Footstep pitter-patter
    if (footL && footR) {
      if (isWalking) {
        footL.position.y = 0.010 + Math.max(0, Math.sin(step)) * 0.016
        footR.position.y = 0.010 + Math.max(0, Math.sin(step + Math.PI)) * 0.016
      } else {
        footL.position.y = 0.010
        footR.position.y = 0.010
      }
    }

    // 2. Emotional Arm Gestures
    if (armL && armR) {
      if (berryMood === 'uneasy') {
        // Scared trembling shiver: arms held tightly to tummy
        armL.rotation.z = 0.75
        armL.rotation.x = 0.35 + Math.sin(t * 28) * 0.08
        armR.rotation.z = -0.75
        armR.rotation.x = 0.35 - Math.sin(t * 28) * 0.08
      } else if (berryMood === 'happy') {
        // Joyful wave: arms raised high
        armL.rotation.z = 1.3 + Math.sin(t * 8) * 0.2
        armL.rotation.x = 0.2
        armR.rotation.z = -1.3 - Math.sin(t * 8) * 0.2
        armR.rotation.x = 0.2
      } else if (berryMood === 'emotional') {
        // Tender posture: arms folded softly forward
        armL.rotation.z = 0.55
        armL.rotation.x = 0.35 + Math.sin(t * 3) * 0.04
        armR.rotation.z = -0.55
        armR.rotation.x = 0.35 - Math.sin(t * 3) * 0.04
      } else if (berryMood === 'peaceful') {
        // Resting posture: arms relaxed at lower sides
        armL.rotation.z = 0.25
        armL.rotation.x = 0.12
        armR.rotation.z = -0.25
        armR.rotation.x = 0.12
      } else if (isWalking) {
        // Rhythmic walking arm swings
        armL.rotation.z = 0.35
        armL.rotation.x = 0.2 + Math.sin(step) * 0.45
        armR.rotation.z = -0.35
        armR.rotation.x = 0.2 - Math.sin(step) * 0.45
      } else {
        // Neutral curious idle
        armL.rotation.z = 0.35
        armL.rotation.x = 0.2
        armR.rotation.z = -0.35
        armR.rotation.x = 0.2
      }
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class GLBErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('BerryGLB failed to load, gracefully falling back to procedural placeholder:', error, errorInfo)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

/**
 * BerryGLB — React Three Fiber component integrating the Blender-created Berry asset.
 *
 * Features:
 * - Loads `/models/berry.glb` with automated preloading.
 * - Robust dual-layer fallback: Suspense loading fallback and GLBErrorBoundary crash protection.
 * - Matches scale, ground contact, and orientation of the original diorama character.
 * - Preserves all existing interactions, mood changes, and autonomous locomotion.
 */
export function BerryGLB() {
  return (
    <GLBErrorBoundary fallback={<BerryPlaceholderModel />}>
      <Suspense fallback={<BerryPlaceholderModel />}>
        <BerryModel />
      </Suspense>
    </GLBErrorBoundary>
  )
}
