import bpy
import math
import os
from mathutils import Vector, Euler

def build_berry_character():
    print("=== STARTING BERRY 3D CHARACTER GENERATION IN BLENDER ===")

    # 1. Clear existing scene objects
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 2. Material Helper
    def create_material(name, color_rgba, roughness=0.5):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = color_rgba
            bsdf.inputs["Roughness"].default_value = roughness
        return mat

    # Palette based on game design guidelines
    mat_body = create_material("M_BerryBody", (0.878, 0.384, 0.353, 1.0), roughness=0.42)
    mat_leaves = create_material("M_BerryLeaves", (0.498, 0.714, 0.600, 1.0), roughness=0.48)
    mat_eyes = create_material("M_BerryEyes", (0.16, 0.11, 0.08, 1.0), roughness=0.15)
    mat_gleam = create_material("M_BerryGleam", (1.0, 1.0, 1.0, 1.0), roughness=0.1)
    mat_blush = create_material("M_BerryBlush", (0.95, 0.52, 0.50, 1.0), roughness=0.6)
    mat_seeds = create_material("M_BerrySeeds", (0.97, 0.83, 0.48, 1.0), roughness=0.35)
    mat_feet = create_material("M_BerryFeet", (0.80, 0.32, 0.28, 1.0), roughness=0.5)

    # Root Empty for clean diorama grouping
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = "Berry_Root"

    # 3. Strawberry Body (Lathe/Deformed plump silhouette)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, radius=0.09, location=(0, 0, 0.125))
    body = bpy.context.active_object
    body.name = "Berry_Body"
    body.parent = root
    body.data.materials.append(mat_body)

    # Deform vertices into a cute plump strawberry shape
    for v in body.data.vertices:
        rel_z = (v.co.z - 0.125) / 0.09  # -1.0 to +1.0
        if rel_z < 0:
            # Taper toward cute rounded bottom point
            factor = 1.0 + rel_z * 0.58
            v.co.x *= factor
            v.co.y *= factor
            v.co.z = 0.125 + rel_z * 0.085
        else:
            # Plump shoulders, slight taper under leaf calyx
            factor = 1.0 - (rel_z ** 2) * 0.22
            v.co.x *= factor
            v.co.y *= factor
            v.co.z = 0.125 + rel_z * 0.092

    body.data.update()
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.shade_smooth()

    # 4. Golden Seeds embedded around body
    seed_rings = [
        (0.065, 0.048, 5, 0.0),
        (0.095, 0.076, 7, 0.4),
        (0.135, 0.088, 8, 0.2),
        (0.170, 0.078, 6, 0.5),
    ]
    seed_idx = 0
    for z_h, rad, count, offset in seed_rings:
        for i in range(count):
            ang = offset + i * (2 * math.pi / count)
            # Only put seeds where they don't cover the face (face is at front around -Y)
            is_face_zone = (z_h > 0.11 and z_h < 0.16 and -2.2 < ang < -0.9)
            if is_face_zone:
                continue

            sx = math.cos(ang) * (rad + 0.001)
            sy = math.sin(ang) * (rad + 0.001)
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.0035, location=(sx, sy, z_h))
            seed = bpy.context.active_object
            seed.name = f"Berry_Seed_{seed_idx}"
            seed.scale = (0.8, 0.8, 1.4)
            seed.rotation_euler = Euler((0, math.pi * 0.15, -ang), 'XYZ')
            seed.parent = root
            seed.data.materials.append(mat_seeds)
            seed_idx += 1

    # 5. Crown Leaves (Calyx) - 5 radiating star leaves
    for i in range(5):
        angle = i * (2 * math.pi / 5)
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.022, radius2=0.002, depth=0.065, location=(0, 0, 0))
        leaf = bpy.context.active_object
        leaf.name = f"Berry_Leaf_{i+1}"
        leaf.parent = root
        leaf.data.materials.append(mat_leaves)
        leaf.scale = (1.0, 0.28, 1.0)
        # Position leaf drooping down over strawberry shoulders
        dx = math.sin(angle) * 0.038
        dy = math.cos(angle) * 0.038
        leaf.location = (dx, dy, 0.212)
        leaf.rotation_euler = Euler((0.48 * math.cos(angle), -0.48 * math.sin(angle), -angle), 'XYZ')
        bpy.context.view_layer.objects.active = leaf
        bpy.ops.object.shade_smooth()

    # Stem sprout on top
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.008, depth=0.036, location=(0.004, 0.004, 0.232))
    stem = bpy.context.active_object
    stem.name = "Berry_Stem"
    stem.parent = root
    stem.rotation_euler = Euler((0.18, 0.18, 0), 'XYZ')
    stem.data.materials.append(mat_leaves)
    bpy.context.view_layer.objects.active = stem
    bpy.ops.object.shade_smooth()

    # 6. Expressive Face (Facing -Y in Blender -> +Z in game)
    for side, sign in [("L", -1), ("R", 1)]:
        # Glossy cartoon espresso eye
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.012, location=(sign * 0.034, -0.088, 0.145))
        eye = bpy.context.active_object
        eye.name = f"Berry_Eye_{side}"
        eye.scale = (1.0, 0.45, 1.25)
        eye.parent = root
        eye.data.materials.append(mat_eyes)
        bpy.context.view_layer.objects.active = eye
        bpy.ops.object.shade_smooth()

        # White twinkle sparkle gleam
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.0035, location=(sign * 0.034 + 0.003, -0.0935, 0.149))
        gleam = bpy.context.active_object
        gleam.name = f"Berry_Gleam_{side}"
        gleam.parent = root
        gleam.data.materials.append(mat_gleam)

        # Soft pink blushing cheek
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.011, location=(sign * 0.052, -0.082, 0.128))
        blush = bpy.context.active_object
        blush.name = f"Berry_Blush_{side}"
        blush.scale = (1.2, 0.3, 0.65)
        blush.parent = root
        blush.data.materials.append(mat_blush)
        bpy.context.view_layer.objects.active = blush
        bpy.ops.object.shade_smooth()

    # Sweet smiling mouth
    bpy.ops.mesh.primitive_torus_add(major_radius=0.012, minor_radius=0.0022, major_segments=16, minor_segments=8, location=(0, -0.089, 0.131))
    mouth = bpy.context.active_object
    mouth.name = "Berry_Mouth"
    mouth.rotation_euler = Euler((math.pi * 0.46, 0, 0), 'XYZ')
    mouth.scale = (1.0, 0.6, 1.0)
    mouth.parent = root
    mouth.data.materials.append(mat_eyes)
    bpy.context.view_layer.objects.active = mouth
    bpy.ops.object.shade_smooth()

    # 7. Animated Limbs (Feet & Arms)
    for side, sign in [("L", -1), ("R", 1)]:
        # Cute little shoes / feet planted safely at Z=0
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.017, location=(sign * 0.032, -0.018, 0.012))
        foot = bpy.context.active_object
        foot.name = f"Berry_Foot_{side}"
        foot.scale = (1.0, 1.35, 0.7)
        foot.parent = root
        foot.data.materials.append(mat_feet)
        bpy.context.view_layer.objects.active = foot
        bpy.ops.object.shade_smooth()

        # Stubby cute arms
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.016, location=(sign * 0.092, -0.015, 0.11))
        arm = bpy.context.active_object
        arm.name = f"Berry_Arm_{side}"
        arm.scale = (0.7, 0.8, 1.25)
        arm.rotation_euler = Euler((0.2, 0, -sign * 0.35), 'XYZ')
        arm.parent = root
        arm.data.materials.append(mat_body)
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.shade_smooth()

    # 8. Export files
    output_dir = os.path.abspath("public/models/berry")
    os.makedirs(output_dir, exist_ok=True)

    blend_file = os.path.join(output_dir, "berry.blend")
    glb_file = os.path.join(output_dir, "berry.glb")

    print(f"Saving Blender project to: {blend_file}")
    bpy.ops.wm.save_as_mainfile(filepath=blend_file)

    print(f"Exporting GLTF Binary to: {glb_file}")
    bpy.ops.export_scene.gltf(
        filepath=glb_file,
        export_format='GLB',
        export_apply=True,
        export_materials='EXPORT',
        export_yup=True,
    )

    print("=== BERRY 3D GENERATION COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    build_berry_character()
