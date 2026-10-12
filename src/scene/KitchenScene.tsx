import { OrbitControls } from '@react-three/drei'
import { CAMERA } from '../config/scene'
import { Berry } from '../characters/Berry/Berry'
import {
  DragInteractionPlane,
  DropZoneVisualizers,
} from '../interaction/DragVisualizers'
import { useGrabState } from '../interaction/GrabSystem'
import { CareInteractions } from './environment/CareInteractions'
import { KitchenEnvironment } from './environment/KitchenEnvironment'
import { SunbeamMotes } from './environment/SunbeamMotes'
import { KitchenLighting } from './lighting/KitchenLighting'
import { InteractableObjects } from './objects/InteractableObjects'
import { ShadowGroup } from './primitives'

/**
 * The full 3D kitchen scene composition.
 *
 * Combines lighting, environment architecture, interactive kitchen objects,
 * Berry (living character), controlled drop zones, care interactions, and calibrated orbit camera controls
 * that suspend smoothly whenever the player picks up an object.
 */
export function KitchenScene() {
  const isDragging = useGrabState((s) => s.isDragging)

  return (
    <>
      {/* Scene illumination */}
      <KitchenLighting />

      {/* Orbit Controls tuned for diorama viewing (paused during active item dragging) */}
      <OrbitControls
        enabled={!isDragging}
        target={CAMERA.target}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        minPolarAngle={CAMERA.minPolarAngle}
        maxPolarAngle={CAMERA.maxPolarAngle}
        minAzimuthAngle={CAMERA.minAzimuthAngle}
        maxAzimuthAngle={CAMERA.maxAzimuthAngle}
      />

      {/* Environment geometry */}
      <ShadowGroup>
        <KitchenEnvironment />
      </ShadowGroup>

      {/* Ambient sunbeam dust motes */}
      <SunbeamMotes />

      {/* Care interactions: tidy cleanable messes */}
      <CareInteractions />

      {/* Interactable & Draggable toy items */}
      <InteractableObjects />

      {/* Living Food Characters */}
      <Berry />

      {/* Visual snap rings for drop zones while holding an item */}
      <DropZoneVisualizers />

      {/* Full-viewport invisible drag-catcher */}
      <DragInteractionPlane />
    </>
  )
}
