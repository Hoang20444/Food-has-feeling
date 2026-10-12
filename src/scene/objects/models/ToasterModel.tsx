import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { materials } from '../../materials'
import { Block } from '../../primitives'
import { useKitchenState } from '../../../state/kitchenState'

const W = 0.42
const H = 0.28
const D = 0.26
const BASE = 0.025

/**
 * A playful retro toaster that feels alive:
 * - Gentle idle breathing pulse.
 * - Playful hop, bouncy lever motion, and peeking golden toast when interacted with.
 */
export function ToasterModel() {
  const isPopped = useKitchenState((s) => s.toasterPopped)
  const groupRef = useRef<Group>(null)
  const leverRef = useRef<Group>(null)
  const toastRef = useRef<Group>(null)

  const cy = BASE + H / 2

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const group = groupRef.current
    const lever = leverRef.current
    const toast = toastRef.current
    if (!group || !lever || !toast) return

    // Gentle idle breathing
    const idleScaleY = 1 + Math.sin(t * 2) * 0.012
    const idleScaleXZ = 1 - Math.sin(t * 2) * 0.006

    if (isPopped) {
      // Playful spring hop & wiggle
      const hopY = Math.abs(Math.sin(t * 8)) * 0.04
      const wiggleZ = Math.sin(t * 18) * 0.035
      group.position.y = MathUtils.damp(group.position.y, hopY, 14, delta)
      group.rotation.z = MathUtils.damp(group.rotation.z, wiggleZ, 14, delta)
      group.scale.set(idleScaleXZ * 1.05, idleScaleY * 0.95, idleScaleXZ * 1.05)

      // Lever springs down then up
      lever.position.y = MathUtils.damp(lever.position.y, -0.04, 18, delta)

      // Toast peeks up high
      toast.position.y = MathUtils.damp(toast.position.y, 0.075, 12, delta)
    } else {
      group.position.y = MathUtils.damp(group.position.y, 0, 10, delta)
      group.rotation.z = MathUtils.damp(group.rotation.z, 0, 10, delta)
      group.scale.set(idleScaleXZ, idleScaleY, idleScaleXZ)

      lever.position.y = MathUtils.damp(lever.position.y, 0, 8, delta)
      // Toast rests slightly peeking
      toast.position.y = MathUtils.damp(toast.position.y, 0.01, 8, delta)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base plate */}
      <Block size={[W + 0.02, BASE, D + 0.02]} radius={0.01} position-y={BASE / 2} material={materials.steel} />

      {/* Main toaster body */}
      <Block size={[W, H, D]} radius={0.08} position-y={cy} material={materials.butter} />

      {/* Two bread slots */}
      {[-0.055, 0.055].map((z) => (
        <Block
          key={z}
          size={[W * 0.68, 0.02, 0.045]}
          radius={0.008}
          position={[0, BASE + H - 0.002, z]}
          material={materials.charcoal}
        />
      ))}

      {/* Two cute golden bread slices inside the slots */}
      <group ref={toastRef} position-y={0.01}>
        {[-0.055, 0.055].map((z, idx) => (
          <group key={z} position={[idx === 0 ? -0.01 : 0.01, BASE + H, z]}>
            <Block
              size={[0.22, 0.12, 0.028]}
              radius={0.015}
              position-y={0.04}
              material={materials.woodLight}
            />
            {/* Golden crust rim */}
            <mesh position-y={0.085} material={materials.wood}>
              <boxGeometry args={[0.224, 0.02, 0.03]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Lever slider track & moving handle */}
      <mesh position={[W / 2 + 0.005, cy + 0.03, 0]} material={materials.steelDark}>
        <boxGeometry args={[0.012, 0.14, 0.03]} />
      </mesh>
      <group ref={leverRef} position={[W / 2 + 0.03, cy + 0.06, 0]}>
        <Block size={[0.05, 0.035, 0.08]} radius={0.012} material={materials.strawberry} />
      </group>

      {/* Browning dial */}
      <mesh position={[0.11, BASE + 0.08, D / 2 + 0.006]} rotation-x={Math.PI / 2} material={materials.porcelain}>
        <cylinderGeometry args={[0.028, 0.028, 0.02, 12]} />
      </mesh>
      <mesh position={[0.11, BASE + 0.08, D / 2 + 0.018]} material={materials.strawberry}>
        <boxGeometry args={[0.006, 0.02, 0.004]} />
      </mesh>
    </group>
  )
}
