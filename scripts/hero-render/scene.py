# Studio Baikal hero: the scale model rendered offline in Blender Cycles, frame by frame, so the site can
# play it with the scroll (public/hero-frames). Same layout and camera path as the three.js version, but
# path-traced: real bounce light, soft sun through the arch, true materials and CC0 Poly Haven furniture.
#
#   blender -b --factory-startup --python scripts/hero-render/scene.py -- --out art/frames/desk --w 1280 --h 720
#   options: --frames 150 --intro 30 --samples 64 --only 1,60,140 (test frames)
#            --portrait (phone framing: model up, words below)
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(k, d=None):
    return argv[argv.index("--" + k) + 1] if "--" + k in argv else d
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "art", "hero-src")
OUT = os.path.join(ROOT, arg("out", "art/frames/desk"))
W, H_PX = int(arg("w", 1280)), int(arg("h", 720))
N, INTRO = int(arg("frames", 150)), int(arg("intro", 30))
SAMPLES = int(arg("samples", 64))
PORTRAIT = "--portrait" in argv
ONLY = [int(x) for x in arg("only", "").split(",") if x]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def V(x, y, z):  # three.js (y up) -> Blender (z up)
    return Vector((x, -z, y))

# ---------- materials ----------
def node_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes["Principled BSDF"]

def plain(name, rgb, rough=0.8, metal=0.0, emit=None, emit_k=0.0):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = emit_k
    return m

def tex_path(folder, kind):
    d = os.path.join(SRC, folder, folder, "textures")
    for f in os.listdir(d):
        if f"_{kind}_" in f: return os.path.join(d, f)
    return None

def pbr(name, folder, tint=(1, 1, 1), scale=1.0, bright=0.0, normal=0.6):
    """Poly Haven texture set, box-projected in object space at `scale` repeats per model unit."""
    m, nt, b = node_mat(name); N_ = nt.nodes; L = nt.links
    tc = N_.new("ShaderNodeTexCoord"); mp = N_.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale, scale, scale)
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    def img(kind, colour):
        p = tex_path(folder, kind)
        if not p: return None
        t = N_.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(p); t.projection = "BOX"; t.projection_blend = 0.25
        t.image.colorspace_settings.name = "sRGB" if colour else "Non-Color"; L.new(mp.outputs["Vector"], t.inputs["Vector"]); return t
    d = img("diff", True)
    if d:
        mix = N_.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs["Factor"].default_value = 1
        L.new(d.outputs["Color"], mix.inputs["A"]); mix.inputs["B"].default_value = (*tint, 1)
        bc = N_.new("ShaderNodeBrightContrast"); bc.inputs["Bright"].default_value = bright
        L.new(mix.outputs["Result"], bc.inputs["Color"]); L.new(bc.outputs["Color"], b.inputs["Base Color"])
    arm = img("arm", False)
    if arm:
        sp = N_.new("ShaderNodeSeparateColor"); L.new(arm.outputs["Color"], sp.inputs["Color"]); L.new(sp.outputs["Green"], b.inputs["Roughness"])
    else:
        r = img("rough", False)
        if r: L.new(r.outputs["Color"], b.inputs["Roughness"])
    n = img("nor_gl", False)
    if n:
        nm = N_.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = normal
        L.new(n.outputs["Color"], nm.inputs["Color"]); L.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m

plaster = plain("plaster", (0.82, 0.78, 0.72), 0.85)
stone = plain("stone", (0.80, 0.72, 0.62), 0.6)
oak = pbr("oak", "herringbone_parquet", (0.8, 0.72, 0.62), 1.0, 0.04, 0.8)
walnut = pbr("walnut", "american_walnut_veneer", (0.85, 0.72, 0.6), 3.0)
wool = pbr("wool", "poly_wool_herringbone", (0.85, 0.79, 0.7), 3.0)
linen = pbr("linen", "rough_linen", (0.95, 0.92, 0.87), 3.0)
plinth_m = plain("plinth", (0.035, 0.04, 0.045), 0.45, 0.2)
steel = plain("steel", (0.025, 0.022, 0.02), 0.35, 0.7)
brass = plain("brass", (0.62, 0.45, 0.24), 0.25, 1.0)
bronze_line = plain("line", (0.55, 0.4, 0.22), 0.5, 0, (0.77, 0.6, 0.36), 0.6)
glow = plain("glow", (1, 0.94, 0.84), 1, 0, (1, 0.9, 0.75), 4.0)
lampm = plain("lamp", (1, 0.95, 0.85), 0.4, 0, (1, 0.82, 0.55), 6.0)

# ---------- geometry ----------
F, H, T = 0.04, 1.4, 0.08
WY = F + H / 2
def box(w, h, d, x, y, z, mat=plaster, bevel=0.006, name="box"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=V(x, y, z))
    o = bpy.context.active_object; o.name = name; o.scale = (w, d, h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    if bevel:
        bv = o.modifiers.new("bevel", "BEVEL"); bv.width = min(bevel, w / 2.2, h / 2.2, d / 2.2); bv.segments = 2; bv.limit_method = "NONE"
    return o

# plinth, floor
box(6.5, 0.16, 4.5, 0, -0.08, 0, plinth_m, 0.012, name="plinth")
box(6, F, 4, 0, F / 2, 0, oak, 0.004, name="floor")
# dining back wall with the arched window (boolean cut, then the bevel)
AX, HW, SPRING = -1.55, 0.55, F + 0.82
FZ = -2 - T / 2
wall = box(2.9, H, T, -1.55, WY, FZ, plaster, 0, name="archwall")
bpy.ops.mesh.primitive_cube_add(size=1, location=V(AX, (F + 0.1 + SPRING) / 2, FZ)); ca = bpy.context.active_object; ca.scale = (HW * 2, T * 3, SPRING - F - 0.1)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=HW, depth=T * 3, location=V(AX, SPRING, FZ), rotation=(math.pi / 2, 0, 0)); cc = bpy.context.active_object
for ct in (ca, cc):
    ct.hide_render = True; ct.display_type = "WIRE"
    bl = wall.modifiers.new("cut", "BOOLEAN"); bl.object = ct; bl.operation = "DIFFERENCE"; bl.solver = "EXACT"
bv = wall.modifiers.new("bevel", "BEVEL"); bv.width = 0.006; bv.segments = 2
for dx in (-HW, -HW / 3, HW / 3, HW):
    box(0.022, SPRING - F - 0.1, 0.028, AX + dx, F + 0.1 + (SPRING - F - 0.1) / 2, FZ, steel, 0.004)
box(HW * 2, 0.022, 0.028, AX, F + 0.5, FZ, steel, 0.004); box(HW * 2, 0.022, 0.028, AX, SPRING, FZ, steel, 0.004)
bpy.ops.curve.primitive_bezier_circle_add(radius=HW - 0.011, location=V(AX, SPRING, FZ), rotation=(math.pi / 2, 0, 0))
arc = bpy.context.active_object; arc.data.bevel_depth = 0.012; arc.data.bevel_factor_start = 0.0; arc.data.bevel_factor_end = 0.5
arc.data.materials.append(steel)
box(2.2, 1.1, 0.01, AX, F + 0.58, -2.6, glow, 0, name="sky")  # warm daylight beyond the arch
box(3.1, H, T, 1.45, WY, FZ)                        # bedroom back wall
box(T, H, 4 + T, -3 - T / 2, WY, -T / 2)            # left wall
box(T, H, 4, -0.1, WY, 0)                           # dining | corridor
box(T, H, 2.4, 0.6, WY, 0.8)                        # corridor | living
box(0.13, H, T, -0.035, WY, -0.4); box(2.53, H, T, 1.735, WY, -0.4); box(0.44, H - 1.12, T, 0.25, F + 1.12 + (H - 1.12) / 2, -0.4)
bpy.ops.object.empty_add(location=V(0.03, F, -0.4)); door = bpy.context.active_object; door.name = "door"
for o in (box(0.44, 1.12, 0.035, 0.25, F + 0.56, -0.4, walnut, 0.004, name="doorleaf"), box(0.01, 0.26, 0.016, 0.43, F + 0.56, -0.37, brass, 0.003, name="handle")):
    o.parent = door; o.matrix_parent_inverse = door.matrix_world.inverted()
box(0.7, 1.3, 0.01, 0.25, F + 0.62, -0.62, glow, 0, name="beyond")
box(6 + T, 0.12, T, 0, F + 0.06, 2 + T / 2); box(T, 0.12, 4 + T, 3 + T / 2, F + 0.06, -T / 2)
# corridor: travertine floor, travertine and walnut panels, a ceiling with a line of light (inside only)
box(0.62, 0.008, 2.36, 0.25, F + 0.004, 0.8, stone, 0.002)
for px in (-0.054, 0.554):
    for i, z in enumerate((1.7, 1.12, 0.54, -0.06)):
        box(0.014, H - 0.14, 0.54, px, F + (H - 0.14) / 2 + 0.02, z, walnut if i % 2 else stone, 0.004)
        if i < 3:  # a thin line of light in each joint, like the reference corridor
            box(0.006, H - 0.3, 0.012, px + (0.009 if px < 0.25 else -0.009), F + (H - 0.3) / 2 + 0.1, z - 0.29, glow, 0)
ceil = box(0.72, 0.03, 2.4, 0.25, F + H + 0.015, 0.8, plaster, 0.004, name="ceiling")
strip = box(0.025, 0.01, 2.3, 0.25, F + H - 0.002, 0.8, glow, 0, name="strip")
# dining: walnut slats, rug, pendant
z = -1.85
while z < 1.75:
    box(0.03, H - 0.04, 0.05, -2.945, WY, z, walnut, 0.006); z += 0.1
box(2.2, 0.012, 1.6, AX, F + 0.006, -0.45, wool, 0.004)
# living rug; bedroom bed
box(1.4, 0.012, 1.25, 1.55, F + 0.006, 0.85, wool, 0.004)
box(1.1, 0.16, 1.22, 1.75, F + 0.08, -1.37, walnut, 0.01)
box(1.06, 0.12, 1.16, 1.75, F + 0.22, -1.37, linen, 0.03)
box(1.06, 0.03, 0.42, 1.75, F + 0.29, -0.96, wool, 0.012)
box(1.4, 0.58, 0.06, 1.75, F + 0.29, -1.95, walnut, 0.01)
# the architect's drawing lines round the plinth
GY = -0.155
for (x, z, w, d) in ((0, 2.8, 6.7, 0.008), (-3.35, 2.8, 0.008, 0.24), (3.35, 2.8, 0.008, 0.24), (3.8, 0, 0.008, 4.7), (3.8, -2.35, 0.24, 0.008), (3.8, 2.35, 0.24, 0.008)):
    box(w, 0.002, d, x, GY, z, bronze_line, 0)

# ---------- CC0 furniture (glTF at 1:2) ----------
S = 0.5
def load(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, name, name, f"{name}_1k.gltf"))
    objs = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in objs if o.type == "MESH"]
    for o in objs: o.hide_render = True; o.hide_viewport = True
    return meshes

def place(meshes, x, z, r=0.0, y=F, tint=None):
    news = []
    for o in meshes:
        c = o.copy(); c.parent = None; c.matrix_world = o.matrix_world.copy(); bpy.context.collection.objects.link(c)
        c.hide_render = False; c.hide_viewport = False; news.append(c)
    bpy.ops.object.empty_add(location=(0, 0, 0)); g = bpy.context.active_object
    for c in news:
        mw = c.matrix_world.copy(); c.parent = g; c.matrix_world = mw
    g.scale = (S, S, S); g.rotation_euler = (0, 0, r); bpy.context.view_layer.update()
    pts = [c.matrix_world @ Vector(b) for c in news for b in c.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    t = V(x, y, z); ctr = (mn + mx) / 2
    g.location = (t.x - ctr.x, t.y - ctr.y, y - mn.z)
    if tint:
        for c in news:
            for s in c.material_slots:
                if not s.material: continue
                m = s.material.copy(); b = m.node_tree.nodes.get("Principled BSDF")
                if b:
                    for l in list(b.inputs["Base Color"].links): m.node_tree.links.remove(l)
                    b.inputs["Base Color"].default_value = (*tint, 1)
                s.link = "OBJECT"; s.material = m
    return mn, mx

table, chair, sofa, arm, coffee, plant, side, pillows = (load(n) for n in (
    "dining_table", "dining_chair_02", "sofa_03", "modern_arm_chair_01", "modern_coffee_table_01", "potted_plant_02", "side_table_tall_01", "throw_pillows_01"))
mn, mx = place(table, AX, -0.45)
sz = mx - mn
Lg, Dg = sz.x, sz.y
xs = [-Lg / 3, 0, Lg / 3] if Lg > 0.8 else [-Lg / 4, Lg / 4]
for dx in xs:
    place(chair, AX + dx, -0.45 - Dg / 2 - 0.05, 0); place(chair, AX + dx, -0.45 + Dg / 2 + 0.05, math.pi)
place(plant, -2.65, -1.7)
place(sofa, 0.98, 0.85, math.pi / 2, tint=(0.62, 0.56, 0.48)); place(coffee, 1.55, 0.85); place(arm, 2.35, 0.85, -math.pi / 2)
place(side, 0.86, 1.82)
place(pillows, 1.75, -1.72, math.pi, F + 0.28, tint=(0.78, 0.72, 0.64)); place(side, 0.95, -1.8); place(side, 2.55, -1.8)
# the details that make it lived in: a sideboard and a vase in the dining room, a lamp over the table,
# art over the sofa, an ottoman, more plants
cab, vase, art, otto, plant4, tree, hang = (load(n) for n in (
    "modern_wooden_cabinet", "ceramic_vase_03", "hanging_picture_frame_02", "Ottoman_01", "potted_plant_04", "pachira_aquatica_01", "modern_ceiling_lamp_01"))
place(cab, -0.27, -1.35, -math.pi / 2)
place(vase, AX, -0.45, 0, mx.z)
place(hang, AX, -0.45, 0, F + 0.92)
place(art, 0.66, 0.85, math.pi / 2, F + 0.62)
place(otto, 2.0, 1.55, 0, F, tint=(0.66, 0.58, 0.48)); place(plant4, 0.8, -0.72); place(tree, 2.72, -0.12)

# ---------- light and world ----------
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
wn = world.node_tree.nodes; wl = world.node_tree.links; wn.clear()
env = wn.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(os.path.join(SRC, "brown_photostudio_02", "brown_photostudio_02_1k.hdr"))
bg_l = wn.new("ShaderNodeBackground"); bg_l.inputs["Strength"].default_value = 0.3; wl.new(env.outputs["Color"], bg_l.inputs["Color"])
# what the camera itself sees: the page's navy, lighter round the model
tc = wn.new("ShaderNodeTexCoord"); mp = wn.new("ShaderNodeMapping")
cxp, cyp = (0.62, 0.6) if not PORTRAIT else (0.5, 0.68)
mp.inputs["Location"].default_value = (-cxp, -cyp, 0); mp.inputs["Scale"].default_value = (1.3, 1.3 * H_PX / W, 1)
wl.new(tc.outputs["Window"], mp.inputs["Vector"])
gr = wn.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"; wl.new(mp.outputs["Vector"], gr.inputs["Vector"])
ramp = wn.new("ShaderNodeValToRGB"); wl.new(gr.outputs["Fac"], ramp.inputs["Fac"])
ramp.color_ramp.elements[0].color = (0.0034, 0.0056, 0.0065, 1); ramp.color_ramp.elements[1].color = (0.016, 0.03, 0.038, 1)
bg_c = wn.new("ShaderNodeBackground"); wl.new(ramp.outputs["Color"], bg_c.inputs["Color"])
lp = wn.new("ShaderNodeLightPath"); mix = wn.new("ShaderNodeMixShader"); out = wn.new("ShaderNodeOutputWorld")
wl.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"]); wl.new(bg_l.outputs["Background"], mix.inputs[1]); wl.new(bg_c.outputs["Background"], mix.inputs[2])
wl.new(mix.outputs["Shader"], out.inputs["Surface"])

bpy.ops.object.light_add(type="SUN"); sun = bpy.context.active_object
sun.data.energy = 4.2; sun.data.angle = math.radians(3); sun.data.color = (1, 0.72, 0.48)  # late afternoon
sun.rotation_euler = (V(-1.55, 0, 0.4) - V(-2.6, 2.9, -6.5)).normalized().to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.light_add(type="POINT", location=V(0.25, F + 1.15, 0.6)); cor = bpy.context.active_object
cor.data.energy = 0; cor.data.color = (1, 0.85, 0.65); cor.data.shadow_soft_size = 0.3
for (lx, ly, lz, e) in ((0.86, F + 0.5, 1.82, 3), (0.95, F + 0.42, -1.8, 1.5), (2.55, F + 0.42, -1.8, 1.5)):  # table lamps
    bpy.ops.object.light_add(type="POINT", location=V(lx, ly, lz)); lt = bpy.context.active_object
    lt.data.energy = e; lt.data.color = (1, 0.78, 0.5); lt.data.shadow_soft_size = 0.06
bpy.ops.object.light_add(type="POINT", location=V(AX, F + 0.86, -0.45)); pl = bpy.context.active_object
pl.data.energy = 12; pl.data.color = (1, 0.8, 0.55); pl.data.shadow_soft_size = 0.1
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -0.16)); bpy.context.active_object.is_shadow_catcher = True

# ---------- camera path (same as the web version) ----------
bpy.ops.object.camera_add(); cam = bpy.context.active_object; sc.camera = cam
cam.data.sensor_fit = "VERTICAL"; cam.data.clip_start = 0.02
# a shallow focus on what the camera looks at, like a real lens on a scale model
bpy.ops.object.empty_add(location=(0, 0, 0)); focus = bpy.context.active_object
cam.data.dof.use_dof = True; cam.data.dof.focus_object = focus
R = 0.8 * 12.5 * min(2.3, max(1.0, 1.45 / (W / H_PX)))
P0 = Vector((0.62, 0.6, 0.78)).normalized(); C = Vector((0.25, 2.4, 5.6)); P1 = Vector((0.25, 0.62, 1.85))
L0 = Vector((0, 0.25, 0)); L1 = Vector((0.25, 0.6, -0.4))
ease = lambda x: x * x * (3 - 2 * x)
cl = lambda x: min(1.0, max(0.0, x))
def rot_y(v, a):
    return Vector((v.x * math.cos(a) + v.z * math.sin(a), v.y, -v.x * math.sin(a) + v.z * math.cos(a)))
def key(f, pos, look, fov, side, door_a, inside):
    loc = V(*pos); cam.location = loc; cam.rotation_euler = (V(*look) - loc).to_track_quat("-Z", "Y").to_euler()
    cam.data.angle_y = math.radians(fov)
    focus.location = V(*look); focus.keyframe_insert("location", frame=f)
    cam.data.dof.aperture_fstop = 3.2 if inside < 0.5 else 2.2; cam.data.keyframe_insert("dof.aperture_fstop", frame=f)
    if PORTRAIT: cam.data.shift_x, cam.data.shift_y = 0, -0.15 * side
    else: cam.data.shift_x, cam.data.shift_y = -0.17 * side, 0
    door.rotation_euler = (0, 0, door_a)
    sun.data.energy = 4.2 * (1 - 0.9 * inside); cor.data.energy = 6 * inside
    for o in (ceil, strip): o.hide_render = inside < 0.5
    for o, path in ((cam, "location"), (cam, "rotation_euler"), (door, "rotation_euler"), (ceil, "hide_render"), (strip, "hide_render")):
        o.keyframe_insert(path, frame=f)
    for dat, path in ((cam.data, "lens"), (cam.data, "shift_x"), (cam.data, "shift_y"), (sun.data, "energy"), (cor.data, "energy")):
        dat.keyframe_insert(path, frame=f)
for f in range(1, N + 1):
    if f <= INTRO:  # on load: the model comes forward and settles, turning a little
        t = ease((f - 1) / (INTRO - 1)); a = (1 - t) * 0.35
        key(f, rot_y(P0 * R * (1 + 0.45 * (1 - t)), a), L0, 32, 1, 0, 0)
    else:           # the scroll: down into the corridor, along it, the door opens
        p = (f - INTRO - 1) / (N - INTRO - 1)
        d_ = ease(cl((p - 0.04) / 0.64)); u = 1 - d_; walk = ease(cl((p - 0.68) / 0.32))
        pos = P0 * R * (u * u) + C * (2 * u * d_) + P1 * (d_ * d_); pos.z -= 1.1 * walk
        key(f, pos, L0.lerp(L1, ease(cl((p - 0.04) / 0.5))), 32 + 24 * d_, 1 - cl(p * 2.4), 1.75 * ease(cl((p - 0.8) / 0.18)), d_)

# ---------- render ----------
sc.render.engine = "CYCLES"
pr = bpy.context.preferences.addons["cycles"].preferences; pr.compute_device_type = "CUDA"; pr.get_devices()
for dv in pr.devices: dv.use = dv.type == "CUDA"
sc.cycles.device = "GPU"
sc.cycles.samples = SAMPLES; sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.03
sc.cycles.use_denoising = True; sc.cycles.denoiser = "OPENIMAGEDENOISE"
sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 3; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 2
sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False; sc.cycles.blur_glossy = 1.0
sc.render.use_persistent_data = True
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"; sc.view_settings.exposure = 0.35
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H_PX, 100
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGB"
sc.frame_start, sc.frame_end = 1, N
os.makedirs(OUT, exist_ok=True)
for f in (ONLY or range(1, N + 1)):
    path = os.path.join(OUT, f"{f:04d}.png")
    if os.path.exists(path) and not ONLY: continue  # resumable
    sc.frame_set(f); sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("FRAME", f, flush=True)
