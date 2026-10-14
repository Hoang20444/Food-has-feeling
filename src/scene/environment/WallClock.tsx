import { useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { ROOM_BOUNDS } from '../../config/scene'
import { interaction } from '../../state/interactionStore'
import { mysteryStore, useMysteryStore } from '../../state/mysteryStore'
import { soundEffects } from '../../shared/audio/soundEffects'
import { materials } from '../materials'

const RADIUS = 0.26

/**
 * Interactive Wall Clock on the left wall:
 * - Phase A: Ticks rhythmically at normal time.
 * - Phase B & C: Stops dead at 03:15 with a subtle scratch mark behind the face.
 * - Inspecting it discovers Clue 2: The Frozen Clock at 3:15.
 */
export function WallClock() {
  const isStopped = useMysteryStore((s) => s.clockStopped)
  const isClueDiscovered = useMysteryStore((s) => s.clues.clock_time.discovered)

  const [hovered, setHovered] = useState(false)
  const hourHandRef = useRef<Group>(null)
  const minuteHandRef = useRef<Group>(null)
  const secondHandRef = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (isStopped) {
      // Frozen at 3:15
      // 3 o'clock in X-rotation coordinates is -Math.PI / 2
      const targetMinuteAngle = -Math.PI / 2
      const targetHourAngle = -Math.PI / 2 - 0.14 // slight offset for 15 past 3

      if (hourHandRef.current) {
        hourHandRef.current.rotation.x = MathUtils.damp(hourHandRef.current.rotation.x, targetHourAngle, 8, 0.016)
      }
      if (minuteHandRef.current) {
        minuteHandRef.current.rotation.x = MathUtils.damp(minuteHandRef.current.rotation.x, targetMinuteAngle, 8, 0.016)
      }
      if (secondHandRef.current) {
        secondHandRef.current.rotation.x = MathUtils.damp(secondHandRef.current.rotation.x, targetMinuteAngle, 8, 0.016)
      }
    } else {
      // Normal ticking animation around 10:10
      const hourAngle = Math.PI / 3 + Math.sin(t * 0.05) * 0.02
      const minuteAngle = -Math.PI / 3 + (t * 0.08) % (Math.PI * 2)
      const secondAngle = (t * 1.5) % (Math.PI * 2)

      if (hourHandRef.current) hourHandRef.current.rotation.x = hourAngle
      if (minuteHandRef.current) minuteHandRef.current.rotation.x = minuteAngle
      if (secondHandRef.current) secondHandRef.current.rotation.x = secondAngle
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    interaction.select('clock')
    soundEffects.playGentleTouch()
    mysteryStore.recordInspection('clock')

    const currentPhase = mysteryStore.getState().phase
    if (currentPhase !== 'comfort' || isStopped) {
      mysteryStore.discoverClue('clock_time')
      soundEffects.playClockStop()
    } else {
      soundEffects.playClockTick()
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'default'
  }

  return (
    <group
      position={[ROOM_BOUNDS.minX, 2.75, 0.55]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Invisible interaction hit cylinder */}
      <mesh position-x={0.06} rotation-z={Math.PI / 2} visible={false}>
        <cylinderGeometry args={[RADIUS + 0.06, RADIUS + 0.06, 0.12, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Clock Face Base */}
      <mesh position-x={0.03} rotation-z={Math.PI / 2} material={materials.porcelain}>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.04, 28]} />
      </mesh>

      {/* Clock Bezel Ring (glows subtly on hover or clue discovery) */}
      <mesh
        position-x={0.05}
        rotation-y={Math.PI / 2}
        material={isStopped ? materials.strawberry : hovered ? materials.butterDeep : materials.butter}
      >
        <torusGeometry args={[RADIUS, 0.035, 8, 28]} />
      </mesh>

      {/* Scratch mark / tea-time highlight at 3:00 position */}
      {isStopped && (
        <group position={[0.052, 0, RADIUS * 0.75]}>
          <mesh material={materials.strawberry}>
            <boxGeometry args={[0.005, 0.03, 0.015]} />
          </mesh>
        </group>
      )}

      {/* Hour markers at 12, 3, 6, 9 */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2
        return (
          <mesh
            key={i}
            position={[0.055, Math.cos(a) * RADIUS * 0.75, Math.sin(a) * RADIUS * 0.75]}
            material={isStopped && i === 1 ? materials.strawberry : materials.cocoa}
            userData={{ shadow: 'none' }}
          >
            <sphereGeometry args={[0.014, 8, 6]} />
          </mesh>
        )
      })}

      {/* Hour Hand */}
      <group ref={hourHandRef} position-x={0.06}>
        <mesh position-y={RADIUS * 0.25} material={materials.cocoa} userData={{ shadow: 'none' }}>
          <boxGeometry args={[0.008, RADIUS * 0.5, 0.026]} />
        </mesh>
      </group>

      {/* Minute Hand */}
      <group ref={minuteHandRef} position-x={0.066}>
        <mesh position-y={RADIUS * 0.35} material={materials.cocoa} userData={{ shadow: 'none' }}>
          <boxGeometry args={[0.008, RADIUS * 0.7, 0.018]} />
        </mesh>
      </group>

      {/* Central Pin */}
      <mesh position-x={0.07} rotation-z={Math.PI / 2} material={materials.strawberry}>
        <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
      </mesh>

      {/* Clue discovered indicator floating sparkle */}
      {isClueDiscovered && (
        <group position={[0.08, RADIUS + 0.06, 0]} scale={[0.035, 0.035, 0.035]}>
          <mesh material={materials.butterDeep}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        </group>
      )}
    </group>
  )
}
