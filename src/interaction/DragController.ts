import { Plane, Raycaster, Vector3 } from 'three'
import { soundEffects } from '../shared/audio/soundEffects'
import { friendshipState } from '../state/friendshipState'
import { objectPositionsStore } from '../state/objectPositionsStore'
import { grabSystem } from './GrabSystem'

const planeIntersection = new Vector3()
const dragPlane = new Plane()
const cameraForward = new Vector3()

/**
 * Controller managing the 3D drag surface, camera alignment,
 * and snap calculation while an object is being held.
 */
export const DragController = {
  /**
   * Calculates world coordinates on the drag billboard plane
   * from 2D normalized device coordinates (NDC).
   */
  projectPointerToWorld: (
    raycaster: Raycaster,
    cameraPos: Vector3,
    anchorPos: Vector3,
  ): [number, number, number] | null => {
    // Plane facing the camera, passing through the grab origin
    cameraForward.subVectors(cameraPos, anchorPos).normalize()
    dragPlane.setFromNormalAndCoplanarPoint(cameraForward, anchorPos)

    if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
      return [planeIntersection.x, planeIntersection.y, planeIntersection.z]
    }
    return null
  },

  /**
   * Finalizes an active grab on pointer release.
   */
  handleDrop: () => {
    const { grabbedId, candidateZone, hasActuallyDragged } = grabSystem.getState()
    if (!grabbedId) return

    if (hasActuallyDragged) {
      if (candidateZone) {
        // Successful placement
        soundEffects.playDropTap()
        objectPositionsStore.setPosition(grabbedId, candidateZone.position, candidateZone.id)
        friendshipState.evaluatePlacement(grabbedId, candidateZone.id, candidateZone.name)
      } else {
        // Wrong placement / Missed drop
        soundEffects.playWobbleReturn()
      }
    }

    grabSystem.endGrab()
  },
}
