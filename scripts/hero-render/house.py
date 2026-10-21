# Studio Baikal: a villa as an architect's model, path-traced in Blender Cycles as a 360 turn (transparent
# background, its own soft shadow) for the drag-to-turn house on the home page (public/house-frames).
#   blender -b --factory-startup --python scripts/hero-render/house.py -- --out art/frames/house --w 960 --h 720
#   options: --frames 72 --samples 64 --only 1,19,37
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(k, d=None):
    return argv[argv.index("--" + k) + 1] if "--" + k in argv else d
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "art", "hero-src")
OUT = os.path.join(ROOT, arg("out", "art/frames/house"))
W, H = int(arg("w", 960)), int(arg("h", 720))
N, SAMPLES = int(arg("frames", 72)), int(arg("samples", 64))
ONLY = [int(x) for x in arg("only", "").split(",") if x]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------- materials ----------
def mat(name, rgb, rough=0.8, metal=0.0, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m

def tex_mat(name, folder, tint, scale, normal=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N_ = nt.nodes; L = nt.links; b = N_["Principled BSDF"]
    tc = N_.new("ShaderNodeTexCoord"); mp = N_.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale,) * 3
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    d = os.path.join(SRC, folder, folder, "textures")
    def img(kind, colour):
        f = next((x for x in os.listdir(d) if f"_{kind}_" in x), None)
        if not f: return None
        t = N_.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(d, f)); t.projection = "BOX"; t.projection_blend = 0.3
        t.image.colorspace_settings.name = "sRGB" if colour else "Non-Color"; L.new(mp.outputs["Vector"], t.inputs["Vector"]); return t
    df = img("diff", True); mx = N_.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs["Factor"].default_value = 1
    L.new(df.outputs["Color"], mx.inputs["A"]); mx.inputs["B"].default_value = (*tint, 1); L.new(mx.outputs["Result"], b.inputs["Base Color"])
    r = img("rough", False) or img("arm", False)
    if r: L.new(r.outputs["Color"], b.inputs["Roughness"])
    n = img("nor_gl", False)
    if n:
        nm = N_.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = normal; L.new(n.outputs["Color"], nm.inputs["Color"]); L.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m

def bumpy(name, rgb, rough, scale, strength):
    m = mat(name, rgb, rough); nt = m.node_tree; nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = scale
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength
    nt.links.new(nz.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    return m

trav = tex_mat("trav", "marble_01", (0.93, 0.86, 0.75), 0.35, 0.3)
walnut = tex_mat("walnut", "american_walnut_veneer", (0.8, 0.66, 0.54), 1.2)
plaster = mat("plaster", (0.86, 0.83, 0.78), 0.85)
dark = mat("dark", (0.04, 0.045, 0.05), 0.45, 0.2)
slabm = mat("slab", (0.42, 0.4, 0.37), 0.7)  # the cantilevered slabs: pale concrete
steel = mat("steel", (0.03, 0.03, 0.03), 0.35, 0.8)
glass = mat("glass", (0.85, 0.9, 0.92), 0.02, 0, **{"Transmission Weight": 1.0, "IOR": 1.45})
glow = mat("glow", (1, 0.8, 0.55), 1, 0, **{"Emission Color": (1, 0.74, 0.45, 1), "Emission Strength": 3.5})
water = bumpy("water", (0.05, 0.22, 0.26), 0.03, 6.0, 0.08); water.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 0.6
grass = bumpy("grass", (0.11, 0.18, 0.06), 0.95, 220.0, 0.12)
paving = tex_mat("paving", "marble_01", (0.86, 0.8, 0.7), 0.5, 0.2)

def box(w, d, h, x, y, z, m, bevel=0.03, name="box"):
    """w along x, d along y, h up; (x, y) centre, z the bottom."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + h / 2)); o = bpy.context.active_object; o.name = name
    o.scale = (w, d, h); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new("bevel", "BEVEL"); bv.width = min(bevel, w / 3, d / 3, h / 3); bv.segments = 2
    return o

def cut(target, w, d, h, x, y, z, arch=False):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + h / 2)); c = bpy.context.active_object; c.scale = (w, d, h)
    cs = [c]
    if arch:
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=w / 2, depth=d, location=(x, y, z + h), rotation=(math.pi / 2, 0, 0)); cs.append(bpy.context.active_object)
    for k in cs:
        k.hide_render = True; k.display_type = "WIRE"
        bl = target.modifiers.new("cut", "BOOLEAN"); bl.object = k; bl.operation = "DIFFERENCE"; bl.solver = "EXACT"
    if target.modifiers.get("bevel"): target.modifiers.move(target.modifiers.find("bevel"), len(target.modifiers) - 1)

# ---------- the model ----------
box(20, 17, 0.5, 0.5, -1.5, -0.6, dark, 0.06, "plinth")
box(19.4, 16.4, 0.1, 0.5, -1.5, -0.1, grass, 0.02, "lawn")
box(12.5, 9.2, 0.06, 0, 0, 0, paving, 0.01, "terrace")              # paving round the house
box(1.8, 6, 0.06, 1.8, -7.4, 0, paving, 0.01, "path")                 # path to the arch
box(7, 3.4, 0.06, -4.8, -7.2, 0, paving, 0.01, "pooldeck")
box(5.8, 2.4, 0.07, -4.8, -7.2, 0.005, water, 0, "pool")
# ground floor: travertine with a long window and the arched entrance, warm light inside
g = box(10, 7, 3.2, 0, 0, 0.06, trav, 0.04, "ground")
cut(g, 5.2, 0.8, 2.5, -2.2, -3.5, 0.4)                                # long window
cut(g, 1.6, 0.8, 1.9, 1.8, -3.5, 0.06, arch=True)                     # arched entrance
cut(g, 0.8, 4.6, 2.3, -5.0, 0.3, 0.5)                                 # side window
box(5.1, 0.03, 2.4, -2.2, -3.2, 0.42, glass, 0, "glass1"); box(5.1, 0.02, 2.4, -2.2, -3.0, 0.42, glow, 0)
box(0.03, 4.5, 2.2, -4.72, 0.3, 0.52, glass, 0, "glass2"); box(0.02, 4.5, 2.2, -4.5, 0.3, 0.52, glow, 0)
for gx in (-3.9, -2.2, -0.5):
    box(0.06, 0.06, 2.5, gx, -3.18, 0.4, steel, 0.005)
box(1.5, 0.08, 2.65, 1.8, -3.12, 0.06, walnut, 0.01, "door")
box(0.04, 0.04, 0.6, 2.35, -3.18, 1.0, mat("brass", (0.62, 0.45, 0.24), 0.25, 1.0), 0.005)
box(10.8, 7.8, 0.28, 0, 0, 3.26, slabm, 0.02, "slab1")                 # cantilevered slab
# first floor: white plaster, glass band behind walnut slats, a terrace with a glass rail
f1 = box(7.6, 6.2, 3.0, 1.0, 0.6, 3.54, plaster, 0.04, "first")
cut(f1, 6.4, 0.8, 2.3, 1.2, -2.5, 3.9)
box(6.3, 0.03, 2.25, 1.2, -2.22, 3.92, glass, 0); box(6.3, 0.02, 2.25, 1.2, -2.0, 3.92, glow, 0)
x = -1.9
while x < 4.4:
    box(0.07, 0.12, 2.9, x, -2.62, 3.56, walnut, 0.01); x += 0.22
box(8.4, 7.0, 0.26, 1.0, 0.6, 6.54, slabm, 0.02, "slab2")
# the back and the far side are lived in too: windows with light behind them
cut(g, 3.2, 0.8, 2.2, 1.5, 3.5, 0.6); box(3.1, 0.03, 2.1, 1.5, 3.22, 0.62, glass, 0); box(3.1, 0.02, 2.1, 1.5, 3.0, 0.62, glow, 0)
cut(g, 0.8, 3.0, 2.2, 5.0, -0.4, 0.6); box(0.03, 2.9, 2.1, 4.72, -0.4, 0.62, glass, 0); box(0.02, 2.9, 2.1, 4.5, -0.4, 0.62, glow, 0)
cut(f1, 4.0, 0.8, 1.6, 1.4, 3.7, 4.3); box(3.9, 0.03, 1.5, 1.4, 3.42, 4.32, glass, 0); box(3.9, 0.02, 1.5, 1.4, 3.2, 4.32, glow, 0)
cut(f1, 0.8, 2.4, 1.6, 4.8, 0.2, 4.3); box(0.03, 2.3, 1.5, 4.52, 0.2, 4.32, glass, 0); box(0.02, 2.3, 1.5, 4.3, 0.2, 4.32, glow, 0)
for (w, d, x, y) in ((10.6, 0.03, 0, -3.84), (0.03, 4.8, -5.3, -1.4)):
    box(w, d, 0.95, x, y, 3.54, glass, 0)
# planting
def load(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, name, name, f"{name}_1k.gltf"))
    objs = [o for o in bpy.data.objects if o not in before]
    for o in objs: o.hide_render = True; o.hide_viewport = True
    return [o for o in objs if o.type == "MESH"]
def place(meshes, x, y, height, rot=0.0):
    news = []
    for o in meshes:
        c = o.copy(); c.parent = None; c.matrix_world = o.matrix_world.copy(); bpy.context.collection.objects.link(c); c.hide_render = c.hide_viewport = False; news.append(c)
    bpy.ops.object.empty_add(location=(0, 0, 0)); e = bpy.context.active_object
    for c in news:
        mw = c.matrix_world.copy(); c.parent = e; c.matrix_world = mw
    bpy.context.view_layer.update()
    pts = [c.matrix_world @ Vector(b) for c in news for b in c.bound_box]
    zmin, zmax = min(p.z for p in pts), max(p.z for p in pts); k = height / (zmax - zmin)
    e.scale = (k, k, k); e.rotation_euler = (0, 0, rot); bpy.context.view_layer.update()
    pts = [c.matrix_world @ Vector(b) for c in news for b in c.bound_box]
    cx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2; cy = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    e.location = (x - cx, y - cy, -min(p.z for p in pts))
tree, shrub, fir = load("jacaranda_tree"), load("shrub_02"), load("fir_sapling_medium")
place(tree, -7.4, 4.4, 7.0); place(tree, 8.4, 3.6, 5.5, 1.3)
for (x, y) in ((-6.8, -3.6), (6.9, 2.6), (3.6, -6.2), (-1.0, -6.0), (7.2, -2.2)):
    place(shrub, x, y, 1.1, x)
for (x, y) in ((8.4, 4.6), (-8.4, -1.4), (5.6, 5.0)):
    place(fir, x, y, 2.6, y)

# ---------- light ----------
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
wn = world.node_tree.nodes; env = wn.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(os.path.join(SRC, "kloofendal_48d_partly_cloudy_puresky", "kloofendal_48d_partly_cloudy_puresky_1k.hdr"))
world.node_tree.links.new(env.outputs["Color"], wn["Background"].inputs["Color"]); wn["Background"].inputs["Strength"].default_value = 0.55
bpy.ops.object.light_add(type="SUN"); sun = bpy.context.active_object
sun.data.energy = 3.6; sun.data.angle = math.radians(2.5); sun.data.color = (1, 0.76, 0.52)
sun.rotation_euler = (Vector((0, 0, 0)) - Vector((10, -12, 17))).to_track_quat("-Z", "Y").to_euler()
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, -0.6)); bpy.context.active_object.is_shadow_catcher = True

# ---------- the turn ----------
bpy.ops.object.camera_add(); cam = bpy.context.active_object; sc.camera = cam
cam.data.sensor_fit = "VERTICAL"; cam.data.angle_y = math.radians(24)
bpy.ops.object.empty_add(location=(0.5, -1.5, 2.2)); tgt = bpy.context.active_object
R, EL = 58.0, math.radians(27)
for f in range(1, N + 1):
    a = math.radians(-35) + 2 * math.pi * (f - 1) / N
    cam.location = (tgt.location.x + R * math.cos(EL) * math.sin(a), tgt.location.y - R * math.cos(EL) * math.cos(a), tgt.location.z + R * math.sin(EL))
    cam.rotation_euler = (tgt.location - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)

sc.render.engine = "CYCLES"
pr = bpy.context.preferences.addons["cycles"].preferences; pr.compute_device_type = "CUDA"; pr.get_devices()
for dv in pr.devices: dv.use = dv.type == "CUDA"
sc.cycles.device = "GPU"; sc.cycles.samples = SAMPLES; sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.03
sc.cycles.use_denoising = True; sc.cycles.denoiser = "OPENIMAGEDENOISE"
sc.cycles.max_bounces = 8; sc.cycles.transmission_bounces = 6; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
sc.render.film_transparent = True; sc.render.use_persistent_data = True
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"; sc.view_settings.exposure = 0.2
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
os.makedirs(OUT, exist_ok=True)
for f in (ONLY or range(1, N + 1)):
    path = os.path.join(OUT, f"{f:04d}.png")
    if os.path.exists(path) and not ONLY: continue
    sc.frame_set(f); sc.render.filepath = path; bpy.ops.render.render(write_still=True); print("FRAME", f, flush=True)
