import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { palette } from '../config/palette'

interface TouchSparklesProps {
  active: boolean
  radius?: number
  count?: number
}

/**
 * Gentle magical dust particles that swirl around an object
 * when touched or lifted by the player's hand.
 */
export function TouchSparkles({ active, radius = 0.22, count = 8 }: TouchSparklesProps) {
  const groupRef = useRef<Group>(null)

  // Precompute random particle offsets
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        speed: 1.5 + (i % 3) * 0.8,
        heightOffset: (i % 4) * 0.08,
        size: 0.022 + (i % 2) * 0.012,
        color: i % 2 === 0 ? palette.butterDeep : palette.porcelain,
      })),
    [count],
  )

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return

    if (!active) {
      group.visible = false
      return
    }

    group.visible = true
    const t = state.clock.elapsedTime

    group.children.forEach((child, i) => {
      const p = particles[i]
      if (!p) return
      const currentAngle = p.angle + t * p.speed
      const floatY = p.heightOffset + Math.sin(t * 3 + i) * 0.05 + 0.1
      const currentRadius = radius + Math.sin(t * 2 + i) * 0.04

      child.position.x = Math.cos(currentAngle) * currentRadius
      child.position.z = Math.sin(currentAngle) * currentRadius
      child.position.y = floatY

      const s = 0.8 + Math.sin(t * 6 + i) * 0.3
      child.scale.setScalar(s)
    })
  })

  if (!active) return null

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} raycast={() => null}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial
            color={p.color}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
