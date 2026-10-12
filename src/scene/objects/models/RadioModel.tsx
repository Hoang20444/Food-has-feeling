import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group, type Mesh } from 'three'
import { materials } from '../../materials'
import { Block } from '../../primitives'
import { useKitchenState } from '../../../state/kitchenState'

const W = 0.56
const H = 0.36
const D = 0.24
const FEET = 0.03

/**
 * A retro radio that turns on and off:
 * - When ON: glowing dial window, oscillating frequency needle, vibrating speaker bass,
 *   swaying antenna, and floating musical motes.
 * - Mysterious cozy audio humming in the background.
 */
export function RadioModel() {
  const isPlaying = useKitchenState((s) => s.radioPlaying)

  const speakerRef = useRef<Group>(null)
  const needleRef = useRef<Mesh>(null)
  const antennaRef = useRef<Group>(null)
  const knobRef = useRef<Group>(null)
  const notesRef = useRef<Group>(null)

  const cy = FEET + H / 2
  const front = D / 2

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const needle = needleRef.current
    const antenna = antennaRef.current
    const speaker = speakerRef.current
    const knob = knobRef.current
    const notes = notesRef.current

    if (isPlaying) {
      // Frequency needle sweeps across the dial
      if (needle) {
        needle.position.x = 0.13 + Math.sin(t * 1.6) * 0.055
      }

      // Antenna sways in rhythm
      if (antenna) {
        antenna.rotation.z = -0.55 + Math.sin(t * 3.2) * 0.06
      }

      // Speaker subtle bass vibration
      if (speaker) {
        const bass = 1 + Math.sin(t * 12) * 0.03
        speaker.scale.set(bass, bass, 1)
      }

      // Volume / tuning knob rotated
      if (knob) {
        knob.rotation.x = MathUtils.damp(knob.rotation.x, Math.PI / 2 + 0.8, 10, delta)
      }

      // Floating musical notes / sound sparkles
      if (notes) {
        notes.children.forEach((child, i) => {
          const phase = i * 2.2
          const progress = ((t * 0.4 + phase) % 1)
          child.position.y = cy + 0.12 + progress * 0.24
          child.position.x = -0.12 + Math.sin(t * 3 + phase) * 0.06
          child.position.z = front + 0.04 + Math.cos(t * 2.5 + phase) * 0.03
          const s = Math.sin(progress * Math.PI) * 0.016
          child.scale.setScalar(Math.max(0.001, s))
          child.rotation.z = t * 2 + phase
        })
      }
    } else {
      if (needle) {
        needle.position.x = MathUtils.damp(needle.position.x, 0.13, 8, delta)
      }
      if (antenna) {
        antenna.rotation.z = MathUtils.damp(antenna.rotation.z, -0.55, 8, delta)
      }
      if (speaker) {
        speaker.scale.set(1, 1, 1)
      }
      if (knob) {
        knob.rotation.x = MathUtils.damp(knob.rotation.x, Math.PI / 2, 8, delta)
      }
      if (notes) {
        notes.children.forEach((child) => child.scale.setScalar(0.001))
      }
    }
  })

  return (
    <group>
      {/* Wooden feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - 0.08), FEET / 2, 0]} material={materials.cocoa}>
          <boxGeometry args={[0.07, FEET, D * 0.7]} />
        </mesh>
      ))}

      {/* Main retro casing */}
      <Block size={[W, H, D]} radius={0.07} position-y={cy} material={materials.strawberry} />

      {/* Speaker */}
      <group ref={speakerRef} position={[-0.12, cy, front]}>
        <mesh rotation-x={Math.PI / 2} material={materials.porcelain}>
          <cylinderGeometry args={[0.105, 0.105, 0.02, 24]} />
        </mesh>
        {[0.075, 0.045].map((r) => (
          <mesh key={r} position-z={0.012} material={materials.strawberryDeep}>
            <torusGeometry args={[r, 0.007, 4, 24]} />
          </mesh>
        ))}
        <mesh position-z={0.012} material={materials.strawberryDeep}>
          <sphereGeometry args={[0.014, 8, 6]} />
        </mesh>
      </group>

      {/* Dial window */}
      <Block
        size={[0.18, 0.08, 0.02]}
        radius={0.01}
        position={[0.13, cy + 0.06, front]}
        material={isPlaying ? materials.butterDeep : materials.butter}
      />

      {/* Dial frequency scale marks */}
      {[-0.05, -0.02, 0.01, 0.04].map((dx) => (
        <mesh key={dx} position={[0.13 + dx, cy + 0.075, front + 0.011]} material={materials.cocoa}>
          <boxGeometry args={[0.004, 0.016, 0.002]} />
        </mesh>
      ))}

      {/* Moving frequency needle */}
      <mesh ref={needleRef} position={[0.13, cy + 0.06, front + 0.012]} material={isPlaying ? materials.strawberry : materials.cocoa}>
        <boxGeometry args={[0.008, 0.055, 0.004]} />
      </mesh>

      {/* Knobs */}
      <group ref={knobRef} position={[0.08, cy - 0.07, front + 0.015]}>
        <mesh rotation-x={Math.PI / 2} material={materials.woodDark}>
          <cylinderGeometry args={[0.032, 0.035, 0.03, 12]} />
        </mesh>
        {/* On/Off indicator dot */}
        <mesh position={[0, 0.02, 0.018]} material={isPlaying ? materials.mintDeep : materials.charcoal}>
          <sphereGeometry args={[0.006, 6, 6]} />
        </mesh>
      </group>
      <group position={[0.18, cy - 0.07, front + 0.015]}>
        <mesh rotation-x={Math.PI / 2} material={materials.woodDark}>
          <cylinderGeometry args={[0.032, 0.035, 0.03, 12]} />
        </mesh>
      </group>

      {/* Antenna */}
      <group ref={antennaRef} position={[W / 2 - 0.08, FEET + H - 0.01, -D / 4]} rotation-z={-0.55}>
        <mesh position-y={0.2} material={materials.steel}>
          <cylinderGeometry args={[0.007, 0.01, 0.4, 6]} />
        </mesh>
        <mesh position-y={0.4} material={isPlaying ? materials.strawberry : materials.butter}>
          <sphereGeometry args={[0.018, 8, 6]} />
        </mesh>
      </group>

      {/* Floating sound sparkles / music notes */}
      <group ref={notesRef}>
        {[0, 1].map((idx) => (
          <mesh key={idx} material={materials.butterDeep} scale={0.001}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
