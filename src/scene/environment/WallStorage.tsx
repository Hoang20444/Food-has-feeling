import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { ROOM_BOUNDS } from '../../config/scene'
import { materials } from '../materials'
import { Block } from '../primitives'
import { kitchenState, useKitchenState } from '../../state/kitchenState'

const WALL_Z = ROOM_BOUNDS.minZ

/** Upper cabinet (left of the window) and a small pantry shelf (right of it). */
export function WallStorage() {
  return (
    <group>
      <WallCabinet />
      <PantryShelf />
    </group>
  )
}

function WallCabinet() {
  const from = ROOM_BOUNDS.minX
  const to = -2.0
  const bottom = 2.05
  const top = 3.15
  const depth = 0.42
  const width = to - from
  const height = top - bottom
  const cx = (from + to) / 2
  const cy = (bottom + top) / 2
  const gap = 0.03
  const doorW = (width - gap * 3) / 2
  const doorH = height - gap * 2

  return (
    <group position={[cx, cy, WALL_Z]}>
      <mesh position-z={depth / 2} material={materials.cabinetBody}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>
      {/* Crown trim */}
      <Block size={[width + 0.04, 0.05, depth + 0.05]} radius={0.015} position={[0.02, height / 2 + 0.025, (depth + 0.05) / 2]} material={materials.woodLight} />

      {[-1, 1].map((side) => (
        <group key={side} position={[side * (doorW / 2 + gap / 2), 0, depth + 0.0175]}>
          <Block size={[doorW, doorH, 0.035]} radius={0.015} material={materials.mint} />
          <Block size={[doorW - 0.14, doorH - 0.14, 0.02]} radius={0.008} position-z={0.0175} material={materials.mintDeep} />
          <mesh position={[-side * (doorW / 2 - 0.08), -doorH / 2 + 0.1, 0.045]} material={materials.woodDark}>
            <sphereGeometry args={[0.03, 12, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Open shelf with three lidded pantry jars — where a secret friend is stirring! */
function PantryShelf() {
  const isAwakened = useKitchenState((s) => s.kitchenAwakened)
  const rustleJarRef = useRef<Group>(null)
  const sparkleRef = useRef<Group>(null)

  const cx = 0.6
  const y = 2.4
  const depth = 0.24
  const jars: { x: number; h: number; r: number; lid: keyof typeof materials }[] = [
    { x: -0.27, h: 0.2, r: 0.07, lid: 'strawberry' },
    { x: 0.0, h: 0.27, r: 0.08, lid: 'butter' },
    { x: 0.26, h: 0.16, r: 0.065, lid: 'mintDeep' },
  ]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (isAwakened) {
      // Periodic rustle behind the strawberry jar
      if (rustleJarRef.current) {
        // Rustle every 3 seconds for 0.6s
        const cycle = t % 3.0
        if (cycle < 0.6) {
          rustleJarRef.current.rotation.z = Math.sin(cycle * 30) * 0.035
          rustleJarRef.current.position.y = 0.025 + Math.abs(Math.sin(cycle * 20)) * 0.008
        } else {
          rustleJarRef.current.rotation.z = 0
          rustleJarRef.current.position.y = 0.025
        }
      }

      // Sparkles dancing near the awakened shelf
      if (sparkleRef.current) {
        sparkleRef.current.children.forEach((child, i) => {
          const phase = i * 2.0
          const progress = (t * 0.35 + phase) % 1
          child.position.y = 0.1 + progress * 0.25
          child.position.x = -0.27 + Math.sin(t * 2 + phase) * 0.08
          child.position.z = depth / 2 + Math.cos(t * 2 + phase) * 0.06
          const s = Math.sin(progress * Math.PI) * 0.012
          child.scale.setScalar(Math.max(0.001, s))
          child.rotation.y = t * 2 + phase
        })
      }
    }
  })

  return (
    <group position={[cx, y, WALL_Z]}>
      <Block size={[0.92, 0.05, depth]} radius={0.015} position-z={depth / 2} material={materials.wood} />
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, -0.09, 0.08]} material={materials.woodDark}>
          <boxGeometry args={[0.04, 0.14, 0.16]} />
        </mesh>
      ))}

      {jars.map((j, idx) => {
        const isStrawberryJar = idx === 0
        return (
          <group
            key={j.x}
            ref={isStrawberryJar ? rustleJarRef : undefined}
            position={[j.x, 0.025, depth / 2]}
            onClick={(e) => {
              if (isStrawberryJar) {
                e.stopPropagation()
                kitchenState.triggerAwakening()
              }
            }}
            onPointerOver={(e) => {
              if (isStrawberryJar) {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }
            }}
            onPointerOut={() => {
              if (isStrawberryJar) {
                document.body.style.cursor = 'default'
              }
            }}
          >
            <mesh position-y={j.h / 2} material={materials.porcelain}>
              <cylinderGeometry args={[j.r, j.r, j.h, 14]} />
            </mesh>
            <mesh position-y={j.h + 0.015} material={materials[j.lid]}>
              <cylinderGeometry args={[j.r + 0.008, j.r + 0.008, 0.035, 14]} />
            </mesh>
            <mesh position-y={j.h + 0.045} material={materials[j.lid]}>
              <sphereGeometry args={[0.018, 10, 8]} />
            </mesh>
          </group>
        )
      })}

      {/* Secret friend sparkle motes around the jar */}
      <group ref={sparkleRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={materials.butterDeep} scale={0.001}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
