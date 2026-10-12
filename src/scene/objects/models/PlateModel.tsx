import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2, MathUtils, type Group } from 'three'
import { materials } from '../../materials'
import { useKitchenState } from '../../../state/kitchenState'

/**
 * Lathe profile, traced from the axis outward along the underside, around the
 * rim, then back across the top — this winding gives outward-facing normals.
 */
const PROFILE: [number, number][] = [
  [0.001, 0],
  [0.12, 0],
  [0.14, 0.008],
  [0.24, 0.032],
  [0.262, 0.04],
  [0.258, 0.05],
  [0.24, 0.047],
  [0.14, 0.018],
  [0.001, 0.018],
]

/** A porcelain plate with gentle ceramic wobble feedback when interacted with. */
export function PlateModel() {
  const isWobbled = useKitchenState((s) => s.plateWobbled)
  const plateRef = useRef<Group>(null)

  const points = useMemo(() => PROFILE.map(([x, y]) => new Vector2(x, y)), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const plate = plateRef.current
    if (!plate) return

    if (isWobbled) {
      const wobbleX = Math.sin(t * 22) * 0.035
      const wobbleZ = Math.cos(t * 20) * 0.025
      plate.rotation.x = MathUtils.damp(plate.rotation.x, wobbleX, 14, delta)
      plate.rotation.z = MathUtils.damp(plate.rotation.z, wobbleZ, 14, delta)
    } else {
      plate.rotation.x = MathUtils.damp(plate.rotation.x, 0, 10, delta)
      plate.rotation.z = MathUtils.damp(plate.rotation.z, 0, 10, delta)
    }
  })

  return (
    <group ref={plateRef}>
      <mesh material={materials.porcelain}>
        <latheGeometry args={[points, 24]} />
      </mesh>
      <mesh position-y={0.046} rotation-x={Math.PI / 2} material={materials.butterDeep}>
        <torusGeometry args={[0.235, 0.006, 4, 32]} />
      </mesh>
    </group>
  )
}
