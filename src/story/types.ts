import type { CharacterReaction } from '../shared/interactions/characterTypes'

export interface PersonalityProfile {
  id: string
  name: string
  title: string
  traits: string[]
  loves: string
  voiceTone: string
  idleBehavior: string
}

export interface StoryDialogueLine {
  speakerId: string
  speakerName: string
  emoji: string
  text: string
  reaction?: CharacterReaction
  delayMs?: number
}

export interface PostcardMemory {
  id: string
  title: string
  characters: string[]
  characterEmojis: string[]
  locationName: string
  message: string
  stampEmoji: string
  accentColor: string
  unlockedAt: number
  hint: string
}

export interface StoryEventDefinition {
  id: string
  title: string
  requiredCharacters: string[]
  matchCondition: (context: {
    movedId: string
    targetZoneId: string
    positions: Record<string, { currentZoneId: string | null; position: [number, number, number] }>
    unlockedMoments: Record<string, boolean>
  }) => boolean
  sequence: {
    visualReactionDurationMs: number
    dialogueLines: StoryDialogueLine[]
    postcard: Omit<PostcardMemory, 'unlockedAt'>
  }
}
