/**
 * DropZones — Controlled, toy-like snap positions across the kitchen diorama.
 *
 * Each drop zone represents a safe, meaningful surface where objects can rest,
 * snap into place, and discover relationships with surrounding friends.
 */

export interface DropZone {
  id: string
  name: string
  position: [number, number, number]
  radius: number // Snap threshold in meters
  surfaceY: number
  tags: string[]
  allowedObjectTypes?: string[] // optional filter, otherwise accepts any item
}

export const DROP_ZONES: DropZone[] = [
  {
    id: 'window_sunlight',
    name: 'Sunlit Window Sill',
    position: [-0.95, 1.64, -2.88],
    surfaceY: 1.64,
    radius: 0.55,
    tags: ['window', 'sunlight', 'warmth', 'view'],
  },
  {
    id: 'table_placemat',
    name: 'Breakfast Placemat',
    position: [0.15, 0.962, 0.90],
    surfaceY: 0.962,
    radius: 0.45,
    tags: ['table', 'placemat', 'dining', 'center'],
  },
  {
    id: 'table_tea_spot',
    name: 'Tea Spot on Table',
    position: [0.70, 0.95, 1.00],
    surfaceY: 0.95,
    radius: 0.45,
    tags: ['table', 'tea', 'dining'],
  },
  {
    id: 'table_center',
    name: 'Table Center',
    position: [0.55, 0.95, 0.75],
    surfaceY: 0.95,
    radius: 0.48,
    tags: ['table', 'gathering'],
  },
  {
    id: 'counter_prep',
    name: 'Prep Counter',
    position: [-0.32, 1.05, -2.62],
    surfaceY: 1.05,
    radius: 0.45,
    tags: ['counter', 'prep'],
  },
  {
    id: 'counter_radio',
    name: 'Radio Nook',
    position: [-2.45, 1.05, -2.58],
    surfaceY: 1.05,
    radius: 0.48,
    tags: ['counter', 'music'],
  },
  {
    id: 'counter_middle',
    name: 'Sink Side Counter',
    position: [-1.75, 1.05, -2.58],
    surfaceY: 1.05,
    radius: 0.45,
    tags: ['counter', 'sink'],
  },
  {
    id: 'cooktop_burner_front',
    name: 'Front Stove Burner',
    position: [0.17, 1.075, -2.58],
    surfaceY: 1.075,
    radius: 0.40,
    tags: ['cooktop', 'burner'],
  },
  {
    id: 'cooktop_burner_back',
    name: 'Back Stove Burner',
    position: [0.53, 1.075, -2.58],
    surfaceY: 1.075,
    radius: 0.40,
    tags: ['cooktop', 'burner'],
  },
  {
    id: 'pantry_shelf',
    name: 'High Pantry Shelf',
    position: [0.16, 2.435, -2.80],
    surfaceY: 2.435,
    radius: 0.45,
    tags: ['shelf', 'secret', 'jar'],
  },
]

/**
 * Finds the closest valid drop zone within snap threshold radius.
 */
export function findNearestDropZone(
  pos: [number, number, number],
  ignoreZoneId?: string | null,
): { zone: DropZone; distance: number } | null {
  let closest: DropZone | null = null
  let minDistance = Infinity

  for (const zone of DROP_ZONES) {
    if (ignoreZoneId && zone.id === ignoreZoneId) continue

    // Distance calculation on 3D coordinates (with extra weighting on horizontal plane)
    const dx = pos[0] - zone.position[0]
    const dy = (pos[1] - zone.position[1]) * 0.8
    const dz = pos[2] - zone.position[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < zone.radius && dist < minDistance) {
      minDistance = dist
      closest = zone
    }
  }

  if (closest) {
    return { zone: closest, distance: minDistance }
  }
  return null
}
