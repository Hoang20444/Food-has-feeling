import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, type Group } from 'three'
import { palette } from '../config/palette'
import { DROP_ZONES, findNearestDropZone } from './DropZones'
import { DragController } from './DragController'
import { grabSystem, useGrabState } from './GrabSystem'

/**
 * Renders pulsating soft rings on valid drop surfaces
 * whenever the player is holding an object.
 */
export function DropZoneVisualizers() {
  const isDragging = useGrabState((s) => s.isDragging)
  const candidateZone = useGrabState((s) => s.candidateZone)

  if (!isDragging) return null

  return (
    <group>
      {DROP_ZONES.map((zone) => {
        const isHovered = candidateZone?.id === zone.id
        return (
          <DropZoneRing
            key={zone.id}
            zone={zone}
            isHovered={isHovered}
          />
        )
      })}
    </group>
  )
}

function DropZoneRing({
  zone,
  isHovered,
}: {
  zone: (typeof DROP_ZONES)[0]
  isHovered: boolean
}) {
  const ringRef = useRef<Group>(null)

  useFrame((state, delta) => {
    const ring = ringRef.current
    if (!ring) return

    const t = state.clock.elapsedTime
    const baseScale = isHovered ? 1.15 + Math.sin(t * 8) * 0.05 : 0.95 + Math.sin(t * 3) * 0.03
    const s = MathUtils.damp(ring.scale.x, baseScale, 10, delta)
    ring.scale.setScalar(s)
  })

  return (
    <group
      ref={ringRef}
      position={[zone.position[0], zone.surfaceY + 0.008, zone.position[2]]}
    >
      <mesh rotation-x={-Math.PI / 2} raycast={() => null}>
        <ringGeometry args={[zone.radius * 0.35, zone.radius * 0.44, 32]} />
        <meshBasicMaterial
          color={isHovered ? palette.strawberry : palette.butterDeep}
          transparent
          opacity={isHovered ? 0.85 : 0.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Full-viewport invisible interaction catcher that runs during active dragging.
 * Tracks pointer movements via useFrame and window pointerup.
 */
export function DragInteractionPlane() {
  const isDragging = useGrabState((s) => s.isDragging)
  const grabbedId = useGrabState((s) => s.grabbedId)
  const originPos = useGrabState((s) => s.originPos)
  const { camera } = useThree()

  const [ox, oy, oz] = originPos
  const anchorVec = useMemo(() => new Vector3(ox, oy, oz), [ox, oy, oz])

  // Attach global pointerup listener when dragging
  useEffect(() => {
    if (!isDragging) return

    const onPointerUp = () => {
      DragController.handleDrop()
    }

    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isDragging])

  // Continuously update drag position on every animation frame
  useFrame((state) => {
    if (!isDragging || !grabbedId) return

    state.raycaster.setFromCamera(state.pointer, camera)
    const worldPoint = DragController.projectPointerToWorld(
      state.raycaster,
      camera.position,
      anchorVec,
    )
    if (!worldPoint) return

    const nearest = findNearestDropZone(worldPoint)
    grabSystem.updateDragPos(worldPoint, nearest?.zone || null)
  })

  if (!isDragging || !grabbedId) return null

  return (
    <mesh
      position={[0, originPos[1], 0]}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
