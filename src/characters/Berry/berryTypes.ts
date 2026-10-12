import type { CharacterDialogue, CharacterReaction, EmergencePhase } from '../../shared/interactions/characterTypes'

export interface BerryState {
  emergencePhase: EmergencePhase
  interactionCount: number
  activeReaction: CharacterReaction
  reactionStartTime: number
  isHovered: boolean
  dialogue: CharacterDialogue | null
  dialogueVisible: boolean
}

export const BERRY_DIALOGUES: CharacterDialogue[] = [
  {
    text: 'Oh... you found me.',
    mood: 'Surprised',
    emoji: '🍓',
  },
  {
    text: "Please don't tell the toaster.",
    mood: 'Playful',
    emoji: '🤫',
  },
  {
    text: 'Is it safe out here?',
    mood: 'Shy',
    emoji: '🙈',
  },
  {
    text: 'The tea smelled so good from inside the jar...',
    mood: 'Warm',
    emoji: '☕',
  },
  {
    text: 'I thought everyone forgot about breakfast...',
    mood: 'Relieved',
    emoji: '✨',
  },
  {
    text: 'Your kitchen feels very cozy.',
    mood: 'Happy',
    emoji: '🌸',
  },
]
