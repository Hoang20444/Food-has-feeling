/**
 * Kitchen layout + camera configuration.
 *
 * World units are roughly metres. The room is an open "diorama corner":
 * a floor slab with a back wall (−Z) and a left wall (−X). The camera always
 * looks into the corner from the open +X/+Z side.
 */
export const ROOM = {
  width: 7, // x: −3.5 … 3.5
  depth: 6, // z: −3 … 3
  wallHeight: 4,
  wallThickness: 0.2,
  slabThickness: 0.35,
} as const

export const ROOM_BOUNDS = {
  minX: -ROOM.width / 2,
  maxX: ROOM.width / 2,
  minZ: -ROOM.depth / 2,
  maxZ: ROOM.depth / 2,
} as const

const COUNTER_BODY_HEIGHT = 0.95
const COUNTER_TOP_THICKNESS = 0.1

/** Base cabinets along the back wall. */
export const COUNTER = {
  startX: ROOM_BOUNDS.minX,
  endX: 1.1,
  depth: 0.8,
  bodyHeight: COUNTER_BODY_HEIGHT,
  topThickness: COUNTER_TOP_THICKNESS,
  /** Y coordinate of the countertop's upper surface. */
  surfaceY: COUNTER_BODY_HEIGHT + COUNTER_TOP_THICKNESS,
} as const

/** Two-burner cooktop set into the counter. */
export const COOKTOP = {
  centerX: 0.35,
  centerZ: ROOM_BOUNDS.minZ + 0.42,
  /** Burner x offsets from the cooktop centre. */
  burners: [-0.18, 0.18],
  surfaceY: COUNTER_BODY_HEIGHT + COUNTER_TOP_THICKNESS + 0.025,
} as const

/** Central kitchen table. */
export const TABLE = {
  position: [0.55, 0, 0.75] as [number, number, number],
  width: 2.0,
  depth: 1.2,
  surfaceY: 0.95,
  /** Placemat (offset is x/z relative to the table centre). */
  placemat: {
    offset: [-0.4, 0.15] as [number, number],
    size: [0.6, 0.012, 0.42] as [number, number, number],
  },
} as const

/** Window centre on the back wall (above the sink). */
export const WINDOW = {
  centerX: -0.95,
  bottomY: 1.68,
  width: 1.7,
  height: 1.4,
} as const

export const CAMERA = {
  fov: 34,
  /** Orbit target: roughly the centre of the play area. */
  target: [0, 1.25, 0] as [number, number, number],
  /** Initial position, framing the whole corner. */
  position: [7.1, 6.4, 8.3] as [number, number, number],
  minDistance: 7.5,
  maxDistance: 15,
  /** Polar angle limits (radians from straight up). Keeps us above the floor. */
  minPolarAngle: 0.75,
  maxPolarAngle: 1.3,
  /** Azimuth limits (radians around Y from +Z). Keeps us on the open side. */
  minAzimuthAngle: 0.12,
  maxAzimuthAngle: 1.42,
} as const
