import { MathUtils } from 'three'
import type { BerryEmotionalState } from '../../state/mysteryStore'

export type WanderActivity = 'idle' | 'walking' | 'looking_around' | 'hopping' | 'resting'

export interface BerryWanderState {
  position: [number, number, number]
  target: [number, number, number]
  facingRotY: number
  activity: WanderActivity
  activityTimer: number
  isWalking: boolean
  stepCycle: number
  statusText: string
  statusEmoji: string
}

// Navigable surface definition
interface SurfaceBounds {
  y: number
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  name: string
  pointsOfInterest: [number, number, number][]
}

const SURFACES: SurfaceBounds[] = [
  // 1. Pantry Shelf (initial emergence spot)
  {
    name: 'shelf',
    y: 2.435,
    minX: -0.42,
    maxX: 0.42,
    minZ: -2.85,
    maxZ: -2.75,
    pointsOfInterest: [
      [0.16, 2.435, -2.8],
      [-0.25, 2.435, -2.8],
      [0.35, 2.435, -2.8],
    ],
  },
  // 2. Kitchen Counter
  {
    name: 'counter',
    y: 1.05,
    minX: -2.35,
    maxX: 0.75,
    minZ: -2.65,
    maxZ: -2.52,
    pointsOfInterest: [
      [-2.15, 1.05, -2.58], // near radio
      [-0.55, 1.05, -2.60], // near toaster
      [0.05, 1.05, -2.58], // near kettle
      [-1.15, 1.05, -2.60], // near sink
      [0.65, 1.05, -2.58], // near stove
    ],
  },
  // 3. Central Dining Table
  {
    name: 'table',
    y: 0.95,
    minX: -0.15,
    maxX: 1.25,
    minZ: 0.55,
    maxZ: 1.05,
    pointsOfInterest: [
      [0.15, 0.95, 0.85], // near plate
      [0.65, 0.95, 0.95], // near mug
      [0.35, 0.95, 0.70], // table center
      [1.1, 0.95, 0.85], // table edge
    ],
  },
  // 4. Window Sill (Sunlight)
  {
    name: 'window',
    y: 2.1,
    minX: 0.85,
    maxX: 1.45,
    minZ: -2.85,
    maxZ: -2.75,
    pointsOfInterest: [
      [1.15, 2.1, -2.8], // sunny center
    ],
  },
  // 5. Floor & Cozy Oval Rug
  {
    name: 'floor',
    y: 0.05,
    minX: -0.8,
    maxX: 1.2,
    minZ: 0.2,
    maxZ: 1.5,
    pointsOfInterest: [
      [0.55, 0.05, 0.75], // rug center
      [-0.2, 0.05, 0.6], // left side of table
      [0.8, 0.05, 1.2], // front side
    ],
  },
]

function getNearestSurface(pos: [number, number, number]): SurfaceBounds {
  const [x, y, z] = pos
  let best = SURFACES[0]
  let bestDist = 9999

  for (const s of SURFACES) {
    // Height difference has highest weight
    const dy = Math.abs(y - s.y) * 3
    const dx = Math.max(0, s.minX - x, x - s.maxX)
    const dz = Math.max(0, s.minZ - z, z - s.maxZ)
    const dist = dy + dx + dz
    if (dist < bestDist) {
      bestDist = dist
      best = s
    }
  }
  return best
}


class BerryWanderManager {
  private state: BerryWanderState = {
    position: [0.16, 2.435, -2.8],
    target: [0.16, 2.435, -2.8],
    facingRotY: 0.35,
    activity: 'idle',
    activityTimer: 3.5,
    isWalking: false,
    stepCycle: 0,
    statusText: 'Đang ngắm nhìn gian bếp...',
    statusEmoji: '🍓',
  }

  private isEmergenceSettled = false

  public getState(): BerryWanderState {
    return this.state
  }

  public setSettled(settled: boolean) {
    this.isEmergenceSettled = settled
  }

  public notifyPlayerPlaced(pos: [number, number, number]) {
    const surf = getNearestSurface(pos)
    // Snap to safe surface height
    const snapped: [number, number, number] = [
      MathUtils.clamp(pos[0], surf.minX, surf.maxX),
      surf.y,
      MathUtils.clamp(pos[2], surf.minZ, surf.maxZ),
    ]

    this.state.position = [...snapped]
    this.state.target = [...snapped]
    this.state.activity = 'idle'
    this.state.activityTimer = 2.0 // pause briefly on landing
    this.state.isWalking = false
    this.state.statusText = 'Vừa đáp xuống, ngơ ngác nhìn quanh...'
    this.state.statusEmoji = '👀'
  }

  public update(
    delta: number,
    isGrabbed: boolean,
    berryMood: BerryEmotionalState,
    isHovered: boolean,
  ) {
    if (!this.isEmergenceSettled || isGrabbed) {
      this.state.isWalking = false
      return
    }

    const { activity, target } = this.state
    const currentPos = this.state.position

    // Determine current surface
    const surface = getNearestSurface(currentPos)

    // Countdown activity timer
    this.state.activityTimer -= delta

    if (this.state.activityTimer <= 0) {
      this.pickNextActivity(berryMood, surface)
    }

    // Walking behavior logic
    if (activity === 'walking') {
      const dx = target[0] - currentPos[0]
      const dz = target[2] - currentPos[2]
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < 0.04) {
        // Arrived at destination
        this.state.position[0] = target[0]
        this.state.position[2] = target[2]
        this.state.isWalking = false

        // Pick immediate post-walk reaction
        if (berryMood === 'happy') {
          this.state.activity = 'hopping'
          this.state.activityTimer = 2.0
          this.state.statusText = 'Nhảy chân sáo thích thú! ✨'
          this.state.statusEmoji = '🌸'
        } else if (berryMood === 'uneasy') {
          this.state.activity = 'looking_around'
          this.state.activityTimer = 3.5
          this.state.statusText = 'Run rẩy nhìn chiếc đồng hồ...'
          this.state.statusEmoji = '🥺'
        } else {
          this.state.activity = 'looking_around'
          this.state.activityTimer = MathUtils.randFloat(2.5, 4.5)
          this.state.statusText = 'Dừng bước, tò mò ngó nghiêng...'
          this.state.statusEmoji = '👀'
        }
      } else {
        // Walk towards target
        this.state.isWalking = true
        const speed = berryMood === 'happy' ? 0.32 : berryMood === 'uneasy' ? 0.16 : 0.22
        const moveStep = Math.min(dist, speed * delta)

        this.state.position[0] += (dx / dist) * moveStep
        this.state.position[2] += (dz / dist) * moveStep
        this.state.position[1] = MathUtils.damp(this.state.position[1], surface.y, 8, delta)

        // Turn smoothly towards travel angle
        const targetAngle = Math.atan2(dx, dz)
        this.state.facingRotY = MathUtils.damp(this.state.facingRotY, targetAngle, 8, delta)

        // Accumulate footstep cycle
        this.state.stepCycle += delta * (berryMood === 'happy' ? 14 : 10)
      }
    } else {
      this.state.isWalking = false

      if (activity === 'hopping') {
        this.state.stepCycle += delta * 12
      } else if (isHovered) {
        // Pause and look towards player
        this.state.statusText = 'Nhận ra bạn đang nhìn nè! 💛'
        this.state.statusEmoji = '✨'
      }
    }
  }

  private pickNextActivity(berryMood: BerryEmotionalState, surface: SurfaceBounds) {
    if (berryMood === 'peaceful') {
      this.state.activity = 'resting'
      this.state.activityTimer = 6.0
      this.state.isWalking = false
      this.state.statusText = 'Đang cuộn tròn ngủ yên bình...'
      this.state.statusEmoji = '💤'
      return
    }

    if (berryMood === 'uneasy') {
      // Uneasy: takes tiny nervous paces or stays still shivering
      const shouldWalk = Math.random() > 0.45
      if (shouldWalk) {
        this.state.activity = 'walking'
        this.state.activityTimer = 3.0
        // Small nervous step
        const offsetX = MathUtils.randFloat(-0.18, 0.18)
        this.state.target = [
          MathUtils.clamp(this.state.position[0] + offsetX, surface.minX, surface.maxX),
          surface.y,
          this.state.position[2],
        ]
        this.state.statusText = 'Bước đi lo lắng, tim đập thình thịch...'
        this.state.statusEmoji = '🥺'
      } else {
        this.state.activity = 'looking_around'
        this.state.activityTimer = 4.0
        this.state.statusText = 'Bất an... sao tiếng đồng hồ lại dừng?'
        this.state.statusEmoji = '⚡'
      }
      return
    }

    if (berryMood === 'emotional') {
      // Revelation: face front / camera, deep breath
      this.state.activity = 'looking_around'
      this.state.activityTimer = 5.0
      this.state.isWalking = false
      this.state.facingRotY = 0.38
      this.state.statusText = 'Nhớ lại lời hẹn rồi... bạn đã quay lại.'
      this.state.statusEmoji = '🥺'
      return
    }

    // Default Curious / Happy autonomous roaming:
    const roll = Math.random()
    if (roll < 0.6) {
      // Pick a walk destination on current surface
      this.state.activity = 'walking'
      this.state.activityTimer = 6.0

      // 50% chance pick point of interest, 50% random safe spot
      let targetX: number
      let targetZ: number

      if (surface.pointsOfInterest.length > 0 && Math.random() < 0.5) {
        const poi = surface.pointsOfInterest[Math.floor(Math.random() * surface.pointsOfInterest.length)]
        targetX = poi[0]
        targetZ = poi[2]
      } else {
        targetX = MathUtils.randFloat(surface.minX, surface.maxX)
        targetZ = MathUtils.randFloat(surface.minZ, surface.maxZ)
      }

      this.state.target = [targetX, surface.y, targetZ]
      this.state.statusText =
        surface.name === 'shelf'
          ? 'Đang đi dạo trên kệ gỗ ngắm căn bếp... 🐾'
          : surface.name === 'table'
            ? 'Đang lon ton dạo chơi quanh bàn ăn... 🐾'
            : surface.name === 'counter'
              ? 'Đang thám hiểm mặt bàn bếp thơm lừng... 🐾'
              : 'Đang tự do dạo bước... 🐾'
      this.state.statusEmoji = berryMood === 'happy' ? '🌸' : '🚶'
    } else if (roll < 0.85) {
      // Stop and look around
      this.state.activity = 'looking_around'
      this.state.activityTimer = MathUtils.randFloat(3.0, 5.0)
      this.state.statusText = 'Dừng chân ngó nghiêng tìm kiếm bạn bè...'
      this.state.statusEmoji = '👀'
    } else {
      // Happy hop
      this.state.activity = 'hopping'
      this.state.activityTimer = 2.0
      this.state.statusText = 'Nhảy tưng tưng vì căn bếp quá đỗi ấm áp! ✨'
      this.state.statusEmoji = '🍓'
    }
  }
}

export const berryWanderAI = new BerryWanderManager()
