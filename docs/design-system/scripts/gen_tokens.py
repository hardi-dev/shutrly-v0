#!/usr/bin/env python3
"""Generate Shutrly approved token artifacts from one definition.

Outputs:
  docs/design-system/tokens.json            DTCG-compatible (light = $value, dark = $extensions.mode.dark)
  docs/design-system/pencil-mapping.json    token path <-> Pencil variable name
  scratchpad/pencil-vars.json               payload for Pencil SetVariables
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRATCH = Path(__file__).parent
TODAY = "2026-09-26"

# ---------- primitives (status: O=observed, P=proposed; all APPROVED 2026-09-26) ----------
P = {
 "neutral": [("0","#FFFFFF","O"),("50","#FAFAFA","O"),("100","#F4F4F5","O"),("200","#E4E4E7","O"),("300","#D4D4D8","P"),
             ("400","#A1A1AA","O"),("500","#71717A","O"),("600","#52525B","O"),("700","#3F3F46","O"),("800","#27272A","O"),
             ("850","#1F1F23","P"),("900","#18181B","O"),("950","#09090B","P")],
 "blue":    [("50","#EEF3FF","O"),("100","#D6DEFF","O"),("450","#8FAEFF","P"),("500","#2F5BFF","O"),("600","#1F55E0","P"),("700","#1D4ED8","O")],
 "lime":    [("50","#F4FBDF","O"),("100","#EEFBC8","O"),("300","#C6F432","O"),("400","#A3D916","O"),("500","#84CC16","O"),("800","#3F6212","O"),("900","#3F5200","O")],
 "green":   [("50","#E8F7EE","O"),("400","#4ADE80","P"),("700","#15803D","O")],
 "amber":   [("50","#FEF3E2","O"),("100","#FDE7C4","O"),("400","#FBBF24","P"),("700","#B45309","O")],
 "red":     [("50","#FDECEC","O"),("400","#F87171","P"),("600","#DC2626","O"),("700","#B91C1C","O")],
}
# alpha primitives: name -> (base primitive, alpha hex, pct)
A = {
 "blue-500-a25":("blue.500","40",25),"blue-500-a40":("blue.500","66",40),
 "blue-450-a16":("blue.450","29",16),"blue-450-a33":("blue.450","55",33),"blue-700-a25":("blue.700","40",25),
 "lime-300-a12":("lime.300","1F",12),"lime-300-a16":("lime.300","29",16),"lime-300-a33":("lime.300","55",33),"lime-800-a25":("lime.800","40",25),
 "green-400-a16":("green.400","29",16),"green-400-a33":("green.400","55",33),"green-700-a25":("green.700","40",25),
 "amber-400-a16":("amber.400","29",16),"amber-400-a33":("amber.400","55",33),"amber-700-a25":("amber.700","40",25),
 "red-400-a16":("red.400","29",16),"red-400-a33":("red.400","55",33),"red-700-a25":("red.700","40",25),
 "neutral-900-a08":("neutral.900","14",8),"neutral-900-a14":("neutral.900","24",14),"black-a40":(None,"66",40),
}
HEX = {f"{g}.{k}": v for g, steps in P.items() for k, v, _ in steps}
for n,(base,a,_) in A.items():
    HEX[f"alpha.{n}"] = (HEX[base] if base else "#000000") + a

def prim(ref):  # "neutral.100" or "alpha.blue-500-a25"
    assert ref in HEX, ref
    return "{color.primitive." + ref + "}"

# ---------- semantic colors: name -> (light, dark, description) ----------
S = {
 "surface.canvas":        ("neutral.100","neutral.950","App background behind panels"),
 "surface.panel":         ("neutral.0","neutral.900","Cards, panels, inputs, toasts"),
 "surface.subtle":        ("neutral.50","neutral.850","Table header, search field, quiet areas"),
 "surface.sunken":        ("neutral.100","neutral.850","Segmented track, disabled field fill"),
 "surface.muted":         ("neutral.200","neutral.800","Count badge, avatar, chips on panel"),
 "surface.inverse":       ("neutral.900","neutral.50","Inverse chips, selected calendar day"),
 "border.default":        ("neutral.200","neutral.800","Panel, tile, card borders"),
 "border.subtle":         ("neutral.100","neutral.850","Row separators, hairlines"),
 "border.input":          ("neutral.300","neutral.700","Text field at rest (Option A; GAP-06 accepted)"),
 "border.input-hover":    ("neutral.400","neutral.500","Text field hover"),
 "border.control":        ("neutral.500","neutral.500","Checkbox/radio outline (>= 3:1)"),
 "border.control-hover":  ("neutral.600","neutral.400","Checkbox/radio outline · hover (Owner 2026-09-26)"),
 "text.primary":          ("neutral.900","neutral.50","Headings, body, values"),
 "text.secondary":        ("neutral.600","neutral.300","Secondary copy, labels"),
 "text.muted":            ("neutral.500","neutral.400","Helper, placeholder, column heads, icons"),
 "text.disabled":         ("neutral.400","neutral.500","Disabled only (fails AA as text by design)"),
 "text.inverse":          ("neutral.0","neutral.900","Text on surface.inverse"),
 "action.primary":        ("blue.500","blue.500","Primary action, active nav (user: same blue both modes)"),
 "action.primary-hover":  ("blue.600","blue.600","Primary action hover"),
 "action.on-primary":     ("neutral.0","neutral.0","Label on action.primary (4.94:1)"),
 "focus.ring":            ("blue.500","blue.500","2px focus border"),
 "focus.glow":            ("alpha.blue-500-a25","alpha.blue-500-a40","Soft focus halo"),
 "control.track-off":     ("neutral.300","neutral.700","Switch off track"),
 "control.track-off-hover": ("neutral.400","neutral.600","Switch off track · hover (Owner 2026-09-26)"),
 "control.knob":          ("neutral.0","neutral.50","Switch knob"),
 "accent.highlight":      ("lime.300","lime.300","Brand lime: workspace mark, today marker"),
 "accent.on-highlight":   ("neutral.900","neutral.900","Content on accent.highlight"),
 "accent.on-inverse":     ("lime.300","lime.800","Lime label on surface.inverse"),
 "accent.soft":           ("lime.50","alpha.lime-300-a12","Active timeline event, shooting stage"),
 "accent.soft-fg":        ("lime.800","lime.300","Text/dot on accent.soft"),
 "progress.positive":     ("lime.400","lime.300","Positive progress fill"),
 "data.muted":            ("blue.100","alpha.blue-500-a25","Sparkline history bars"),
 "data.current":          ("blue.500","blue.500","Sparkline current bar"),
 "status.positive.bg":    ("lime.100","alpha.lime-300-a16","Positive delta chip"),
 "status.positive.fg":    ("lime.900","lime.300","Positive delta text"),
 "status.success.bg":     ("green.50","alpha.green-400-a16","Success chip/toast fill"),
 "status.success.fg":     ("green.700","green.400","Success text/icon"),
 "status.success.border": ("alpha.green-700-a25","alpha.green-400-a33","Success toast border"),
 "status.warning.bg":     ("amber.50","alpha.amber-400-a16","Warning chip/toast fill"),
 "status.warning.fg":     ("amber.700","amber.400","Warning text/icon"),
 "status.warning.border": ("alpha.amber-700-a25","alpha.amber-400-a33","Warning toast border"),
 "status.danger.bg":      ("red.50","alpha.red-400-a16","Danger chip/toast fill"),
 "status.danger.fg":      ("red.700","red.400","Danger text/icon"),
 "status.danger.border":  ("alpha.red-700-a25","alpha.red-400-a33","Danger toast border"),
 "status.danger.solid":   ("red.600","red.400","Error field border, notification badge"),
 "status.danger.on-solid":("neutral.0","neutral.950","Content on status.danger.solid (Owner 2026-09-26, tier 1b)"),
 "status.info.bg":        ("blue.50","alpha.blue-450-a16","Info chip/toast fill"),
 "status.info.fg":        ("blue.700","blue.450","Info text/icon; links on dark"),
 "status.info.border":    ("alpha.blue-700-a25","alpha.blue-450-a33","Info toast border"),
 "status.highlight.border":("alpha.lime-800-a25","alpha.lime-300-a33","Highlight toast border"),
 "elevation.1.color":     ("alpha.neutral-900-a08","alpha.black-a40","Menu/popover/toast shadow"),
 "elevation.2.color":     ("alpha.neutral-900-a14","alpha.black-a40","Dialog/sheet shadow"),
}

NUM = {  # number tokens: path -> (value, description)
 "space.0-5":(2,""),"space.1":(4,""),"space.1-5":(6,""),"space.2":(8,""),"space.2-5":(10,""),"space.3":(12,""),
 "space.4":(16,""),"space.5":(20,""),"space.6":(24,""),"space.7":(28,""),"space.8":(32,""),"space.9":(36,""),"space.10":(40,""),"space.12":(48,""),
 "size.content-max":(1096,"Page content max-width: 1440 shell − 252 sidebar − 12 gutter − 2×40 content padding (layout size, not spacing)"),
 "radius.2xs":(2,"Bars"),"radius.xs":(4,"Kbd, delta, checkbox"),"radius.sm":(8,"Nav item, input"),"radius.md":(12,"Tile, toast"),
 "radius.lg":(16,"App panel, day cell"),"radius.xl":(24,"Sheet"),"radius.full":(999,"Pill"),
 "opacity.disabled":(0.4,""),"opacity.hover-overlay":(0.06,""),"opacity.status-tint":(0.16,"Dark status backgrounds"),"opacity.scrim":(0.5,""),
 "elevation.1.offset-y":(4,""),"elevation.1.blur":(16,""),"elevation.2.offset-y":(16,""),"elevation.2.blur":(40,""),
 "font.size.display":(34,""),"font.size.metric":(26,""),"font.size.title":(18,""),"font.size.subtitle":(16,""),"font.size.body":(14,""),
 "font.size.body-sm":(13,""),"font.size.label":(12,""),"font.size.caption":(11,""),"font.size.overline":(10,""),
 "font.letter-spacing.display":(-1,""),"font.letter-spacing.metric":(-0.6,""),"font.letter-spacing.title":(-0.4,""),
 "font.letter-spacing.overline":(0.6,""),"font.line-height.tight":(1.1,"Observed on display"),"font.line-height.body":(1.5,"Observed on long copy"),
}
STR = {
 "font.family.base":("Plus Jakarta Sans","Only typeface (observed 100% of text)"),
 "font.weight.regular":("400",""),"font.weight.medium":("500",""),"font.weight.semibold":("600",""),"font.weight.bold":("700","800 folded into 700"),
}

# ---------- component tokens: path -> (type, light alias, dark alias or None) ----------
def c(t, light, dark=None): return (t, light, dark)
SC = lambda s: "{color.semantic." + s + "}"
SP = lambda s: "{" + s + "}"
COMP = {}
def add(path, *v): COMP[path] = c(*v)
add("button.primary.background","color",SC("action.primary"))
add("button.primary.background-hover","color",SC("action.primary-hover"))
add("button.primary.text","color",SC("action.on-primary"))
add("button.secondary.background","color",SC("surface.panel"))
add("button.secondary.background-hover","color",SC("surface.sunken"))  # Owner 2026-09-26: secondary hover
add("button.secondary.border","color",SC("border.default"))
add("button.secondary.text","color",SC("text.primary"))
add("button.radius","number",SP("radius.full"))
add("button.md.padding-x","number",SP("space.9")); add("button.md.padding-y","number",SP("space.3"))  # 12/36 = 3:1 squish (Owner 2026-09-26; was 10/16)
add("button.lg.padding-x","number",SP("space.12")); add("button.lg.padding-y","number",SP("space.4"))  # 16/48 = 3:1 (Owner 2026-09-26; was 12/24)
add("nav.item.background-active","color",SC("action.primary"))
add("nav.item.text-active","color",SC("action.on-primary"))
add("nav.item.text","color",SC("text.primary"))
add("nav.item.icon","color",SC("text.muted"))
add("nav.item.radius","number",SP("radius.sm"))
add("nav.count.background","color",SC("surface.muted"))
add("nav.count.text","color",SC("text.secondary"))
for stage, grp in [("shooting","accent.soft"),("scheduled","status.info"),("editing","status.warning"),("awaiting-deposit","status.danger"),("delivered","status.success")]:
    bg = grp if grp=="accent.soft" else grp+".bg"; fg = "accent.soft-fg" if grp=="accent.soft" else grp+".fg"
    add(f"chip.stage.{stage}.background","color",SC(bg)); add(f"chip.stage.{stage}.text","color",SC(fg))
add("metric.tile.background","color",SC("surface.panel"))
add("metric.tile.border","color",SC("border.default"))
add("metric.tile.radius","number",SP("radius.md"))
add("metric.tile.padding","number",SP("space.4"))
add("metric.tile.gap","number",SP("space.3"))
add("metric.delta.positive.background","color",SC("status.positive.bg"))
add("metric.delta.positive.text","color",SC("status.positive.fg"))
add("metric.delta.warning.background","color",SC("status.warning.bg"))
add("metric.delta.warning.text","color",SC("status.warning.fg"))
add("metric.spark.bar","color",SC("data.muted"))
add("metric.spark.current","color",SC("data.current"))
add("calendar.day.background","color",SC("surface.sunken"))
add("calendar.day.background-selected","color",SC("surface.inverse"))
add("calendar.day.label-selected","color",SC("accent.on-inverse"))
add("calendar.day.number-selected","color",SC("text.inverse"))
# ── tier 2 composites (Owner 2026-09-26) ──
add("calendar.day.label","color",SC("text.muted"))
add("calendar.day.number","color",SC("text.primary"))
add("calendar.day.dot","color",SC("action.primary"))
add("calendar.day.dot-selected","color",SC("accent.on-inverse"))   # visible on inverse cell in both modes
add("nav.item.background-hover","color",SC("surface.sunken"))
add("nav.group-label","color",SC("text.muted"))                     # legacy #A1A1AA darkened for AA
add("metric.tile.label","color",SC("text.secondary"))
add("metric.tile.value","color",SC("text.primary"))
add("metric.spark.gap","number",SP("space.1"))                      # 3 → 4
add("metric.spark.radius","number",SP("radius.2xs"))                # 2
for st in ["success","info","warning","danger","highlight"]:
    if st=="highlight": bg, fg, bd = "accent.soft","accent.soft-fg","status.highlight.border"
    else: bg, fg, bd = f"status.{st}.bg", f"status.{st}.fg", f"status.{st}.border"
    add(f"toast.{st}.background","color",SC(bg))
    add(f"toast.{st}.border","color",SC(bd))
    add(f"toast.{st}.icon","color",SC(fg))
    add(f"toast.{st}.title","color",SC(fg),SC("text.primary"))
    add(f"toast.{st}.action","color",SC(fg),SC("text.primary"))   # tier 2: action link = title colour
add("toast.surface","color",SC("surface.panel"))
add("toast.body","color",SC("text.secondary"))
add("toast.radius","number",SP("radius.md"))
add("input.background","color",SC("surface.panel"))
add("input.background-disabled","color",SC("surface.sunken"))
add("input.border","color",SC("border.input"))
add("input.border-hover","color",SC("border.input-hover"))
add("input.border-focus","color",SC("focus.ring"))
add("input.border-error","color",SC("status.danger.solid"))
add("input.border-disabled","color",SC("border.default"))
add("input.text","color",SC("text.primary"))
add("input.placeholder","color",SC("text.muted"))
add("input.text-disabled","color",SC("text.disabled"))  # tier 1b (G3)
add("input.label","color",SC("text.primary"))
add("input.helper","color",SC("text.muted"))
add("input.error-text","color",SC("status.danger.fg"))
add("input.radius","number",SP("radius.sm"))
add("input.height","number",SP("space.10"))
add("input.padding-x","number",SP("space.3"))
add("checkbox.background","color",SC("surface.panel"))  # unchecked box/radio fill (G3)
add("checkbox.border","color",SC("border.control"))
add("checkbox.label","color",SC("text.primary"))  # checkbox/radio label (G3)
add("checkbox.border-hover","color",SC("border.control-hover"))  # Owner 2026-09-26
add("checkbox.background-checked","color",SC("action.primary"))
add("checkbox.background-checked-hover","color",SC("action.primary-hover"))  # Owner 2026-09-26
add("checkbox.mark","color",SC("action.on-primary"))
add("checkbox.radius","number",SP("radius.xs"))
add("switch.track-on","color",SC("action.primary"))
add("switch.track-on-hover","color",SC("action.primary-hover"))  # Owner 2026-09-26
add("switch.track-off","color",SC("control.track-off"))
add("switch.track-off-hover","color",SC("control.track-off-hover"))  # Owner 2026-09-26
add("switch.knob","color",SC("control.knob"))
add("switch.label","color",SC("text.primary"))  # (G3)
add("switch.gap","number",SP("space.2"))          # track↔label 8 (Owner 2026-09-26)
add("switch.padding","number",SP("space.0-5"))    # knob inset 2 (SP6: inside small component)
add("switch.radius","number",SP("radius.full"))
# --- spacing (padding/gap) component tokens, added 2026-09-26 after verification GAP ---
# Observed legacy value in comment; snapped to the approved 4 px scale (CONFLICT-03 rule).
add("button.gap","number",SP("space.2"))                  # icon↔label 8
add("nav.item.padding-y","number",SP("space.2"))          # 9 → 8
add("nav.item.padding-x","number",SP("space.3"))          # 12
add("nav.item.gap","number",SP("space.2-5"))              # 10
add("nav.count.padding-y","number",SP("space.0-5"))       # 1 → 2
add("nav.count.padding-x","number",SP("space.2"))         # 7 → 8
add("nav.count.radius","number",SP("radius.full"))
add("chip.stage.padding-y","number",SP("space.0-5"))      # 3 → 2 (matches count/delta/now-label chips)
add("chip.stage.padding-x","number",SP("space.2"))        # 9 → 8
add("chip.stage.gap","number",SP("space.1-5"))            # dot↔label 6
add("chip.stage.radius","number",SP("radius.full"))
add("metric.delta.padding-y","number",SP("space.0-5"))    # 2
add("metric.delta.padding-x","number",SP("space.1-5"))    # 6
add("metric.delta.radius","number",SP("radius.xs"))       # 4
add("calendar.day.padding-y","number",SP("space.2-5"))    # 10
add("calendar.day.gap","number",SP("space.1"))            # 4
add("calendar.day.radius","number",SP("radius.lg"))       # 16
add("toast.padding-y","number",SP("space.3"))             # 12
add("toast.padding-x","number",SP("space.3"))             # 12 / 14 → 12
add("toast.gap","number",SP("space.3"))                   # icon↔text 12
add("toast.text-gap","number",SP("space.0-5"))            # title↔body 2
add("input.gap","number",SP("space.1-5"))                 # label↔field↔helper 6
add("input.content-gap","number",SP("space.2"))           # prefix/icon↔text 8
add("checkbox.gap","number",SP("space.2"))                # box↔label 10 → 8 (Owner 2026-09-26, whole steps)
add("segmented.track","color",SC("surface.sunken"))
add("segmented.item.background-active","color",SC("surface.panel"))
add("segmented.item.border-active","color",SC("border.default"))
add("segmented.item.text","color",SC("text.muted"))
add("segmented.item.text-active","color",SC("text.primary"))
add("segmented.padding","number",SP("space.1"))           # 3 → 2 → 4 (Owner 2026-09-26, whole steps)
add("segmented.gap","number",SP("space.1"))               # 2 → 4 (Owner 2026-09-26)
add("segmented.item.padding-y","number",SP("space.2"))    # 6 → 8 (Owner 2026-09-26)
add("segmented.item.padding-x","number",SP("space.4"))    # 14 → 12 → 16 (Owner 2026-09-26)
add("segmented.radius","number",SP("radius.full"))
# ── tier 1b (Owner 2026-09-26) ──
add("segmented.item.text-hover","color",SC("text.secondary"))
add("input.search.background","color",SC("surface.subtle"))   # search field fill (legacy)
add("input.padding-y","number",SP("space.3"))                  # textarea only (single-line input is 40 px, centred)
add("stepper.background","color",SC("surface.panel"))
add("stepper.border","color",SC("border.input"))
add("stepper.value","color",SC("text.primary"))
add("stepper.button.background","color",SC("surface.sunken"))
add("stepper.button.background-hover","color",SC("surface.muted"))
add("stepper.button.icon","color",SC("text.primary"))
add("stepper.button-primary.background","color",SC("action.primary"))        # "+" = primary (Owner)
add("stepper.button-primary.background-hover","color",SC("action.primary-hover"))
add("stepper.button-primary.icon","color",SC("action.on-primary"))
add("stepper.padding","number",SP("space.1"))                  # 3 → 4
add("stepper.gap","number",SP("space.1"))
add("stepper.radius","number",SP("radius.full"))
add("avatar.background","color",SC("surface.muted"))
add("avatar.text","color",SC("text.secondary"))
add("avatar.radius","number",SP("radius.full"))
add("icon-button.background","color",SC("surface.panel"))
add("icon-button.background-hover","color",SC("surface.sunken"))
add("icon-button.border","color",SC("border.default"))
add("icon-button.icon","color",SC("text.primary"))
add("icon-button.padding","number",SP("space.3"))              # 16 icon + 2×12 = 40 (matches input height)
add("icon-button.sm.padding","number",SP("space.2"))           # tier 2: 16 icon + 2×8 = 32 (toast close, row actions)
add("icon-button.radius","number",SP("radius.sm"))
add("badge.danger.background","color",SC("status.danger.solid"))
add("badge.danger.text","color",SC("status.danger.on-solid"))
add("badge.danger.padding-y","number",SP("space.0-5"))         # 1 → 2 (SP6 badge)
add("badge.danger.padding-x","number",SP("space.1-5"))         # 5 → 6 (SP6 badge)
add("badge.danger.radius","number",SP("radius.full"))
add("kbd.background","color",SC("surface.panel"))
add("kbd.border","color",SC("border.default"))
add("kbd.text","color",SC("text.secondary"))
add("kbd.padding-y","number",SP("space.0-5"))                  # 1 → 2 (SP6 small component)
add("kbd.padding-x","number",SP("space.1-5"))                  # 5 → 6
add("kbd.radius","number",SP("radius.xs"))
# ── tier 1c: menu (Owner 2026-09-26; no legacy evidence — PROPOSED) ──
add("menu.background","color",SC("surface.panel"))
add("menu.border","color",SC("border.default"))
add("menu.divider","color",SC("border.subtle"))
add("menu.group-label","color",SC("text.muted"))
add("menu.padding","number",SP("space.1"))                     # 4 around items
add("menu.radius","number",SP("radius.md"))                    # 12 outer ≥ item 8 (SP9)
add("menu.item.text","color",SC("text.primary"))
add("menu.item.description","color",SC("text.muted"))
add("menu.item.icon","color",SC("text.muted"))
add("menu.item.check","color",SC("action.primary"))            # selected indicator (like checked checkbox)
add("menu.item.background-hover","color",SC("surface.sunken"))  # hover = keyboard highlight
add("menu.item.text-disabled","color",SC("text.disabled"))
add("menu.item.text-destructive","color",SC("status.danger.fg"))
add("menu.item.background-destructive-hover","color",SC("status.danger.bg"))
add("menu.item.padding-y","number",SP("space.2"))              # 8
add("menu.item.padding-x","number",SP("space.3"))              # 12
add("menu.item.gap","number",SP("space.2"))                    # icon/check ↔ text 8
add("menu.item.radius","number",SP("radius.sm"))               # 8
add("table.header.background","color",SC("surface.subtle"))
add("table.header.text","color",SC("text.muted"))
add("table.row.border","color",SC("border.subtle"))
add("table.row.padding-y","number",SP("space.3"))         # 12
add("table.row.padding-x","number",SP("space.5"))         # 20
add("table.cell.gap","number",SP("space.2-5"))            # avatar↔name 10
# ── tier 3 (Owner 2026-09-26) ──
add("table.background","color",SC("surface.panel"))
add("table.border","color",SC("border.default"))
add("table.radius","number",SP("radius.lg"))                  # 16 (legacy card)
add("table.toolbar.padding-y","number",SP("space.4"))         # 16
add("table.toolbar.padding-x","number",SP("space.5"))         # 20 (= row padding-x)
add("table.header.padding-y","number",SP("space.2"))          # 8
add("table.header.border","color",SC("border.default"))
add("table.row.background-hover","color",SC("surface.subtle"))  # clickable rows (no legacy)
add("table.cell.text","color",SC("text.secondary"))
add("table.cell.text-strong","color",SC("text.primary"))
add("table.footer.link","color",SC("action.primary"),SC("status.info.fg"))  # §2: small blue text fails on dark
add("panel.app.header.padding-x","number",SP("space.7"))  # 28
add("panel.app.content.padding-y","number",SP("space.7")) # 28
add("panel.app.content.padding-x","number",SP("space.10"))# 40
add("panel.app.content.gap","number",SP("space.7"))       # 28
add("panel.app.background","color",SC("surface.panel"))
add("panel.app.border","color",SC("border.default"))
add("panel.app.radius","number",SP("radius.lg"))
add("panel.app.title","color",SC("text.primary"))
add("panel.app.header.gap","number",SP("space.3"))        # title/actions 12
add("panel.app.content.max-width","number",SP("size.content-max"))  # Owner 2026-09-26: Page Content container; Pencil can't bind width → documented

# ---------- build DTCG ----------
def setp(d, path, val):
    parts = path.split(".")
    for p in parts[:-1]: d = d.setdefault(p, {})
    d[parts[-1]] = val

STATUS = {f"{g}.{k}": s for g, steps in P.items() for k, _, s in steps}
doc = {"$description": f"Shutrly design tokens — S / Studio Lime. APPROVED by user {TODAY}; PERSISTED {TODAY}. Light = $value, dark = $extensions['dev.pen.modes'].dark. Source: docs/design-system/exploration.pen boards 01-03.",
       "$extensions": {"dev.pen.themes": {"mode": ["light","dark"]}}}
color = {"$type": "color", "primitive": {}, "semantic": {}}
for g, steps in P.items():
    for k, v, s in steps:
        color["primitive"].setdefault(g, {})[k] = {"$value": v, "$description": "OBSERVED" if s=="O" else "PROPOSED→APPROVED"}
for n,(base,a,pct) in A.items():
    color["primitive"].setdefault("alpha", {})[n] = {"$value": HEX["alpha."+n], "$description": f"{base or 'black'} @ {pct}%"}
for name,(l,d,desc) in S.items():
    tok = {"$value": prim(l), "$description": desc}
    if d != l: tok["$extensions"] = {"dev.pen.modes": {"dark": prim(d)}}
    setp(color["semantic"], name, tok)
doc["color"] = color
for path,(v,desc) in NUM.items():
    tok = {"$type":"number","$value": v}
    if desc: tok["$description"] = desc
    setp(doc, path, tok)
for path,(v,desc) in STR.items():
    tok = {"$type":"string","$value": v}
    if desc: tok["$description"] = desc
    setp(doc, path, tok)
comp = {}
for path,(t,l,d) in COMP.items():
    tok = {"$type": t, "$value": l}
    if d: tok["$extensions"] = {"dev.pen.modes": {"dark": d}}
    setp(comp, path, tok)
doc["component"] = comp

# ---------- flatten + checks (modes) ----------
flat = {}
def walk(n, p, t):
    t = n.get("$type", t)
    if "$value" in n: flat[".".join(p)] = (n, t); return
    for k, v in n.items():
        if not k.startswith("$"): walk(v, p+[k], t)
walk(doc, [], None)
errs = []
for name,(n,t) in flat.items():
    dark = n.get("$extensions",{}).get("dev.pen.modes",{}).get("dark")
    for mode,val in [("light",n["$value"]),("dark",dark)]:
        if isinstance(val,str) and val.startswith("{"):
            tgt = val[1:-1]
            if tgt not in flat: errs.append(f"{name} [{mode}] -> missing {tgt}")
            elif flat[tgt][1] != t: errs.append(f"{name} [{mode}] type mismatch {tgt}")
pencil_names = {}
for name in flat:
    pn = name.replace(".","/")
    if pn in pencil_names: errs.append("dup normalized "+pn)
    pencil_names[pn] = name
if errs:
    print("\n".join(errs)); sys.exit(1)

# ---------- Pencil variables payload ----------
def pv(val):
    return "$"+val[1:-1].replace(".","/") if isinstance(val,str) and val.startswith("{") else val
ptype = {"color":"color","number":"number","string":"string"}
vars_ = {}
for name,(n,t) in flat.items():
    dark = n.get("$extensions",{}).get("dev.pen.modes",{}).get("dark")
    v = pv(n["$value"])
    if dark is not None:
        v = [{"value": v, "theme": {"mode":"light"}}, {"value": pv(dark), "theme": {"mode":"dark"}}]
    if name.startswith("opacity.") and isinstance(v, (int, float)):
        v = round(v * 100, 4)  # Pencil stores opacity variables as percent
    vars_[name.replace(".","/")] = {"type": ptype[t], "value": v}

(ROOT/"tokens.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False)+"\n")
(SCRATCH/"pencil-vars.json").write_text(json.dumps(vars_, separators=(",",":"), ensure_ascii=False))
mapping = {
 "$description": "Canonical token path <-> Pencil variable. Generated; do not hand-edit.",
 "source": {"exploration": "docs/design-system/exploration.pen", "tokens": "docs/design-system/tokens.json",
            "status": f"APPROVED {TODAY} (board 03 decision record) · PERSISTED {TODAY}"},
 "library": {"file": "docs/design-system/design-system.lib.pen", "role": "approved reusable source", "importedBy": []},
 "themes": {"mode": ["light","dark"], "default": "light", "darkValueLocation": "$extensions['dev.pen.modes'].dark"},
 "variables": {k: v for k, v in sorted(pencil_names.items())},
 "counts": {"total": len(flat), "primitive": sum(1 for k in flat if k.startswith("color.primitive")),
            "semantic": sum(1 for k in flat if k.startswith("color.semantic")), "component": sum(1 for k in flat if k.startswith("component.")),
            "themed": sum(1 for k,(n,_) in flat.items() if "$extensions" in n)},
 "transforms": {"opacity/*": "Pencil value = token $value × 100 (Pencil opacity variables are percent; e.g. opacity.disabled 0.4 → 40)"},
 "library_canvas": {"boards": ["00 — Cover", "01 — Color · primitives", "02 — Color · semantic", "03 — Typography",
                               "04 — Spacing · radius · opacity", "05 — Elevation", "06 — Component tokens", "07 — Usage rules", "08 — Spacing rules"],
                    "usage_rules": "docs/design-system/token-usage.md (APPROVED 2026-09-26)",
                    "rules_status": "APPROVED 2026-09-26",
                    "note": "Documentation boards bind every swatch/scale to live variables; dark previews use theme mode=dark."},
 "components": {k: v for k, v in json.loads((ROOT/"components"/"registry.json").read_text()).items() if not k.startswith("$")} if (ROOT/"components"/"registry.json").exists() else {},
 "components_status": "IN PROGRESS — C01–C30 APPROVED 2026-09-26 (tiers pilot, 1, 1b, 1c, 2, 3).",
 "unsupported": {
   "size-binding": "Pencil width/height cannot bind to number variables; spacing is applied via padding/gap bindings.","typography": "Composite text styles are not Pencil variables; components bind family/size/weight/letter-spacing separately.",
                 "shadow": "Composite shadow split into elevation.N.offset-y / blur (number) + color.semantic.elevation.N.color (color)."},
}
(ROOT/"pencil-mapping.json").write_text(json.dumps(mapping, indent=2, ensure_ascii=False)+"\n")
print("OK", mapping["counts"])
