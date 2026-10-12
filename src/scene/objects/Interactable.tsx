import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, type Group, type MeshBasicMaterial } from 'three'
import { INTERACTABLES } from '../../config/interactables'
import { palette } from '../../config/palette'
import { interaction, useInteraction } from '../../state/interactionStore'
import { kitchenState } from '../../state/kitchenState'
import type { InteractableId } from '../../types/interaction'

type Vec3 = [number, number, number]

interface InteractableProps {
  id: InteractableId
  position: Vec3
  rotationY?: number
  /** Radius of the soft selection ring drawn on the surface beneath the object. */
  footprint: number
  /** Height above the object's base where the floating label is anchored. */
  labelHeight: number
  children: ReactNode
}

const HOVER_LIFT = 0.05
const SELECT_LIFT = 0.09
const HOVER_SCALE = 1.06

/**
 * Wraps any object model and makes it interactable:
 *  - hover → gentle lift + scale, pointer cursor, faint ring, name label
 *  - click → selected (higher lift, soft bob, solid ring, label with a note)
 *
 * The visual model is passed as children, so procedural placeholders can later
 * be swapped for Blender models without changing interaction code.
 * The object's local origin must sit on the surface it rests on.
 */
export function Interactable({
  id,
  position,
  rotationY = 0,
  footprint,
  labelHeight,
  children,
}: InteractableProps) {
  const hovered = useInteraction((s) => s.hoveredId === id)
  const selected = useInteraction((s) => s.selectedId === id)

  const liftRef = useRef<Group>(null)
  const ringMatRef = useRef<MeshBasicMaterial>(null)
  const ringRef = useRef<Group>(null)

  useFrame((state, delta) => {
    const lift = liftRef.current
    const ringMat = ringMatRef.current
    const ring = ringRef.current
    if (!lift || !ringMat || !ring) return

    const t = state.clock.elapsedTime
    const bob = selected ? Math.sin(t * 2.4) * 0.015 : 0
    const targetY = (selected ? SELECT_LIFT : hovered ? HOVER_LIFT : 0) + bob
    const targetScale = hovered || selected ? HOVER_SCALE : 1
    const targetOpacity = selected ? 0.9 : hovered ? 0.4 : 0
    const targetRing = selected ? 1 : hovered ? 0.92 : 0.8

    lift.position.y = MathUtils.damp(lift.position.y, targetY, 12, delta)
    const s = MathUtils.damp(lift.scale.x, targetScale, 12, delta)
    lift.scale.setScalar(s)

    ringMat.opacity = MathUtils.damp(ringMat.opacity, targetOpacity, 10, delta)
    const rs = MathUtils.damp(ring.scale.x, targetRing, 10, delta)
    ring.scale.setScalar(rs)
    ring.visible = ringMat.opacity > 0.01
  })

  useEffect(() => {
    return () => {
      if (hovered) {
        document.body.style.cursor = 'default'
      }
    }
  }, [hovered])

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    interaction.hover(id)
  }
  const onPointerOut = () => {
    document.body.style.cursor = 'default'
    interaction.unhover(id)
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 5) return // ended an orbit drag, not a click
    interaction.select(id)
    kitchenState.recordInspection(id)
    if (id === 'mug') kitchenState.triggerMug()
    else if (id === 'toaster') kitchenState.triggerToaster()
    else if (id === 'radio') kitchenState.toggleRadio()
    else if (id === 'kettle') kitchenState.triggerKettle()
    else if (id === 'plate') kitchenState.triggerPlate()
  }

  const info = INTERACTABLES[id]
  const showLabel = hovered || selected

  return (
    <group position={position} rotation-y={rotationY}>
      {/* Selection ring on the resting surface (not affected by lift). */}
      <group ref={ringRef} position-y={0.006} scale={0.8} visible={false}>
        <mesh rotation-x={-Math.PI / 2} raycast={() => null}>
          <ringGeometry args={[footprint * 0.86, footprint, 48]} />
          <meshBasicMaterial
            ref={ringMatRef}
            color={palette.butterDeep}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group
        ref={liftRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        {children}
      </group>

      <Html
        position={[0, labelHeight, 0]}
        center
        zIndexRange={[20, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`object-label${showLabel ? ' is-visible' : ''}${selected ? ' is-selected' : ''}`}
          aria-hidden={!showLabel}
        >
          <span className="object-label__name">{info.name}</span>
        </div>
      </Html>
    </group>
  )
}
