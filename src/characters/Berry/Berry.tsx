import { useEffect, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, type Group } from 'three'
import { useKitchenState } from '../../state/kitchenState'
import { interaction } from '../../state/interactionStore'
import { useMysteryStore } from '../../state/mysteryStore'
import { objectPositionsStore, useObjectPosition } from '../../state/objectPositionsStore'
import { useTimeAtmosphere } from '../../state/timeAtmosphereStore'
import { useWorldMemoryStore } from '../../state/worldMemoryStore'
import { grabSystem, useGrabState } from '../../interaction/GrabSystem'
import { TouchSparkles } from '../../interaction/TouchSparkles'
import { soundEffects } from '../../shared/audio/soundEffects'
import { characterInteraction, useCharacterState } from '../../shared/interactions/characterInteraction'
import { computeBerryTransforms, type BerryTransform } from './BerryAnimation'
import { BerryBehavior } from './BerryBehavior'
import { BerryGLBLoader } from './BerryGLBLoader'
import { berryWanderAI } from './BerryWanderAI'

const INITIAL_TRANSFORM: BerryTransform = {
  position: [0.16, 2.435, -2.80],
  rotation: [0, 0.35, 0],
  scale: [1, 1, 1],
  leafRotation: [0, 0, 0],
  eyeScaleY: 1.0,
  blushIntensity: 0.8,
  stepCycle: 0,
}

/**
 * Berry — The First Living Food Friend.
 *
 * Fully autonomous living creature with:
 * - Free autonomous roaming across surfaces (shelf, counter, table, rug)
 * - Pitter-patter footsteps & waddling walk cycles
 * - Dramatic, readable emotional states (uneasy shivering, joyful hops, cozy naps)
 * - Floating 3D live mood and activity thoughts over head
 */
export function Berry() {
  const isKitchenAwakened = useKitchenState((s) => s.kitchenAwakened)
  const berryState = useCharacterState((s) => s.characters.berry)
  const timeAtmosphere = useTimeAtmosphere((s) => s.current)
  const berryMood = useMysteryStore((s) => s.berryMood)

  const groupRef = useRef<Group>(null)
  const transformRef = useRef<BerryTransform>({ ...INITIAL_TRANSFORM })
  const [, setTick] = useState(0)

  const berryPosState = useObjectPosition((s) => s.berry)
  const isGrabbed = useGrabState((s) => s.grabbedId === 'berry')
  const dragPos = useGrabState((s) => (s.grabbedId === 'berry' ? s.currentDragPos : null))
  const pointerDownCoord = useRef<{ x: number; y: number; time: number } | null>(null)

  const isFavoriteWindowSpot = useWorldMemoryStore(
    (s) => (s.dropFrequency.berry?.window_sunlight || 0) >= 2,
  ) && berryPosState.currentZoneId === 'window_sunlight'

  // Trigger one-time emergence when the kitchen awakens
  useEffect(() => {
    if (isKitchenAwakened && berryState.emergencePhase === 'hidden') {
      BerryBehavior.startEmergenceSequence()
    }
  }, [isKitchenAwakened, berryState.emergencePhase])

  // Sync emergence settled state with autonomous wander AI
  useEffect(() => {
    if (berryState.emergencePhase === 'settled') {
      berryWanderAI.setSettled(true)
    }
  }, [berryState.emergencePhase])

  // Periodic UI refresh for status badge
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Reset cursor if unmounted while hovered
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const t = state.clock.elapsedTime
    const reactionElapsed = berryState.reactionStartTime > 0
      ? (performance.now() - berryState.reactionStartTime) / 1000
      : 0

    // Update autonomous wandering AI
    berryWanderAI.update(delta, isGrabbed, berryMood, berryState.isHovered)
    const wanderState = berryWanderAI.getState()

    // Periodically sync live roam position to store so proximity triggers work naturally
    if (wanderState.isWalking && Math.floor(t * 3) !== Math.floor((t - delta) * 3)) {
      objectPositionsStore.setPosition('berry', wanderState.position, 'free_roam')
    }

    // Compute restrained, smooth procedural animations with subtle cursor presence, daily routines, and mystery chapter mood
    transformRef.current = computeBerryTransforms(
      t,
      delta,
      berryState.emergencePhase,
      berryState.activeReaction,
      reactionElapsed,
      transformRef.current,
      berryPosState.position,
      state.pointer,
      timeAtmosphere,
      isFavoriteWindowSpot,
      berryMood,
      wanderState,
    )

    const tr = transformRef.current

    if (isGrabbed && dragPos) {
      // Follow drag position smoothly with floating bob
      group.position.x = MathUtils.damp(group.position.x, dragPos[0], 18, delta)
      group.position.y = MathUtils.damp(group.position.y, dragPos[1] + 0.16 + Math.sin(t * 4) * 0.015, 18, delta)
      group.position.z = MathUtils.damp(group.position.z, dragPos[2], 18, delta)
      group.rotation.set(0, tr.rotation[1], 0)
      group.scale.set(tr.scale[0] * 1.08, tr.scale[1] * 1.08, tr.scale[2] * 1.08)
    } else {
      group.position.set(...tr.position)
      group.rotation.set(...tr.rotation)
      group.scale.set(...tr.scale)
    }

    // Clear reaction after 3.2 seconds
    if (berryState.activeReaction !== 'none' && reactionElapsed > 3.2) {
      characterInteraction.clearReaction('berry')
    }
  })

  // Pointer event handlers
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (berryState.emergencePhase === 'hidden') return
    e.stopPropagation()
    document.body.style.cursor = isGrabbed ? 'grabbing' : 'grab'
    characterInteraction.hover('berry')
    grabSystem.setHoveredDraggable('berry')
  }

  const onPointerOut = () => {
    if (!isGrabbed) {
      document.body.style.cursor = 'default'
    }
    characterInteraction.unhover('berry')
    grabSystem.setHoveredDraggable(null)
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (berryState.emergencePhase !== 'settled') return
    e.stopPropagation()
    pointerDownCoord.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    }
    document.body.style.cursor = 'grabbing'
    soundEffects.playGrabPop()
    grabSystem.startGrab('berry', berryPosState.position)

    // Player presence: Berry acknowledges being gently held
    characterInteraction.triggerReaction('berry', 'excited_reaction', {
      text: "Wheee! You're so gentle.",
      mood: 'Carefree',
      emoji: '🍓',
    })
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (berryState.emergencePhase === 'hidden') return
    e.stopPropagation()
    document.body.style.cursor = 'grab'

    if (pointerDownCoord.current) {
      const dx = Math.abs(e.clientX - pointerDownCoord.current.x)
      const dy = Math.abs(e.clientY - pointerDownCoord.current.y)
      const duration = performance.now() - pointerDownCoord.current.time

      if (dx < 6 && dy < 6 && duration < 350) {
        interaction.clearSelection()

        // Check if Berry is at favorite window spot
        if (isFavoriteWindowSpot) {
          soundEffects.playBerryGiggle()
          characterInteraction.triggerReaction('berry', 'happy_bounce', {
            text: 'The sun always remembers where I sit... thank you.',
            mood: 'Treasured',
            emoji: '🌸',
          })
          setTimeout(() => {
            characterInteraction.dismissDialogue('berry')
          }, 4500)
        } else {
          BerryBehavior.handleClick(berryState.interactionCount)
        }
      }
    }

    pointerDownCoord.current = null
  }

  // Do not render if completely hidden
  if (berryState.emergencePhase === 'hidden') {
    return null
  }

  return (
    <group
      ref={groupRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* 3D Character Renderer (with Blender GLB support and procedural fallback) */}
      <BerryGLBLoader />

      {/* Floating magical sparkles on touch/grab */}
      <TouchSparkles active={isGrabbed} radius={0.25} />

      {/* Invisible generous hit volume for reliable touch & mouse clicking */}
      <mesh position-y={0.14}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Floating 3D Living Mood & Activity Bubble */}
      {berryState.emergencePhase === 'settled' && !berryState.dialogueVisible && (
        <Html
          position={[0, 0.38, 0]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`berry-living-mood is-${berryMood}`} role="status">
            <span className="berry-living-mood__emoji">{berryWanderAI.getState().statusEmoji}</span>
            <span className="berry-living-mood__text">{berryWanderAI.getState().statusText}</span>
          </div>
        </Html>
      )}

      {/* Floating Emotional Dialogue Bubble in 3D */}
      {berryState.dialogueVisible && berryState.dialogue && (
        <Html
          position={[0, 0.34, 0]}
          center
          zIndexRange={[25, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <aside className="berry-dialogue" role="status" aria-live="polite">
            <span className="berry-dialogue__emoji">{berryState.dialogue.emoji}</span>
            <div className="berry-dialogue__body">
              <strong className="berry-dialogue__name">Berry</strong>
              <p className="berry-dialogue__text">“{berryState.dialogue.text}”</p>
            </div>
          </aside>
        </Html>
      )}
    </group>
  )
}
