import { useState } from 'react'
import { soundEffects } from '../../shared/audio/soundEffects'
import { useWorldMemoryStore, worldMemoryStore } from '../../state/worldMemoryStore'
import { materials } from '../materials'

/**
 * CareInteractions — Small nurturing interactions in the kitchen:
 * - Tiny cleanable messes (stray bread crumb, curled tea leaf, tiny dust fluff)
 * - Brushing them away plays a soothing starry chime and clears the space.
 * - Entirely stress-free: no timers, no failure, pure gentle satisfaction.
 */
export function CareInteractions() {
  const cleanedMesses = useWorldMemoryStore((s) => s.cleanedMesses)

  return (
    <group>
      {/* 1. Stray bread crumb on the dining placemat */}
      {!cleanedMesses.crumb_table && (
        <CleanableItem
          id="crumb_table"
          position={[0.7, 0.965, 0.65]}
          label="Tiny bread crumb"
          onClean={() => {
            worldMemoryStore.cleanMess('crumb_table')
            soundEffects.playCleanSparkle()
          }}
        >
          <group scale={[0.025, 0.02, 0.025]}>
            <mesh material={materials.butterDeep} rotation={[0.2, 0.4, 0.1]}>
              <dodecahedronGeometry args={[1, 0]} />
            </mesh>
            <mesh position={[0.6, 0.1, 0.4]} material={materials.butter}>
              <tetrahedronGeometry args={[0.5, 0]} />
            </mesh>
          </group>
        </CleanableItem>
      )}

      {/* 2. Fallen dried tea leaf near the cooktop */}
      {!cleanedMesses.leaf_cooktop && (
        <CleanableItem
          id="leaf_cooktop"
          position={[-0.45, 1.055, -2.45]}
          label="Fallen tea leaf"
          onClean={() => {
            worldMemoryStore.cleanMess('leaf_cooktop')
            soundEffects.playCleanSparkle()
          }}
        >
          <group scale={[0.03, 0.015, 0.04]} rotation={[0, 0.8, 0]}>
            <mesh material={materials.leaf}>
              <coneGeometry args={[0.6, 1.6, 5]} />
            </mesh>
          </group>
        </CleanableItem>
      )}

      {/* 3. Soft dust bunny near the lower pantry shelf */}
      {!cleanedMesses.fluff_shelf && (
        <CleanableItem
          id="fluff_shelf"
          position={[0.6, 2.05, -2.78]}
          label="Gentle dust fluff"
          onClean={() => {
            worldMemoryStore.cleanMess('fluff_shelf')
            soundEffects.playCleanSparkle()
          }}
        >
          <group scale={[0.035, 0.025, 0.035]}>
            <mesh material={materials.porcelain} scale={[1, 0.6, 1]}>
              <icosahedronGeometry args={[0.8, 1]} />
            </mesh>
          </group>
        </CleanableItem>
      )}
    </group>
  )
}

function CleanableItem({
  children,
  position,
  label,
  onClean,
}: {
  id: string
  position: [number, number, number]
  label: string
  children: React.ReactNode
  onClean: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={position}
      name={label}
      onPointerEnter={(e) => {
        e.stopPropagation()
        setHovered(true)
        soundEffects.playGentleTouch()
      }}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClean()
      }}
    >
      {/* Invisible interaction hit sphere for easy clicking */}
      <mesh visible={false}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual mesh */}
      <group scale={hovered ? [1.25, 1.25, 1.25] : [1, 1, 1]}>
        {children}
      </group>

      {/* Gentle sparkle hint on hover */}
      {hovered && (
        <group position-y={0.08} scale={[0.02, 0.02, 0.02]}>
          <mesh material={materials.butter}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        </group>
      )}
    </group>
  )
}
