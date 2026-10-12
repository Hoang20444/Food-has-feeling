import { useSyncExternalStore } from 'react'
import type { MovableObjectId } from '../state/objectPositionsStore'
import type { DropZone } from './DropZones'

export interface GrabState {
  grabbedId: MovableObjectId | null
  isDragging: boolean
  hasActuallyDragged: boolean
  originPos: [number, number, number]
  currentDragPos: [number, number, number]
  candidateZone: DropZone | null
  hoveredDraggableId: MovableObjectId | null
}

let state: GrabState = {
  grabbedId: null,
  isDragging: false,
  hasActuallyDragged: false,
  originPos: [0, 0, 0],
  currentDragPos: [0, 0, 0],
  candidateZone: null,
  hoveredDraggableId: null,
}

const listeners = new Set<() => void>()

function setState(patch: Partial<GrabState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const grabSystem = {
  getState: () => state,

  startGrab: (id: MovableObjectId, startPos: [number, number, number]) => {
    setState({
      grabbedId: id,
      isDragging: true,
      hasActuallyDragged: false,
      originPos: [...startPos],
      currentDragPos: [...startPos],
      candidateZone: null,
    })
  },

  updateDragPos: (
    pos: [number, number, number],
    candidateZone: DropZone | null,
  ) => {
    const dx = pos[0] - state.originPos[0]
    const dy = pos[1] - state.originPos[1]
    const dz = pos[2] - state.originPos[2]
    const distSq = dx * dx + dy * dy + dz * dz
    const hasActuallyDragged = state.hasActuallyDragged || distSq > 0.01

    setState({
      currentDragPos: pos,
      candidateZone,
      hasActuallyDragged,
    })
  },

  endGrab: () => {
    setState({
      grabbedId: null,
      isDragging: false,
      hasActuallyDragged: false,
      candidateZone: null,
    })
  },

  setHoveredDraggable: (id: MovableObjectId | null) => {
    if (state.hoveredDraggableId !== id) {
      setState({ hoveredDraggableId: id })
    }
  },
}

export function useGrabState<T>(selector: (s: GrabState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
    () => selector(state),
  )
}
