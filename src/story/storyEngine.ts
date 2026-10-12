import { soundEffects } from '../shared/audio/soundEffects'
import { characterInteraction } from '../shared/interactions/characterInteraction'
import { kitchenState } from '../state/kitchenState'
import { objectPositionsStore, type MovableObjectId } from '../state/objectPositionsStore'
import { storyStore } from '../state/storyStore'
import { STORY_EVENTS } from './storyEvents'
import { ObjectMemorySystem } from '../interaction/ObjectMemory'

let activeSequenceTimeout: ReturnType<typeof setTimeout> | null = null

export const storyEngine = {
  /**
   * Evaluates if the newly placed object completes a handcrafted story moment.
   * Runs naturally after placement.
   */
  evaluatePlacementStory: (
    movedId: MovableObjectId,
    targetZoneId: string,
    zoneName: string,
  ) => {
    const positions = objectPositionsStore.getState()
    const unlockedMoments = storyStore.getState().unlockedPostcards

    // Check all handcrafted events
    for (const event of STORY_EVENTS) {
      const isMatch = event.matchCondition({
        movedId,
        targetZoneId,
        positions,
        unlockedMoments: Object.fromEntries(
          Object.keys(unlockedMoments).map((k) => [k, true]),
        ),
      })

      if (isMatch) {
        storyEngine.playStorySequence(event, zoneName)
        return true
      }
    }

    // Default personality acknowledgments if no multi-character story triggered
    storyEngine.playSoloPersonalityReaction(movedId, targetZoneId, zoneName)
    return false
  },

  /**
   * Plays a sequenced emotional story moment:
   * Visual emotion communicates FIRST, followed by gentle lines of dialogue,
   * culminating in a collectible postcard memory.
   */
  playStorySequence: (
    event: (typeof STORY_EVENTS)[0],
    zoneName: string,
  ) => {
    if (activeSequenceTimeout) {
      clearTimeout(activeSequenceTimeout)
    }

    const { sequence } = event

    // 1. Trigger visual reactions & audio cue immediately
    soundEffects.playFriendshipChime()

    if (event.requiredCharacters.includes('mug')) {
      kitchenState.triggerMug()
    }
    if (event.requiredCharacters.includes('toaster')) {
      kitchenState.triggerToaster()
    }
    if (event.requiredCharacters.includes('kettle')) {
      kitchenState.triggerKettle()
    }
    if (event.requiredCharacters.includes('plate')) {
      kitchenState.triggerPlate()
    }
    if (event.requiredCharacters.includes('radio') && !kitchenState.getState().radioPlaying) {
      kitchenState.toggleRadio()
    }

    // 2. Play lines in sequence
    sequence.dialogueLines.forEach((line) => {
      setTimeout(() => {
        storyStore.setActiveDialogueLine(line)

        // If Berry is speaking, also reflect in 3D speech bubble
        if (line.speakerId === 'berry') {
          characterInteraction.triggerReaction(
            'berry',
            line.reaction || 'happy_bounce',
            {
              text: line.text,
              mood: 'Touching',
              emoji: line.emoji,
            },
          )
        }
      }, line.delayMs || 300)
    })

    // 3. Clear dialogue and award collectible postcard
    const totalDuration = (sequence.dialogueLines[sequence.dialogueLines.length - 1]?.delayMs || 3000) + 3200

    activeSequenceTimeout = setTimeout(() => {
      storyStore.setActiveDialogueLine(null)
      storyStore.unlockPostcard(sequence.postcard)

      // Also record in ObjectMemory
      ObjectMemorySystem.createMemory({
        objectId: event.requiredCharacters[0],
        objectName: sequence.postcard.characters.join(' & '),
        action: 'discovered_friendship',
        locationId: event.id,
        locationName: zoneName,
        message: sequence.postcard.message,
        emoji: sequence.postcard.stampEmoji,
      })
    }, totalDuration)
  },

  /**
   * Natural solo personality reaction when an object is placed alone.
   */
  playSoloPersonalityReaction: (
    objectId: MovableObjectId,
    targetZoneId: string,
    zoneName: string,
  ) => {
    if (objectId === 'berry') {
      if (targetZoneId === 'window_sunlight') {
        characterInteraction.triggerReaction('berry', 'curious_looking', {
          text: 'I can see the morning clouds moving...',
          mood: 'Wonder',
          emoji: '☀️',
        })
      } else {
        characterInteraction.triggerReaction('berry', 'happy_bounce', {
          text: `A peaceful spot on the ${zoneName}.`,
          mood: 'Cozy',
          emoji: '🍓',
        })
      }
    } else if (objectId === 'mug') {
      kitchenState.triggerMug()
    } else if (objectId === 'toaster') {
      kitchenState.triggerToaster()
    } else if (objectId === 'radio') {
      if (!kitchenState.getState().radioPlaying) {
        kitchenState.toggleRadio()
      }
    } else if (objectId === 'plate') {
      kitchenState.triggerPlate()
    } else if (objectId === 'kettle') {
      kitchenState.triggerKettle()
    }
  },
}
