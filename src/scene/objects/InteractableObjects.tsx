import { DraggableObject } from '../../interaction/DraggableObject'
import { ShadowGroup } from '../primitives'
import { KettleModel } from './models/KettleModel'
import { MugModel } from './models/MugModel'
import { PlateModel } from './models/PlateModel'
import { RadioModel } from './models/RadioModel'
import { ToasterModel } from './models/ToasterModel'

/**
 * Places all 5 movable kitchen items across the kitchen diorama:
 * - Plate: on the dining table's placemat
 * - Mug: beside the plate on the dining table
 * - Radio: on the left counter surface
 * - Toaster: on the prep counter between sink and cooktop
 * - Kettle: on the cooktop's front-left burner
 *
 * Each item is wrapped in DraggableObject, enabling gentle pick-up,
 * floating follow, and smooth snapping into drop zones.
 */
export function InteractableObjects() {
  return (
    <ShadowGroup>
      {/* 1. Plate on placemat */}
      <DraggableObject id="plate" footprint={0.28} labelHeight={0.22}>
        <PlateModel />
      </DraggableObject>

      {/* 2. Mug on dining table */}
      <DraggableObject id="mug" footprint={0.16} labelHeight={0.34}>
        <MugModel />
      </DraggableObject>

      {/* 3. Retro radio on left counter */}
      <DraggableObject id="radio" footprint={0.34} labelHeight={0.52}>
        <RadioModel />
      </DraggableObject>

      {/* 4. Toaster on prep counter */}
      <DraggableObject id="toaster" footprint={0.28} labelHeight={0.42}>
        <ToasterModel />
      </DraggableObject>

      {/* 5. Kettle on cooktop */}
      <DraggableObject id="kettle" footprint={0.22} labelHeight={0.42}>
        <KettleModel />
      </DraggableObject>
    </ShadowGroup>
  )
}
