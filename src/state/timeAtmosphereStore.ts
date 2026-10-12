import { useSyncExternalStore } from 'react'

export type TimeAtmosphere = 'morning' | 'afternoon' | 'evening'

export interface TimeAtmosphereState {
  current: TimeAtmosphere
  isCameraMode: boolean
  lastPhotoTaken: string | null
}

const STORAGE_KEY_TIME = 'food_has_feelings_time_atmosphere_v1'

function getInitialTime(): TimeAtmosphere {
  if (typeof window === 'undefined') return 'morning'
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TIME) as TimeAtmosphere
    if (saved === 'morning' || saved === 'afternoon' || saved === 'evening') {
      return saved
    }
  } catch {}

  // Auto-detect based on real local hour
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 13) return 'morning'
  if (hour >= 13 && hour < 18) return 'afternoon'
  return 'evening'
}

let state: TimeAtmosphereState = {
  current: getInitialTime(),
  isCameraMode: false,
  lastPhotoTaken: null,
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export const timeAtmosphereStore = {
  getState: () => state,

  setAtmosphere: (time: TimeAtmosphere) => {
    state = { ...state, current: time }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_TIME, time)
      } catch {}
    }
    notify()
  },

  cycleAtmosphere: () => {
    const sequence: TimeAtmosphere[] = ['morning', 'afternoon', 'evening']
    const nextIdx = (sequence.indexOf(state.current) + 1) % sequence.length
    timeAtmosphereStore.setAtmosphere(sequence[nextIdx])
  },

  setCameraMode: (active: boolean) => {
    state = { ...state, isCameraMode: active }
    notify()
  },

  setLastPhotoTaken: (dataUrl: string | null) => {
    state = { ...state, lastPhotoTaken: dataUrl }
    notify()
  },
}

export function useTimeAtmosphere<T>(selector: (s: TimeAtmosphereState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
    () => selector(state),
  )
}
