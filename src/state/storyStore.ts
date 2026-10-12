import { useSyncExternalStore } from 'react'
import type { PostcardMemory, StoryDialogueLine } from '../story/types'

export interface StoryStoreState {
  unlockedPostcards: Record<string, PostcardMemory>
  activeDialogueLine: StoryDialogueLine | null
  postcardAlbumOpen: boolean
  newlyUnlockedPostcard: PostcardMemory | null
}

const STORAGE_KEY_POSTCARDS = 'food_has_feelings_postcards_v1'

function loadSavedPostcards(): Record<string, PostcardMemory> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTCARDS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function savePostcards(p: Record<string, PostcardMemory>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_POSTCARDS, JSON.stringify(p))
  } catch {}
}

let state: StoryStoreState = {
  unlockedPostcards: loadSavedPostcards(),
  activeDialogueLine: null,
  postcardAlbumOpen: false,
  newlyUnlockedPostcard: null,
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export const storyStore = {
  getState: () => state,

  unlockPostcard: (postcardData: Omit<PostcardMemory, 'unlockedAt'>) => {
    const already = Boolean(state.unlockedPostcards[postcardData.id])
    const fullPostcard: PostcardMemory = {
      ...postcardData,
      unlockedAt: already
        ? state.unlockedPostcards[postcardData.id].unlockedAt
        : Date.now(),
    }

    const updated = {
      ...state.unlockedPostcards,
      [fullPostcard.id]: fullPostcard,
    }

    savePostcards(updated)

    state = {
      ...state,
      unlockedPostcards: updated,
      newlyUnlockedPostcard: already ? null : fullPostcard,
    }
    notify()
  },

  setActiveDialogueLine: (line: StoryDialogueLine | null) => {
    state = { ...state, activeDialogueLine: line }
    notify()
  },

  openAlbum: () => {
    state = { ...state, postcardAlbumOpen: true, newlyUnlockedPostcard: null }
    notify()
  },

  closeAlbum: () => {
    state = { ...state, postcardAlbumOpen: false }
    notify()
  },

  dismissUnlockedToast: () => {
    state = { ...state, newlyUnlockedPostcard: null }
    notify()
  },
}

export function useStoryStore<T>(selector: (s: StoryStoreState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
    () => selector(state),
  )
}
