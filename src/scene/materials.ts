import {
  Color,
  DataTexture,
  MeshStandardMaterial,
  NearestFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three'
import { palette } from '../config/palette'

/**
 * Shared, module-level materials.
 *
 * Re-using a handful of materials keeps draw state small and guarantees the
 * whole kitchen reads as one consistent, matte, hand-painted style.
 */
const matte = (color: string, roughness = 0.85, extra: Partial<MeshStandardMaterial> = {}) =>
  new MeshStandardMaterial({ color, roughness, metalness: 0, ...extra })

export const materials = {
  wall: matte(palette.wall, 0.95),
  wallShade: matte(palette.wallShade, 0.95),
  slab: matte(palette.slab, 0.9),

  cabinetBody: matte(palette.cabinetBody, 0.8),
  mint: matte(palette.mint, 0.7),
  mintDeep: matte(palette.mintDeep, 0.7),

  wood: matte(palette.wood, 0.75),
  woodLight: matte(palette.woodLight, 0.75),
  woodDark: matte(palette.woodDark, 0.8),

  strawberry: matte(palette.strawberry, 0.55),
  strawberryDeep: matte(palette.strawberryDeep, 0.6),
  butter: matte(palette.butter, 0.6),
  butterDeep: matte(palette.butterDeep, 0.6),

  porcelain: matte(palette.porcelain, 0.35),
  steel: matte(palette.steel, 0.4, { metalness: 0.25 }),
  steelDark: matte(palette.steelDark, 0.5, { metalness: 0.2 }),
  charcoal: matte(palette.charcoal, 0.8),
  cocoa: matte(palette.cocoa, 0.6),

  leaf: matte(palette.leaf, 0.8, { flatShading: true }),

  // The view outside the window is unlit so it always reads as bright daylight.
  sky: matte(palette.sky, 1, { emissive: new Color(palette.sky), emissiveIntensity: 0.85 }),
  skyLow: matte(palette.skyLow, 1, { emissive: new Color(palette.skyLow), emissiveIntensity: 0.85 }),
  hill: matte(palette.hill, 1, {
    emissive: new Color(palette.hill),
    emissiveIntensity: 0.55,
    flatShading: true,
  }),
  hillFar: matte(palette.hillFar, 1, {
    emissive: new Color(palette.hillFar),
    emissiveIntensity: 0.6,
    flatShading: true,
  }),
  sun: matte(palette.butter, 1, { emissive: new Color(palette.butter), emissiveIntensity: 0.9 }),
  cloud: matte(palette.porcelain, 1, {
    emissive: new Color(palette.porcelain),
    emissiveIntensity: 0.75,
    flatShading: true,
  }),
}

/** Parse '#rrggbb' straight into sRGB bytes (the texture is tagged sRGB). */
function hexToBytes(hex: string): number[] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
}

/**
 * A 2×2 checker texture. Tiny on purpose: nearest-filtered and repeated, so it
 * stays crisp at any zoom with practically zero memory.
 */
function createCheckerTexture(a: string, b: string): DataTexture {
  const A = hexToBytes(a)
  const B = hexToBytes(b)
  const data = new Uint8Array([...A, ...B, ...B, ...A])
  const tex = new DataTexture(data, 2, 2, RGBAFormat)
  tex.colorSpace = SRGBColorSpace
  tex.magFilter = NearestFilter
  tex.minFilter = NearestFilter
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.needsUpdate = true
  return tex
}

/** Checker-tiled matte material. `repeatX/Y` = number of 2×2 checker repeats. */
export function createCheckerMaterial(
  a: string,
  b: string,
  repeatX: number,
  repeatY: number,
  roughness = 0.9,
): MeshStandardMaterial {
  const map = createCheckerTexture(a, b)
  map.repeat.set(repeatX, repeatY)
  return new MeshStandardMaterial({ map, roughness, metalness: 0 })
}
