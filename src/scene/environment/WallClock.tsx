import { ROOM_BOUNDS } from '../../config/scene'
import { materials } from '../materials'

const RADIUS = 0.26

/** Round wall clock on the left wall, stopped at a smiling 10:10. */
export function WallClock() {
  // Local frame: the clock face looks toward +X (into the room).
  return (
    <group position={[ROOM_BOUNDS.minX, 2.75, 0.55]}>
      <mesh position-x={0.03} rotation-z={Math.PI / 2} material={materials.porcelain}>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.04, 28]} />
      </mesh>
      <mesh position-x={0.05} rotation-y={Math.PI / 2} material={materials.butter}>
        <torusGeometry args={[RADIUS, 0.035, 8, 28]} />
      </mesh>

      {/* Hour markers at 12, 3, 6, 9 */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2
        return (
          <mesh
            key={i}
            position={[0.055, Math.cos(a) * RADIUS * 0.75, Math.sin(a) * RADIUS * 0.75]}
            material={materials.cocoa}
            userData={{ shadow: 'none' }}
          >
            <sphereGeometry args={[0.014, 8, 6]} />
          </mesh>
        )
      })}

      {/* Hands: rotation about X; positive angle sweeps from 12 toward 9. */}
      <Hand length={RADIUS * 0.5} width={0.026} angle={Math.PI / 3} offset={0.06} />
      <Hand length={RADIUS * 0.7} width={0.018} angle={-Math.PI / 3} offset={0.066} />
      <mesh position-x={0.07} rotation-z={Math.PI / 2} material={materials.strawberry}>
        <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
      </mesh>
    </group>
  )
}

function Hand({ length, width, angle, offset }: { length: number; width: number; angle: number; offset: number }) {
  return (
    <group position-x={offset} rotation-x={angle}>
      <mesh position-y={length / 2} material={materials.cocoa} userData={{ shadow: 'none' }}>
        <boxGeometry args={[0.008, length, width]} />
      </mesh>
    </group>
  )
}
