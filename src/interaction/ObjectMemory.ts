/**
 * ObjectMemory — The kitchen remembers player actions.
 *
 * Lightweight local memory model recording meaningful actions,
 * locations, and emotional responses.
 */

export interface ObjectMemory {
  id: string
  objectId: string
  objectName: string
  action: 'placed' | 'moved' | 'discovered_friendship' | 'sunlight_basking'
  locationId: string
  locationName: string
  timestamp: number
  message: string
  emoji: string
}

const STORAGE_KEY = 'food_has_feelings_memories_v1'

export const ObjectMemorySystem = {
  loadMemories: (): ObjectMemory[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as ObjectMemory[]
    } catch {
      return []
    }
  },

  saveMemories: (memories: ObjectMemory[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories.slice(0, 50)))
    } catch {
      // Storage quota or private browsing
    }
  },

  createMemory: (params: Omit<ObjectMemory, 'id' | 'timestamp'>): ObjectMemory => {
    return {
      ...params,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    }
  },
}
