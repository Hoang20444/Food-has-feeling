/**
 * Shared interaction types.
 *
 * Every interactable object in the kitchen is identified by a stable string id.
 * Later phases (food characters, reactions) can key behaviour off these ids
 * without depending on how the object is rendered.
 */
export type InteractableId = 'plate' | 'mug' | 'radio' | 'toaster' | 'kettle' | 'clock' | 'drawer'

export interface InteractableInfo {
  id: InteractableId
  /** Short display name shown in the interaction label. */
  name: string
  /** Quirky personality title (e.g. "The Anxious Mug") */
  personality: string
  /** Emotional state / mood (e.g. "Yearning", "Playful") */
  mood: string
  /** Emoji representing the mood or item */
  moodEmoji: string
  /** Primary short emotional message */
  note: string
  /** Additional emotional thoughts that cycle on interaction */
  whispers: string[]
  /** Optional interactive action label (e.g. "Turn Off", "Push Lever") */
  actionLabel?: string
}

export interface InteractionState {
  hoveredId: InteractableId | null
  selectedId: InteractableId | null
}
