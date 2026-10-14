import { soundEffects } from '../../shared/audio/soundEffects'
import { characterInteraction } from '../../shared/interactions/characterInteraction'
import { mysteryStore } from '../../state/mysteryStore'
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
    const mystery = mysteryStore.getState()

    // 1. If in a Mystery phase, Berry's voice reflects the unfolding story
    if (mystery.phase !== 'comfort') {
      if (mystery.phase === 'something_wrong') {
        soundEffects.playBerryChirp()
        characterInteraction.triggerReaction('berry', 'curious_looking', {
          text: 'The ticking stopped... and that radio song sounded so lonely. Did something happen?',
          mood: 'Uneasy',
          emoji: '🥺',
        })
      } else if (mystery.phase === 'missing_memory') {
        const { clock_time, drawer_note, radio_melody } = mystery.clues

        if (clock_time.discovered && !drawer_note.discovered) {
          soundEffects.playBerryChirp()
          characterInteraction.triggerReaction('berry', 'curious_looking', {
            text: 'The clock froze at 3:15... who were we waiting for? Is there something in the counter drawer?',
            mood: 'Hesitant',
            emoji: '🕰️',
          })
        } else if (drawer_note.discovered && !radio_melody.discovered) {
          soundEffects.playBerryChirp()
          characterInteraction.triggerReaction('berry', 'noticed', {
            text: 'The recipe note in the drawer... it mentions a song on the radio so I won’t be scared.',
            mood: 'Wondering',
            emoji: '📜',
          })
        } else if (radio_melody.discovered && !clock_time.discovered) {
          soundEffects.playBerryChirp()
          characterInteraction.triggerReaction('berry', 'noticed', {
            text: 'That lullaby on the radio... someone used to hum it while setting the table.',
            mood: 'Pensive',
            emoji: '📻',
          })
        } else {
          soundEffects.playBerryChirp()
          characterInteraction.triggerReaction('berry', 'curious_looking', {
            text: 'We are close to remembering... check the radio, the clock, and the drawer.',
            mood: 'Curious',
            emoji: '🔍',
          })
        }
      } else if (mystery.phase === 'revelation') {
        soundEffects.playBerryChirp()
        characterInteraction.triggerReaction('berry', 'noticed', {
          text: 'I remember now... someone loved this kitchen. Someone loved me. We made a promise at 3:15.',
          mood: 'Tearful',
          emoji: '🥺',
        })
      } else if (mystery.phase === 'chapter_complete') {
        if (mystery.finalChoice === 'preserve_memory') {
          soundEffects.playBerryGiggle()
          characterInteraction.triggerReaction('berry', 'happy_bounce', {
            text: 'We’ll remember together every single morning. I’m never lonely anymore.',
            mood: 'Treasured',
            emoji: '🌸',
          })
        } else {
          soundEffects.playBerryChirp()
          characterInteraction.triggerReaction('berry', 'sleepy_idle', {
            text: 'A quiet sleep... no more waiting. Thank you for staying with me until the end.',
            mood: 'At Peace',
            emoji: '🌙',
          })
        }
      }

      setTimeout(() => {
        characterInteraction.dismissDialogue('berry')
      }, 5000)
      return
    }

    // 2. Default Comfort Phase interactions
    if (nextCount === 1) {
      soundEffects.playBerryChirp()
      characterInteraction.triggerReaction('berry', 'noticed', BERRY_DIALOGUES[0])
    } else if (nextCount === 2) {
      soundEffects.playBerryGiggle()
      characterInteraction.triggerReaction('berry', 'happy_bounce', BERRY_DIALOGUES[1])
    } else if (nextCount === 3) {
      soundEffects.playBerryChirp()
      characterInteraction.triggerReaction('berry', 'shy_hide', BERRY_DIALOGUES[2])
    } else {
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
