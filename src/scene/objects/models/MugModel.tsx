import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { materials } from '../../materials'
import { useKitchenState } from '../../../state/kitchenState'
import { useFriendshipState } from '../../../state/friendshipState'

const HEIGHT = 0.2
const RADIUS = 0.1

interface SteamParticle {
  yOffset: number
  phase: number
  speed: number
  radius: number
}

const STEAM_PARTICLES: SteamParticle[] = [
  { yOffset: 0.0, phase: 0.0, speed: 0.18, radius: 0.018 },
  { yOffset: 0.09, phase: 2.1, speed: 0.15, radius: 0.024 },
  { yOffset: 0.18, phase: 4.2, speed: 0.2, radius: 0.016 },
]

/**
 * A chunky strawberry mug that feels alive:
 * - Gentle warm steam curls rising rhythmically from the hot tea.
 * - Subtle vibration and shiver when inspected with warmth.
 */
export function MugModel() {
  const isWarmed = useKitchenState((s) => s.mugWarmed)
  const hasBerryFriendship = useFriendshipState((s) => s.discoveredFriendships.berry_mug_friendship)
  const bodyRef = useRef<Group>(null)
  const steamRef = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Vibration when touched / inspected or when friendship is active
    if (bodyRef.current) {
      if (isWarmed) {
        bodyRef.current.position.x = Math.sin(t * 45) * 0.0035
        bodyRef.current.position.z = Math.cos(t * 40) * 0.003
        bodyRef.current.rotation.y = Math.sin(t * 30) * 0.025
      } else {
        bodyRef.current.position.x = 0
        bodyRef.current.position.z = 0
        bodyRef.current.rotation.y = 0
      }
    }

    // Animate steam puffs rising and swaying (leans toward Berry when friends!)
    if (steamRef.current) {
      steamRef.current.children.forEach((child, i) => {
        const p = STEAM_PARTICLES[i]
        const progress = ((t * p.speed + p.yOffset) % 0.25) / 0.25
        child.position.y = progress * 0.22
        // Leans toward Berry if friendship unlocked
        const friendshipLean = hasBerryFriendship ? -0.04 : 0
        child.position.x = Math.sin(t * 2.2 + p.phase) * 0.025 + friendshipLean * progress
        child.position.z = Math.cos(t * 1.8 + p.phase) * 0.02
        const s = Math.sin(progress * Math.PI) * (isWarmed || hasBerryFriendship ? 1.4 : 1.0)
        child.scale.setScalar(Math.max(0.01, s))
      })
    }
  })

  return (
    <group>
      <group ref={bodyRef}>
        <mesh position-y={HEIGHT / 2} material={materials.strawberry}>
          <cylinderGeometry args={[RADIUS, RADIUS * 0.92, HEIGHT, 18]} />
        </mesh>
        <mesh position-y={HEIGHT} rotation-x={Math.PI / 2} material={materials.porcelain}>
          <torusGeometry args={[RADIUS - 0.008, 0.01, 6, 24]} />
        </mesh>
        <mesh position-y={HEIGHT - 0.025} material={materials.cocoa}>
          <cylinderGeometry args={[RADIUS - 0.012, RADIUS - 0.012, 0.01, 18]} />
        </mesh>
        {/* Handle */}
        <mesh
          position={[RADIUS - 0.005, HEIGHT * 0.5, 0]}
          rotation-z={-Math.PI / 2}
          material={materials.strawberry}
        >
          <torusGeometry args={[0.055, 0.017, 8, 12, Math.PI]} />
        </mesh>
      </group>

      {/* Warm gentle rising steam */}
      <group ref={steamRef} position-y={HEIGHT}>
        {STEAM_PARTICLES.map((p, idx) => (
          <mesh key={idx} material={materials.cloud}>
            <sphereGeometry args={[p.radius, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
