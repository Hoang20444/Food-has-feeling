import { Suspense, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { BerryPlaceholderModel } from './BerryPlaceholderModel'
import { berryWanderAI } from './BerryWanderAI'
import { useMysteryStore } from '../../state/mysteryStore'

const GLB_URL = '/models/berry/berry.glb'

// Preload the production Blender GLB asset immediately
useGLTF.preload(GLB_URL)

interface BlenderBerryModelProps {
  url: string
}

function BlenderBerryModel({ url }: BlenderBerryModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, groupRef)
  const berryMood = useMysteryStore((s) => s.berryMood)

  // Clone scene so shadows and materials are isolated and clean
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

  // Auto-play matching animation clips if Blender project includes baked actions
  useFrame(() => {
    if (!actions) return
    const wander = berryWanderAI.getState()
    const actionNames = Object.keys(actions)
    if (actionNames.length === 0) return

    let targetClipName = ''
    if (wander.isWalking) {
      targetClipName = actionNames.find((n) => /walk|run|move/i.test(n)) || ''
    } else if (berryMood === 'uneasy') {
      targetClipName = actionNames.find((n) => /scared|fear|shiver|uneasy/i.test(n)) || ''
    } else if (berryMood === 'happy') {
      targetClipName = actionNames.find((n) => /happy|bounce|joy/i.test(n)) || ''
    }

    if (!targetClipName) {
      targetClipName = actionNames.find((n) => /idle|breath/i.test(n)) || actionNames[0]
    }

    const currentAction = actions[targetClipName]
    if (currentAction && !currentAction.isRunning()) {
      currentAction.reset().fadeIn(0.2).play()
    }
  })

  // Procedural limb animation (pitter-patter footsteps & emotional arm gestures)
  useFrame((state) => {
    const wander = berryWanderAI.getState()
    const isWalking = wander.isWalking
    const step = wander.stepCycle
    const t = state.clock.elapsedTime

    const footL = clonedScene.getObjectByName('Berry_Foot_L')
    const footR = clonedScene.getObjectByName('Berry_Foot_R')
    const armL = clonedScene.getObjectByName('Berry_Arm_L')
    const armR = clonedScene.getObjectByName('Berry_Arm_R')

    if (footL && footR) {
      if (isWalking) {
        footL.position.y = 0.010 + Math.max(0, Math.sin(step)) * 0.016
        footR.position.y = 0.010 + Math.max(0, Math.sin(step + Math.PI)) * 0.016
      } else {
        footL.position.y = 0.010
        footR.position.y = 0.010
      }
    }

    if (armL && armR) {
      if (berryMood === 'uneasy') {
        armL.rotation.z = 0.75
        armL.rotation.x = 0.35 + Math.sin(t * 28) * 0.08
        armR.rotation.z = -0.75
        armR.rotation.x = 0.35 - Math.sin(t * 28) * 0.08
      } else if (berryMood === 'happy') {
        armL.rotation.z = 1.3 + Math.sin(t * 8) * 0.2
        armL.rotation.x = 0.2
        armR.rotation.z = -1.3 - Math.sin(t * 8) * 0.2
        armR.rotation.x = 0.2
      } else if (isWalking) {
        armL.rotation.z = 0.35
        armL.rotation.x = 0.2 + Math.sin(step) * 0.45
        armR.rotation.z = -0.35
        armR.rotation.x = 0.2 - Math.sin(step) * 0.45
      } else {
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

/**
 * Character renderer with direct production Blender GLB asset.
 * Seamlessly loads `/models/berry/berry.glb` with procedural fallback while loading.
 */
export function BerryGLBLoader() {
  return (
    <Suspense fallback={<BerryPlaceholderModel />}>
      <BlenderBerryModel url={GLB_URL} />
    </Suspense>
  )
}
