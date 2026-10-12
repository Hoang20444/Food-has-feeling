import { useLayoutEffect, useRef, type ComponentProps, type ReactNode } from 'react'
import { RoundedBox } from '@react-three/drei'
import type { Group, Material, Mesh } from 'three'

type Vec3 = [number, number, number]

interface BlockProps extends Omit<ComponentProps<typeof RoundedBox>, 'args' | 'material'> {
  size: Vec3
  material: Material
  radius?: number
}

/**
 * Rounded box with low-poly defaults — the basic building block for the
 * kitchen's soft, chunky silhouettes.
 */
export function Block({ size, material, radius = 0.04, ...rest }: BlockProps) {
  const r = Math.min(radius, Math.min(...size) / 2 - 0.0005)
  return (
    <RoundedBox
      args={size}
      radius={Math.max(r, 0.001)}
      smoothness={3}
      bevelSegments={2}
      creaseAngle={0.5}
      material={material}
      {...rest}
    />
  )
}

/**
 * Enables shadows on every mesh below it, once, after mount.
 *
 * Opt-outs via `userData.shadow` on a mesh:
 *  - 'receive' → receives but does not cast (e.g. flat decals, window view)
 *  - 'none'    → neither (e.g. transparent helper rings)
 */
export function ShadowGroup({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null)
  useLayoutEffect(() => {
    ref.current?.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      const mode = mesh.userData.shadow as 'receive' | 'none' | undefined
      mesh.castShadow = mode === undefined
      mesh.receiveShadow = mode !== 'none'
    })
  }, [])
  return <group ref={ref}>{children}</group>
}
