import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2, type Group, type Mesh } from 'three'
import { materials } from '../../scene/materials'
import { useMysteryStore } from '../../state/mysteryStore'
import { berryWanderAI } from './BerryWanderAI'

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
 * Full animated living food friend:
 * - Walking footsteps and waddling arm swings
 * - Emotional arm gestures (scared tremble vs happy wave)
 * - Expressive face with blinking and mood mouth shapes
 * - Leaf crown and stem
 */
export function BerryPlaceholderModel() {
  const berryMood = useMysteryStore((s) => s.berryMood)
  const leafRef = useRef<Group>(null)
  const eyesRef = useRef<Group>(null)
  const leftFootRef = useRef<Mesh>(null)
  const rightFootRef = useRef<Mesh>(null)
  const leftArmRef = useRef<Mesh>(null)
  const rightArmRef = useRef<Mesh>(null)

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
    const wander = berryWanderAI.getState()
    const isWalking = wander.isWalking
    const step = wander.stepCycle

    // Leaf crown animation
    if (leafRef.current) {
      if (berryMood === 'happy') {
        leafRef.current.rotation.y = t * 6
      } else {
        leafRef.current.rotation.x = Math.sin(t * 1.6) * 0.04
        leafRef.current.rotation.y = Math.sin(t * 1.2) * 0.06
        leafRef.current.rotation.z = Math.sin(t * 1.8) * 0.05
      }
    }

    // Blinking eyes
    if (eyesRef.current) {
      const blinkCycle = t % 3.8
      const eyeScaleY = blinkCycle < 0.14 ? 0.08 : 1.0
      eyesRef.current.scale.y = eyeScaleY
    }

    // Animated footsteps
    if (leftFootRef.current && rightFootRef.current) {
      if (isWalking) {
        leftFootRef.current.position.z = 0.02 + Math.sin(step) * 0.028
        leftFootRef.current.position.y = 0.012 + Math.max(0, Math.sin(step) * 0.016)
        rightFootRef.current.position.z = 0.02 - Math.sin(step) * 0.028
        rightFootRef.current.position.y = 0.012 + Math.max(0, -Math.sin(step) * 0.016)
      } else {
        leftFootRef.current.position.z = 0.02
        leftFootRef.current.position.y = 0.012
        rightFootRef.current.position.z = 0.02
        rightFootRef.current.position.y = 0.012
      }
    }

    // Animated arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      if (berryMood === 'uneasy') {
        // Scared: arms held tight to tummy with nervous trembling
        leftArmRef.current.rotation.z = 0.75
        leftArmRef.current.rotation.x = 0.35 + Math.sin(t * 28) * 0.08
        rightArmRef.current.rotation.z = -0.75
        rightArmRef.current.rotation.x = 0.35 - Math.sin(t * 28) * 0.08
      } else if (berryMood === 'happy') {
        // Happy: arms raised high waving excitedly!
        leftArmRef.current.rotation.z = 1.3 + Math.sin(t * 8) * 0.2
        leftArmRef.current.rotation.x = 0.2
        rightArmRef.current.rotation.z = -1.3 - Math.sin(t * 8) * 0.2
        rightArmRef.current.rotation.x = 0.2
      } else if (isWalking) {
        // Walking: rhythmic waddling arm swings
        leftArmRef.current.rotation.z = 0.35
        leftArmRef.current.rotation.x = 0.2 + Math.sin(step) * 0.45
        rightArmRef.current.rotation.z = -0.35
        rightArmRef.current.rotation.x = 0.2 - Math.sin(step) * 0.45
      } else {
        leftArmRef.current.rotation.z = 0.35
        leftArmRef.current.rotation.x = 0.2
        rightArmRef.current.rotation.z = -0.35
        rightArmRef.current.rotation.x = 0.2
      }
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
        {/* Left & Right Eyes */}
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
              {/* Emotional glistening tear droplet during revelation */}
              {berryMood === 'emotional' && (
                <mesh position={[0.006, -0.009, 0.007]} material={materials.porcelain}>
                  <sphereGeometry args={[0.0028, 6, 4]} />
                </mesh>
              )}
            </group>
          ))}
        </group>

        {/* Rosy Blush Cheeks */}
        {[-0.055, 0.055].map((x) => (
          <mesh
            key={x}
            position={[x, -0.018, -0.008]}
            scale={berryMood === 'uneasy' ? [0.8, 0.6, 0.4] : [1.2, 0.8, 0.5]}
            material={materials.strawberryDeep}
          >
            <sphereGeometry args={[0.012, 8, 6]} />
          </mesh>
        ))}

        {/* Dynamic Mouth Expression */}
        {berryMood === 'uneasy' ? (
          /* Little surprised 'o' when uneasy */
          <mesh position={[0, -0.016, 0.002]}>
            <torusGeometry args={[0.007, 0.002, 6, 12]} />
            <primitive object={materials.cocoa} attach="material" />
          </mesh>
        ) : berryMood === 'hesitant' ? (
          /* Small hesitant line */
          <mesh position={[0, -0.015, 0.002]} rotation-z={Math.PI * 0.95}>
            <torusGeometry args={[0.01, 0.002, 6, 8, Math.PI * 0.7]} />
            <primitive object={materials.cocoa} attach="material" />
          </mesh>
        ) : berryMood === 'peaceful' ? (
          /* Soft gentle restful smile */
          <mesh position={[0, -0.013, 0.002]} rotation-z={Math.PI * 0.98}>
            <torusGeometry args={[0.012, 0.002, 6, 10, Math.PI * 0.8]} />
            <primitive object={materials.cocoa} attach="material" />
          </mesh>
        ) : (
          /* Sweet full smile */
          <mesh position={[0, -0.014, 0.002]} rotation-z={Math.PI}>
            <torusGeometry args={[0.014, 0.0022, 6, 12, Math.PI]} />
            <primitive object={materials.cocoa} attach="material" />
          </mesh>
        )}
      </group>

      {/* 4. Animated Tiny Feet */}
      <mesh
        ref={leftFootRef}
        position={[-0.032, 0.012, 0.02]}
        scale={[1, 0.7, 1.4]}
        material={materials.strawberryDeep}
      >
        <sphereGeometry args={[0.018, 10, 8]} />
      </mesh>
      <mesh
        ref={rightFootRef}
        position={[0.032, 0.012, 0.02]}
        scale={[1, 0.7, 1.4]}
        material={materials.strawberryDeep}
      >
        <sphereGeometry args={[0.018, 10, 8]} />
      </mesh>

      {/* 5. Animated Tiny Arms */}
      <mesh
        ref={leftArmRef}
        position={[-0.092, 0.11, 0.02]}
        rotation-z={0.35}
        rotation-x={0.2}
        scale={[0.7, 1.2, 0.7]}
        material={materials.strawberry}
      >
        <sphereGeometry args={[0.018, 8, 6]} />
      </mesh>
      <mesh
        ref={rightArmRef}
        position={[0.092, 0.11, 0.02]}
        rotation-z={-0.35}
        rotation-x={0.2}
        scale={[0.7, 1.2, 0.7]}
        material={materials.strawberry}
      >
        <sphereGeometry args={[0.018, 8, 6]} />
      </mesh>

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
