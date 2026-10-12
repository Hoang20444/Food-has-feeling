import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { materials } from '../materials'
import { useKitchenState } from '../../state/kitchenState'

const MOTE_COUNT = 14

interface MoteData {
  x: number
  y: number
  z: number
  speed: number
  phase: number
}

const MOTES: MoteData[] = Array.from({ length: MOTE_COUNT }, (_, i) => ({
  x: -1.2 + (i % 5) * 0.7,
  y: 1.0 + ((i * 0.4) % 2.2),
  z: -2.0 + (i % 4) * 0.8,
  speed: 0.2 + (i % 3) * 0.1,
  phase: i * 1.5,
}))

/**
 * Gentle morning sunbeam dust motes drifting through the kitchen diorama.
 * When the kitchen awakens, they shimmer softly with warm life.
 */
export function SunbeamMotes() {
  const isAwakened = useKitchenState((s) => s.kitchenAwakened)
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!groupRef.current) return

    groupRef.current.children.forEach((child, i) => {
      const m = MOTES[i]
      const yProgress = ((t * m.speed + m.phase) % 2.5) / 2.5
      child.position.y = 1.0 + yProgress * 2.2
      child.position.x = m.x + Math.sin(t * 0.8 + m.phase) * 0.25
      child.position.z = m.z + Math.cos(t * 0.6 + m.phase) * 0.25

      const scaleMultiplier = isAwakened ? 1.6 : 1.0
      const pulse = Math.sin(yProgress * Math.PI) * scaleMultiplier * 0.016
      child.scale.setScalar(Math.max(0.001, pulse))
    })
  })

  return (
    <group ref={groupRef}>
      {MOTES.map((_, i) => (
        <mesh key={i} material={materials.butter} userData={{ shadow: 'none' }}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  )
}
