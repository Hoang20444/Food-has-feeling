import { useSyncExternalStore } from 'react'
import { ObjectMemorySystem, type ObjectMemory } from '../interaction/ObjectMemory'
import { soundEffects } from '../shared/audio/soundEffects'
import { characterInteraction } from '../shared/interactions/characterInteraction'
import { kitchenState } from './kitchenState'
import { objectPositionsStore, type MovableObjectId } from './objectPositionsStore'
import { worldMemoryStore } from './worldMemoryStore'
import { storyEngine } from '../story/storyEngine'

export interface FriendshipDiscovery {
  id: string
  title: string
  note: string
  emoji: string
}

export interface FriendshipState {
  discoveredFriendships: Record<string, boolean>
  memories: ObjectMemory[]
  friendshipPoints: number
  recentDiscovery: FriendshipDiscovery | null
  hasMovedAnyObject: boolean
}

const STORAGE_KEY_FRIENDSHIPS = 'food_has_feelings_friendships_v1'

function loadSavedFriendships(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDSHIPS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveFriendships(f: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_FRIENDSHIPS, JSON.stringify(f))
  } catch {}
}

const initialSaved = loadSavedFriendships()
const initialMemories = ObjectMemorySystem.loadMemories()

let state: FriendshipState = {
  discoveredFriendships: {
    berry_mug_friendship: Boolean(initialSaved.berry_mug_friendship),
    berry_sunlight_memory: Boolean(initialSaved.berry_sunlight_memory),
    berry_radio_chatter: Boolean(initialSaved.berry_radio_chatter),
    toaster_tickle: Boolean(initialSaved.toaster_tickle),
    plate_table_welcoming: Boolean(initialSaved.plate_table_welcoming),
    radio_window_tune: Boolean(initialSaved.radio_window_tune),
  },
  memories: initialMemories,
  friendshipPoints: initialMemories.length * 5,
  recentDiscovery: null,
  hasMovedAnyObject: initialMemories.length > 0,
}

const listeners = new Set<() => void>()

function setState(updater: (prev: FriendshipState) => FriendshipState) {
  state = updater(state)
  listeners.forEach((l) => l())
}

export const friendshipState = {
  getState: () => state,

  recordMovement: () => {
    if (!state.hasMovedAnyObject) {
      setState((prev) => ({ ...prev, hasMovedAnyObject: true }))
    }
  },

  addMemory: (memoryParams: Omit<ObjectMemory, 'id' | 'timestamp'>) => {
    const newMem = ObjectMemorySystem.createMemory(memoryParams)
    const nextMemories = [newMem, ...state.memories]
    ObjectMemorySystem.saveMemories(nextMemories)

    setState((prev) => ({
      ...prev,
      memories: nextMemories,
      friendshipPoints: prev.friendshipPoints + 5,
      hasMovedAnyObject: true,
    }))
  },

  unlockFriendship: (
    key: string,
    points: number,
    discovery: FriendshipDiscovery,
  ) => {
    const alreadyDiscovered = Boolean(state.discoveredFriendships[key])
    const nextFriendships = {
      ...state.discoveredFriendships,
      [key]: true,
    }
    saveFriendships(nextFriendships)

    setState((prev) => ({
      ...prev,
      discoveredFriendships: nextFriendships,
      friendshipPoints: prev.friendshipPoints + (alreadyDiscovered ? 2 : points),
      recentDiscovery: discovery,
      hasMovedAnyObject: true,
    }))

    soundEffects.playFriendshipChime()

    // Auto-dismiss discovery notification after 4.5 seconds
    setTimeout(() => {
      setState((prev) => {
        if (prev.recentDiscovery?.id === discovery.id) {
          return { ...prev, recentDiscovery: null }
        }
        return prev
      })
    }, 4500)
  },

  dismissDiscovery: () => {
    setState((prev) => ({ ...prev, recentDiscovery: null }))
  },

  /**
   * Evaluates emotional reactions, dialogue, and relationships
   * after an object is placed in a zone.
   */
  evaluatePlacement: (
    objectId: MovableObjectId,
    zoneId: string,
    zoneName: string,
  ) => {
    friendshipState.recordMovement()

    // Record in World Memory (tracks favorite spots & unlocks gifts)
    worldMemoryStore.recordPlacement(objectId, zoneId)

    const allPositions = objectPositionsStore.getState()
    for (const [otherId, pos] of Object.entries(allPositions)) {
      if (otherId !== objectId && pos.currentZoneId === zoneId) {
        worldMemoryStore.recordPairing(objectId, otherId)
      }
    }

    // 1. Check for handcrafted multi-character story moments first
    const storyHandled = storyEngine.evaluatePlacementStory(objectId, zoneId, zoneName)
    if (storyHandled) {
      return
    }

    const berryZone = allPositions.berry.currentZoneId
    const mugZone = allPositions.mug.currentZoneId
    const radioZone = allPositions.radio.currentZoneId

    // 1. Berry + Sunlight / Window
    if (objectId === 'berry' && zoneId === 'window_sunlight') {
      const visitedBefore = state.discoveredFriendships.berry_sunlight_memory
      const dialogueText = visitedBefore
        ? 'You found my favorite place.'
        : 'I can see the morning better...'

      characterInteraction.triggerReaction('berry', 'happy_bounce', {
        text: dialogueText,
        mood: 'Joyful',
        emoji: '☀️',
      })

      friendshipState.unlockFriendship('berry_sunlight_memory', 15, {
        id: 'berry_sunlight',
        title: 'Morning Sunbeams',
        note: 'Berry can see the rolling hills and warm sunrise.',
        emoji: '☀️',
      })

      friendshipState.addMemory({
        objectId: 'berry',
        objectName: 'Berry',
        action: 'sunlight_basking',
        locationId: zoneId,
        locationName: zoneName,
        message: dialogueText,
        emoji: '☀️',
      })
      return
    }

    // 2. Berry + Mug Pairing
    const isBerryNearMug =
      (objectId === 'berry' && (zoneId === mugZone || (zoneId.startsWith('table_') && mugZone?.startsWith('table_')))) ||
      (objectId === 'mug' && (zoneId === berryZone || (zoneId.startsWith('table_') && berryZone?.startsWith('table_'))))

    if (isBerryNearMug) {
      kitchenState.triggerMug()
      characterInteraction.triggerReaction('berry', 'happy_bounce', {
        text: 'Your tea smells wonderful!',
        mood: 'Warm',
        emoji: '☕',
      })

      friendshipState.unlockFriendship('berry_mug_friendship', 20, {
        id: 'berry_mug',
        title: 'Tea & Strawberry',
        note: 'The Mug feels warmer with Berry nearby.',
        emoji: '☕',
      })

      friendshipState.addMemory({
        objectId: objectId === 'berry' ? 'berry' : 'mug',
        objectName: objectId === 'berry' ? 'Berry' : 'Mug',
        action: 'discovered_friendship',
        locationId: zoneId,
        locationName: zoneName,
        message: 'My tea feels warmer today.',
        emoji: '☕',
      })
      return
    }

    // 3. Berry + Radio Pairing
    const isBerryNearRadio =
      (objectId === 'berry' && (zoneId === radioZone || (zoneId.startsWith('counter_') && radioZone?.startsWith('counter_')))) ||
      (objectId === 'radio' && (zoneId === berryZone || (zoneId.startsWith('counter_') && berryZone?.startsWith('counter_'))))

    if (isBerryNearRadio) {
      if (!kitchenState.getState().radioPlaying) {
        kitchenState.toggleRadio()
      }
      characterInteraction.triggerReaction('berry', 'happy_bounce', {
        text: 'The tunes sound clearer here!',
        mood: 'Groovy',
        emoji: '📻',
      })

      friendshipState.unlockFriendship('berry_radio_chatter', 15, {
        id: 'berry_radio',
        title: 'Kitchen Radio Tunes',
        note: 'Berry and the Radio are sharing cozy morning songs.',
        emoji: '📻',
      })

      friendshipState.addMemory({
        objectId: 'berry',
        objectName: 'Berry',
        action: 'discovered_friendship',
        locationId: zoneId,
        locationName: zoneName,
        message: 'The tunes sound clearer here!',
        emoji: '📻',
      })
      return
    }

    // 4. Radio near Window
    if (objectId === 'radio' && zoneId === 'window_sunlight') {
      friendshipState.unlockFriendship('radio_window_tune', 10, {
        id: 'radio_window',
        title: 'Morning Frequencies',
        note: 'The Radio caught a crystal clear morning melody.',
        emoji: '📻',
      })
      friendshipState.addMemory({
        objectId: 'radio',
        objectName: 'Vintage Radio',
        action: 'moved',
        locationId: zoneId,
        locationName: zoneName,
        message: 'Signal improved...',
        emoji: '📻',
      })
      return
    }

    // 5. Toaster placement
    if (objectId === 'toaster') {
      kitchenState.triggerToaster()
      friendshipState.addMemory({
        objectId: 'toaster',
        objectName: 'Retro Toaster',
        action: 'moved',
        locationId: zoneId,
        locationName: zoneName,
        message: "Careful! I'm ticklish!",
        emoji: '🍞',
      })
      return
    }

    // 6. Plate placement
    if (objectId === 'plate') {
      kitchenState.triggerPlate()
      const msg = zoneId.startsWith('table_')
        ? 'Someone might come soon...'
        : 'Resting in a fresh quiet spot.'
      friendshipState.addMemory({
        objectId: 'plate',
        objectName: 'Porcelain Plate',
        action: 'moved',
        locationId: zoneId,
        locationName: zoneName,
        message: msg,
        emoji: '🍽️',
      })
      return
    }

    // 7. Generic Berry placement
    if (objectId === 'berry') {
      characterInteraction.triggerReaction('berry', 'happy_bounce', {
        text: `I like this spot on the ${zoneName}!`,
        mood: 'Curious',
        emoji: '🍓',
      })
      friendshipState.addMemory({
        objectId: 'berry',
        objectName: 'Berry',
        action: 'moved',
        locationId: zoneId,
        locationName: zoneName,
        message: `Settled happily on the ${zoneName}.`,
        emoji: '🍓',
      })
      return
    }

    // 8. Default item memory
    friendshipState.addMemory({
      objectId,
      objectName: objectId.charAt(0).toUpperCase() + objectId.slice(1),
      action: 'moved',
      locationId: zoneId,
      locationName: zoneName,
      message: `Resting softly on ${zoneName}.`,
      emoji: '✨',
    })
  },
}

export function useFriendshipState<T>(selector: (s: FriendshipState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
    () => selector(state),
  )
}
