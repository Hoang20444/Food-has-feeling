import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2, MathUtils, type Group } from 'three'
import { materials } from '../../materials'
import { useKitchenState } from '../../../state/kitchenState'

/** Body profile from the axis outward along the base, up the side, back over the top. */
const BODY: [number, number][] = [
  [0.001, 0],
  [0.14, 0],
  [0.165, 0.025],
  [0.172, 0.08],
  [0.158, 0.16],
  [0.12, 0.205],
  [0.075, 0.226],
  [0.001, 0.23],
]

/**
 * A mint kettle that feels alive:
 * - Gentle rhythmic simmer rock & warm breathing.
 * - Steam whistle puff from the spout and animated lid knob when heated.
 */
export function KettleModel() {
  const isHeating = useKitchenState((s) => s.kettleHeating)
  const bodyRef = useRef<Group>(null)
  const knobRef = useRef<Group>(null)
  const steamRef = useRef<Group>(null)

  const points = useMemo(() => BODY.map(([x, y]) => new Vector2(x, y)), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const body = bodyRef.current
    const knob = knobRef.current
    const steam = steamRef.current
    if (!body || !knob || !steam) return

    if (isHeating) {
      // Cheerful whistling simmer rock
      const rockZ = Math.sin(t * 14) * 0.028
      const rockX = Math.cos(t * 12) * 0.015
      body.rotation.z = MathUtils.damp(body.rotation.z, rockZ, 12, delta)
      body.rotation.x = MathUtils.damp(body.rotation.x, rockX, 12, delta)

      // Lid knob rattles
      knob.position.y = 0.262 + Math.abs(Math.sin(t * 22)) * 0.006

      // Steam puffs from spout
      steam.children.forEach((puff, i) => {
        const progress = ((t * 0.8 + i * 0.35) % 1)
        puff.position.x = 0.28 + progress * 0.12
        puff.position.y = 0.22 + progress * 0.18
        puff.position.z = Math.sin(t * 3 + i) * 0.02
        const s = Math.sin(progress * Math.PI) * 0.03
        puff.scale.setScalar(Math.max(0.001, s))
      })
    } else {
      // Gentle calm simmering breathing
      const calmRockZ = Math.sin(t * 2.2) * 0.012
      body.rotation.z = MathUtils.damp(body.rotation.z, calmRockZ, 8, delta)
      body.rotation.x = MathUtils.damp(body.rotation.x, 0, 8, delta)
      knob.position.y = MathUtils.damp(knob.position.y, 0.262, 8, delta)

      // Hide steam puffs
      steam.children.forEach((puff) => puff.scale.setScalar(0.001))
    }
  })

  return (
    <group ref={bodyRef}>
      <mesh material={materials.mintDeep}>
        <latheGeometry args={[points, 18]} />
      </mesh>

      {/* Lid rim */}
      <mesh position-y={0.232} material={materials.porcelain}>
        <cylinderGeometry args={[0.07, 0.078, 0.02, 16]} />
      </mesh>

      {/* Rattling lid strawberry knob */}
      <group ref={knobRef} position-y={0.262}>
        <mesh material={materials.strawberry}>
          <sphereGeometry args={[0.026, 12, 8]} />
        </mesh>
      </group>

      {/* Spout */}
      <mesh position={[0.19, 0.12, 0]} rotation-z={-0.85} material={materials.mintDeep}>
        <cylinderGeometry args={[0.018, 0.034, 0.15, 10]} />
      </mesh>

      {/* Arched wooden handle */}
      <mesh position-y={0.19} rotation-y={Math.PI / 2} material={materials.woodDark}>
        <torusGeometry args={[0.12, 0.018, 8, 16, Math.PI]} />
      </mesh>

      {/* Spout steam puffs */}
      <group ref={steamRef}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx} material={materials.cloud} scale={0.001}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
