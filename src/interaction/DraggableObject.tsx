import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, Vector3, type Group, type MeshBasicMaterial } from 'three'
import { INTERACTABLES } from '../config/interactables'
import { palette } from '../config/palette'
import { soundEffects } from '../shared/audio/soundEffects'
import { interaction, useInteraction } from '../state/interactionStore'
import { kitchenState } from '../state/kitchenState'
import {
  useObjectPosition,
  type MovableObjectId,
} from '../state/objectPositionsStore'
import { grabSystem, useGrabState } from './GrabSystem'
import { TouchSparkles } from './TouchSparkles'

interface DraggableObjectProps {
  id: MovableObjectId
  footprint?: number
  labelHeight?: number
  children: ReactNode
}

const HOVER_LIFT = 0.04
const GRAB_LIFT = 0.18
const HOVER_SCALE = 1.05
const GRAB_SCALE = 1.08

const CARE_NOTES: Record<string, string> = {
  mug: '“Warm hands... thank you.”',
  toaster: "“Careful! I'm ticklish!”",
  plate: '“Going to a new spot?”',
  radio: '“Tuning into a new corner?”',
  kettle: '“Steady now, almost ready!”',
}

export function DraggableObject({
  id,
  footprint = 0.24,
  labelHeight = 0.38,
  children,
}: DraggableObjectProps) {
  const transform = useObjectPosition((s) => s[id])
  const isGrabbed = useGrabState((s) => s.grabbedId === id)
  const isCandidateZone = useGrabState((s) => s.candidateZone !== null && s.grabbedId === id)
  const dragPos = useGrabState((s) => (s.grabbedId === id ? s.currentDragPos : null))
  const isSelected = useInteraction((s) => s.selectedId === id)
  const isInspectedHover = useInteraction((s) => s.hoveredId === id)

  const [isHovered, setIsHovered] = useState(false)
  const [wobbleTime, setWobbleTime] = useState(0)

  const rootGroupRef = useRef<Group>(null)
  const liftGroupRef = useRef<Group>(null)
  const ringRef = useRef<Group>(null)
  const ringMatRef = useRef<MeshBasicMaterial>(null)
  const shadowMatRef = useRef<MeshBasicMaterial>(null)

  const currentPos = useRef(new Vector3(...(transform?.position || [0, 0, 0])))
  const targetPos = useRef(new Vector3(...(transform?.position || [0, 0, 0])))
  const pointerDownCoord = useRef<{ x: number; y: number; time: number } | null>(null)
  const prevDragPos = useRef<[number, number, number]>([0, 0, 0])

  // Sync transform position updates
  useEffect(() => {
    if (transform?.position && !isGrabbed) {
      targetPos.current.set(...transform.position)
    }
  }, [transform?.position, isGrabbed])

  useFrame((state, delta) => {
    const root = rootGroupRef.current
    const lift = liftGroupRef.current
    const ringMat = ringMatRef.current
    const ring = ringRef.current
    const shadowMat = shadowMatRef.current
    if (!root || !lift) return

    const t = state.clock.elapsedTime

    // 1. World Position Lerp
    if (isGrabbed && dragPos) {
      // Follow drag position smoothly
      targetPos.current.set(dragPos[0], dragPos[1] + GRAB_LIFT, dragPos[2])
      currentPos.current.x = MathUtils.damp(currentPos.current.x, targetPos.current.x, 18, delta)
      currentPos.current.y = MathUtils.damp(currentPos.current.y, targetPos.current.y, 18, delta)
      currentPos.current.z = MathUtils.damp(currentPos.current.z, targetPos.current.z, 18, delta)
    } else {
      // Resting lerp
      targetPos.current.set(...(transform?.position || [0, 0, 0]))
      currentPos.current.x = MathUtils.damp(currentPos.current.x, targetPos.current.x, 14, delta)
      currentPos.current.y = MathUtils.damp(currentPos.current.y, targetPos.current.y, 14, delta)
      currentPos.current.z = MathUtils.damp(currentPos.current.z, targetPos.current.z, 14, delta)
    }

    // 2. Wobble shake animation on invalid drop
    let wobbleOffset = 0
    if (wobbleTime > 0) {
      wobbleOffset = Math.sin(wobbleTime * 35) * 0.03 * (wobbleTime / 0.4)
      setWobbleTime((prev) => Math.max(0, prev - delta))
    }

    root.position.set(
      currentPos.current.x + wobbleOffset,
      currentPos.current.y,
      currentPos.current.z,
    )

    // 3. Lift, Floating Bob & Scale
    let targetLiftY = 0
    let targetScale = 1

    if (isGrabbed) {
      targetLiftY = Math.sin(t * 4) * 0.018 // floating bob
      targetScale = GRAB_SCALE
    } else if (isHovered || isInspectedHover) {
      targetLiftY = HOVER_LIFT
      targetScale = HOVER_SCALE
    } else if (isSelected) {
      targetLiftY = HOVER_LIFT + Math.sin(t * 2.5) * 0.012
      targetScale = HOVER_SCALE
    }

    lift.position.y = MathUtils.damp(lift.position.y, targetLiftY, 14, delta)
    const currentScale = MathUtils.damp(lift.scale.x, targetScale, 14, delta)
    lift.scale.setScalar(currentScale)

    // 4. Motion velocity tilt when dragged
    if (isGrabbed && dragPos) {
      const vx = dragPos[0] - prevDragPos.current[0]
      const vz = dragPos[2] - prevDragPos.current[2]
      const targetTiltZ = MathUtils.clamp(-vx * 4, -0.2, 0.2)
      const targetTiltX = MathUtils.clamp(vz * 4, -0.2, 0.2)
      lift.rotation.z = MathUtils.damp(lift.rotation.z, targetTiltZ, 10, delta)
      lift.rotation.x = MathUtils.damp(lift.rotation.x, targetTiltX, 10, delta)
      prevDragPos.current = [dragPos[0], dragPos[1], dragPos[2]]
    } else {
      lift.rotation.z = MathUtils.damp(lift.rotation.z, 0, 10, delta)
      lift.rotation.x = MathUtils.damp(lift.rotation.x, 0, 10, delta)
    }

    // Base rotation around Y
    root.rotation.y = transform?.rotationY || 0

    // 5. Selection and Hover Ground Halo
    if (ring && ringMat) {
      const targetOpacity = isCandidateZone ? 0.9 : isGrabbed ? 0.6 : isHovered || isSelected ? 0.5 : 0
      ringMat.opacity = MathUtils.damp(ringMat.opacity, targetOpacity, 10, delta)
      ring.visible = ringMat.opacity > 0.01
    }

    // 6. Contact Ground Shadow separation
    if (shadowMat) {
      const targetShadowOpacity = isGrabbed ? 0.22 : 0.45
      shadowMat.opacity = MathUtils.damp(shadowMat.opacity, targetShadowOpacity, 10, delta)
    }
  })

  // Pointer event handlers
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
    document.body.style.cursor = isGrabbed ? 'grabbing' : 'grab'
    grabSystem.setHoveredDraggable(id)
    interaction.hover(id as any) // sync with inspection system
    soundEffects.playGentleTouch()
  }

  const onPointerOut = () => {
    setIsHovered(false)
    if (!isGrabbed) {
      document.body.style.cursor = 'default'
    }
    grabSystem.setHoveredDraggable(null)
    interaction.unhover(id as any)
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    pointerDownCoord.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    }
    document.body.style.cursor = 'grabbing'
    soundEffects.playGrabPop()
    grabSystem.startGrab(id, transform?.position || [0, 0, 0])
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = isHovered ? 'grab' : 'default'

    // If pointer moved less than threshold, treat as an inspection click
    if (pointerDownCoord.current) {
      const dx = Math.abs(e.clientX - pointerDownCoord.current.x)
      const dy = Math.abs(e.clientY - pointerDownCoord.current.y)
      const duration = performance.now() - pointerDownCoord.current.time

      if (dx < 6 && dy < 6 && duration < 350) {
        // Normal click inspection
        interaction.select(id as any)
        kitchenState.recordInspection(id as any)
        if (id === 'mug') kitchenState.triggerMug()
        else if (id === 'toaster') kitchenState.triggerToaster()
        else if (id === 'radio') kitchenState.toggleRadio()
        else if (id === 'kettle') kitchenState.triggerKettle()
        else if (id === 'plate') kitchenState.triggerPlate()
      }
    }

    pointerDownCoord.current = null
  }

  const info = INTERACTABLES[id as keyof typeof INTERACTABLES]
  const showLabel = (isHovered || isSelected || isGrabbed) && info !== undefined

  return (
    <group ref={rootGroupRef}>
      {/* Ground contact shadow on resting surface */}
      <mesh
        position-y={0.004}
        rotation-x={-Math.PI / 2}
        raycast={() => null}
      >
        <circleGeometry args={[footprint * 0.9, 24]} />
        <meshBasicMaterial
          ref={shadowMatRef}
          color="#38281e"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Surface snap/selection ring */}
      <group ref={ringRef} position-y={0.007} visible={false}>
        <mesh rotation-x={-Math.PI / 2} raycast={() => null}>
          <ringGeometry args={[footprint * 0.88, footprint * 1.05, 32]} />
          <meshBasicMaterial
            ref={ringMatRef}
            color={isCandidateZone ? palette.strawberry : palette.butterDeep}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Lifted visual container */}
      <group
        ref={liftGroupRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {children}

        {/* Floating magical sparkles on touch/grab */}
        <TouchSparkles active={isGrabbed} radius={footprint * 0.8} />
      </group>

      {/* Floating 3D label */}
      {showLabel && (
        <Html
          position={[0, labelHeight + (isGrabbed ? 0.15 : 0), 0]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`object-label is-visible${isGrabbed ? ' is-grabbed' : ''}`}>
            <span className="object-label__name">
              {isGrabbed ? `✨ ${info.name}` : info.name}
            </span>
            {isGrabbed && CARE_NOTES[id] && (
              <span className="object-label__care-whisper">{CARE_NOTES[id]}</span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
