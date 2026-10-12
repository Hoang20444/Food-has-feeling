import type { StoryEventDefinition } from './types'

export const STORY_EVENTS: StoryEventDefinition[] = [
  // 1. Berry + Mug + Window
  {
    id: 'first_morning_together',
    title: 'First Morning Together',
    requiredCharacters: ['berry', 'mug'],
    matchCondition: ({ targetZoneId, positions, unlockedMoments }) => {
      if (unlockedMoments.first_morning_together) return false
      const bZone = positions.berry?.currentZoneId
      const mZone = positions.mug?.currentZoneId

      // Both near window or placed at window while the other is also there
      const atWindow =
        (targetZoneId === 'window_sunlight' && (bZone === 'window_sunlight' || mZone === 'window_sunlight')) ||
        (bZone === 'window_sunlight' && mZone === 'window_sunlight')

      return Boolean(atWindow)
    },
    sequence: {
      visualReactionDurationMs: 900,
      dialogueLines: [
        {
          speakerId: 'berry',
          speakerName: 'Berry',
          emoji: '🍓',
          text: 'Look! The morning sun is pouring right over the tea!',
          reaction: 'excited_reaction',
          delayMs: 300,
        },
        {
          speakerId: 'mug',
          speakerName: 'Mug',
          emoji: '☕',
          text: 'My tea feels so much warmer with a friend beside me.',
          delayMs: 2400,
        },
        {
          speakerId: 'berry',
          speakerName: 'Berry',
          emoji: '🍓',
          text: 'I think this is my happiest morning ever.',
          reaction: 'happy_bounce',
          delayMs: 4400,
        },
      ],
      postcard: {
        id: 'first_morning_together',
        title: 'First Morning Together',
        characters: ['Berry', 'Mug'],
        characterEmojis: ['🍓', '☕'],
        locationName: 'Sunlit Window Sill',
        message: 'Berry discovered sunlight with a caring friend by the morning sill.',
        stampEmoji: '☀️',
        accentColor: '#e0625a',
        hint: 'Bring Berry and the Mug together by the sunlit window.',
      },
    },
  },

  // 2. Toaster + Plate
  {
    id: 'breakfast_promise',
    title: 'Breakfast Promise',
    requiredCharacters: ['toaster', 'plate'],
    matchCondition: ({ positions, unlockedMoments }) => {
      if (unlockedMoments.breakfast_promise) return false
      const tZone = positions.toaster?.currentZoneId
      const pZone = positions.plate?.currentZoneId
      if (!tZone || !pZone) return false

      // Close together on table or on prep counter
      const tableShared = tZone.startsWith('table_') && pZone.startsWith('table_')
      const counterShared = tZone.startsWith('counter_') && pZone.startsWith('counter_')
      return tableShared || counterShared || tZone === pZone
    },
    sequence: {
      visualReactionDurationMs: 800,
      dialogueLines: [
        {
          speakerId: 'toaster',
          speakerName: 'Toaster',
          emoji: '🍞',
          text: "Nobody made toast today... did they forget about me?",
          reaction: 'shy_hide',
          delayMs: 300,
        },
        {
          speakerId: 'plate',
          speakerName: 'Plate',
          emoji: '🍽️',
          text: "I'm keeping this spot ready for your golden toast.",
          delayMs: 2300,
        },
        {
          speakerId: 'toaster',
          speakerName: 'Toaster',
          emoji: '🍞',
          text: "Really? You mean it? My springs feel lighter already!",
          reaction: 'happy_bounce',
          delayMs: 4300,
        },
      ],
      postcard: {
        id: 'breakfast_promise',
        title: 'Breakfast Promise',
        characters: ['Toaster', 'Plate'],
        characterEmojis: ['🍞', '🍽️'],
        locationName: 'Breakfast Counter',
        message: 'When the toaster felt forgotten, the faithful plate promised to wait for its golden toast.',
        stampEmoji: '✨',
        accentColor: '#e8b95a',
        hint: 'Place the Retro Toaster and Porcelain Plate beside each other.',
      },
    },
  },

  // 3. Kettle + Mug
  {
    id: 'freshly_steeped',
    title: 'Freshly Steeped',
    requiredCharacters: ['kettle', 'mug'],
    matchCondition: ({ positions, unlockedMoments }) => {
      if (unlockedMoments.freshly_steeped) return false
      const kZone = positions.kettle?.currentZoneId
      const mZone = positions.mug?.currentZoneId
      if (!kZone || !mZone) return false

      const tableShared = kZone.startsWith('table_') && mZone.startsWith('table_')
      const counterShared =
        (kZone.startsWith('counter_') || kZone.startsWith('cooktop_')) &&
        (mZone.startsWith('counter_') || mZone.startsWith('cooktop_'))
      return tableShared || counterShared || kZone === mZone
    },
    sequence: {
      visualReactionDurationMs: 800,
      dialogueLines: [
        {
          speakerId: 'kettle',
          speakerName: 'Kettle',
          emoji: '🫖',
          text: "Fresh chamomile water, piping hot and ready for tea!",
          delayMs: 300,
        },
        {
          speakerId: 'mug',
          speakerName: 'Mug',
          emoji: '☕',
          text: "Ahhh... just what I needed to keep my warmth all morning.",
          delayMs: 2300,
        },
      ],
      postcard: {
        id: 'freshly_steeped',
        title: 'Freshly Steeped',
        characters: ['Kettle', 'Mug'],
        characterEmojis: ['🫖', '☕'],
        locationName: 'Tea Prep Nook',
        message: 'The patient kettle shared its hot water to keep the anxious mug comforted and warm.',
        stampEmoji: '🫖',
        accentColor: '#9fcfb4',
        hint: 'Place the Mint Kettle and Ceramic Mug together.',
      },
    },
  },

  // 4. Berry + Plate on Dining Table
  {
    id: 'a_place_at_the_table',
    title: 'A Place at the Table',
    requiredCharacters: ['berry', 'plate'],
    matchCondition: ({ targetZoneId, positions, unlockedMoments }) => {
      if (unlockedMoments.a_place_at_the_table) return false
      const bZone = positions.berry?.currentZoneId
      const pZone = positions.plate?.currentZoneId

      const isTablePlacemat = targetZoneId === 'table_placemat' || bZone === 'table_placemat'
      const plateNear = pZone?.startsWith('table_')

      return Boolean(isTablePlacemat && plateNear)
    },
    sequence: {
      visualReactionDurationMs: 900,
      dialogueLines: [
        {
          speakerId: 'berry',
          speakerName: 'Berry',
          emoji: '🍓',
          text: 'Is this special spot set just for me?',
          reaction: 'curious_looking',
          delayMs: 300,
        },
        {
          speakerId: 'plate',
          speakerName: 'Plate',
          emoji: '🍽️',
          text: 'The finest seat in the kitchen was always waiting for you.',
          delayMs: 2300,
        },
        {
          speakerId: 'berry',
          speakerName: 'Berry',
          emoji: '🍓',
          text: 'I feel like I truly belong here now.',
          reaction: 'happy_bounce',
          delayMs: 4300,
        },
      ],
      postcard: {
        id: 'a_place_at_the_table',
        title: 'A Place at the Table',
        characters: ['Berry', 'Plate'],
        characterEmojis: ['🍓', '🍽️'],
        locationName: 'Breakfast Placemat',
        message: 'Berry found a welcome place setting at the dining table, feeling truly at home.',
        stampEmoji: '🌸',
        accentColor: '#f5d27e',
        hint: 'Bring Berry to visit the Porcelain Plate on the dining placemat.',
      },
    },
  },

  // 5. Berry + Radio
  {
    id: 'morning_symphony',
    title: 'Morning Symphony',
    requiredCharacters: ['berry', 'radio'],
    matchCondition: ({ positions, unlockedMoments }) => {
      if (unlockedMoments.morning_symphony) return false
      const bZone = positions.berry?.currentZoneId
      const rZone = positions.radio?.currentZoneId
      if (!bZone || !rZone) return false

      const sharedCounter = bZone.startsWith('counter_') && rZone.startsWith('counter_')
      const sharedTable = bZone.startsWith('table_') && rZone.startsWith('table_')
      return sharedCounter || sharedTable || bZone === rZone
    },
    sequence: {
      visualReactionDurationMs: 800,
      dialogueLines: [
        {
          speakerId: 'radio',
          speakerName: 'Radio',
          emoji: '📻',
          text: 'Catching the morning frequency... a tune just for friends!',
          delayMs: 300,
        },
        {
          speakerId: 'berry',
          speakerName: 'Berry',
          emoji: '🍓',
          text: 'It feels like the whole kitchen is dancing with us.',
          reaction: 'happy_bounce',
          delayMs: 2300,
        },
      ],
      postcard: {
        id: 'morning_symphony',
        title: 'Morning Symphony',
        characters: ['Berry', 'Radio'],
        characterEmojis: ['🍓', '📻'],
        locationName: 'Kitchen Radio Nook',
        message: 'Between the static frequencies, the radio and Berry shared a secret morning tune.',
        stampEmoji: '🎶',
        accentColor: '#c99a6b',
        hint: 'Place Berry next to the Vintage Radio to listen to morning tunes.',
      },
    },
  },

  // 6. Glimpse of the World (Berry solo at window)
  {
    id: 'glimpse_of_the_world',
    title: 'A Glimpse of the World',
    requiredCharacters: ['berry'],
    matchCondition: ({ targetZoneId, positions, unlockedMoments }) => {
      if (unlockedMoments.glimpse_of_the_world) return false
      const bZone = positions.berry?.currentZoneId
      return targetZoneId === 'window_sunlight' || bZone === 'window_sunlight'
    },
    sequence: {
      visualReactionDurationMs: 900,
      dialogueLines: [
        {
          speakerId: 'berry',
          speakerName: 'Berry',
          emoji: '☀️',
          text: 'I can see the rolling hills and clouds... the world is so gentle.',
          reaction: 'curious_looking',
          delayMs: 300,
        },
      ],
      postcard: {
        id: 'glimpse_of_the_world',
        title: 'A Glimpse of the World',
        characters: ['Berry'],
        characterEmojis: ['🍓'],
        locationName: 'Sunlit Window Sill',
        message: 'Berry looked out beyond the glass, realizing how vast and beautiful the morning is.',
        stampEmoji: '☀️',
        accentColor: '#cfe7e6',
        hint: 'Place Berry on the sunlit window sill to gaze outside.',
      },
    },
  },
]
