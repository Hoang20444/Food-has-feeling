import type { InteractableId, InteractableInfo } from '../types/interaction'

/**
 * Display data, moods, and emotional messages for each kitchen object.
 *
 * Short, emotional, cozy storytelling that makes the kitchen feel alive.
 */
export const INTERACTABLES: Record<InteractableId, InteractableInfo> = {
  mug: {
    id: 'mug',
    name: 'Ceramic Mug',
    personality: 'The Anxious Mug',
    mood: 'Yearning',
    moodEmoji: '☕',
    note: 'I was warm five minutes ago...',
    whispers: [
      'I was warm five minutes ago...',
      'Please don’t let my tea go cold.',
      'Holding onto the last sip of chamomile.',
      'Someone was just here... right?',
    ],
    actionLabel: 'Check Temperature',
  },
  toaster: {
    id: 'toaster',
    name: 'Retro Toaster',
    personality: 'The Eager Toaster',
    mood: 'Playful',
    moodEmoji: '🍞',
    note: 'Someone forgot breakfast again...',
    whispers: [
      'Someone forgot breakfast again...',
      'My springs are coiled and ready to pop!',
      'Two empty slots waiting for golden toast.',
      'Did somebody say butter?',
    ],
    actionLabel: 'Press Lever',
  },
  radio: {
    id: 'radio',
    name: 'Vintage Radio',
    personality: 'The Dreamy Dial',
    mood: 'Tuning In',
    moodEmoji: '📻',
    note: 'Tuning into secret kitchen frequencies...',
    whispers: [
      'Tuning into secret kitchen frequencies...',
      'Static whispers... did you hear that hum?',
      'Playing a gentle morning melody for nobody.',
      'Between the frequencies, something is stirring.',
    ],
    actionLabel: 'Toggle Radio',
  },
  kettle: {
    id: 'kettle',
    name: 'Mint Kettle',
    personality: 'The Patient Kettle',
    mood: 'Simmering',
    moodEmoji: '🫖',
    note: 'Bubbling softly on the stove...',
    whispers: [
      'Bubbling softly on the stove...',
      'Ready to whistle whenever you are.',
      'Water is warm and ready for honey.',
      'I keep watch over the morning light.',
    ],
    actionLabel: 'Warm Up',
  },
  plate: {
    id: 'plate',
    name: 'Porcelain Plate',
    personality: 'The Faithful Plate',
    mood: 'Expectant',
    moodEmoji: '🍽️',
    note: 'Keeping this spot ready for a friend...',
    whispers: [
      'Keeping this spot ready for a friend...',
      'Empty for now, but hoping for crumbs.',
      'A cozy table is meant to be shared.',
      'Where did the morning go?',
    ],
    actionLabel: 'Tidy Up',
  },
}
