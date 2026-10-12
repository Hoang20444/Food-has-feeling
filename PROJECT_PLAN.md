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

### Phase 4: Kitchen Cooking Playground & Narrative (Future)
- **Goal:** Introduce food items (bread slices, butter, tea bag, honey) with cooking recipes and prep actions.

---

## 5. Acceptance Criteria & Verification Matrix

### Phase 3B: The Little Kitchen Stories Acceptance Matrix

| # | Acceptance Criterion | Status | Verification Method |
|---|---|---|---|
| 1 | Lightweight story engine reacts to location, companions, and memories | Passed | `storyEngine.ts` & `storyEvents.ts` evaluate spatial pairings naturally upon drop |
| 2 | Handcrafted story moments trigger without pressing buttons | Passed | Events (e.g. Berry+Mug+Window, Toaster+Plate, Kettle+Mug) trigger on natural placement |
| 3 | Visual animations communicate emotion before text appears | Passed | `visualReactionDurationMs` delays dialogue, playing hops/steam/wobbles first |
| 4 | Reusable emotional animations implemented | Passed | `curious_looking`, `sleepy_idle`, `excited_reaction`, `happy_bounce`, `shy_hide` |
| 5 | Character personality data guides reactions | Passed | `personalities.ts` defines traits and voices for Berry, Mug, Toaster, Radio, Plate, Kettle |
| 6 | Collectible Postcard Memory Album | Passed | `PostcardAlbum.tsx` displays textured vintage postcards with stamps and story excerpts |
| 7 | Subtle player presence & cursor tracking | Passed | Berry's head tracks cursor coordinates; objects express care when held (`CARE_NOTES`) |
| 8 | No technical jargon or game-like point grinding | Passed | Clean storytelling, replaced point badges with `💌 Stories` postcard album |
| 9 | Preserves all existing features (Drag, Awakening, Web Audio, Models) | Passed | All Phase 1, 2, and 3A systems tested and fully intact |
| 10 | Production build and linter pass cleanly | Passed | `oxlint`: 0 warnings, 0 errors; `npm run build`: Exit code 0 (built in 2.68s) |
