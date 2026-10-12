# FOOD HAS FEELINGS — Character Asset Pipeline: Berry

This document specifies the technical asset workflow for integrating 3D character models created in Blender into **FOOD HAS FEELINGS**.

---

## 1. Overview

To allow rapid development while maintaining production readiness, the character architecture strictly separates:

1. **Behavior & Logic (`BerryBehavior.ts`):** State machine managing emergence and reactions.
2. **Procedural Motion (`BerryAnimation.ts`):** Math-driven skeletal and mesh adjustments.
3. **Renderer & Model Interface (`BerryGLBLoader.tsx`):** Asset loader with automatic GLB detection and graceful fallback to the procedural placeholder.
4. **Interaction Bus (`characterInteraction.ts`):** Reusable system for player interaction and dialogues.

---

## 2. Target Asset Specification

* **Destination:** `public/models/berry/berry.glb`
* **Format:** Binary glTF 2.0 (`.glb`)
* **Scale / Dimensions:**
  * Total Height: ~0.26m
  * Total Width: ~0.18m
  * Pivot: Base of feet (`y = 0`)
* **Materials / Textures:**
  * Uses unlit or standard PBR with low roughness (0.4 – 0.6) and zero metallic.
  * Flat low-poly vertex colors or simple solid material slots (matching palette tokens).
* **Color Swatches:**
  * Strawberry Body: `#e0625a`
  * Leaf Crown: `#7fb699`
  * Leaf Accent: `#9fcfb4`
  * Eye Charcoal: `#36251b`
  * Cheeks / Blush: `#f28a84`

---

## 3. Step-by-Step Blender Export Instructions

1. Model the low-poly character in Blender in Meter units (`1 Blender Unit = 1 Meter`).
2. Center the character at world origin `(0, 0, 0)` with feet resting on the `Z = 0` grid plane.
3. Apply all transforms (`Ctrl + A` -> `All Transforms`).
4. (Optional) Name root object `Berry_Root` and sub-meshes `Berry_Body`, `Berry_Leaves`, `Berry_Eyes`.
5. Go to **File -> Export -> glTF 2.0 (.glb)**:
   * Format: `glTF Binary (.glb)`
   * Include: `Selected Objects` (or `Visible Objects`)
   * Transform: `+Y Up`
   * Geometry: `Apply Modifiers` (checked)
   * Animation: include if custom keyframed clips exist (e.g. `Idle`, `Notice`, `HappyBounce`).
6. Save the file to:
   ```
   <project-root>/public/models/berry/berry.glb
   ```

---

## 4. Current Implementation State

* **Asset Status:** Temporary handcrafted procedural placeholder active.
* **Loading Mechanism:** `BerryGLBLoader.tsx` handles automatic loading and fallback.
* **Compatibility:** Future characters (Bread, Egg, Lemon, Mushroom) follow this exact modular blueprint.
