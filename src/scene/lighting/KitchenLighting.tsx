import { useFriendshipState } from '../../state/friendshipState'
import { useMysteryStore } from '../../state/mysteryStore'
import { useTimeAtmosphere } from '../../state/timeAtmosphereStore'

/**
 * Lighting setup for FOOD HAS FEELINGS:
 *
 * Dynamically responds to:
 * 1. Time of Day (Morning, Afternoon, Evening)
 * 2. Mystery Chapter Progression:
 *    - Comfort: Warm, joyful indie diorama.
 *    - Something Wrong / Missing Memory: Cloud drifts over sun, cooler pale stillness, lowered intensity.
 *    - Revelation: Nostalgic golden-rose memory hour focusing on the diorama.
 *    - Dual Endings: Radiant warm morning (Preserve Memory) vs Serene twilight peace (Let It Rest).
 */
export function KitchenLighting() {
  const hasSunlightFriendship = useFriendshipState((s) => s.discoveredFriendships.berry_sunlight_memory)
  const time = useTimeAtmosphere((s) => s.current)

  const phase = useMysteryStore((s) => s.phase)
  const finalChoice = useMysteryStore((s) => s.finalChoice)

  const isAfternoon = time === 'afternoon'
  const isEvening = time === 'evening'

  const isUneasyPhase = phase === 'something_wrong' || phase === 'missing_memory'
  const isRevelationPhase = phase === 'revelation'
  const isCompleted = phase === 'chapter_complete'

  // Calculate ambient color & intensity
  let ambientColor = isEvening ? '#41486e' : isAfternoon ? '#ffe8d6' : '#fff4e6'
  let ambientIntensity = isEvening ? 0.32 : isAfternoon ? 0.52 : (hasSunlightFriendship ? 0.62 : 0.55)

  if (isCompleted) {
    if (finalChoice === 'preserve_memory') {
      ambientColor = '#fff9eb'
      ambientIntensity = 0.65
    } else {
      ambientColor = '#484c72'
      ambientIntensity = 0.38
    }
  } else if (isRevelationPhase) {
    ambientColor = '#fae6dc'
    ambientIntensity = 0.58
  } else if (isUneasyPhase) {
    ambientColor = '#d9e3f0'
    ambientIntensity = 0.44
  }

  // Calculate hemisphere bounce
  let hemiSky = isEvening ? '#4f588a' : isAfternoon ? '#ffd8a8' : '#ffeacc'
  let hemiGround = isEvening ? '#2b2c3d' : isAfternoon ? '#be9872' : '#d4bba0'
  let hemiIntensity = isEvening ? 0.28 : isAfternoon ? 0.42 : 0.4

  if (isUneasyPhase) {
    hemiSky = '#d2deee'
    hemiGround = '#98a5b8'
    hemiIntensity = 0.34
  } else if (isRevelationPhase) {
    hemiSky = '#ffdec9'
    hemiGround = '#ba8f7d'
    hemiIntensity = 0.45
  }

  // Directional sun color and intensity
  let sunColor = isEvening ? '#8fa3e8' : isAfternoon ? '#ffcc88' : '#fff8e7'
  let sunIntensity = isEvening ? 0.45 : isAfternoon ? 1.05 : (hasSunlightFriendship ? 1.25 : 1.15)

  if (isCompleted) {
    if (finalChoice === 'preserve_memory') {
      sunColor = '#fff8e0'
      sunIntensity = 1.3
    } else {
      sunColor = '#8ba2e0'
      sunIntensity = 0.48
    }
  } else if (isRevelationPhase) {
    sunColor = '#ffe3cb'
    sunIntensity = 1.15
  } else if (isUneasyPhase) {
    sunColor = '#e2eaf5'
    sunIntensity = 0.88
  }

  return (
    <group>
      {/* 1. Ambient base */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* 2. Hemisphere bounce gradient */}
      <hemisphereLight color={hemiSky} groundColor={hemiGround} intensity={hemiIntensity} />

      {/* 3. Key directional sunlight / moonlight */}
      {isEvening || (isCompleted && finalChoice === 'let_it_rest') ? (
        <directionalLight
          position={[-3.5, 6.5, -4.5]}
          color={sunColor}
          intensity={sunIntensity}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0003}
        />
      ) : (
        <directionalLight
          position={isAfternoon ? [5.2, 6.8, 6.2] : [6, 8.5, 6.5]}
          color={sunColor}
          intensity={sunIntensity}
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
          isUneasyPhase
            ? '#c0d4ec'
            : isRevelationPhase
              ? '#ffd8be'
              : isEvening
                ? '#3e4878'
                : isAfternoon
                  ? '#ffd499'
                  : hasSunlightFriendship
                    ? '#ffebc4'
                    : '#d6edff'
        }
        intensity={
          isUneasyPhase
            ? 0.32
            : isEvening
              ? 0.25
              : isAfternoon
                ? 0.8
                : hasSunlightFriendship
                  ? 0.75
                  : 0.4
        }
      />

      {/* 5. Cozy dining table pendant light (glows extra warmly in evening and let_it_rest ending) */}
      <pointLight
        position={[0.55, 3.1, 0.75]}
        color={isEvening || (isCompleted && finalChoice === 'let_it_rest') ? '#ffad42' : '#ffecd1'}
        intensity={
          isCompleted && finalChoice === 'let_it_rest'
            ? 1.8
            : isEvening
              ? 1.6
              : isAfternoon
                ? 0.6
                : 0.45
        }
        distance={isEvening || isCompleted ? 8 : 6}
        decay={2}
      />

      {/* 6. Under-cabinet / kitchen counter warm cozy light */}
      {(isEvening || (isCompleted && finalChoice === 'let_it_rest')) && (
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
