import { MathUtils } from 'three'
import type { CharacterReaction, EmergencePhase } from '../../shared/interactions/characterTypes'
import type { TimeAtmosphere } from '../../state/timeAtmosphereStore'
import type { BerryEmotionalState } from '../../state/mysteryStore'
import type { BerryWanderState } from './BerryWanderAI'

export interface BerryTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  leafRotation: [number, number, number]
  eyeScaleY: number
  blushIntensity: number
  stepCycle: number
}

// World anchor coordinates for the shelf near the strawberry jar
// Shelf surface is at Y = 2.425, jar is at [0.33, 2.425, -2.88]
const HIDING_POS: [number, number, number] = [0.33, 2.42, -2.95]
const PEEKING_POS: [number, number, number] = [0.33, 2.58, -2.93]
const EMERGING_POS: [number, number, number] = [0.18, 2.44, -2.84]
const SETTLED_POS: [number, number, number] = [0.16, 2.435, -2.80]

/**
 * Calculates smooth, non-conflicting transform values for Berry
 * based on elapsed time, emergence phase, autonomous wander AI, daily routine, mystery mood, and active reaction.
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
  berryMood: BerryEmotionalState = 'curious',
  wanderState?: BerryWanderState,
): BerryTransform {
  const next: BerryTransform = {
    position: [...current.position],
    rotation: [...current.rotation],
    scale: [...current.scale],
    leafRotation: [...current.leafRotation],
    eyeScaleY: 1,
    blushIntensity: 0.8,
    stepCycle: wanderState?.stepCycle || 0,
  }

  // --- 1. Target Position and Base Orientation based on Emergence Phase & Autonomous Wander AI ---
  let targetPos: [number, number, number] = wanderState ? wanderState.position : baseSettledPos
  let targetRotY = wanderState ? wanderState.facingRotY : 0.35

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
  } else if (wanderState) {
    // --- AUTONOMOUS LIVING LOCOMOTION & EMOTIONAL POSTURES ---
    if (wanderState.activity === 'walking') {
      const walkStep = wanderState.stepCycle
      const walkHop = Math.abs(Math.sin(walkStep)) * 0.024
      targetPos = [wanderState.position[0], wanderState.position[1] + walkHop, wanderState.position[2]]
      targetRotY = wanderState.facingRotY
      // Side-to-side waddling tilt
      next.rotation[2] += Math.sin(walkStep) * 0.08
      next.leafRotation[2] += Math.sin(walkStep) * 0.12
    } else if (wanderState.activity === 'hopping') {
      const hopHeight = Math.abs(Math.sin(wanderState.stepCycle * 1.5)) * 0.045
      targetPos = [wanderState.position[0], wanderState.position[1] + hopHeight, wanderState.position[2]]
      targetRotY = wanderState.facingRotY + Math.sin(wanderState.stepCycle * 2) * 0.12
    } else if (wanderState.activity === 'resting') {
      targetPos = wanderState.position
      targetRotY = wanderState.facingRotY
      next.scale[1] *= 0.88 // cozy squished loaf
      next.scale[0] *= 1.1
      next.scale[2] *= 1.1
      next.eyeScaleY = 0.12
    } else if (wanderState.activity === 'looking_around') {
      targetPos = wanderState.position
      targetRotY = wanderState.facingRotY + Math.sin(time * 1.8) * 0.4
    } else {
      targetPos = wanderState.position
      targetRotY = wanderState.facingRotY + Math.sin(time * 0.8) * 0.08
    }

    // Emotion Overrides
    if (berryMood === 'uneasy') {
      // Freezes and stares toward the clock and counter drawer with prominent nervous shiver
      targetRotY = -0.42 + Math.sin(time * 4) * 0.1
      next.blushIntensity = 0.35
    } else if (berryMood === 'hesitant') {
      targetRotY = 0.15 + Math.sin(time * 1.5) * 0.25
      next.blushIntensity = 0.7
    } else if (berryMood === 'emotional') {
      targetPos = [targetPos[0], targetPos[1], targetPos[2] + 0.04]
      targetRotY = 0.38 + Math.sin(time * 0.8) * 0.04
      next.blushIntensity = 1.0
    } else if (berryMood === 'happy') {
      next.blushIntensity = 1.0
    } else if (berryMood === 'peaceful') {
      next.blushIntensity = 0.7
    }
  }

  // Smoothly damp position towards live target
  const posDampSpeed = wanderState?.isWalking ? 14 : 7
  next.position[0] = MathUtils.damp(current.position[0], targetPos[0], posDampSpeed, delta)
  next.position[1] = MathUtils.damp(current.position[1], targetPos[1], 14, delta)
  next.position[2] = MathUtils.damp(current.position[2], targetPos[2], posDampSpeed, delta)

  // --- 2. Idle Breathing & Subtle Head Tilts (when not hidden) ---
  if (phase !== 'hidden') {
    const isEvening = timeAtmosphere === 'evening'
    const isMorning = timeAtmosphere === 'morning'

    let breathSpeed = isEvening ? 1.2 : isMorning ? 2.6 : 1.8
    let breathAmp = isEvening ? 0.012 : 0.02

    if (berryMood === 'uneasy') {
      breathSpeed = 3.2
      breathAmp = 0.01
    } else if (berryMood === 'emotional') {
      breathSpeed = 1.3
      breathAmp = 0.024
    } else if (berryMood === 'peaceful') {
      breathSpeed = 0.85
      breathAmp = 0.01
    }

    const breathY = 1 + Math.sin(time * breathSpeed) * breathAmp
    const breathXZ = 1 - Math.sin(time * breathSpeed) * (breathAmp * 0.5)
    next.scale = [breathXZ, breathY, breathXZ]

    // Emotional adjustments to posture and dramatic body language
    if (berryMood === 'uneasy') {
      // Clear, readable nervous trembling and scared crouch
      const shiver = Math.sin(time * 28) * 0.012
      next.position[0] += shiver
      next.position[1] += Math.abs(Math.sin(time * 24)) * 0.008
      next.scale[0] *= 1.15
      next.scale[1] *= 0.82 // visibly hunched in fear
      next.scale[2] *= 1.15
    } else if (berryMood === 'happy') {
      // Big joyful bouncy hops
      const happyBounce = Math.abs(Math.sin(time * 5)) * 0.038
      next.position[1] += happyBounce
      next.scale[1] *= 1.08
    } else if (berryMood === 'peaceful') {
      // Cozy sleeping loaf on the surface
      next.scale[1] *= 0.8
      next.scale[0] *= 1.18
      next.scale[2] *= 1.18
    }

    if (isFavoriteSpot && timeAtmosphere !== 'evening') {
      next.blushIntensity = 1.0
    }

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
    if (berryMood === 'uneasy') {
      // Crown leaves droop slightly in worry
      next.leafRotation = [0.06, 0, Math.sin(time * 12) * 0.015]
    } else if (berryMood === 'happy') {
      // Joyful leaf fluttering
      next.leafRotation = [
        Math.sin(time * 5) * 0.05,
        Math.sin(time * 6) * 0.1,
        Math.sin(time * 4) * 0.06,
      ]
    } else {
      next.leafRotation = [
        Math.sin(time * (isEvening ? 0.8 : 1.6)) * (isEvening ? 0.02 : 0.04),
        Math.sin(time * (isEvening ? 0.6 : 1.2)) * (isEvening ? 0.03 : 0.06),
        Math.sin(time * (isEvening ? 0.9 : 1.8)) * (isEvening ? 0.02 : 0.05),
      ]
    }

    // Blinking & Eyes expression
    if (berryMood === 'peaceful' || isEvening) {
      // Sleepy half-lidded eyes with slow deep blinks
      next.eyeScaleY = 0.32 + Math.sin(time * 1.2) * 0.06
    } else if (berryMood === 'uneasy' || berryMood === 'hesitant') {
      // Alert, wide, questioning eyes
      const blinkCycle = time % 5.0
      next.eyeScaleY = blinkCycle < 0.1 ? 0.1 : 1.22
    } else if (berryMood === 'emotional') {
      // Wide glistening eyes
      next.eyeScaleY = 1.18
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
