import { useFriendshipState } from '../../state/friendshipState'

/**
 * Lighting setup for FOOD HAS FEELINGS:
 *
 * Creates a cozy, sunlit morning kitchen ambiance:
 * - Warm ambient and hemisphere light for soft fill.
 * - Main directional sun light casting soft, warm shadows into the diorama.
 * - Daylight window fill light streaming in through the window opening.
 * - Gentle warm pendant/overhead accent over the dining table.
 * - Extra golden morning warmth when Berry is placed by the sunlit window.
 */
export function KitchenLighting() {
  const hasSunlightFriendship = useFriendshipState((s) => s.discoveredFriendships.berry_sunlight_memory)

  return (
    <group>
      {/* Soft ambient base */}
      <ambientLight color="#fff4e6" intensity={hasSunlightFriendship ? 0.62 : 0.55} />

      {/* Sky/ground bounce gradient */}
      <hemisphereLight
        color="#ffeacc"
        groundColor="#d4bba0"
        intensity={0.4}
      />

      {/* Key directional sunlight */}
      <directionalLight
        position={[6, 8.5, 6.5]}
        color="#fff8e7"
        intensity={hasSunlightFriendship ? 1.25 : 1.15}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={5.5}
        shadow-camera-bottom={-5.5}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* Window morning daylight fill */}
      <directionalLight
        position={[-2.5, 3.8, -5]}
        target-position={[0, 1, 0]}
        color={hasSunlightFriendship ? '#ffebc4' : '#d6edff'}
        intensity={hasSunlightFriendship ? 0.75 : 0.4}
      />

      {/* Cozy warm overhead fill centered on the dining table */}
      <pointLight
        position={[0.55, 3.2, 0.75]}
        color="#ffecd1"
        intensity={0.5}
        distance={7}
        decay={2}
      />
    </group>
  )
}
