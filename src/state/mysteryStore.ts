import { useSyncExternalStore } from 'react'

export type ChapterPhase =
  | 'comfort' // Initial cozy exploration (0-4 mins)
  | 'something_wrong' // Radio warps, clock halts at 3:15, Berry freezes (4-8 mins)
  | 'missing_memory' // 3 clues available for discovery (8-13 mins)
  | 'revelation' // All 3 clues connected, climax decision ready (13-20 mins)
  | 'chapter_complete' // Final choice made, ending active

export type BerryEmotionalState =
  | 'curious'
  | 'happy'
  | 'uneasy'
  | 'hesitant'
  | 'emotional'
  | 'peaceful'

export interface MysteryClue {
  id: 'radio_melody' | 'clock_time' | 'drawer_note'
  title: string
  shortSummary: string
  fullDescription: string
  discovered: boolean
  discoveredAt?: number
  icon: string
}

export interface MysteryState {
  phase: ChapterPhase
  berryMood: BerryEmotionalState
  clues: Record<'radio_melody' | 'clock_time' | 'drawer_note', MysteryClue>
  inspectedObjects: Record<string, number>
  drawerOpen: boolean
  noteModalOpen: boolean
  clockStopped: boolean
  radioMelodyWarped: boolean
  finalChoice: 'preserve_memory' | 'let_it_rest' | null
  climaxRevealed: boolean
}

const STORAGE_KEY = 'food_has_feelings_mystery_chapter1_v1'

const INITIAL_CLUES: Record<'radio_melody' | 'clock_time' | 'drawer_note', MysteryClue> = {
  radio_melody: {
    id: 'radio_melody',
    title: 'The Warped Radio Melody',
    shortSummary: 'A familiar song drifting out of tune...',
    fullDescription:
      'The morning radio unexpectedly broadcast a bittersweet lullaby with hesitant intervals and a missing note. Berry recognized the tune immediately.',
    discovered: false,
    icon: '📻',
  },
  clock_time: {
    id: 'clock_time',
    title: 'The Frozen Clock at 3:15',
    shortSummary: 'The kitchen clock stopped dead at 3:15.',
    fullDescription:
      'The hands of the round porcelain clock are frozen at 3:15. A gentle scratch mark behind the glass highlights the hour: tea time was never forgotten.',
    discovered: false,
    icon: '🕰️',
  },
  drawer_note: {
    id: 'drawer_note',
    title: 'The Forgotten Promise Note',
    shortSummary: 'A child’s handwritten recipe note left in the drawer.',
    fullDescription:
      '“Don’t forget our promise at tea time (3:15). If I’m late, play the radio song so Berry won’t be scared. We’ll always share breakfast.”',
    discovered: false,
    icon: '📜',
  },
}

function loadSavedMystery(): MysteryState {
  const defaultState: MysteryState = {
    phase: 'comfort',
    berryMood: 'curious',
    clues: { ...INITIAL_CLUES },
    inspectedObjects: {},
    drawerOpen: false,
    noteModalOpen: false,
    clockStopped: false,
    radioMelodyWarped: false,
    finalChoice: null,
    climaxRevealed: false,
  }

  if (typeof window === 'undefined') return defaultState

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<MysteryState>

    return {
      phase: parsed.phase || 'comfort',
      berryMood: parsed.berryMood || 'curious',
      clues: {
        radio_melody: {
          ...INITIAL_CLUES.radio_melody,
          ...(parsed.clues?.radio_melody || {}),
        },
        clock_time: {
          ...INITIAL_CLUES.clock_time,
          ...(parsed.clues?.clock_time || {}),
        },
        drawer_note: {
          ...INITIAL_CLUES.drawer_note,
          ...(parsed.clues?.drawer_note || {}),
        },
      },
      inspectedObjects: parsed.inspectedObjects || {},
      drawerOpen: Boolean(parsed.drawerOpen),
      noteModalOpen: false,
      clockStopped: Boolean(parsed.clockStopped),
      radioMelodyWarped: Boolean(parsed.radioMelodyWarped),
      finalChoice: parsed.finalChoice || null,
      climaxRevealed: Boolean(parsed.climaxRevealed),
    }
  } catch {
    return defaultState
  }
}

function saveMystery(st: MysteryState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st))
  } catch {}
}

let state: MysteryState = loadSavedMystery()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export const mysteryStore = {
  getState: () => state,

  /**
   * Tracks an object inspection and checks for Phase A -> Phase B transition.
   * Phase B triggers after player explores enough items (at least 3 unique items + radio inspected).
   */
  recordInspection: (objectId: string) => {
    const nextInspected = {
      ...state.inspectedObjects,
      [objectId]: (state.inspectedObjects[objectId] || 0) + 1,
    }

    let nextPhase = state.phase
    let nextBerryMood = state.berryMood
    let nextClockStopped = state.clockStopped
    let nextRadioWarped = state.radioMelodyWarped

    // If still in comfort phase, check if we should trigger Phase B (Something Is Wrong)
    if (state.phase === 'comfort') {
      const uniqueCount = Object.keys(nextInspected).length
      const hasCheckedRadio = Boolean(nextInspected['radio'])

      if (uniqueCount >= 3 && hasCheckedRadio) {
        nextPhase = 'something_wrong'
        nextBerryMood = 'uneasy'
        nextClockStopped = true
        nextRadioWarped = true
      }
    }

    state = {
      ...state,
      inspectedObjects: nextInspected,
      phase: nextPhase,
      berryMood: nextBerryMood,
      clockStopped: nextClockStopped,
      radioMelodyWarped: nextRadioWarped,
    }

    saveMystery(state)
    notify()
  },

  /**
   * Mark a clue as discovered and advance mystery progression.
   */
  discoverClue: (clueId: 'radio_melody' | 'clock_time' | 'drawer_note') => {
    if (state.clues[clueId].discovered) return

    const updatedClues = {
      ...state.clues,
      [clueId]: {
        ...state.clues[clueId],
        discovered: true,
        discoveredAt: Date.now(),
      },
    }

    // Check how many clues are discovered now
    const allDiscovered = Object.values(updatedClues).every((c) => c.discovered)

    let nextPhase = state.phase
    let nextBerryMood = state.berryMood

    if (allDiscovered) {
      nextPhase = 'revelation'
      nextBerryMood = 'emotional'
    } else if (state.phase === 'something_wrong' || state.phase === 'comfort') {
      nextPhase = 'missing_memory'
      nextBerryMood = 'hesitant'
    }

    state = {
      ...state,
      clues: updatedClues,
      phase: nextPhase,
      berryMood: nextBerryMood,
    }

    saveMystery(state)
    notify()
  },

  /**
   * Drawer toggle controls
   */
  toggleDrawer: () => {
    const next = !state.drawerOpen
    state = { ...state, drawerOpen: next }
    saveMystery(state)
    notify()
    return next
  },

  openNoteModal: () => {
    state = { ...state, noteModalOpen: true }
    notify()
  },

  closeNoteModal: () => {
    state = { ...state, noteModalOpen: false }
    notify()
  },

  /**
   * Climax choice at the end of the chapter
   */
  makeFinalChoice: (choice: 'preserve_memory' | 'let_it_rest') => {
    state = {
      ...state,
      finalChoice: choice,
      phase: 'chapter_complete',
      berryMood: choice === 'preserve_memory' ? 'happy' : 'peaceful',
      climaxRevealed: true,
    }
    saveMystery(state)
    notify()
  },

  /**
   * Full reset for testing and replayability
   */
  resetChapter: () => {
    state = {
      phase: 'comfort',
      berryMood: 'curious',
      clues: { ...INITIAL_CLUES },
      inspectedObjects: {},
      drawerOpen: false,
      noteModalOpen: false,
      clockStopped: false,
      radioMelodyWarped: false,
      finalChoice: null,
      climaxRevealed: false,
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
    }
    notify()
  },
}

export function useMysteryStore<T>(selector: (s: MysteryState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
    () => selector(state),
  )
}
