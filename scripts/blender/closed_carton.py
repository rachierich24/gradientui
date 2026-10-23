# Closed corrugated shipping carton for the supplier hero (public/supplier/carton-closed.gltf + .bin + textures).
# Run headless:  /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/blender/closed_carton.py -- <out.gltf> [preview.png]
# Builds the box (bevelled edges, faces that bulge and sag a little, a couple of dents), a branded tape strip
# over the flap seam, printed "this side up" marks and a shipping label. The kraft material is procedural
# (fibre mottling, faint corrugation ribs showing through the liner, worn edges) and is baked to image
# textures so it survives the trip to glTF.
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "carton-closed.glb")
PREVIEW = os.path.abspath(argv[1]) if len(argv) > 1 else None
TEX = 2048
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
W, D, H = 1.8, 1.25, 1.15          # x (long side), y (depth), z (height); bottom at z = 0
BEV = 0.009

def srgb(h, a=1.0):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, a)

def link(obj):
    scene.collection.objects.link(obj)
    return obj

FONTS = {
    "bold": "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "narrow": "/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf",
    "regular": "/System/Library/Fonts/Supplemental/Arial.ttf",
    "black": "/System/Library/Fonts/Supplemental/Arial Black.ttf",
}
_font_cache = {}
def font(k):
    if k not in _font_cache:
        _font_cache[k] = bpy.data.fonts.load(FONTS[k])
    return _font_cache[k]

def principled(name, color, rough=0.6, metal=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = spec
    return m

def text_mesh(body, size, fnt, mat, name, align="LEFT"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.size = size
    cu.font = font(fnt)
    cu.align_x = align
    tmp = bpy.data.objects.new(name + "_tmp", cu)
    link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))

def place(obj, loc, rot):
    obj.matrix_world = Matrix.Translation(loc) @ rot

FRONT = Matrix.Rotation(math.pi / 2, 4, "X")                                  # faces -Y
RIGHT = Matrix.Rotation(math.pi / 2, 4, "Z") @ Matrix.Rotation(math.pi / 2, 4, "X")   # faces +X
TOP = Matrix.Identity(4)                                                       # faces +Z

# ───────────────────────── the box ─────────────────────────
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co = Vector((v.co.x * W, v.co.y * D, v.co.z * H + H / 2))
bmesh.ops.bevel(bm, geom=list(bm.edges), offset=BEV, offset_type="OFFSET", segments=2, profile=0.5, affect="EDGES", clamp_overlap=True)
long_edges = [e for e in bm.edges if e.calc_length() > 0.2]
bmesh.ops.subdivide_edges(bm, edges=long_edges, cuts=16, use_grid_fill=True)

def bow(face, a, b):
    """How far the face at in-plane coords (a, b) sits outside its nominal plane."""
    if face == "y":                     # long faces: a = x, b = z
        fx, fz = 2 * a / W, 2 * (b - H / 2) / H
        return 0.011 * max(0, 1 - fx ** 4) * max(0, 1 - fz * fz)
    if face == "x":                     # end faces: a = y, b = z
        fy, fz = 2 * a / D, 2 * (b - H / 2) / H
        return 0.009 * max(0, 1 - fy ** 4) * max(0, 1 - fz * fz)
    return 0.0

def bulge(v):
    x, y, z = v.co
    fx, fy, fz = (2 * x / W), (2 * y / D), (2 * (z - H / 2) / H)
    eps = 1e-4
    if abs(z - H) < eps:          # top flaps sag a touch toward the seam
        v.co.z -= 0.010 * (1 - fx * fx) * (1 - fy ** 4) + 0.004 * math.exp(-(y / 0.06) ** 2) * (1 - fx * fx)
    elif abs(abs(y) - D / 2) < eps:   # long faces bow outward
        v.co.y += math.copysign(0.011, y) * (1 - fx ** 4) * (1 - fz * fz)
    elif abs(abs(x) - W / 2) < eps:   # end faces bow outward
        v.co.x += math.copysign(0.009, x) * (1 - fy ** 4) * (1 - fz * fz)

for v in bm.verts:
    bulge(v)

# a couple of soft dents from handling
for cx, cz, r, d in [(-0.5, 0.3, 0.12, 0.006), (-0.66, 0.88, 0.09, 0.004)]:
    for v in bm.verts:
        if abs(v.co.y + D / 2) < 0.03:
            q = ((v.co.x - cx) ** 2 + (v.co.z - cz) ** 2) / (r * r)
            if q < 4:
                v.co.y += d * math.exp(-q)

me = bpy.data.meshes.new("Carton")
bm.to_mesh(me)
bm.free()
box = link(bpy.data.objects.new("Carton", me))
for p in me.polygons:
    p.use_smooth = True

bpy.context.view_layer.objects.active = box
box.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004)
bpy.ops.object.mode_set(mode="OBJECT")

# procedural kraft board
kraft = bpy.data.materials.new("Kraft")
kraft.use_nodes = True
nt = kraft.node_tree
N = nt.nodes
L = nt.links
bsdf = N["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.86
tc = N.new("ShaderNodeTexCoord")
geo = N.new("ShaderNodeNewGeometry")

mott = N.new("ShaderNodeTexNoise"); mott.inputs["Scale"].default_value = 3.5; mott.inputs["Detail"].default_value = 8.0
L.new(tc.outputs["Object"], mott.inputs["Vector"])
ramp = N.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = srgb("#A4733D")
ramp.color_ramp.elements[1].color = srgb("#B5864E")
ramp.color_ramp.elements[0].position = 0.38
ramp.color_ramp.elements[1].position = 0.64
L.new(mott.outputs["Fac"], ramp.inputs["Fac"])

fib = N.new("ShaderNodeTexNoise"); fib.inputs["Scale"].default_value = 180.0; fib.inputs["Detail"].default_value = 4.0
L.new(tc.outputs["Object"], fib.inputs["Vector"])
fibmix = N.new("ShaderNodeMix"); fibmix.data_type = "RGBA"; fibmix.blend_type = "OVERLAY"
fibmix.inputs["Factor"].default_value = 0.28
L.new(ramp.outputs["Color"], fibmix.inputs[6]); L.new(fib.outputs["Color"], fibmix.inputs[7])

fl = N.new("ShaderNodeTexNoise"); fl.inputs["Scale"].default_value = 420.0; fl.inputs["Detail"].default_value = 2.0
L.new(tc.outputs["Object"], fl.inputs["Vector"])
flr = N.new("ShaderNodeValToRGB")
flr.color_ramp.elements[0].position = 0.66; flr.color_ramp.elements[0].color = (1, 1, 1, 1)
flr.color_ramp.elements[1].position = 0.74; flr.color_ramp.elements[1].color = srgb("#6E4A28")
L.new(fl.outputs["Fac"], flr.inputs["Fac"])

# corrugation flutes showing faintly through the outer liner (vertical on the walls, along x on top)
sep = N.new("ShaderNodeSeparateXYZ"); L.new(geo.outputs["Normal"], sep.inputs["Vector"])
def wave(axis):
    w = N.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = axis
    w.inputs["Scale"].default_value = 90.0; w.inputs["Distortion"].default_value = 0.4
    L.new(tc.outputs["Object"], w.inputs["Vector"])
    return w
wx, wy = wave("X"), wave("Y")
def absn(o):
    a = N.new("ShaderNodeMath"); a.operation = "ABSOLUTE"; L.new(sep.outputs[o], a.inputs[0]); return a
ax, ay, az = absn("X"), absn("Y"), absn("Z")
def mul(a, b):
    m = N.new("ShaderNodeMath"); m.operation = "MULTIPLY"; L.new(a, m.inputs[0]); L.new(b, m.inputs[1]); return m
def add(a, b):
    m = N.new("ShaderNodeMath"); m.operation = "ADD"; L.new(a, m.inputs[0]); L.new(b, m.inputs[1]); return m
rib = add(add(mul(wx.outputs["Fac"], ay.outputs[0]).outputs[0], mul(wy.outputs["Fac"], ax.outputs[0]).outputs[0]).outputs[0],
          mul(wy.outputs["Fac"], az.outputs[0]).outputs[0])

ribmix = N.new("ShaderNodeMix"); ribmix.data_type = "RGBA"; ribmix.blend_type = "MULTIPLY"
ribmix.inputs["Factor"].default_value = 0.09
fleck = N.new("ShaderNodeMix"); fleck.data_type = "RGBA"; fleck.blend_type = "MULTIPLY"
fleck.inputs["Factor"].default_value = 0.55
L.new(fibmix.outputs[2], fleck.inputs[6]); L.new(flr.outputs["Color"], fleck.inputs[7])
L.new(fleck.outputs[2], ribmix.inputs[6])
ribcol = N.new("ShaderNodeCombineColor"); L.new(rib.outputs[0], ribcol.inputs[0]); L.new(rib.outputs[0], ribcol.inputs[1]); L.new(rib.outputs[0], ribcol.inputs[2])
L.new(ribcol.outputs[0], ribmix.inputs[7])

# worn, slightly lighter crushed edges
pnt = N.new("ShaderNodeValToRGB")
pnt.color_ramp.elements[0].position = 0.5; pnt.color_ramp.elements[1].position = 0.56
L.new(geo.outputs["Pointiness"], pnt.inputs["Fac"])
edge = N.new("ShaderNodeMix"); edge.data_type = "RGBA"
L.new(pnt.outputs["Color"], edge.inputs["Factor"])
L.new(ribmix.outputs[2], edge.inputs[6]); edge.inputs[7].default_value = srgb("#C79C68")
L.new(edge.outputs[2], bsdf.inputs["Base Color"])

bmp = N.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = 0.45; bmp.inputs["Distance"].default_value = 0.003
fibb = add(mul(fib.outputs["Fac"], fib.outputs["Fac"]).outputs[0], rib.outputs[0])
L.new(fibb.outputs[0], bmp.inputs["Height"])
L.new(bmp.outputs["Normal"], bsdf.inputs["Normal"])
me.materials.append(kraft)

# ───────────────────────── tape over the flap seam, running down both ends ─────────────────────────
TAPE_W, DROP, T = 0.34, 0.30, 0.0016
tape_mat = principled("Tape", srgb("#C29A60", 1.0), rough=0.2, spec=0.7)
r = BEV + T
prof = []
prof += [(-W / 2 - T, H - DROP), (-W / 2 - T, H - BEV)]
for i in range(1, 6):
    a = math.pi - (math.pi / 2) * i / 6
    prof.append((-W / 2 + BEV + r * math.cos(a), H - BEV + r * math.sin(a)))
prof += [(-W / 2 + BEV, H + T - 0.006), (W / 2 - BEV, H + T - 0.006)]
for i in range(1, 6):
    a = math.pi / 2 - (math.pi / 2) * i / 6
    prof.append((W / 2 - BEV + r * math.cos(a), H - BEV + r * math.sin(a)))
prof += [(W / 2 + T, H - BEV), (W / 2 + T, H - DROP)]
tbm = bmesh.new()
rows = []
for (x, z) in prof:
    rows.append([tbm.verts.new((x, y, z)) for y in (-TAPE_W / 2, TAPE_W / 2)])
for a, b in zip(rows, rows[1:]):
    tbm.faces.new((a[0], b[0], b[1], a[1]))
tme = bpy.data.meshes.new("Tape"); tbm.to_mesh(tme); tbm.free()
tme.materials.append(tape_mat)
tape = link(bpy.data.objects.new("Tape", tme))
for p in tme.polygons:
    p.use_smooth = True

# printed brand on the tape
ink_tape = principled("TapeInk", srgb("#1B1712"), rough=0.4)
for i, x in enumerate((-0.6, 0.0, 0.6)):
    t = text_mesh("gradient 365", 0.085, "bold", ink_tape, f"TapeBrand{i}", "CENTER")
    place(t, Vector((x, -0.03, H + T - 0.0045)), TOP)

# ───────────────────────── "this side up" print on the right end ─────────────────────────
ink = principled("Ink", srgb("#3B2A1B"), rough=0.75)
def arrow(name):
    abm = bmesh.new()
    pts = [(-0.035, 0), (0.035, 0), (0.035, 0.11), (0.08, 0.11), (0, 0.19), (-0.08, 0.11), (-0.035, 0.11)]
    abm.faces.new([abm.verts.new((x, y, 0)) for x, y in pts])
    am = bpy.data.meshes.new(name); abm.to_mesh(am); abm.free(); am.materials.append(ink)
    return link(bpy.data.objects.new(name, am))
for i, y in enumerate((-0.16, 0.16)):
    a = arrow(f"Arrow{i}")
    place(a, Vector((W / 2 + 0.0035, y, 0.56)), RIGHT)
cap = text_mesh("THIS SIDE UP", 0.05, "narrow", ink, "SideUp", "CENTER")
place(cap, Vector((W / 2 + 0.0035, 0, 0.47)), RIGHT)
fr = text_mesh("HANDLE WITH CARE  ·  KEEP DRY", 0.034, "narrow", ink, "Handle", "CENTER")
place(fr, Vector((W / 2 + 0.0035, 0, 0.16)), RIGHT)

# ───────────────────────── shipping label on the front ─────────────────────────
paper = principled("Label", srgb("#F3F0E8"), rough=0.55)
LW, LH = 0.66, 0.44
# a fine grid, so the paper can follow the bowed face it is stuck to
lbm = bmesh.new()
bmesh.ops.create_grid(lbm, x_segments=24, y_segments=16, size=0.5)
for v in lbm.verts:
    v.co = Vector((v.co.x * LW, 0, v.co.y * LH))
lme = bpy.data.meshes.new("Label"); lbm.to_mesh(lme); lbm.free(); lme.materials.append(paper)
label = link(bpy.data.objects.new("Label", lme))
LX, LZ = 0.38, 0.36
FY = -D / 2 - 0.0125
label.location = (LX, FY, LZ)

lab_ink = principled("LabelInk", srgb("#141414"), rough=0.5)
def ltext(body, size, fnt, dx, dz, name):
    t = text_mesh(body, size, fnt, lab_ink, name)
    place(t, Vector((LX - LW / 2 + dx, FY - 0.0012, LZ - LH / 2 + dz)), FRONT)
ltext("gradient 365", 0.05, "bold", 0.04, LH - 0.085, "LabBrand")
ltext("SUPPLIER DISPATCH", 0.022, "narrow", 0.43, LH - 0.08, "LabTag")
ltext("SHIP TO", 0.02, "narrow", 0.04, LH - 0.15, "LabShip")
ltext("Blue Tokai Coffee Roasters", 0.03, "bold", 0.04, LH - 0.19, "LabName")
ltext("Koramangala · Bengaluru 560034", 0.024, "regular", 0.04, LH - 0.225, "LabAddr")
ltext("PO #GRB-1049    12 kg    1 of 3", 0.024, "narrow", 0.04, LH - 0.275, "LabPO")
rule = bmesh.new()
rv = [rule.verts.new((x, 0, z)) for x, z in ((0, 0), (LW - 0.08, 0), (LW - 0.08, 0.0025), (0, 0.0025))]
rule.faces.new(rv)
rme = bpy.data.meshes.new("LabRule"); rule.to_mesh(rme); rule.free(); rme.materials.append(lab_ink)
ro = link(bpy.data.objects.new("LabRule", rme))
ro.location = (LX - LW / 2 + 0.04, FY - 0.0012, LZ - LH / 2 + LH - 0.115)
# barcode
bbm = bmesh.new()
x = 0.0
while x < 0.5:
    wbar = random.choice((0.003, 0.005, 0.008))
    q = [bbm.verts.new((x + dx, 0, z)) for dx, z in ((0, 0), (wbar, 0), (wbar, 0.09), (0, 0.09))]
    bbm.faces.new(q)
    x += wbar + random.choice((0.003, 0.004, 0.006))
bme = bpy.data.meshes.new("Barcode"); bbm.to_mesh(bme); bbm.free(); bme.materials.append(lab_ink)
bar = link(bpy.data.objects.new("Barcode", bme))
bar.location = (LX - LW / 2 + 0.04, FY - 0.0012, LZ - LH / 2 + 0.035)

# ───────────────────────── stick prints and the label onto the bowed faces ─────────────────────────
bpy.context.view_layer.update()      # make sure every object's matrix_world reflects its location
def conform(names, face, sign, lift):
    for n in names:
        o = scene.objects[n]
        mw = o.matrix_world.copy()
        o.data.transform(mw)
        o.matrix_world = Matrix.Identity(4)
        for v in o.data.vertices:
            if face == "y":
                v.co.y = sign * (D / 2 + bow("y", v.co.x, v.co.z) + lift)
            else:
                v.co.x = sign * (W / 2 + bow("x", v.co.y, v.co.z) + lift)
conform(["Arrow0", "Arrow1", "SideUp", "Handle"], "x", 1, 0.0008)
conform(["Label"], "y", -1, 0.0008)
conform(["LabBrand", "LabTag", "LabShip", "LabName", "LabAddr", "LabPO", "LabRule", "Barcode"], "y", -1, 0.0016)
# the tape's drops over the bowed ends
for v in tme.vertices:
    if abs(abs(v.co.x) - (W / 2 + T)) < 1e-6:
        v.co.x = math.copysign(W / 2 + bow("x", v.co.y, v.co.z) + T, v.co.x)

# ───────────────────────── bake the kraft board to textures ─────────────────────────
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 16
for o in scene.objects:
    o.select_set(False)
box.select_set(True)
bpy.context.view_layer.objects.active = box

def bake(kind, name, colorspace):
    img = bpy.data.images.new(name, TEX, TEX, alpha=False)
    img.colorspace_settings.name = colorspace
    node = N.new("ShaderNodeTexImage"); node.image = img
    for n in N:
        n.select = False
    node.select = True; N.active = node
    if kind == "DIFFUSE":
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, margin=8)
    else:
        bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT", margin=8)
    N.remove(node)
    return img

col_img = bake("DIFFUSE", "kraft_color", "sRGB")
nrm_img = bake("NORMAL", "kraft_normal", "Non-Color")

# swap the procedural graph for the baked maps
for n in list(N):
    if n.type not in ("BSDF_PRINCIPLED", "OUTPUT_MATERIAL"):
        N.remove(n)
ci = N.new("ShaderNodeTexImage"); ci.image = col_img
ni = N.new("ShaderNodeTexImage"); ni.image = nrm_img
nm = N.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 1.0
L.new(ci.outputs["Color"], bsdf.inputs["Base Color"])
L.new(ni.outputs["Color"], nm.inputs["Color"])
L.new(nm.outputs["Normal"], bsdf.inputs["Normal"])

# ───────────────────────── export ─────────────────────────
for o in scene.objects:
    o.select_set(o.type == "MESH")
# textures as separate .jpg files: the site's CSP blocks the blob: URLs three.js uses for textures packed in a .glb
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLTF_SEPARATE", export_texture_dir="carton-closed-tex", use_selection=True, export_image_format="JPEG",
                          export_jpeg_quality=88, export_apply=True, export_yup=True)
print("exported", OUT, os.path.getsize(OUT))

# ───────────────────────── studio preview ─────────────────────────
if PREVIEW:
    world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#F2F2F0")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8
    def area(loc, energy, size):
        l = bpy.data.lights.new("A", "AREA"); l.energy = energy; l.size = size
        o = link(bpy.data.objects.new("A", l)); o.location = loc
        o.rotation_euler = (Vector((0, 0, H / 2)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area((3.5, -4.0, 4.5), 1300, 2.2)
    area((-4.5, -2.5, 2.5), 300, 4)
    area((0.0, 4.0, 3.5), 250, 3)
    floor_me = bpy.data.meshes.new("F"); fbm = bmesh.new(); bmesh.ops.create_grid(fbm, x_segments=1, y_segments=1, size=12); fbm.to_mesh(floor_me); fbm.free()
    floor_me.materials.append(principled("Floor", srgb("#F2F2F0"), rough=0.9))
    link(bpy.data.objects.new("Floor", floor_me))
    cam = bpy.data.cameras.new("C"); cam.lens = 60
    co = link(bpy.data.objects.new("C", cam)); co.location = (3.6, -4.6, 2.6)
    co.rotation_euler = (Vector((0.05, 0, H * 0.45)) - co.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = co
    scene.cycles.samples = 96
    scene.render.resolution_x, scene.render.resolution_y = 1400, 1000
    scene.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)
    print("preview", PREVIEW)
