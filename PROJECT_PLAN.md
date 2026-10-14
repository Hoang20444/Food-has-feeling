# FOOD HAS FEELINGS — Project Plan

## 1. Project Overview & Goals
**FOOD HAS FEELINGS** is a browser-based 3D indie game set in a cozy, charming kitchen where food items gradually come alive, reveal personalities, and react dynamically to player actions.

The goal is to create an emotionally resonant, tactile, and visually delightful experience that combines playful low-poly aesthetics with emergent food interactions and subtle storytelling.

---

## 2. Technology Stack
* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite 8
* **3D Engine:** Three.js + React Three Fiber (R3F) + React Three Drei
* **Styling:** Vanilla CSS (custom design system, no Tailwind)
* **Audio:** Procedural Web Audio API synthesizer (zero external sound files)
* **Physics (Future Phases):** Rapier (deferred until gameplay requires dynamic rigidbodies)

---

## 3. Visual & Art Direction
* **Style:** Handcrafted, cozy low-poly 3D diorama.
* **Palette:**
  * Base & Large Surfaces: Warm cream (`#f3e6cf`) and soft beige (`#efe0c6`).
  * Cabinetry: Muted mint green (`#9fcfb4`) with deep mint accents (`#7fb699`).
  * Furniture & Trim: Warm natural wood (`#c99a6b`) and honey tones (`#ddb88a`).
  * Accents: Strawberry red (`#e0625a`) and butter yellow (`#f5d27e`).
* **Lighting:** Soft morning sunlight with gentle contact shadows, warm bounce, daylight streaming through the window, and floating sunbeam motes.
* **Silhouettes:** Chunky, beveled, friendly geometry without harsh edges.
* **Restraint:** Avoid sci-fi neon, excessive bloom/particles, or hyper-realistic PBR textures.

---

## 4. Phase Roadmap

### Phase 1: The Kitchen (Complete)
- **Goal:** Establish the foundational 3D environment, camera choreography, lighting, and modular interaction architecture.
- **Key Deliverables:**
  - Diorama room shell (walls, wainscoting, floor slab, checker tiles).
  - Shaker-style mint cabinets with wood countertop, gooseneck sink, and cooktop.
  - Layered scenic window overlooking rolling hills and sunshine.
  - Wall cabinet, open pantry shelf with canisters, retro fridge, and kitchen wall clock.
  - Central dining table, rug, and stools.
  - 5 procedural interactable kitchen objects: **Plate**, **Mug**, **Radio**, **Toaster**, **Kettle**.
  - Orbital camera controls with strict angle and distance clamps.

### Phase 2A: The Kitchen Wakes Up (Complete)
- **Goal:** Transform the static kitchen into a secretly alive, tactile space with emotional storytelling, object personality, and hidden awakening events.
- **Key Deliverables:**
  - **Mug:** Warm procedural steam puffs rising and swaying; inspection vibration and warmth reaction.
  - **Toaster:** Playful breathing motion; animated lever spring; bouncy hop; peeking golden bread slices.
  - **Radio:** Interactive on/off power toggle; glowing frequency dial; oscillating tuner needle; bass speaker throb; swaying antenna; floating music sparkles.
  - **Kettle:** Rhythmic simmering rock; animated rattling lid knob; whistling steam puffs from spout.
  - **Plate:** Tactile ceramic wobble and clink reaction.
  - **Procedural Sound Engine (`soundEffects.ts`):** Web Audio synthesis for cozy radio static, toaster springs, kettle whistle, ceramic notes, and awakening chime. Audio mute/unmute control in header.
  - **Interactive Storytelling & Personalities:** Objects feature emotional moods (Yearning, Playful, Tuning In, Simmering, Expectant) and cycling short emotional whispers.
  - **Event System & Secret Kitchen Awakening (`kitchenState.ts`):** Inspecting several objects triggers "The Kitchen is Waking Up", causing the pantry shelf jars to rustle and dance with sparkles, awakening banner notice, and sunbeam motes.

### Phase 2B: Berry, The First Friend (Current Phase — Complete)
- **Goal:** Introduce Berry, the first living food character, emerging naturally from behind the strawberry jar on the pantry shelf after the kitchen awakens.
- **Key Deliverables:**
  - **Blender Asset Pipeline:** Asset path documented at `public/models/berry/berry.glb`. Architecture decoupled via `BerryGLBLoader.tsx` with graceful fallback to `BerryPlaceholderModel.tsx`. Documentation in `public/models/berry/README.md` and `docs/BERRY_ASSET_PIPELINE.md`.
  - **Procedural Character Model:** Handcrafted low-poly strawberry body, 5-petal leaf crown with stem, tiny limbs, expressive face with natural blinking eyes and rosy blush cheeks.
  - **First Appearance Emergence Sequence:** When the kitchen awakens, the strawberry jar rattles → Berry peeks up from behind the jar → pauses briefly → steps out onto the open shelf beside the jar → looks around curiously → settles into idle pose.
  - **Smooth Idle Animations:** Gentle breathing stretch & squash, occasional blinking (every 3.8s for 0.14s), leaf crown breeze sway, head tilts.
  - **3-Stage Reactive Interactions:**
    - 1st click: Berry notices player, looks directly toward camera, dialogue: *"Oh... you found me."*
    - 2nd click: Joyful double hop, happy bounce, dialogue: *"Please don't tell the toaster."*
    - 3rd click: Shy tuck downward, bashful blush, dialogue: *"Is it safe out here?"*
    - 4th+ clicks: Cycles sweet thoughts with gentle vocal chirps.
  - **Dual Feedback:** Floating 3D speech bubble above Berry + bottom Inspect Dock integration (`🍓 Talk to Berry`).
  - **Audio Vocals:** Procedural chirps, giggles, and rustles via Web Audio API.

### Phase 3A: Hands of the Friend (Complete)
- **Goal:** Transform the kitchen diorama from a passive interactive viewer into a living toy world. The player becomes "The first friend who can touch, move, and help the little kitchen."
- **Key Deliverables:**
  - Controlled toy-like snap system (`DropZones.ts`, `GrabSystem.ts`, `DragController.ts`, `DraggableObject.tsx`).
  - 6 movable kitchen items (Berry, Mug, Toaster, Radio, Plate, Kettle).
  - Web Audio procedural sound synthesis (`playGrabPop`, `playDropTap`, `playFriendshipChime`, `playWobbleReturn`).
  - Initial friendship pairings and `ObjectMemorySystem` persistence.

### Phase 3B: The Little Kitchen Stories (Current Phase — Complete)
- **Goal:** Transform the kitchen from an interactive toy room into a small living story world. Existing characters create memorable emotional moments and shared memories.
- **Key Deliverables:**
  - **Lightweight Story Engine (`src/story/`):**
    - `storyEngine.ts`: Evaluates placements naturally, sequencing visual emotions first, followed by conversational lines and postcard rewards.
    - `storyEvents.ts`: 6 handcrafted emotional moments with multi-step dialogue:
      1. **First Morning Together**: Berry + Mug + Window sill. Steam leans toward Berry, Berry rejoices in sunlight, Mug shares warmth.
      2. **Breakfast Promise**: Toaster + Plate. Toaster feels forgotten; Plate promises to wait for golden toast.
      3. **Freshly Steeped**: Kettle + Mug. Kettle shares boiling chamomile water, comforting the anxious mug.
      4. **A Place at the Table**: Berry + Plate on table placemat. Berry finds a welcome seat setting at the dining table.
      5. **Morning Symphony**: Berry + Radio. Secret morning melody tunes in; Berry dances with the radio.
      6. **A Glimpse of the World**: Berry solo on window sill. G种azing at the rolling hills and clouds.
  - **Emotional Animation System (`BerryAnimation.ts`, `characterTypes.ts`):**
    - Reusable animations: `happy_bounce`, `shy_hide`, `curious_looking`, `sleepy_idle`, `excited_reaction`.
    - Characters visually express emotion *before* text appears.
  - **Character Personality Data (`personalities.ts`):**
    - Handcrafted personality traits, voice tone guidelines, and preferences for Berry (curious, shy, loves sunlight), Mug (caring, warm), Toaster (playful, wants attention), Radio (dreamy), Plate (faithful, welcoming), and Kettle (patient, watchful).
  - **Collectible Postcard Memory Album (`PostcardAlbum.tsx`, `storyStore.ts`):**
    - Replaced game-like arbitrary numbers with a heartwarming **Postcard Album** modal.
    - Collectible vintage postcard cards featuring stamps (`☀️`, `✨`, `🫖`, `🌸`, `🎶`), postmark cancellation marks, character pairings, location stamps, story excerpts, and locked hints.
    - Header button: `💌 X/6 Stories` opens the album.
    - Celebratory notification card floats in upon collecting new stories with a direct `Open Album` action.
  - **Subtle Player Presence:**
    - Procedural head and eye tracking: Berry's head smoothly tilts and follows the player's cursor across the 3D diorama.
    - Objects acknowledge being held: caring whispers inside 3D labels when picked up (e.g. Mug: *"Warm hands... thank you."*, Berry: *"Wheee! You're so gentle."*).
    - Preserved zero tutorial popups and clean minimalist UI.

### Phase 4: The Kitchen Remembers You (Current Phase — Complete)
- **Goal:** Make the kitchen feel like a living place that remembers the player. Create an emotional persistent world with daily rhythms, authored routines, nurturing interactions, and cozy memory capture.
- **Key Deliverables:**
  - **World Memory System (`worldMemoryStore.ts`):**
    - Remembers favorite character drop locations (e.g. Berry at window, Mug at table/cooktop, Toaster at placemat).
    - Remembers favorite character companion pairings without displaying numbers or XP.
    - Spawns subtle emotional decorations in the world when a character's favorite spot is loved:
      - Sprouted white strawberry blossom in a tiny pot on the window sill (`BerryWindowBlossom`).
      - Pastel knitted coaster on the dining table (`mug_cozy_coaster`).
      - Golden butter dish by the placemat (`toaster_butter_dish`).
    - Remembers returning player visits and greets them with a tender welcome tagline.
    - Special dialogue when Berry sits at its favorite window spot: *"The sun always remembers where I sit... thank you."*
  - **Time Atmosphere System (`timeAtmosphereStore.ts`, `KitchenLighting.tsx`, `KitchenWindow.tsx`):**
    - Three cozy atmospheric states:
      - **Morning:** Crisp morning sky, warm sunlight streaming through the window, energetic character idle states, morning bird audio (`playMorningBirds`).
      - **Afternoon:** Golden honey amber sky, soft long shadows, peaceful calm demeanor.
      - **Evening:** Dusky indigo twilight sky with glowing crescent moon and twinkling stars; warm overhead dining table pendant lamp and under-cabinet lights glow with cozy amber illumination; soft night crickets audio (`playEveningCrickets`).
    - Thematic time-of-day switcher button in Header (`☀️ Morning` -> `🌤️ Afternoon` -> `🌙 Evening`).
  - **Character Daily Routines (`BerryAnimation.ts`, `MugModel.tsx`, `ToasterModel.tsx`):**
    - Berry: watches outside excitedly in morning, rests peacefully near friends in afternoon, sleepy idle with half-lidded eyes and slow breathing in evening.
    - Mug: lively tall steam curls in morning, steady warmth in afternoon, tiny calm steam wisp in evening.
    - Toaster: energetic morning hop with eager peeking toast, calm afternoon, sleepy relaxed lever and snug toast in evening.
  - **Memory Camera Feature (`MemoryCamera.tsx`):**
    - Cozy screenshot mode accessed via `📷 Camera` button in header.
    - Hides all game UI and frames the 3D diorama in a soft postcard viewfinder with corner marks and caption strip.
    - Direct WebGL canvas capture with high-res postcard border, cream paper texture, and *"Food Has Feelings Memory 🍓"* watermark.
    - Mechanical camera shutter sound (`playCameraShutter`), flash animation, and Polaroid preview modal with instant download.
  - **Care Interactions (`CareInteractions.tsx`, `InspectCard.tsx`):**
    - Nurturing button (`💛 Warm & Comfort` / `💛 Comfort & Nurture`) on inspected characters with soothing purr sound (`playCarePurr`) and heartwarming comfort whispers.
    - 3 tiny cleanable messes in the diorama: stray table crumb, fallen cooktop tea leaf, and soft dust fluff.
    - Brushing them away plays a sparkling chime (`playCleanSparkle`) and stars sweep, keeping the kitchen loved and tidy.
  - **Preserved Systems:** 100% preservation of Phase 1 to Phase 3B features (drag-and-drop, stories engine, postcard album, Web Audio procedural synth, low-poly aesthetics).

### Core Gameplay Redesign: Cozy Psychological Mystery Adventure
### Chapter 1: "The Song Nobody Remembers" (Current Phase — Complete)
- **Vision:** Transform FOOD HAS FEELINGS from a passive diorama / toy room into a compelling, tender **Cozy Psychological Mystery Adventure**. The world begins warm, cute, peaceful, and comforting. Gradually, subtle environmental inconsistencies and character behavioral shifts introduce mystery and curiosity about the kitchen's past, leading to an emotional climax decision with dual endings.
- **Key Deliverables:**
  - **Deterministic Chapter State Machine (`mysteryStore.ts`):**
    - 5 Progressive Phases:
      - `comfort`: Warm diorama exploration; player touches objects and discovers baseline behaviors.
      - `something_wrong`: Transitions once player inspects 3 unique objects + radio; radio plays bittersweet warped lullaby with missing note, porcelain clock freezes at 3:15, Berry freezes and looks uneasy.
      - `missing_memory`: 3 connected clues available to find across the diorama.
      - `revelation`: All 3 clues found; connects child's departure with Berry's loneliness; climax choice ready.
      - `chapter_complete`: Choice made; ending active with narrative resolution.
    - Berry emotional states: `'curious'`, `'uneasy'`, `'hesitant'`, `'emotional'`, `'happy'`, `'peaceful'`.
    - LocalStorage persistence under `food_has_feelings_mystery_chapter1_v1` with `resetChapter()` replayability.
  - **The 3 Connected Clues:**
    1. **The Warped Radio Melody (`radio_melody`):** Procedural Web Audio synth playing a warm major arpeggio in Phase A, transitioning in Phase B/C to a detuned, tape-wobbled melody missing its resolving note.
    2. **The Frozen Wall Clock at 3:15 (`clock_time`, `WallClock.tsx`):** Handcrafted round porcelain wall clock on the kitchen wall with animated hour and minute hands. Ticks rhythmically in Phase A; halts at 3:15 with mechanical stillness in Phase B/C. Scratch behind glass marks tea time.
    3. **The Counter Drawer & Handwritten Note (`drawer_note`, `BaseCabinets.tsx`, `NoteModal.tsx`):** Upper cedar drawer slides forward along Z axis on click, revealing a folded child's recipe note. Clicking reads the letter: *"Don’t forget our promise at tea time (3:15). If I’m late, play the radio song so Berry won’t be scared. We’ll always share breakfast."*
  - **Emotional Character & Procedural Animation System (`BerryAnimation.ts`, `BerryPlaceholderModel.tsx`, `BerryBehavior.ts`):**
    - Procedural transformations respond to `berryMood`:
      - `uneasy`: 22Hz subtle restrained micro-shiver, head turns left and fixes on clock/drawer (`targetRotY = -0.42`), drooped crown leaves, pale blush (`0.45`), mouth becomes a small surprised 'o'.
      - `hesitant`: Cautious head tilts, wide questioning eyes (`eyeScaleY = 1.22`), attentive leaf perch, uncertain mouth line.
      - `emotional`: Leans forward toward player (`targetPos[2] += 0.035`), glistening tear sparkles under eyes, deep emotional breathing, warm blush.
      - `happy`: Continuous joyful bouncing hops, spinning crown leaves, radiant smile.
      - `peaceful`: Gentle relaxed slouch, half-lidded sleepy eyes (`0.32`), deep slow peaceful breathing.
    - Mystery-aware dialogues when clicking Berry directly in 3D diorama.
  - **Atmospheric Lighting Shift (`KitchenLighting.tsx`):**
    - `something_wrong` / `missing_memory`: Passing cloud dims sun warmth (1.15 -> 0.88), pale blue-white key light (`#e2eaf5`), cool ambient tint (`#d9e3f0`) creating a palpable stillness without cheap horror or jumpscares.
    - `revelation`: Soft nostalgic golden-rose memory hour (`#ffe3cb` key, `#fae6dc` ambient).
    - Dual ending lighting: Radiant morning sunrise (Preserve Memory) vs serene lavender-amber dusk with warm glowing lamp (Let It Rest).
  - **Context-Dependent Whispers (`InspectCard.tsx`):**
    - All kitchen objects (Mug, Toaster, Kettle, Plate) display emotional memory whispers in Phase B/C reflecting the child's departure and 3:15 tea time.
  - **Climax Decision & Dual Endings (`InspectCard.tsx`, `PostcardAlbum.tsx`):**
    - Inspecting Berry during Revelation displays dual choices:
      - 🌸 **Keep the promise & remember together:** Ending A — Berry hums the 3:15 lullaby without loneliness; bright golden morning dawn.
      - 🌙 **It’s okay to let go & rest now:** Ending B — Gentle peaceful rest; no more waiting by the window; warm cozy lamplight.
  - **Unified Kitchen Memory Journal & Clue Dossier (`PostcardAlbum.tsx`, `Header.tsx`):**
    - Tab 1: 🔍 Chapter 1: The Song Nobody Remembers (status banner, 3 clue dossier cards with audio playback / letter reader buttons, resolution banner, and `Replay Chapter 1` button).
    - Tab 2: 💌 Postcard Stories (the 6 collectible friend memories).
    - Header indicator badge: `🔍 Ch. 1: X/3 Clues` / `✨ Revelation!` / `Ch. 1 Solved` opens the Mystery Dossier directly.
  - **Procedural Web Audio API Sound Suite (`soundEffects.ts`):**
    - `playNormalRadioMelody()`, `playWarpedRadioMelody()`, `playClockTick()`, `playClockStop()`, `playPaperRustle()`, `playMusicBoxMelody()`. Zero external audio asset dependencies.

---

## 5. Acceptance Criteria & Verification Matrix

### Core Gameplay Redesign: Chapter 1 Acceptance Matrix

| # | Acceptance Criterion | Status | Verification Method |
|---|---|---|---|
| 1 | Deterministic phase progression (Comfort -> Something Wrong -> Missing Memory -> Revelation -> Complete) | Passed | `mysteryStore.ts` inspected and verified via inspection counts and clue discovery triggers |
| 2 | Procedural radio melody warps with tape wobble and missing note | Passed | Audio synthesized dynamically via Web Audio API oscillators and gain nodes |
| 3 | Wall clock animated and freezes dead at 3:15 in Phase B | Passed | `WallClock.tsx` hands animate smoothly and halt precisely at 3:15 with mechanical click sound |
| 4 | Counter drawer slides forward and exposes child's handwritten letter | Passed | `BaseCabinets.tsx` animated slider + `NoteModal.tsx` parchment card with tea time promise |
| 5 | Berry displays subtle micro-shivers, emotional postures, and responsive facial expressions | Passed | `BerryAnimation.ts` procedural math + `BerryPlaceholderModel.tsx` dynamic mouth and tear sparkles |
| 6 | Kitchen diorama lighting subtly chills and shifts with chapter progression | Passed | `KitchenLighting.tsx` transitions from warm sun to pale blue overcast, golden memory rose, and dual endings |
| 7 | Climax decision with dual branching endings (Preserve vs Let Rest) | Passed | `InspectCard.tsx` dual choice buttons trigger respective ending audio, lighting, and Berry states |
| 8 | Unified Kitchen Memory Journal with Mystery Dossier & Clue playback | Passed | `PostcardAlbum.tsx` tabs verified in browser subagent with screenshots |
| 9 | Replay / Reset Chapter 1 functionality | Passed | `resetChapter()` resets store and clears localStorage; verified replay button in UI |
| 10 | Clean production build and zero linter warnings | Passed | `tsc -b && vite build` built in 489ms with 0 errors |


