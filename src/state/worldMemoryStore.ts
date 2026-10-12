import { useSyncExternalStore } from 'react'

export interface CharacterFavoriteSpot {
  characterId: string
  zoneId: string
  count: number
  hasGift: boolean
}

export interface WorldMemoryState {
  visitCount: number
  lastVisitTime: number
  firstVisitTime: number
  isReturningPlayer: boolean
  welcomeBackMessage: string | null

  // Drop frequency tracking: characterId -> { zoneId: count }
  dropFrequency: Record<string, Record<string, number>>

  // Pair frequency tracking: "charA+charB" -> count
  pairFrequency: Record<string, number>

  // Unlocked memory decorations earned through love and care
  unlockedDecorations: Record<string, boolean>

  // Cleaned small messes: messId -> boolean
  cleanedMesses: Record<string, boolean>

  // Care moments count
  careInteractionsCount: number
}

const STORAGE_KEY_WORLD_MEMORY = 'food_has_feelings_world_memory_v1'

const WELCOME_MESSAGES = [
  "Welcome back! The kettle kept today's warmth safe for you.",
  "The kitchen missed your gentle hands. The sun is shining.",
  "Berry saw you coming! The little strawberry is waving.",
  "A cozy day begins again. Everyone is glad you're here.",
]

function loadSavedWorldMemory(): WorldMemoryState {
  const defaultState: WorldMemoryState = {
    visitCount: 1,
    lastVisitTime: Date.now(),
    firstVisitTime: Date.now(),
    isReturningPlayer: false,
    welcomeBackMessage: null,
    dropFrequency: {},
    pairFrequency: {},
    unlockedDecorations: {},
    cleanedMesses: {},
    careInteractionsCount: 0,
  }

  if (typeof window === 'undefined') return defaultState

  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORLD_MEMORY)
    if (!raw) return defaultState

    const parsed = JSON.parse(raw) as Partial<WorldMemoryState>
    const now = Date.now()
    const lastVisit = parsed.lastVisitTime || now
    // If returning after at least 1 minute or new session
    const isReturning = (parsed.visitCount || 0) >= 1 && (now - lastVisit > 60000 || !sessionStorage.getItem('fhf_session_active'))

    sessionStorage.setItem('fhf_session_active', 'true')

    const randomWelcome = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]

    const updatedState: WorldMemoryState = {
      visitCount: (parsed.visitCount || 0) + 1,
      lastVisitTime: now,
      firstVisitTime: parsed.firstVisitTime || now,
      isReturningPlayer: isReturning,
      welcomeBackMessage: isReturning ? randomWelcome : null,
      dropFrequency: parsed.dropFrequency || {},
      pairFrequency: parsed.pairFrequency || {},
      unlockedDecorations: parsed.unlockedDecorations || {},
      cleanedMesses: parsed.cleanedMesses || {},
      careInteractionsCount: parsed.careInteractionsCount || 0,
    }

    // Save updated visit count
    localStorage.setItem(STORAGE_KEY_WORLD_MEMORY, JSON.stringify(updatedState))
    return updatedState
  } catch {
    return defaultState
  }
}

function saveWorldMemory(st: WorldMemoryState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_WORLD_MEMORY, JSON.stringify(st))
  } catch {}
}

let state: WorldMemoryState = loadSavedWorldMemory()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export const worldMemoryStore = {
  getState: () => state,

  dismissWelcomeMessage: () => {
    state = { ...state, welcomeBackMessage: null }
    notify()
  },

  /**
   * Record when a character is placed at a specific drop zone.
   * If placed repeatedly (>= 2 times), a special memory decoration sprouts!
   */
  recordPlacement: (characterId: string, zoneId: string) => {
    const charDrops = { ...(state.dropFrequency[characterId] || {}) }
    charDrops[zoneId] = (charDrops[zoneId] || 0) + 1

    const updatedDropFrequency = {
      ...state.dropFrequency,
      [characterId]: charDrops,
    }

    const updatedDecorations = { ...state.unlockedDecorations }

    // Berry favorite spot: window sill
    if (characterId === 'berry' && zoneId === 'window_sunlight' && charDrops[zoneId] >= 2) {
      updatedDecorations.berry_window_blossom = true
    }

    // Mug favorite spot: cooktop or table
    if (characterId === 'mug' && (zoneId === 'table_placemat' || zoneId === 'cooktop_burner_front') && charDrops[zoneId] >= 2) {
      updatedDecorations.mug_cozy_coaster = true
    }

    // Toaster favorite spot: breakfast placemat
    if (characterId === 'toaster' && zoneId === 'table_placemat' && charDrops[zoneId] >= 2) {
      updatedDecorations.toaster_butter_dish = true
    }

    state = {
      ...state,
      dropFrequency: updatedDropFrequency,
      unlockedDecorations: updatedDecorations,
    }

    saveWorldMemory(state)
    notify()
  },

  /**
   * Record when two friends are placed near each other.
   */
  recordPairing: (charA: string, charB: string) => {
    const key = [charA, charB].sort().join('+')
    const currentCount = state.pairFrequency[key] || 0
    const updatedPairFrequency = {
      ...state.pairFrequency,
      [key]: currentCount + 1,
    }

    state = {
      ...state,
      pairFrequency: updatedPairFrequency,
    }

    saveWorldMemory(state)
    notify()
  },

  /**
   * Check if a character has a favorite spot in the kitchen.
   */
  getFavoriteSpot: (characterId: string): string | null => {
    const drops = state.dropFrequency[characterId]
    if (!drops) return null
    let maxZone: string | null = null
    let maxCount = 0
    for (const [zone, count] of Object.entries(drops)) {
      if (count >= 2 && count > maxCount) {
        maxCount = count
        maxZone = zone
      }
    }
    return maxZone
  },

  /**
   * Record a gentle nurturing care interaction.
   */
  recordCare: () => {
    state = {
      ...state,
      careInteractionsCount: state.careInteractionsCount + 1,
    }
    saveWorldMemory(state)
    notify()
  },

  /**
   * Clean a small kitchen mess.
   */
  cleanMess: (messId: string) => {
    if (state.cleanedMesses[messId]) return
    const updatedMesses = {
      ...state.cleanedMesses,
      [messId]: true,
    }
    state = {
      ...state,
      cleanedMesses: updatedMesses,
    }
    saveWorldMemory(state)
    notify()
  },
}

export function useWorldMemoryStore<T>(selector: (s: WorldMemoryState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
    () => selector(state),
  )
}
