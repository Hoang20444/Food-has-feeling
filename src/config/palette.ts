/**
 * FOOD HAS FEELINGS — colour palette.
 *
 * A deliberately small palette: warm creams for large surfaces, muted mint for
 * cabinetry, natural wood for furniture, and strawberry / butter yellow used
 * sparingly as accents. Keep new colours inside this file so the scene stays
 * visually coherent.
 */
export const palette = {
  // Large surfaces
  wall: '#f3e6cf',
  wallShade: '#e9d6b8',
  floorLight: '#efe0c6',
  floorDark: '#dfc6a2',
  slab: '#c9a983',

  // Cabinetry
  mint: '#9fcfb4',
  mintDeep: '#7fb699',
  mintPale: '#d7ebdc',
  cabinetBody: '#f6ecdb',

  // Wood
  wood: '#c99a6b',
  woodLight: '#ddb88a',
  woodDark: '#a5774d',

  // Accents
  strawberry: '#e0625a',
  strawberryDeep: '#c44c46',
  butter: '#f5d27e',
  butterDeep: '#e8b95a',

  // Neutrals
  porcelain: '#fbf5ea',
  steel: '#cfc9c0',
  steelDark: '#a39c93',
  charcoal: '#5a4a44',
  cocoa: '#4a3329',

  // Outside the window
  sky: '#cfe7e6',
  skyLow: '#f6ead2',
  hill: '#a9d3a4',
  hillFar: '#c4e0b8',
  leaf: '#86bb8f',

  // Page backdrop (also used as the WebGL clear colour)
  backdrop: '#efd3b6',
} as const

export type PaletteKey = keyof typeof palette
