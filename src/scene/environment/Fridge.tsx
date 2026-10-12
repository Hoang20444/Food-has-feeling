import { ROOM_BOUNDS } from '../../config/scene'
import { materials } from '../materials'
import { Block } from '../primitives'

const FRIDGE = {
  centerX: 1.9,
  width: 1.05,
  depth: 0.78,
  height: 2.3,
  feet: 0.06,
  freezerHeight: 0.62,
}

/** A chunky, rounded retro fridge with a note pinned by a strawberry magnet. */
export function Fridge() {
  const { centerX, width, depth, height, feet, freezerHeight } = FRIDGE
  const backZ = ROOM_BOUNDS.minZ + 0.02
  const bodyDepth = depth - 0.06
  const frontZ = backZ + bodyDepth
  const gap = 0.025
  const doorW = width - 0.06
  const mainH = height - freezerHeight - gap * 3
  const freezerY = feet + height - gap - freezerHeight / 2
  const mainY = feet + gap + mainH / 2

  return (
    <group position-x={centerX}>
      {/* Feet */}
      {[-1, 1].map((sx) =>
        [0.15, bodyDepth - 0.1].map((dz) => (
          <mesh key={`${sx}-${dz}`} position={[sx * (width / 2 - 0.12), feet / 2, backZ + dz]} material={materials.charcoal}>
            <cylinderGeometry args={[0.035, 0.04, feet, 8]} />
          </mesh>
        )),
      )}

      {/* Body */}
      <Block
        size={[width, height, bodyDepth]}
        radius={0.12}
        position={[0, feet + height / 2, backZ + bodyDepth / 2]}
        material={materials.porcelain}
      />

      {/* Doors */}
      <Block size={[doorW, freezerHeight, 0.06]} radius={0.05} position={[0, freezerY, frontZ]} material={materials.porcelain} />
      <Block size={[doorW, mainH, 0.06]} radius={0.05} position={[0, mainY, frontZ]} material={materials.porcelain} />

      {/* Handles */}
      <Block size={[0.05, 0.3, 0.05]} radius={0.02} position={[-doorW / 2 + 0.1, freezerY - 0.1, frontZ + 0.06]} material={materials.steel} />
      <Block size={[0.05, 0.5, 0.05]} radius={0.02} position={[-doorW / 2 + 0.1, mainY + mainH / 2 - 0.4, frontZ + 0.06]} material={materials.steel} />

      {/* Note + magnets */}
      <group position={[0.18, mainY + 0.2, frontZ + 0.032]} rotation-z={-0.08}>
        <mesh material={materials.butter} userData={{ shadow: 'receive' }}>
          <boxGeometry args={[0.24, 0.28, 0.006]} />
        </mesh>
        {[0.06, 0, -0.06].map((y, i) => (
          <mesh key={y} position={[-0.02 + (i === 1 ? 0.02 : 0), y - 0.02, 0.004]} material={materials.butterDeep} userData={{ shadow: 'none' }}>
            <boxGeometry args={[i === 1 ? 0.12 : 0.15, 0.012, 0.002]} />
          </mesh>
        ))}
        <mesh position={[0, 0.13, 0.02]} scale={[1, 1, 0.6]} material={materials.strawberry}>
          <sphereGeometry args={[0.035, 12, 8]} />
        </mesh>
      </group>
      <mesh position={[-0.12, mainY - 0.15, frontZ + 0.045]} scale={[1, 1, 0.6]} material={materials.mintDeep}>
        <sphereGeometry args={[0.03, 12, 8]} />
      </mesh>
    </group>
  )
}
