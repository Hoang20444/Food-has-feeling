import { useMemo } from 'react'
import { palette } from '../../config/palette'
import { ROOM, ROOM_BOUNDS } from '../../config/scene'
import { createCheckerMaterial, materials } from '../materials'

const { width, depth, wallHeight, wallThickness: t, slabThickness } = ROOM
const { minX, minZ } = ROOM_BOUNDS

const WAINSCOT_HEIGHT = 1.0
const RAIL_HEIGHT = 0.05
const BASEBOARD_HEIGHT = 0.12

// Walls sit fully behind the room's inner faces, so the slab extends by one
// wall thickness on the −X and −Z sides.
const SLAB_W = width + t
const SLAB_D = depth + t
const SLAB_CENTER_X = minX - t + SLAB_W / 2
const SLAB_CENTER_Z = minZ - t + SLAB_D / 2

/**
 * The diorama shell: a thick floor slab with checker tiles, plus a back wall
 * and a left wall with a two-tone wainscot, chair rail and baseboards.
 */
export function Room() {
  // 0.5 m tiles → one 2×2 checker repeat per metre.
  const floorMaterial = useMemo(
    () => createCheckerMaterial(palette.floorLight, palette.floorDark, width, depth),
    [],
  )

  return (
    <group>
      {/* Floor slab + tiles */}
      <mesh
        position={[SLAB_CENTER_X, -slabThickness / 2 - 0.001, SLAB_CENTER_Z]}
        material={materials.slab}
        userData={{ shadow: 'receive' }}
      >
        <boxGeometry args={[SLAB_W, slabThickness, SLAB_D]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} material={floorMaterial} userData={{ shadow: 'receive' }}>
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* Back wall (−Z) */}
      <group position={[0, 0, minZ]}>
        <mesh position={[SLAB_CENTER_X, wallHeight / 2, -t / 2]} material={materials.wall}>
          <boxGeometry args={[SLAB_W, wallHeight, t]} />
        </mesh>
        <WallTrim length={width} />
      </group>

      {/* Left wall (−X), rotated so its inner face (local +Z) looks toward +X.
          After the rotation, local +X points toward world −Z. */}
      <group position={[minX, 0, 0]} rotation-y={Math.PI / 2}>
        <mesh position={[-SLAB_CENTER_Z, wallHeight / 2, -t / 2]} material={materials.wall}>
          <boxGeometry args={[SLAB_D, wallHeight, t]} />
        </mesh>
        <WallTrim length={depth} />
      </group>
    </group>
  )
}

/** Wainscot panel, chair rail and baseboard along a wall's inner face (local +Z). */
function WallTrim({ length }: { length: number }) {
  return (
    <group>
      <mesh
        position={[0, WAINSCOT_HEIGHT / 2, 0.01]}
        material={materials.wallShade}
        userData={{ shadow: 'receive' }}
      >
        <boxGeometry args={[length, WAINSCOT_HEIGHT, 0.02]} />
      </mesh>
      <mesh position={[0, WAINSCOT_HEIGHT, 0.03]} material={materials.woodLight}>
        <boxGeometry args={[length, RAIL_HEIGHT, 0.06]} />
      </mesh>
      <mesh position={[0, BASEBOARD_HEIGHT / 2, 0.035]} material={materials.wood}>
        <boxGeometry args={[length, BASEBOARD_HEIGHT, 0.05]} />
      </mesh>
    </group>
  )
}
