# Textures the two untextured Meshy models for the supplier hero and exports them for the web.
#   boxes: kraft board with the supplier green printed as bands around each box
#   tote:  natural canvas with two green stripes; the groceries poking out of it in a muted palette
# Run headless:
#   Blender -b -P scripts/blender/meshy_props.py -- boxes <in.glb> <out.gltf> [preview.png]
#   Blender -b -P scripts/blender/meshy_props.py -- tote  <in.glb> <out.gltf> [preview.png]
# Materials are procedural and baked to image textures (colour + normal), exported as .gltf with separate
# .jpg files (the site's CSP blocks the blob: URLs three.js would use for textures packed in a .glb).
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
KIND, SRC, OUT = argv[0], os.path.expanduser(argv[1]), os.path.abspath(argv[2])
PREVIEW = os.path.abspath(argv[3]) if len(argv) > 3 else None
TEX = 2048
GREEN, GREEN_DEEP = "#1FA952", "#178A42"
INK_GREEN = "#4E8F62"        # brand green as it prints on kraft and dyes into canvas: muted, absorbed
STRIPE_GREEN = "#47704A"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=SRC)
obj = [o for o in scene.objects if o.type == "MESH"][0]
obj.name = KIND
for o in list(scene.objects):
    if o is not obj:
        bpy.data.objects.remove(o)
# bake transforms into the mesh, so object coordinates are world coordinates (z up, origin centred)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple([x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1.0])

if KIND == "tote":
    dec = obj.modifiers.new("dec", "DECIMATE")
    dec.ratio = 0.1
    bpy.ops.object.modifier_apply(modifier="dec")
print("faces", len(obj.data.polygons))

for p in obj.data.polygons:
    p.use_smooth = True
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)   # AI meshes often have flipped patches, which spoil the AO bake
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")

# ───────────────────────── node helpers ─────────────────────────
mat = bpy.data.materials.new(KIND)
mat.use_nodes = True
nt = mat.node_tree
N, L = nt.nodes, nt.links
bsdf = N["Principled BSDF"]
tc = N.new("ShaderNodeTexCoord")
geo = N.new("ShaderNodeNewGeometry")
xyz = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], xyz.inputs[0])
nrm = N.new("ShaderNodeSeparateXYZ"); L.new(geo.outputs["Normal"], nrm.inputs[0])

def math_(op, a, b=None, c=None):
    m = N.new("ShaderNodeMath"); m.operation = op
    for i, v in enumerate((a, b, c)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            m.inputs[i].default_value = v
        else:
            L.new(v, m.inputs[i])
    return m.outputs[0]

def mix(fac, a, b, blend="MIX"):
    m = N.new("ShaderNodeMix"); m.data_type = "RGBA"; m.blend_type = blend
    if isinstance(fac, (int, float)):
        m.inputs["Factor"].default_value = fac
    else:
        L.new(fac, m.inputs["Factor"])
    for sock, v in ((6, a), (7, b)):
        if isinstance(v, tuple):
            m.inputs[sock].default_value = v
        else:
            L.new(v, m.inputs[sock])
    return m.outputs[2]

def noise(scale, detail=4.0, vec=None):
    n = N.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = detail
    L.new(vec or tc.outputs["Object"], n.inputs["Vector"])
    return n

def clamp01(s):
    return math_("MINIMUM", math_("MAXIMUM", s, 0.0), 1.0)

def stripe(val, centre, half, soft=0.004):
    d = math_("ABSOLUTE", math_("SUBTRACT", val, centre))
    return clamp01(math_("SUBTRACT", 1.0, math_("MULTIPLY", math_("SUBTRACT", d, half), 1.0 / soft)))

def ramp2(fac, a, b, pa=0.0, pb=1.0):
    r = N.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = srgb(a); r.color_ramp.elements[1].color = srgb(b)
    r.color_ramp.elements[0].position = pa; r.color_ramp.elements[1].position = pb
    L.new(fac, r.inputs["Fac"])
    return r.outputs["Color"]

side = math_("LESS_THAN", math_("ABSOLUTE", nrm.outputs["Z"]), 0.5)        # walls, not tops/bottoms
bump = N.new("ShaderNodeBump")
L.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

if KIND == "boxes":
    # ── kraft board ──
    mott = noise(3.5, 8)
    base = ramp2(mott.outputs["Fac"], "#8C7352", "#9C8260", 0.38, 0.64)
    fib = noise(180, 4)
    col = mix(0.28, base, fib.outputs["Color"], "OVERLAY")
    fl = noise(420, 2)
    fleck = ramp2(fl.outputs["Fac"], "#FFFFFF", "#5E4630", 0.66, 0.74)
    col = mix(0.5, col, fleck, "MULTIPLY")
    wv = N.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.bands_direction = "X"; wv.inputs["Scale"].default_value = 90
    L.new(tc.outputs["Object"], wv.inputs["Vector"])
    wv2 = N.new("ShaderNodeTexWave"); wv2.wave_type = "BANDS"; wv2.bands_direction = "Y"; wv2.inputs["Scale"].default_value = 90
    L.new(tc.outputs["Object"], wv2.inputs["Vector"])
    rib = math_("ADD", math_("MULTIPLY", wv.outputs["Fac"], math_("ABSOLUTE", nrm.outputs["Y"])),
                math_("MULTIPLY", wv2.outputs["Fac"], math_("ABSOLUTE", nrm.outputs["X"])))
    pnt = ramp2(geo.outputs["Pointiness"], "#000000", "#FFFFFF", 0.5, 0.56)
    pbw = N.new("ShaderNodeRGBToBW"); L.new(pnt, pbw.inputs[0])
    col = mix(math_("MULTIPLY", pbw.outputs[0], 0.6), col, srgb("#A38867"))
    # ── supplier-green bands printed round each box (horizontal, so they follow each box's twist) ──
    boxes = [(-0.95, 0.01), (0.02, 0.56), (0.58, 0.95)]
    z = xyz.outputs["Z"]
    g = None
    for z0, z1 in boxes:
        h = z1 - z0
        for c, hw in ((z1 - 0.16 * h, 0.035 * h), (z1 - 0.235 * h, 0.012 * h)):
            s = stripe(z, c, hw, 0.003)
            g = s if g is None else math_("MAXIMUM", g, s)
    g = math_("MULTIPLY", g, side)
    # ink sits in the board: multiplied over the kraft, so its grain and mottling show through
    ink = mix(1.0, col, srgb(INK_GREEN), "MULTIPLY")
    col = mix(math_("MULTIPLY", g, 0.92), col, ink)
    L.new(col, bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.84
    L.new(math_("ADD", math_("MULTIPLY", fib.outputs["Fac"], fib.outputs["Fac"]), rib), bump.inputs["Height"])
    bump.inputs["Strength"].default_value = 0.4; bump.inputs["Distance"].default_value = 0.002

else:
    # ── canvas tote: rim around z ≈ 0.55; anything above it and inside the bag's walls is groceries ──
    x, y, z = xyz.outputs["X"], xyz.outputs["Y"], xyz.outputs["Z"]
    inside = math_("MULTIPLY", math_("LESS_THAN", math_("ABSOLUTE", x), 0.58), math_("LESS_THAN", math_("ABSOLUTE", y), 0.31))
    goods = math_("MULTIPLY", inside, math_("GREATER_THAN", z, 0.56))
    # canvas weave
    w1 = N.new("ShaderNodeTexWave"); w1.wave_type = "BANDS"; w1.bands_direction = "X"; w1.inputs["Scale"].default_value = 260
    w2 = N.new("ShaderNodeTexWave"); w2.wave_type = "BANDS"; w2.bands_direction = "Z"; w2.inputs["Scale"].default_value = 260
    for w in (w1, w2):
        L.new(tc.outputs["Object"], w.inputs["Vector"])
    weave = math_("MULTIPLY", w1.outputs["Fac"], w2.outputs["Fac"])
    mott = noise(5, 6)
    canvas = ramp2(mott.outputs["Fac"], "#8F8158", "#A0915F", 0.35, 0.65)
    wbw = ramp2(weave, "#C9C2B4", "#FFFFFF")
    canvas = mix(0.6, canvas, wbw, "MULTIPLY")
    # two green stripes running down the bag
    st = math_("MAXIMUM", stripe(x, -0.2, 0.06, 0.006), stripe(x, 0.2, 0.06, 0.006))
    st = math_("MULTIPLY", st, math_("SUBTRACT", 1.0, goods))
    st = math_("MULTIPLY", st, math_("GREATER_THAN", math_("ABSOLUTE", nrm.outputs["Y"]), 0.35))
    green = mix(0.7, srgb(STRIPE_GREEN), wbw, "MULTIPLY")
    bag = mix(st, canvas, green)
    # groceries: each Voronoi cell picks a colour from a muted palette that sits well with the green
    vor = N.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 2.6
    L.new(tc.outputs["Object"], vor.inputs["Vector"])
    pal = N.new("ShaderNodeValToRGB"); pal.color_ramp.interpolation = "CONSTANT"
    cols = ["#D8D2C4", "#3B5F47", "#A35F45", "#C9BDA2", "#AE8640", "#7B9282", "#E0DCD3", "#8A3E35"]
    els = pal.color_ramp.elements
    while len(els) < len(cols):
        els.new(0.5)
    for i, (e, c) in enumerate(zip(els, cols)):
        e.position = i / len(cols); e.color = srgb(c)
    vbw = N.new("ShaderNodeRGBToBW"); L.new(vor.outputs["Color"], vbw.inputs[0])
    L.new(vbw.outputs[0], pal.inputs["Fac"])
    col = mix(goods, bag, pal.outputs["Color"])
    L.new(col, bsdf.inputs["Base Color"])
    rough = math_("ADD", 0.88, math_("MULTIPLY", goods, -0.45))
    L.new(rough, bsdf.inputs["Roughness"])
    L.new(math_("MULTIPLY", weave, math_("SUBTRACT", 1.0, goods)), bump.inputs["Height"])
    bump.inputs["Strength"].default_value = 0.35; bump.inputs["Distance"].default_value = 0.0015

obj.data.materials.clear()
obj.data.materials.append(mat)

# ───────────────────────── bake to textures ─────────────────────────
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 8

def bake(kind, name, cs):
    img = bpy.data.images.new(name, TEX, TEX, alpha=False)
    img.colorspace_settings.name = cs
    node = N.new("ShaderNodeTexImage"); node.image = img
    for n in N:
        n.select = False
    node.select = True; N.active = node
    if kind == "DIFFUSE":
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, margin=6)
    else:
        bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT", margin=6)
    N.remove(node)
    return img

col_img = bake("DIFFUSE", f"{KIND}_color", "sRGB")

# ambient occlusion baked into the boxes' colour: the seams and the gaps between the boxes get real
# shading. Skipped for the tote, whose mesh has groceries fused into the inside of its wall that
# the bake turns into dark smudges; its folds read fine from the page lighting.
if KIND == "boxes":
    world = bpy.data.worlds.new("bakeW"); scene.world = world
    world.light_settings.distance = 0.35
    scene.cycles.samples = 64
    ao_img = bpy.data.images.new(f"{KIND}_ao", TEX, TEX, alpha=False)
    ao_img.colorspace_settings.name = "Non-Color"
    node = N.new("ShaderNodeTexImage"); node.image = ao_img
    for n in N:
        n.select = False
    node.select = True; N.active = node
    bpy.ops.object.bake(type="AO", margin=6)
    N.remove(node)
    import numpy as np
    px = np.empty(TEX * TEX * 4, dtype=np.float32); col_img.pixels.foreach_get(px)
    ao = np.empty(TEX * TEX * 4, dtype=np.float32); ao_img.pixels.foreach_get(ao)
    floor_ = 0.3
    shade = floor_ + (1 - floor_) * ao.reshape(-1, 4)[:, :1] ** 1.3
    c = px.reshape(-1, 4); c[:, :3] *= shade
    col_img.pixels.foreach_set(c.ravel())
    col_img.update()
    scene.cycles.samples = 8
nrm_img = bake("NORMAL", f"{KIND}_normal", "Non-Color")
rough_val = 0.84 if KIND == "boxes" else 0.82
for n in list(N):
    if n.type not in ("BSDF_PRINCIPLED", "OUTPUT_MATERIAL"):
        N.remove(n)
bsdf.inputs["Roughness"].default_value = rough_val
ci = N.new("ShaderNodeTexImage"); ci.image = col_img
ni = N.new("ShaderNodeTexImage"); ni.image = nrm_img
nm = N.new("ShaderNodeNormalMap")
L.new(ci.outputs["Color"], bsdf.inputs["Base Color"])
L.new(ni.outputs["Color"], nm.inputs["Color"])
L.new(nm.outputs["Normal"], bsdf.inputs["Normal"])

# the boxes come in as one mesh with two loose parts (the bottom pair, and the top box); split them so the
# page can tumble the top box on its own
if KIND == "boxes":
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")
    parts = sorted([o for o in scene.objects if o.type == "MESH"], key=lambda o: len(o.data.vertices))
    parts[0].name = "box_top"; parts[-1].name = "box_stack"
    for o in parts:
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLTF_SEPARATE", export_texture_dir=f"{KIND}-tex",
                          use_selection=True, export_image_format="JPEG", export_jpeg_quality=86, export_yup=True)
print("exported", OUT)

if PREVIEW:
    world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#EEEEEC")
    def area(loc, e, s):
        l = bpy.data.lights.new("A", "AREA"); l.energy = e; l.size = s
        o = bpy.data.objects.new("A", l); scene.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area((3, -3.5, 3.5), 700, 2.5); area((-3.5, -2, 2), 250, 3); area((0, 3.5, 3), 200, 3)
    cam = bpy.data.objects.new("C", bpy.data.cameras.new("C")); scene.collection.objects.link(cam)
    cam.data.lens = 55; cam.location = (3.4, -4.6, 1.8)
    cam.rotation_euler = (Vector((0, 0, 0.05)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    scene.cycles.samples = 64
    scene.render.resolution_x, scene.render.resolution_y = 900, 1000
    scene.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)
