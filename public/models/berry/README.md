# Berry 3D Model Asset Directory

This directory is the designated location for the production Blender 3D model of **Berry**:

```
public/models/berry/berry.glb
```

## Model Requirements for 3D Artists (Blender)

1. **File Format:** Binary glTF (`.glb`).
2. **File Path:** `public/models/berry/berry.glb`
3. **Scale:** Real-world units (meters).
   - Target height: `0.26m` (26 cm tall).
   - Target width: `0.18m` (18 cm wide).
4. **Origin / Pivot Point:**
   - Placed at the bottom center between the feet (sitting on surface `y = 0`).
5. **Color Palette:**
   - Body: Warm strawberry red (`#e0625a` / sRGB `0.878, 0.384, 0.353`)
   - Leaf crown & stem: Muted mint / herb green (`#7fb699` / sRGB `0.498, 0.714, 0.600`)
   - Eyes: Dark espresso charcoal (`#36251b`)
   - Cheeks / Blush: Soft strawberry pink (`#f28a84`)
   - Feet & arms: Warm strawberry red matching body
6. **Geometry:**
   - Clean, handcrafted low-poly aesthetic.
   - Recommended polygon count: 500 – 1,500 triangles.
   - Smooth shading with auto-smooth on body curves.
7. **Node / Mesh Hierarchy (Optional for Rigging):**
   - `Berry_Root`
     - `Berry_Body`
     - `Berry_Leaves`
     - `Berry_Face` (or separate `Eye_L`, `Eye_R`)
     - `Arm_L`, `Arm_R`
     - `Foot_L`, `Foot_R`
8. **Animations (Optional Embedded Clips):**
   - `Idle`: Gentle breathing and leaf sway (2 - 3 seconds looping).
   - `Notice`: Perking up and looking toward camera.
   - `HappyBounce`: Quick celebratory hop.
   - `ShyHide`: Tucking head down bashfully.

## How the Game Loads Berry

The game uses `BerryGLBLoader.tsx` which looks for `/models/berry/berry.glb`:
- If `berry.glb` exists, it is rendered with automatic scaling and materials.
- If `berry.glb` is not yet exported from Blender, the game seamlessly displays the built-in procedural low-poly placeholder model (`BerryPlaceholderModel.tsx`).
- No gameplay code or interaction logic needs to change when the Blender file is added!
