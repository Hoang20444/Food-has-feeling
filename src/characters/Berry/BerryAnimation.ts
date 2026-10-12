import { MathUtils } from 'three'
import type { CharacterReaction, EmergencePhase } from '../../shared/interactions/characterTypes'
import type { TimeAtmosphere } from '../../state/timeAtmosphereStore'

export interface BerryTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  leafRotation: [number, number, number]
  eyeScaleY: number
  blushIntensity: number
}

// World anchor coordinates for the shelf near the strawberry jar
// Shelf surface is at Y = 2.425, jar is at [0.33, 2.425, -2.88]
const HIDING_POS: [number, number, number] = [0.33, 2.42, -2.95]
const PEEKING_POS: [number, number, number] = [0.33, 2.58, -2.93]
const EMERGING_POS: [number, number, number] = [0.18, 2.44, -2.84]
const SETTLED_POS: [number, number, number] = [0.16, 2.435, -2.80]

/**
 * Calculates smooth, non-conflicting transform values for Berry
 * based on elapsed time, emergence phase, daily routine, and active reaction.
 */
export function computeBerryTransforms(
  time: number,
  delta: number,
  phase: EmergencePhase,
  reaction: CharacterReaction,
  reactionElapsed: number,
  current: BerryTransform,
  baseSettledPos: [number, number, number] = SETTLED_POS,
  pointer?: { x: number; y: number },
  timeAtmosphere: TimeAtmosphere = 'morning',
  isFavoriteSpot = false,
): BerryTransform {
  const next: BerryTransform = {
    position: [...current.position],
    rotation: [...current.rotation],
    scale: [...current.scale],
    leafRotation: [...current.leafRotation],
    eyeScaleY: 1,
    blushIntensity: 0.8,
  }

  // --- 1. Target Position and Base Orientation based on Emergence Phase & Daily Routine ---
  let targetPos: [number, number, number] = baseSettledPos
  let targetRotY = 0.35 // Looking slightly into room/camera

  if (phase === 'hidden') {
    targetPos = HIDING_POS
    next.scale = [0.001, 0.001, 0.001]
  } else if (phase === 'peeking') {
    targetPos = PEEKING_POS
    targetRotY = 0.2
    targetPos[1] += Math.sin(time * 3) * 0.008
  } else if (phase === 'emerging') {
    const stepBob = Math.abs(Math.sin(time * 10)) * 0.015
    targetPos = [EMERGING_POS[0], EMERGING_POS[1] + stepBob, EMERGING_POS[2]]
    targetRotY = 0.25 + Math.sin(time * 8) * 0.08
  } else if (phase === 'looking_around') {
    targetPos = baseSettledPos
    targetRotY = Math.sin(time * 1.5) * 0.5
  } else {
    // Settled idle state influenced by daily routine & favorite spot
    targetPos = baseSettledPos

    if (isFavoriteSpot && timeAtmosphere !== 'evening') {
      // Gazing affectionately toward the window and sun
      targetRotY = -0.25 + Math.sin(time * 0.5) * 0.04
      next.blushIntensity = 1.0
    } else if (timeAtmosphere === 'evening') {
      // Sleepy cozy resting pose
      targetRotY = 0.2 + Math.sin(time * 0.4) * 0.03
    } else {
      targetRotY = 0.35 + Math.sin(time * 0.7) * 0.04
    }
  }

  // Smoothly damp position towards target
  next.position[0] = MathUtils.damp(current.position[0], targetPos[0], 6, delta)
  next.position[1] = MathUtils.damp(current.position[1], targetPos[1], 8, delta)
  next.position[2] = MathUtils.damp(current.position[2], targetPos[2], 6, delta)

  // --- 2. Idle Breathing & Subtle Head Tilts (when not hidden) ---
  if (phase !== 'hidden') {
    const isEvening = timeAtmosphere === 'evening'
    const isMorning = timeAtmosphere === 'morning'

    const breathSpeed = isEvening ? 1.2 : isMorning ? 2.6 : 1.8
    const breathAmp = isEvening ? 0.012 : 0.02

    const breathY = 1 + Math.sin(time * breathSpeed) * breathAmp
    const breathXZ = 1 - Math.sin(time * breathSpeed) * (breathAmp * 0.5)
    next.scale = [breathXZ, breathY, breathXZ]

    // Player cursor presence: gentle head bias tracking cursor
    const pointerLookX = pointer ? MathUtils.clamp(pointer.x * 0.28, -0.3, 0.3) : 0
    const pointerLookY = pointer ? MathUtils.clamp(-pointer.y * 0.15, -0.15, 0.15) : 0

    // Head tilt
    const tiltZ = Math.sin(time * (isEvening ? 0.6 : 0.9)) * (isEvening ? 0.045 : 0.03)
    next.rotation = [
      pointerLookY,
      MathUtils.damp(current.rotation[1], targetRotY + pointerLookX, 6, delta),
      tiltZ,
    ]

    // Leaf crown sway
    next.leafRotation = [
      Math.sin(time * (isEvening ? 0.8 : 1.6)) * (isEvening ? 0.02 : 0.04),
      Math.sin(time * (isEvening ? 0.6 : 1.2)) * (isEvening ? 0.03 : 0.06),
      Math.sin(time * (isEvening ? 0.9 : 1.8)) * (isEvening ? 0.02 : 0.05),
    ]

    // Blinking & Sleepy eyes
    if (isEvening) {
      // Sleepy half-lidded eyes with slow deep blinks
      next.eyeScaleY = 0.32 + Math.sin(time * 1.2) * 0.06
    } else {
      // Natural occasional blinking: blink every 3.8s for 0.14s
      const blinkCycle = time % 3.8
      if (blinkCycle < 0.14) {
        next.eyeScaleY = 0.08
      } else {
        next.eyeScaleY = 1.0
      }
    }
  }

  // --- 3. Dynamic Click & Story Reaction Overrides ---
  if (reaction === 'noticed' && reactionElapsed < 1.8) {
    next.rotation[1] = MathUtils.damp(next.rotation[1], 0.55, 12, delta)
    next.scale[1] *= 1.12
    next.scale[0] *= 0.92
    next.scale[2] *= 0.92
    next.position[1] += Math.sin(reactionElapsed * Math.PI) * 0.02
    next.blushIntensity = 1.0
  } else if (reaction === 'happy_bounce' && reactionElapsed < 1.8) {
    const hop = Math.abs(Math.sin(reactionElapsed * 10)) * 0.03
    next.position[1] += hop
    next.rotation[1] = 0.45 + Math.sin(reactionElapsed * 12) * 0.06
    next.leafRotation[2] += Math.sin(reactionElapsed * 14) * 0.1
    next.blushIntensity = 1.0
  } else if (reaction === 'shy_hide' && reactionElapsed < 2.0) {
    next.scale[1] *= 0.9
    next.scale[0] *= 1.06
    next.scale[2] *= 1.06
    next.rotation[0] = 0.12
    next.rotation[1] = MathUtils.damp(next.rotation[1], 0.1, 8, delta)
    next.blushIntensity = 1.0
  } else if (reaction === 'curious_looking' && reactionElapsed < 2.4) {
    next.position[2] += Math.sin(reactionElapsed * Math.PI) * 0.03
    next.rotation[0] = 0.14
    next.rotation[2] = 0.08 * Math.sin(time * 3)
    next.scale[1] *= 1.06
    next.eyeScaleY = 1.15
    next.blushIntensity = 0.9
  } else if (reaction === 'sleepy_idle' && reactionElapsed < 2.4) {
    next.scale[1] *= 0.95 + Math.sin(time * 1.4) * 0.02
    next.eyeScaleY = 0.35
    next.rotation[0] = 0.06
    next.blushIntensity = 0.7
  } else if (reaction === 'excited_reaction' && reactionElapsed < 2.2) {
    const energeticHop = Math.abs(Math.sin(reactionElapsed * 16)) * 0.045
    next.position[1] += energeticHop
    next.rotation[1] = 0.45 + Math.sin(reactionElapsed * 18) * 0.15
    next.leafRotation[1] += delta * 14
    next.blushIntensity = 1.0
  }

  return next
}
