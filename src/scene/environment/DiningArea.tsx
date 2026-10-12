import { TABLE } from '../../config/scene'
import { materials } from '../materials'
import { Block } from '../primitives'

const TOP_THICKNESS = 0.09
const LEG_HEIGHT = TABLE.surfaceY - TOP_THICKNESS
const { offset: PLACEMAT_OFFSET, size: PLACEMAT_SIZE } = TABLE.placemat

/**
 * The central play area: an oval rug, a wooden kitchen table with a placemat,
 * and two cushioned stools tucked behind it (so they never block the view).
 */
export function DiningArea() {
  return (
    <group position={TABLE.position}>
      <Rug />
      <Table />
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
