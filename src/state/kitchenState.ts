import { useSyncExternalStore } from 'react'
import { soundEffects } from '../shared/audio/soundEffects'
import type { InteractableId } from '../types/interaction'

export interface KitchenState {
  /** Unique objects that have been inspected at least once. */
  inspectedIds: InteractableId[]
  /** Dynamic interaction toggles & reaction states */
  radioPlaying: boolean
  toasterPopped: boolean
  kettleHeating: boolean
  mugWarmed: boolean
  plateWobbled: boolean
  /** Whether the secret "Kitchen Wakes Up" event has been unlocked */
  kitchenAwakened: boolean
  awakenedNoticeVisible: boolean
  /** Current whisper cycle index per object */
  whisperIndices: Record<InteractableId, number>
  /** Count of total interaction reactions triggered */
  reactionCount: number
}

const initialState: KitchenState = {
  inspectedIds: [],
  radioPlaying: false,
  toasterPopped: false,
  kettleHeating: false,
  mugWarmed: false,
  plateWobbled: false,
  kitchenAwakened: false,
  awakenedNoticeVisible: false,
  whisperIndices: {
    mug: 0,
    toaster: 0,
    radio: 0,
    kettle: 0,
    plate: 0,
    clock: 0,
    drawer: 0,
  },
  reactionCount: 0,
}

let state: KitchenState = { ...initialState }
const listeners = new Set<() => void>()

function setState(patch: Partial<KitchenState> | ((prev: KitchenState) => Partial<KitchenState>)) {
  const updates = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...updates }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Threshold of unique items inspected before the secret Kitchen Awakening triggers */
const AWAKENING_THRESHOLD = 3

export const kitchenState = {
  getState: () => state,

  /** Record that an object was inspected, cycling its whisper and checking awakening */
  recordInspection: (id: InteractableId) => {
    const isNew = !state.inspectedIds.includes(id)
    const nextInspected = isNew ? [...state.inspectedIds, id] : state.inspectedIds
    const nextWhisperIndex = ((state.whisperIndices[id] || 0) + 1) % 4

    const shouldAwaken = !state.kitchenAwakened && nextInspected.length >= AWAKENING_THRESHOLD

    setState({
      inspectedIds: nextInspected,
      whisperIndices: {
        ...state.whisperIndices,
        [id]: nextWhisperIndex,
      },
    })

    if (shouldAwaken) {
      kitchenState.triggerAwakening()
    }
  },

  /** Manually or automatically trigger the secret Kitchen Awakening event */
  triggerAwakening: () => {
    if (state.kitchenAwakened) return
    setState({
      kitchenAwakened: true,
      awakenedNoticeVisible: true,
    })
    soundEffects.playAwakeningChime()
  },

  dismissAwakeningNotice: () => {
    setState({ awakenedNoticeVisible: false })
  },

  /** Toggle Radio on/off */
  toggleRadio: () => {
    const next = !state.radioPlaying
    setState({ radioPlaying: next, reactionCount: state.reactionCount + 1 })
    if (next) {
      soundEffects.startRadioHum()
    } else {
      soundEffects.stopRadioHum()
    }
  },

  /** Trigger Toaster spring pop */
  triggerToaster: () => {
    setState({ toasterPopped: true, reactionCount: state.reactionCount + 1 })
    soundEffects.playToasterPop()
    setTimeout(() => {
      setState({ toasterPopped: false })
    }, 1800)
  },

  /** Trigger Kettle simmer steam & warmth */
  triggerKettle: () => {
    setState({ kettleHeating: true, reactionCount: state.reactionCount + 1 })
    soundEffects.playKettleWhistle()
    setTimeout(() => {
      setState({ kettleHeating: false })
    }, 2200)
  },

  /** Trigger Mug vibration & steam */
  triggerMug: () => {
    setState({ mugWarmed: true, reactionCount: state.reactionCount + 1 })
    soundEffects.playMugWarmth()
    setTimeout(() => {
      setState({ mugWarmed: false })
    }, 1600)
  },

  /** Trigger Plate gentle wobble */
  triggerPlate: () => {
    setState({ plateWobbled: true, reactionCount: state.reactionCount + 1 })
    soundEffects.playPlateClink()
    setTimeout(() => {
      setState({ plateWobbled: false })
    }, 1400)
  },
}

/** React hook for subscribing to kitchen state */
export function useKitchenState<T>(selector: (s: KitchenState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}
