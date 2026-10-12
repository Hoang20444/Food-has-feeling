import { useMemo } from 'react'
import { Shape } from 'three'
import { ROOM_BOUNDS, WINDOW } from '../../config/scene'
import { materials } from '../materials'
import { Block } from '../primitives'

const FRAME = 0.09
const FRAME_DEPTH = 0.1
const { width: W, height: H } = WINDOW

/**
 * The window above the sink — the scene's focal point.
 *
 * The "outside" is a small layered, softly-lit diorama painted onto the wall
 * (sky, sun, cloud, two rolling hills and a tree), framed by chunky porcelain
 * trim, a scalloped strawberry valance and a sill with a little herb pot.
 */
export function KitchenWindow() {
  const centerY = WINDOW.bottomY + H / 2
  return (
    <group position={[WINDOW.centerX, centerY, ROOM_BOUNDS.minZ]}>
      <WindowView />
      <WindowFrame />
      <Valance />
      <Sill />
    </group>
  )
}

/** Build a hill silhouette that always stays inside the window opening. */
function makeHill(leftY: number, peakX: number, peakY: number, rightY: number) {
  const s = new Shape()
  s.moveTo(-W / 2, -H / 2)
  s.lineTo(W / 2, -H / 2)
  s.lineTo(W / 2, rightY)
  s.quadraticCurveTo(peakX + W * 0.25, peakY, peakX, peakY)
  s.quadraticCurveTo(peakX - W * 0.25, peakY, -W / 2, leftY)
  s.closePath()
  return s
}

function WindowView() {
  const farHill = useMemo(() => makeHill(-0.02, -0.3, 0.12, -0.14), [])
  const nearHill = useMemo(() => makeHill(-0.3, 0.35, -0.12, -0.24), [])

  // Everything sits a few millimetres in front of the wall, layered back to front.
  return (
    <group position-z={0.004}>
      <mesh material={materials.sky} userData={{ shadow: 'receive' }}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh position={[0, -H * 0.3, 0.001]} material={materials.skyLow} userData={{ shadow: 'receive' }}>
        <planeGeometry args={[W, H * 0.4]} />
      </mesh>
      <mesh position={[0.42, 0.3, 0.002]} material={materials.sun} userData={{ shadow: 'none' }}>
        <circleGeometry args={[0.15, 20]} />
      </mesh>

      {/* A puffy low-poly cloud */}
      <group position={[-0.42, 0.38, 0.004]} scale={[1, 1, 0.25]}>
        {(
          [
            [-0.12, -0.01, 0.08],
            [0, 0.03, 0.11],
            [0.13, -0.01, 0.08],
          ] as const
        ).map(([x, y, r]) => (
          <mesh key={x} position={[x, y, 0]} material={materials.cloud} userData={{ shadow: 'none' }}>
            <icosahedronGeometry args={[r, 1]} />
          </mesh>
        ))}
      </group>

      <mesh position-z={0.006} material={materials.hillFar} userData={{ shadow: 'none' }}>
        <shapeGeometry args={[farHill, 16]} />
      </mesh>
      <mesh position-z={0.008} material={materials.hill} userData={{ shadow: 'none' }}>
        <shapeGeometry args={[nearHill, 16]} />
      </mesh>

      {/* Tiny tree on the near hill */}
      <group position={[0.32, -0.1, 0.012]} scale={[1, 1, 0.3]}>
        <mesh position-y={0.04} material={materials.woodDark} userData={{ shadow: 'none' }}>
          <cylinderGeometry args={[0.012, 0.015, 0.08, 6]} />
        </mesh>
        <mesh position-y={0.13} material={materials.leaf} userData={{ shadow: 'none' }}>
          <icosahedronGeometry args={[0.075, 0]} />
        </mesh>
      </group>
    </group>
  )
}

function WindowFrame() {
  const z = FRAME_DEPTH / 2
  return (
    <group>
      {/* Outer frame */}
      <Block size={[W + FRAME * 2, FRAME, FRAME_DEPTH]} radius={0.02} position={[0, H / 2 + FRAME / 2, z]} material={materials.porcelain} />
      <Block size={[W + FRAME * 2, FRAME, FRAME_DEPTH]} radius={0.02} position={[0, -H / 2 - FRAME / 2, z]} material={materials.porcelain} />
      <Block size={[FRAME, H, FRAME_DEPTH]} radius={0.02} position={[-W / 2 - FRAME / 2, 0, z]} material={materials.porcelain} />
      <Block size={[FRAME, H, FRAME_DEPTH]} radius={0.02} position={[W / 2 + FRAME / 2, 0, z]} material={materials.porcelain} />

      {/* Mullions */}
      <Block size={[0.045, H, 0.05]} radius={0.012} position={[0, 0, 0.03]} material={materials.porcelain} />
      <Block size={[W, 0.045, 0.05]} radius={0.012} position={[0, H * 0.12, 0.03]} material={materials.porcelain} />
    </group>
  )
}

function Valance() {
  const top = H / 2 + FRAME
  const fabricH = 0.22
  const fabricY = top + 0.06
  const fabricW = W + 0.34
  const scallops = 7
  const step = fabricW / scallops

  return (
    <group>
      <mesh position={[0, fabricY + fabricH / 2 + 0.03, 0.1]} rotation-z={Math.PI / 2} material={materials.woodDark}>
        <cylinderGeometry args={[0.018, 0.018, W + 0.5, 10]} />
      </mesh>
      <Block size={[fabricW, fabricH, 0.05]} radius={0.02} position={[0, fabricY, 0.12]} material={materials.strawberry} />
      {Array.from({ length: scallops }, (_, i) => (
        <mesh
          key={i}
          position={[-fabricW / 2 + step * (i + 0.5), fabricY - fabricH / 2 + 0.005, 0.12]}
          scale={[1, 0.8, 0.4]}
          material={materials.strawberry}
        >
          <sphereGeometry args={[step / 2, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </mesh>
      ))}
    </group>
  )
}

function Sill() {
  const sillH = 0.06
  const sillY = -H / 2 - FRAME + sillH / 2 - 0.01
  const sillTop = sillY + sillH / 2
  return (
    <group>
      <Block size={[W + 0.36, sillH, 0.22]} radius={0.02} position={[0, sillY, 0.11]} material={materials.porcelain} />
      <HerbPot position={[W / 2 - 0.12, sillTop, 0.12]} />
    </group>
  )
}

function HerbPot({ position }: { position: [number, number, number] }) {
  const leaves: [number, number, number, number][] = [
    [0, 0.2, 0, 0.075],
    [-0.06, 0.17, 0.02, 0.06],
    [0.06, 0.18, -0.01, 0.062],
    [0.01, 0.25, 0.01, 0.05],
  ]
  return (
    <group position={position}>
      <mesh position-y={0.065} material={materials.butter}>
        <cylinderGeometry args={[0.085, 0.065, 0.13, 12]} />
      </mesh>
      <mesh position-y={0.125} rotation-x={Math.PI / 2} material={materials.butterDeep}>
        <torusGeometry args={[0.085, 0.012, 6, 16]} />
      </mesh>
      {leaves.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[i * 0.7, i * 1.1, 0]} material={materials.leaf}>
          <icosahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
    </group>
  )
}
