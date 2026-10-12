import { soundEffects } from '../../shared/audio/soundEffects'
import { characterInteraction } from '../../shared/interactions/characterInteraction'
import { BERRY_DIALOGUES } from './berryTypes'

let emergenceTimer: ReturnType<typeof setTimeout> | null = null
let hasBegunEmergence = false

export const BerryBehavior = {
  /**
   * Start the 5-phase emergence sequence when the Kitchen Awakening event triggers.
   * Runs exactly once per game session to avoid repetitive triggers.
   */
  startEmergenceSequence: () => {
    if (hasBegunEmergence) return
    hasBegunEmergence = true

    // Phase 1: After initial jar rattle, Berry starts peeking (1.4s)
    emergenceTimer = setTimeout(() => {
      characterInteraction.setEmergencePhase('berry', 'peeking')
      soundEffects.playBerryRustle()

      // Phase 2: Berry steps out onto the open shelf (4.0s)
      emergenceTimer = setTimeout(() => {
        characterInteraction.setEmergencePhase('berry', 'emerging')

        // Phase 3: Berry looks around curiously (6.2s)
        emergenceTimer = setTimeout(() => {
          characterInteraction.setEmergencePhase('berry', 'looking_around')
          soundEffects.playBerryChirp()

          // Phase 4: Settled in natural idle state (8.2s)
          emergenceTimer = setTimeout(() => {
            characterInteraction.setEmergencePhase('berry', 'settled')
            // New Player Experience: Berry notices player hand
            characterInteraction.triggerReaction('berry', 'noticed', {
              text: 'Is that... a friend?',
              mood: 'Curious',
              emoji: '🍓',
            })
          }, 2000)
        }, 2200)
      }, 2600)
    }, 1400)
  },

  /**
   * Handles player clicking directly on Berry.
   * Produces distinct, readable reactions corresponding to interaction count.
   */
  handleClick: (currentCount: number) => {
    const nextCount = currentCount + 1

    if (nextCount === 1) {
      // First interaction: Berry notices player, looks toward camera
      soundEffects.playBerryChirp()
      characterInteraction.triggerReaction('berry', 'noticed', BERRY_DIALOGUES[0])
    } else if (nextCount === 2) {
      // Second interaction: Happy small bounce
      soundEffects.playBerryGiggle()
      characterInteraction.triggerReaction('berry', 'happy_bounce', BERRY_DIALOGUES[1])
    } else if (nextCount === 3) {
      // Third interaction: Shy reaction / hides slightly
      soundEffects.playBerryChirp()
      characterInteraction.triggerReaction('berry', 'shy_hide', BERRY_DIALOGUES[2])
    } else {
      // Subsequent interactions: Cycle sweet thoughts with happy bounce
      const dialogueIndex = 3 + ((nextCount - 4) % (BERRY_DIALOGUES.length - 3))
      const dialogue = BERRY_DIALOGUES[dialogueIndex] || BERRY_DIALOGUES[0]
      soundEffects.playBerryChirp()
      characterInteraction.triggerReaction('berry', 'happy_bounce', dialogue)
    }

    // Auto-dismiss dialogue after 4.5 seconds
    setTimeout(() => {
      characterInteraction.dismissDialogue('berry')
    }, 4500)
  },

  resetForTesting: () => {
    if (emergenceTimer) clearTimeout(emergenceTimer)
    hasBegunEmergence = false
    characterInteraction.setEmergencePhase('berry', 'hidden')
  },
}
