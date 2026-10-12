import { useFriendshipState } from '../../state/friendshipState'
import { useTimeAtmosphere } from '../../state/timeAtmosphereStore'

/**
 * Lighting setup for FOOD HAS FEELINGS:
 *
 * Dynamically responds to Time of Day (Morning, Afternoon, Evening):
 * - Morning: Crisp, warm morning sunlight streaming through the window.
 * - Afternoon: Softer, golden honey amber sunlight with long, gentle shadows.
 * - Evening: Twilight atmosphere; warm cozy pendant lamp and counter lights turn on.
 */
export function KitchenLighting() {
  const hasSunlightFriendship = useFriendshipState((s) => s.discoveredFriendships.berry_sunlight_memory)
  const time = useTimeAtmosphere((s) => s.current)

  const isAfternoon = time === 'afternoon'
  const isEvening = time === 'evening'

  return (
    <group>
      {/* 1. Ambient base */}
      <ambientLight
        color={isEvening ? '#41486e' : isAfternoon ? '#ffe8d6' : '#fff4e6'}
        intensity={isEvening ? 0.32 : isAfternoon ? 0.52 : (hasSunlightFriendship ? 0.62 : 0.55)}
      />

      {/* 2. Hemisphere bounce gradient */}
      <hemisphereLight
        color={isEvening ? '#4f588a' : isAfternoon ? '#ffd8a8' : '#ffeacc'}
        groundColor={isEvening ? '#2b2c3d' : isAfternoon ? '#be9872' : '#d4bba0'}
        intensity={isEvening ? 0.28 : isAfternoon ? 0.42 : 0.4}
      />

      {/* 3. Key directional sunlight / moonlight */}
      {isEvening ? (
        // Gentle moonbeam through window in the evening
        <directionalLight
          position={[-3.5, 6.5, -4.5]}
          color="#8fa3e8"
          intensity={0.45}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0003}
        />
      ) : (
        // Morning or Afternoon sun
        <directionalLight
          position={isAfternoon ? [5.2, 6.8, 6.2] : [6, 8.5, 6.5]}
          color={isAfternoon ? '#ffcc88' : '#fff8e7'}
          intensity={isAfternoon ? 1.05 : (hasSunlightFriendship ? 1.25 : 1.15)}
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
      )}

      {/* 4. Window daylight / dusk fill */}
      <directionalLight
        position={[-2.5, 3.8, -5]}
        target-position={[0, 1, 0]}
        color={
          isEvening
            ? '#3e4878'
            : isAfternoon
              ? '#ffd499'
              : (hasSunlightFriendship ? '#ffebc4' : '#d6edff')
        }
        intensity={isEvening ? 0.25 : isAfternoon ? 0.8 : (hasSunlightFriendship ? 0.75 : 0.4)}
      />

      {/* 5. Cozy dining table pendant light (shines warmly in the evening) */}
      <pointLight
        position={[0.55, 3.1, 0.75]}
        color={isEvening ? '#ffad42' : '#ffecd1'}
        intensity={isEvening ? 1.6 : isAfternoon ? 0.6 : 0.45}
        distance={isEvening ? 8 : 6}
        decay={2}
      />

      {/* 6. Under-cabinet / kitchen counter warm cozy light (active in evening) */}
      {isEvening && (
        <pointLight
          position={[-1.2, 1.6, -2.4]}
          color="#ff9d5c"
          intensity={1.1}
          distance={5.5}
          decay={2}
        />
      )}
    </group>
  )
}
