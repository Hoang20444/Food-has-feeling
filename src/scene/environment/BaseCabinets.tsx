import { useMemo } from 'react'
import { palette } from '../../config/palette'
import { COOKTOP, COUNTER, ROOM_BOUNDS, WINDOW } from '../../config/scene'
import { createCheckerMaterial, materials } from '../materials'
import { Block } from '../primitives'

const WALL_Z = ROOM_BOUNDS.minZ
const FRONT_Z = WALL_Z + COUNTER.depth
const TOE_KICK = 0.1
const DOOR_GAP = 0.03
const DOOR_THICKNESS = 0.035
const DOOR_BOTTOM = TOE_KICK + DOOR_GAP
const DOOR_TOP = COUNTER.bodyHeight - DOOR_GAP
const BACKSPLASH_HEIGHT = 0.5

type UnitKind = 'drawers' | 'door' | 'double'
interface CabinetUnit {
  from: number
  to: number
  kind: UnitKind
}

/** Cabinet fronts, left → right. Alternating fronts give the run a gentle rhythm. */
const UNITS: CabinetUnit[] = [
  { from: COUNTER.startX, to: -2.5, kind: 'drawers' },
  { from: -2.5, to: -1.5, kind: 'door' },
  { from: -1.5, to: -0.4, kind: 'double' }, // under the sink / window
  { from: -0.4, to: 0.35, kind: 'drawers' },
  { from: 0.35, to: COUNTER.endX, kind: 'door' },
]

/**
 * The kitchen counter run along the back wall: cabinet bodies with mint fronts,
 * a warm wood countertop, a tiled backsplash, a sink and a small cooktop.
 */
export function BaseCabinets() {
  const runWidth = COUNTER.endX - COUNTER.startX
  const runCenterX = (COUNTER.startX + COUNTER.endX) / 2
  const bodyHeight = COUNTER.bodyHeight - TOE_KICK

  // Small 12.5 cm tiles: 4 checks per metre → 2 repeats per metre.
  const backsplashMaterial = useMemo(
    () =>
      createCheckerMaterial(
        palette.porcelain,
        palette.mintPale,
        runWidth * 2,
        BACKSPLASH_HEIGHT * 2,
        0.5,
      ),
    [runWidth],
  )

  return (
    <group>
      {/* Toe kick (recessed) */}
      <mesh position={[runCenterX, TOE_KICK / 2, WALL_Z + (COUNTER.depth - 0.06) / 2]} material={materials.woodDark}>
        <boxGeometry args={[runWidth, TOE_KICK, COUNTER.depth - 0.06]} />
      </mesh>

      {/* Cabinet body */}
      <mesh
        position={[runCenterX, TOE_KICK + bodyHeight / 2, WALL_Z + COUNTER.depth / 2]}
        material={materials.cabinetBody}
      >
        <boxGeometry args={[runWidth, bodyHeight, COUNTER.depth]} />
      </mesh>

      {UNITS.map((u) => (
        <CabinetFront key={u.from} unit={u} />
      ))}

      {/* Countertop with a small front overhang */}
      <Block
        size={[runWidth + 0.05, COUNTER.topThickness, COUNTER.depth + 0.1]}
        radius={0.025}
        position={[
          runCenterX + 0.025,
          COUNTER.bodyHeight + COUNTER.topThickness / 2,
          WALL_Z + (COUNTER.depth + 0.1) / 2,
        ]}
        material={materials.wood}
      />

      {/* Tiled backsplash */}
      <mesh
        position={[runCenterX, COUNTER.surfaceY + BACKSPLASH_HEIGHT / 2, WALL_Z + 0.012]}
        material={backsplashMaterial}
        userData={{ shadow: 'receive' }}
      >
        <boxGeometry args={[runWidth, BACKSPLASH_HEIGHT, 0.02]} />
      </mesh>

      <Sink />
      <Cooktop />
    </group>
  )
}

function CabinetFront({ unit }: { unit: CabinetUnit }) {
  const width = unit.to - unit.from
  const centerX = (unit.from + unit.to) / 2
  const height = DOOR_TOP - DOOR_BOTTOM
  const centerY = (DOOR_TOP + DOOR_BOTTOM) / 2
  const z = FRONT_Z + DOOR_THICKNESS / 2

  if (unit.kind === 'drawers') {
    const count = 3
    const drawerH = (height - DOOR_GAP * (count - 1)) / count
    return (
      <group position={[centerX, 0, z]}>
        {Array.from({ length: count }, (_, i) => {
          const y = DOOR_BOTTOM + drawerH / 2 + i * (drawerH + DOOR_GAP)
          return (
            <group key={i} position-y={y}>
              <Block size={[width - DOOR_GAP * 2, drawerH, DOOR_THICKNESS]} radius={0.015} material={materials.mint} />
              <Block
                size={[0.22, 0.035, 0.035]}
                radius={0.015}
                position={[0, drawerH * 0.12, DOOR_THICKNESS / 2 + 0.02]}
                material={materials.woodDark}
              />
            </group>
          )
        })}
      </group>
    )
  }

  if (unit.kind === 'double') {
    const doorW = (width - DOOR_GAP * 3) / 2
    return (
      <group position={[centerX, centerY, z]}>
        {[-1, 1].map((side) => (
          <group key={side} position-x={side * (doorW / 2 + DOOR_GAP / 2)}>
            <Block size={[doorW, height, DOOR_THICKNESS]} radius={0.015} material={materials.mint} />
            <DoorInset width={doorW} height={height} />
            <Knob position={[-side * (doorW / 2 - 0.08), height * 0.3, 0]} />
          </group>
        ))}
      </group>
    )
  }

  const doorW = width - DOOR_GAP * 2
  return (
    <group position={[centerX, centerY, z]}>
      <Block size={[doorW, height, DOOR_THICKNESS]} radius={0.015} material={materials.mint} />
      <DoorInset width={doorW} height={height} />
      <Knob position={[doorW / 2 - 0.08, height * 0.3, 0]} />
    </group>
  )
}

/** A slightly raised inner panel — a classic shaker-style door detail. */
function DoorInset({ width, height }: { width: number; height: number }) {
  return (
    <Block
      size={[width - 0.14, height - 0.14, 0.02]}
      radius={0.008}
      position-z={DOOR_THICKNESS / 2}
      material={materials.mintDeep}
    />
  )
}

function Knob({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1], position[2] + DOOR_THICKNESS / 2 + 0.025]} material={materials.woodDark}>
      <sphereGeometry args={[0.03, 12, 8]} />
    </mesh>
  )
}

function Sink() {
  const x = WINDOW.centerX
  const z = WALL_Z + 0.45
  const y = COUNTER.surfaceY
  const faucetZ = WALL_Z + 0.14
  const pipeHeight = 0.24
  const neckRadius = 0.1

  return (
    <group>
      {/* Rim + basin */}
      <Block size={[0.8, 0.02, 0.52]} radius={0.008} position={[x, y + 0.01, z]} material={materials.steel} />
      <mesh position={[x, y + 0.021, z]} material={materials.steelDark} userData={{ shadow: 'receive' }}>
        <boxGeometry args={[0.66, 0.004, 0.38]} />
      </mesh>

      {/* Gooseneck faucet */}
      <group position={[x, y, faucetZ]}>
        <mesh position-y={pipeHeight / 2} material={materials.steel}>
          <cylinderGeometry args={[0.022, 0.03, pipeHeight, 12]} />
        </mesh>
        <mesh
          position={[0, pipeHeight, neckRadius]}
          rotation-y={-Math.PI / 2}
          material={materials.steel}
        >
          <torusGeometry args={[neckRadius, 0.022, 8, 16, Math.PI]} />
        </mesh>
        <mesh position={[0, pipeHeight - 0.03, neckRadius * 2]} material={materials.steel}>
          <cylinderGeometry args={[0.024, 0.022, 0.06, 12]} />
        </mesh>
        {[-0.15, 0.15].map((dx) => (
          <group key={dx} position={[dx, 0, 0]}>
            <mesh position-y={0.03} material={materials.steel}>
              <cylinderGeometry args={[0.025, 0.03, 0.06, 10]} />
            </mesh>
            <mesh position-y={0.07} material={dx < 0 ? materials.strawberry : materials.mintDeep}>
              <sphereGeometry args={[0.025, 10, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function Cooktop() {
  const { centerX, centerZ, burners } = COOKTOP
  const y = COUNTER.surfaceY
  return (
    <group position={[centerX, y, centerZ]}>
      <Block size={[0.72, 0.025, 0.48]} radius={0.01} position-y={0.0125} material={materials.charcoal} />
      {burners.map((dx, i) => (
        <mesh
          key={dx}
          position={[dx, 0.03, 0]}
          rotation-x={-Math.PI / 2}
          material={materials.steelDark}
          userData={{ shadow: 'receive' }}
        >
          <torusGeometry args={[i === 0 ? 0.1 : 0.08, 0.012, 6, 24]} />
        </mesh>
      ))}
    </group>
  )
}
