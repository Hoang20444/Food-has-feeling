import type { ThreeEvent } from '@react-three/fiber'
import { interaction } from '../../state/interactionStore'
import { BaseCabinets } from './BaseCabinets'
import { DiningArea } from './DiningArea'
import { Fridge } from './Fridge'
import { KitchenWindow } from './KitchenWindow'
import { Room } from './Room'
import { WallClock } from './WallClock'
import { WallStorage } from './WallStorage'

/**
 * All static, non-interactive kitchen pieces.
 *
 * The group listens for pointer events so that environment geometry correctly
 * *occludes* interactables behind it, and so that clicking the room itself
 * (floor, walls, furniture) clears the current selection.
 */
export function KitchenEnvironment() {
  const block = (e: ThreeEvent<PointerEvent>) => e.stopPropagation()
  const clear = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta <= 5) interaction.clearSelection()
  }

  return (
    <group onPointerOver={block} onClick={clear}>
      <Room />
      <BaseCabinets />
      <KitchenWindow />
      <WallStorage />
      <Fridge />
      <WallClock />
      <DiningArea />
    </group>
  )
}
