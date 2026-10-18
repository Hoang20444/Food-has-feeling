import { useSyncExternalStore } from 'react'
import type { CharacterDialogue, CharacterId, CharacterReaction, EmergencePhase } from './characterTypes'

export interface CharacterItemState {
  id: CharacterId
  emergencePhase: EmergencePhase
  interactionCount: number
  activeReaction: CharacterReaction
  reactionStartTime: number
  isHovered: boolean
  dialogue: CharacterDialogue | null
  dialogueVisible: boolean
}

interface CharactersGlobalState {
  characters: Record<CharacterId, CharacterItemState>
  selectedCharacterId: CharacterId | null
}

const defaultCharacterState = (id: CharacterId): CharacterItemState => ({
  id,
  emergencePhase: id === 'berry' ? 'settled' : 'hidden',
  interactionCount: 0,
  activeReaction: 'none',
  reactionStartTime: 0,
  isHovered: false,
  dialogue: null,
  dialogueVisible: false,
})

let state: CharactersGlobalState = {
  characters: {
    berry: defaultCharacterState('berry'),
    bread: defaultCharacterState('bread'),
    egg: defaultCharacterState('egg'),
    lemon: defaultCharacterState('lemon'),
    mushroom: defaultCharacterState('mushroom'),
  },
  selectedCharacterId: null,
}

const listeners = new Set<() => void>()

function setState(updater: (prev: CharactersGlobalState) => CharactersGlobalState) {
  state = updater(state)
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const characterInteraction = {
  getState: () => state,

  getCharacter: (id: CharacterId): CharacterItemState => {
    return state.characters[id] || defaultCharacterState(id)
  },

  setEmergencePhase: (id: CharacterId, phase: EmergencePhase) => {
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          emergencePhase: phase,
        },
      },
    }))
  },

  hover: (id: CharacterId) => {
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          isHovered: true,
        },
      },
    }))
  },

  unhover: (id: CharacterId) => {
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          isHovered: false,
        },
      },
    }))
  },

  triggerReaction: (
    id: CharacterId,
    reaction: CharacterReaction,
    dialogue: CharacterDialogue | null,
  ) => {
    const now = performance.now()
    setState((prev) => ({
      ...prev,
      selectedCharacterId: id,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          interactionCount: prev.characters[id].interactionCount + 1,
          activeReaction: reaction,
          reactionStartTime: now,
          dialogue,
          dialogueVisible: Boolean(dialogue),
        },
      },
    }))
  },

  clearReaction: (id: CharacterId) => {
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          activeReaction: 'none',
        },
      },
    }))
  },

  dismissDialogue: (id: CharacterId) => {
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          dialogueVisible: false,
        },
      },
    }))
  },

  clearSelection: () => {
    setState((prev) => ({
      ...prev,
      selectedCharacterId: null,
    }))
  },
}

export function useCharacterState<T>(selector: (s: CharactersGlobalState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}
