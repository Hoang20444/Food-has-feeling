/**
 * Shared character types supporting current and future living food friends.
 */

export type CharacterId = 'berry' | 'bread' | 'egg' | 'lemon' | 'mushroom'

export type EmergencePhase =
  | 'hidden'
  | 'peeking'
  | 'emerging'
  | 'looking_around'
  | 'settled'

export type CharacterReaction =
  | 'none'
  | 'noticed'
  | 'happy_bounce'
  | 'shy_hide'
  | 'curious_looking'
  | 'sleepy_idle'
  | 'excited_reaction'

export interface CharacterDialogue {
  text: string
  mood: string
  emoji: string
}
