import { Color, MeshStandardMaterial } from 'three'
import { TABLE } from '../../config/scene'
import { useTimeAtmosphere } from '../../state/timeAtmosphereStore'
import { useWorldMemoryStore } from '../../state/worldMemoryStore'
import { materials } from '../materials'
import { Block } from '../primitives'

const TOP_THICKNESS = 0.09
const LEG_HEIGHT = TABLE.surfaceY - TOP_THICKNESS
const { offset: PLACEMAT_OFFSET, size: PLACEMAT_SIZE } = TABLE.placemat

const eveningBulbMat = new MeshStandardMaterial({
  color: '#ffc107',
  emissive: new Color('#ff9800'),
  emissiveIntensity: 1.2,
  roughness: 0.3,
})

/**
 * The central play area:
 * - Oval rug, wooden table with placemat, and cushioned stools.
 * - Hanging overhead pendant lamp that glows warmly in the evening.
 * - Memory decorations: cozy coaster (if Mug frequents the table) and butter dish (for Toaster).
 */
export function DiningArea() {
  return (
    <group position={TABLE.position}>
      <Rug />
      <Table />
      <PendantLamp />
      <Stool position={[-0.48, -0.88]} />
      <Stool position={[0.48, -0.88]} rotationY={0.5} />
    </group>
  )
}

function Rug() {
  return (
    <group scale={[1.75, 1, 1.2]}>
      <mesh position-y={0.006} material={materials.butter} userData={{ shadow: 'receive' }}>
        <cylinderGeometry args={[1, 1, 0.012, 40]} />
      </mesh>
      <mesh position-y={0.008} material={materials.porcelain} userData={{ shadow: 'receive' }}>
        <cylinderGeometry args={[0.9, 0.9, 0.012, 40]} />
      </mesh>
    </group>
  )
}

function Table() {
  const { width, depth, surfaceY } = TABLE
  const legX = width / 2 - 0.16
  const legZ = depth / 2 - 0.14

  const hasMugCoaster = useWorldMemoryStore((s) => Boolean(s.unlockedDecorations.mug_cozy_coaster))
  const hasButterDish = useWorldMemoryStore((s) => Boolean(s.unlockedDecorations.toaster_butter_dish))

  return (
    <group>
      <Block
        size={[width, TOP_THICKNESS, depth]}
        radius={0.04}
        position-y={surfaceY - TOP_THICKNESS / 2}
        material={materials.woodLight}
      />
      <mesh position-y={surfaceY - TOP_THICKNESS - 0.05} material={materials.wood}>
        <boxGeometry args={[width - 0.24, 0.1, depth - 0.24]} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * legX, LEG_HEIGHT / 2, sz * legZ]} material={materials.wood}>
            <cylinderGeometry args={[0.05, 0.035, LEG_HEIGHT, 10]} />
          </mesh>
        )),
      )}

      {/* Placemat for the plate */}
      <Block
        size={PLACEMAT_SIZE}
        radius={0.005}
        position={[PLACEMAT_OFFSET[0], surfaceY + PLACEMAT_SIZE[1] / 2, PLACEMAT_OFFSET[1]]}
        material={materials.butter}
        userData={{ shadow: 'receive' }}
      />

      {/* World Memory Decoration: Knitted coaster for Mug */}
      {hasMugCoaster && (
        <group position={[PLACEMAT_OFFSET[0] + 0.38, surfaceY + 0.006, PLACEMAT_OFFSET[1] - 0.12]}>
          <mesh material={materials.mint} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.11, 24]} />
          </mesh>
          <mesh material={materials.mintDeep} rotation-x={-Math.PI / 2} position-z={0.001}>
            <ringGeometry args={[0.08, 0.11, 24]} />
          </mesh>
        </group>
      )}

      {/* World Memory Decoration: Golden butter dish for Toaster */}
      {hasButterDish && (
        <group position={[PLACEMAT_OFFSET[0] - 0.36, surfaceY + 0.02, PLACEMAT_OFFSET[1] + 0.14]} scale={[0.8, 0.8, 0.8]}>
          {/* Ceramic plate */}
          <mesh material={materials.porcelain}>
            <cylinderGeometry args={[0.1, 0.08, 0.02, 16]} />
          </mesh>
          {/* Butter pat */}
          <mesh position-y={0.02} material={materials.butterDeep}>
            <boxGeometry args={[0.07, 0.035, 0.05]} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function PendantLamp() {
  const isEvening = useTimeAtmosphere((s) => s.current === 'evening')
  const lampY = 2.4

  return (
    <group position={[0, lampY, 0]}>
      {/* Hanging cord from ceiling */}
      <mesh position-y={0.6} material={materials.charcoal}>
        <cylinderGeometry args={[0.006, 0.006, 1.2, 6]} />
      </mesh>

      {/* Vintage brass lamp socket */}
      <mesh position-y={0.08} material={materials.butterDeep}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
      </mesh>

      {/* Conical porcelain shade */}
      <mesh material={isEvening ? materials.butter : materials.porcelain}>
        <coneGeometry args={[0.26, 0.18, 18, 1, true]} />
      </mesh>

      {/* Inside bulb */}
      <mesh position-y={-0.03} material={isEvening ? eveningBulbMat : materials.porcelain}>
        <sphereGeometry args={[0.045, 12, 12]} />
      </mesh>
    </group>
  )
}

function Stool({ position, rotationY = 0 }: { position: [number, number]; rotationY?: number }) {
  const seatY = 0.6
  const legR = 0.16
  return (
    <group position={[position[0], 0, position[1]]} rotation-y={rotationY}>
      <mesh position-y={seatY} material={materials.wood}>
        <cylinderGeometry args={[0.24, 0.22, 0.06, 18]} />
      </mesh>
      <mesh position-y={seatY + 0.04} scale={[1, 0.28, 1]} material={materials.mint}>
        <sphereGeometry args={[0.215, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * legR, seatY / 2, Math.sin(a) * legR]}
            rotation={[-Math.sin(a) * 0.08, 0, Math.cos(a) * 0.08]}
            material={materials.wood}
          >
            <cylinderGeometry args={[0.022, 0.026, seatY, 8]} />
          </mesh>
        )
      })}
      <mesh position-y={0.2} rotation-x={Math.PI / 2} material={materials.woodDark}>
        <torusGeometry args={[legR + 0.012, 0.012, 6, 20]} />
      </mesh>
    </group>
  )
}
