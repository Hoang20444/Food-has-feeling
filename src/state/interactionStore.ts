import { useSyncExternalStore } from 'react'
import type { InteractableId, InteractionState } from '../types/interaction'

/**
 * A tiny external store for hover / selection state.
 *
 * Built on `useSyncExternalStore` so it works identically inside the R3F
 * canvas and in the DOM UI, with no extra dependency.
 */
let state: InteractionState = { hoveredId: null, selectedId: null }
const listeners = new Set<() => void>()

function setState(patch: Partial<InteractionState>) {
  const next = { ...state, ...patch }
  if (next.hoveredId === state.hoveredId && next.selectedId === state.selectedId) return
  state = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const interaction = {
  getState: () => state,
  hover: (id: InteractableId) => setState({ hoveredId: id }),
  unhover: (id: InteractableId) => {
    if (state.hoveredId === id) setState({ hoveredId: null })
  },
  select: (id: InteractableId) => setState({ selectedId: id }),
  clearSelection: () => setState({ selectedId: null }),
}

/** Subscribe to a slice of the interaction state. */
export function useInteraction<T>(selector: (s: InteractionState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

/**
 * Distinguish a real click from the end of an orbit drag.
 * The canvas wrapper records where the pointer went down; clicks that travel
 * further than a few pixels are treated as camera drags and ignored.
 */
const DRAG_THRESHOLD_PX = 5
let downX = 0
let downY = 0

export function recordPointerDown(x: number, y: number) {
  downX = x
  downY = y
}

export function wasDrag(x: number, y: number) {
  return Math.hypot(x - downX, y - downY) > DRAG_THRESHOLD_PX
}
