import { useSyncExternalStore } from 'react'

export type MovableObjectId = 'plate' | 'mug' | 'radio' | 'toaster' | 'kettle' | 'berry'

export interface ObjectTransformState {
  id: MovableObjectId
  position: [number, number, number]
  rotationY: number
  currentZoneId: string | null
}

const INITIAL_POSITIONS: Record<MovableObjectId, ObjectTransformState> = {
  plate: {
    id: 'plate',
    position: [0.15, 0.962, 0.90],
    rotationY: 0,
    currentZoneId: 'table_placemat',
  },
  mug: {
    id: 'mug',
    position: [0.70, 0.95, 1.00],
    rotationY: -0.4,
    currentZoneId: 'table_tea_spot',
  },
  radio: {
    id: 'radio',
    position: [-2.45, 1.05, -2.58],
    rotationY: 0.3,
    currentZoneId: 'counter_radio',
  },
  toaster: {
    id: 'toaster',
    position: [-0.32, 1.05, -2.62],
    rotationY: -0.15,
    currentZoneId: 'counter_prep',
  },
  kettle: {
    id: 'kettle',
    position: [0.17, 1.075, -2.58],
    rotationY: 0.2,
    currentZoneId: 'cooktop_burner_front',
  },
  berry: {
    id: 'berry',
    position: [0.16, 2.435, -2.80],
    rotationY: 0.35,
    currentZoneId: 'pantry_shelf',
  },
}

let positions: Record<MovableObjectId, ObjectTransformState> = { ...INITIAL_POSITIONS }
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export const objectPositionsStore = {
  getState: () => positions,
  getPosition: (id: MovableObjectId) => positions[id]?.position || [0, 0, 0],
  getZone: (id: MovableObjectId) => positions[id]?.currentZoneId || null,

  setPosition: (
    id: MovableObjectId,
    position: [number, number, number],
    zoneId: string | null = null,
    rotationY?: number,
  ) => {
    positions = {
      ...positions,
      [id]: {
        ...positions[id],
        position,
        currentZoneId: zoneId !== undefined ? zoneId : positions[id].currentZoneId,
        rotationY: rotationY !== undefined ? rotationY : positions[id].rotationY,
      },
    }
    notify()
  },

  resetPositions: () => {
    positions = { ...INITIAL_POSITIONS }
    notify()
  },
}

export function useObjectPosition<T>(selector: (state: Record<MovableObjectId, ObjectTransformState>) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(positions),
    () => selector(positions),
  )
}
