import { Suspense, useEffect, useState, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { BerryPlaceholderModel } from './BerryPlaceholderModel'
import { berryWanderAI } from './BerryWanderAI'
import { useMysteryStore } from '../../state/mysteryStore'

interface BlenderBerryModelProps {
  url: string
}

function BlenderBerryModel({ url }: BlenderBerryModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, groupRef)
  const berryMood = useMysteryStore((s) => s.berryMood)

  // Enable shadow casting and receiving for all meshes in the Blender model
  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [scene])

  // Auto-play matching animation clips if the 3D artist included animations in Blender
  useEffect(() => {
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
    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play()
      return () => {
        currentAction.fadeOut(0.2)
      }
    }
  }, [actions, berryMood])

  // Procedural limb animation (pitter-patter footsteps & emotional arm gestures)
  // if no baked animation clip is actively taking over the limbs
  useFrame((state) => {
    const hasActiveClips = actions && Object.values(actions).some((a) => a?.isRunning())
    if (hasActiveClips) return

    const wander = berryWanderAI.getState()
    const isWalking = wander.isWalking
    const step = wander.stepCycle
    const t = state.clock.elapsedTime

    const footL = scene.getObjectByName('Berry_Foot_L')
    const footR = scene.getObjectByName('Berry_Foot_R')
    const armL = scene.getObjectByName('Berry_Arm_L')
    const armR = scene.getObjectByName('Berry_Arm_R')

    if (footL && footR) {
      if (isWalking) {
        footL.position.y = 0.012 + Math.max(0, Math.sin(step)) * 0.016
        footR.position.y = 0.012 + Math.max(0, Math.sin(step + Math.PI)) * 0.016
      } else {
        footL.position.y = 0.012
        footR.position.y = 0.012
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
      <primitive object={scene} />
    </group>
  )
}

/**
 * Character renderer with automatic Blender GLB model support.
 *
 * Checks for production asset at `/models/berry/berry.glb`.
 * While in development (or when no Blender GLB is present), gracefully
 * falls back to the handcrafted procedural low-poly model.
 * Automatically checks for updates when switching back from Blender to the browser.
 */
export function BerryGLBLoader() {
  const [hasGlb, setHasGlb] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(false)

  const checkGlbAsset = () => {
    fetch('/models/berry/berry.glb', { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || ''
        const exists = res.ok && !contentType.includes('text/html')
        setHasGlb(exists)
        setChecked(true)
      })
      .catch(() => {
        setHasGlb(false)
        setChecked(true)
      })
  }

  useEffect(() => {
    checkGlbAsset()

    window.addEventListener('focus', checkGlbAsset)
    return () => {
      window.removeEventListener('focus', checkGlbAsset)
    }
  }, [])

  if (!checked || !hasGlb) {
    return <BerryPlaceholderModel />
  }

  return (
    <Suspense fallback={<BerryPlaceholderModel />}>
      <BlenderBerryModel url="/models/berry/berry.glb" />
    </Suspense>
  )
}
