import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2, type Group } from 'three'
import { materials } from '../../scene/materials'

/**
 * Lathe profile of a cute plump strawberry body:
 * Slightly broader near the upper shoulders, gently tapered toward the bottom.
 */
const BERRY_BODY_PROFILE: [number, number][] = [
  [0.001, 0.02],
  [0.035, 0.024],
  [0.065, 0.045],
  [0.088, 0.085],
  [0.098, 0.135],
  [0.095, 0.175],
  [0.075, 0.205],
  [0.045, 0.222],
  [0.001, 0.226],
]

/**
 * Handcrafted low-poly procedural placeholder for Berry.
 *
 * Clearly identified temporary model matching the indie diorama art direction:
 * - Rounded plump strawberry body
 * - 5 low-poly crown leaves with a stem
 * - Tiny arms and feet
 * - Expressive face with natural blinking eyes and rosy blush cheeks
 */
export function BerryPlaceholderModel() {
  const leafRef = useRef<Group>(null)
  const eyesRef = useRef<Group>(null)

  const bodyPoints = useMemo(
    () => BERRY_BODY_PROFILE.map(([x, y]) => new Vector2(x, y)),
    [],
  )

  // 5 star-like crown leaves
  const leaves = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const angle = (i * Math.PI * 2) / 5
      return { angle, key: i }
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (leafRef.current) {
      leafRef.current.rotation.x = Math.sin(t * 1.6) * 0.04
      leafRef.current.rotation.y = Math.sin(t * 1.2) * 0.06
      leafRef.current.rotation.z = Math.sin(t * 1.8) * 0.05
    }
    if (eyesRef.current) {
      const blinkCycle = t % 3.8
      const eyeScaleY = blinkCycle < 0.14 ? 0.08 : 1.0
      eyesRef.current.scale.y = eyeScaleY
    }
  })

  return (
    <group>
      {/* 1. Strawberry Body */}
      <mesh material={materials.strawberry}>
        <latheGeometry args={[bodyPoints, 18]} />
      </mesh>

      {/* 2. Tiny seeds on body (cute golden speckles) */}
      {[
        [-0.045, 0.13, 0.08],
        [0.045, 0.13, 0.08],
        [-0.025, 0.08, 0.07],
        [0.025, 0.08, 0.07],
        [0.0, 0.05, 0.055],
        [-0.06, 0.16, 0.06],
        [0.06, 0.16, 0.06],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={materials.butterDeep}>
          <sphereGeometry args={[0.004, 6, 4]} />
        </mesh>
      ))}

      {/* 3. Expressive Face (Facing forward +Z) */}
      <group position={[0, 0.145, 0.092]}>
        {/* Left & Right Eyes (support blinking via eyesRef) */}
        <group ref={eyesRef}>
          {[-0.034, 0.034].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh material={materials.cocoa}>
                <sphereGeometry args={[0.012, 10, 8]} />
              </mesh>
              {/* White sparkle twinkle dot */}
              <mesh position={[0.003, 0.004, 0.008]} material={materials.porcelain}>
                <sphereGeometry args={[0.0035, 6, 4]} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Rosy Blush Cheeks */}
        {[-0.055, 0.055].map((x) => (
          <mesh key={x} position={[x, -0.018, -0.008]} scale={[1.2, 0.8, 0.5]} material={materials.strawberryDeep}>
            <sphereGeometry args={[0.012, 8, 6]} />
          </mesh>
        ))}

        {/* Sweet Smile (Half-torus arc) */}
        <mesh position={[0, -0.014, 0.002]} rotation-z={Math.PI}>
          <torusGeometry args={[0.014, 0.0022, 6, 12, Math.PI]} />
        </mesh>
      </group>

      {/* 4. Tiny Feet */}
      {[-0.032, 0.032].map((x) => (
        <mesh key={x} position={[x, 0.012, 0.02]} scale={[1, 0.7, 1.4]} material={materials.strawberryDeep}>
          <sphereGeometry args={[0.018, 10, 8]} />
        </mesh>
      ))}

      {/* 5. Tiny Arms (shy resting at sides) */}
      {[-0.092, 0.092].map((x, idx) => (
        <mesh
          key={x}
          position={[x, 0.11, 0.02]}
          rotation-z={idx === 0 ? 0.35 : -0.35}
          rotation-x={0.2}
          scale={[0.7, 1.2, 0.7]}
          material={materials.strawberry}
        >
          <sphereGeometry args={[0.018, 8, 6]} />
        </mesh>
      ))}

      {/* 6. Leaf Crown & Stem atop head */}
      <group ref={leafRef} position={[0, 0.224, 0]}>
        {/* Crown leaves */}
        {leaves.map(({ angle, key }) => (
          <group key={key} rotation-y={angle}>
            <mesh
              position={[0.045, -0.012, 0]}
              rotation-z={-0.35}
              scale={[1.4, 0.25, 0.7]}
              material={materials.leaf}
            >
              <sphereGeometry args={[0.036, 8, 6]} />
            </mesh>
          </group>
        ))}

        {/* Little stem */}
        <mesh position={[0, 0.022, 0]} rotation-z={0.2} material={materials.mintDeep}>
          <cylinderGeometry args={[0.008, 0.012, 0.045, 8]} />
        </mesh>
      </group>
    </group>
  )
}
