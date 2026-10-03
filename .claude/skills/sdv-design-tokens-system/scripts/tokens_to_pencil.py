#!/usr/bin/env python3
"""Derive the Pencil representation of an approved DTCG token file.

tokens.json is canonical. This script never edits it; it emits:

  <payload>   Pencil ``SetVariables`` payload: ``{name: {type, value}}`` where name is the
              token path with "/" and aliases become ``$a/b/c`` references. Tokens with
              values in other modes become ``[{value, theme: {<axis>: <mode>}}, ...]``.
  <mapping>   pencil-mapping.json: variables, counts, themes, transforms, unsupported,
              library_canvas and components_status. Keys the generator does not own
              (library.importedBy, components, components_status, verification, ...) are
              preserved from an existing mapping file.
  stdout      FNV-1a checksums per group (color/<layer>, component/<name>, or the first
              segment of a scale: space, radius, font, ...) and in total. The same
              checksum computed in Pencil (see references/pen-dev-mapping.md) proves the
              live variables equal the payload.

Mode representation (read from tokens.json):
  - root ``$extensions["dev.pen.themes"] = {"mode": ["light", "dark"]}``: the theme axis;
    the first value is the default and lives in ``$value``.
  - per token ``$extensions["dev.pen.modes"] = {"dark": "{color.primitive.x}"}``.

Pencil representation rules applied here:
  - number tokens under ``--percent-prefix`` (default ``opacity.``) are multiplied by 100:
    Pencil opacity variables are percent, literal node ``opacity`` stays 0-1.
  - composite types (typography, shadow, border, gradient, ...) are not emitted; they are
    listed under ``unsupported`` and must be split into scalar tokens in tokens.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from typing import Any

SCALAR = {"color": "color", "number": "number", "string": "string", "boolean": "boolean"}
DEFAULT_BOARDS = [
    "00 — Cover", "01 — Color · primitives", "02 — Color · semantic", "03 — Typography",
    "04 — Spacing · radius · opacity", "05 — Elevation", "06 — Component tokens",
    "07 — Usage rules", "08 — Spacing rules",
]
GENERATED_KEYS = {"$description", "source", "themes", "variables", "counts", "transforms", "unsupported", "removed"}


def flatten(doc: dict[str, Any]) -> dict[str, tuple[dict[str, Any], str | None]]:
    flat: dict[str, tuple[dict[str, Any], str | None]] = {}

    def walk(node: Any, path: list[str], inherited: str | None) -> None:
        if not isinstance(node, dict):
            return
        t = node.get("$type", inherited)
        if "$value" in node:
            flat[".".join(path)] = (node, t)
            return
        for key, child in node.items():
            if not key.startswith("$"):
                walk(child, path + [key], t)

    walk(doc, [], None)
    return flat


def is_alias(value: Any) -> bool:
    return isinstance(value, str) and value.startswith("{") and value.endswith("}")


def to_pencil(value: Any) -> Any:
    return "$" + value[1:-1].replace(".", "/") if is_alias(value) else value


def canon(value: Any) -> str:
    """Canonical string used for checksums; mirrored by the JS snippet in pen-dev-mapping.md."""
    if isinstance(value, list):
        return ",".join(sorted(":".join(e["theme"][k] for k in sorted(e["theme"])) + ":" + canon(e["value"]) for e in value))
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        f = float(value)
        return str(int(f)) if f == int(f) else repr(f)
    return str(value)


def fnv1a(text: str) -> str:
    h = 0x811C9DC5
    for ch in text:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def group_of(name: str) -> str:
    """color/<layer> and component/<name> are groups; scales group by their first segment."""
    parts = name.split("/")
    return "/".join(parts[:2]) if parts[0] in ("color", "component") else parts[0]


def checksums(payload: dict[str, dict[str, Any]]) -> dict[str, Any]:
    lines = {k: f"{k}|{payload[k]['type']}|{canon(payload[k]['value'])}" for k in sorted(payload)}
    groups: dict[str, list[str]] = {}
    for k, line in lines.items():
        groups.setdefault(group_of(k), []).append(line)
    return {
        "count": len(lines),
        "total": fnv1a("\n".join(lines.values())),
        "groups": {g: {"count": len(v), "fnv1a": fnv1a("\n".join(v))} for g, v in sorted(groups.items())},
    }


def build(doc: dict[str, Any], percent_prefixes: list[str]) -> tuple[dict, dict, list[str]]:
    errors: list[str] = []
    themes = doc.get("$extensions", {}).get("dev.pen.themes", {"mode": ["light"]})
    if len(themes) != 1:
        errors.append(f"$extensions.dev.pen.themes: exactly one theme axis is supported, found {list(themes)}")
    axis, modes = next(iter(themes.items()))
    default_mode, other_modes = modes[0], modes[1:]
    flat = flatten(doc)
    payload: dict[str, dict[str, Any]] = {}
    unsupported: dict[str, str] = {}
    transformed: list[str] = []
    for name, (node, t) in flat.items():
        if t not in SCALAR:
            unsupported[name] = f"$type {t!r} has no Pencil variable type; split into scalar tokens"
            continue
        mode_values = node.get("$extensions", {}).get("dev.pen.modes", {})
        for m in mode_values:
            if m not in other_modes:
                errors.append(f"{name}: mode {m!r} is not declared on axis {axis!r} {modes}")
        percent = t == "number" and any(name.startswith(p) for p in percent_prefixes)

        def conv(v: Any) -> Any:
            v = to_pencil(v)
            if percent and isinstance(v, (int, float)) and not isinstance(v, bool):
                v = round(v * 100, 4)
            return v

        value: Any = conv(node["$value"])
        if mode_values:
            value = [{"value": value, "theme": {axis: default_mode}}] + [
                {"value": conv(mode_values.get(m, node["$value"])), "theme": {axis: m}} for m in other_modes
            ]
        if percent:
            transformed.append(name)
        payload[name.replace(".", "/")] = {"type": SCALAR[t], "value": value}
    normalized: dict[str, str] = {}
    for name in flat:
        pn = name.replace(".", "/")
        if pn in normalized:
            errors.append(f"{name}: duplicate normalized Pencil name {pn!r}")
        normalized[pn] = name
    info = {"axis": axis, "modes": modes, "flat": flat, "unsupported": unsupported, "transformed": transformed}
    return payload, info, errors


def build_mapping(payload: dict, info: dict, previous: dict[str, Any], tokens_path: str, library_file: str,
                  today: str, percent_prefixes: list[str]) -> dict[str, Any]:
    flat = info["flat"]
    names = {k.replace(".", "/"): k for k in flat if k not in info["unsupported"]}
    prev_vars = previous.get("variables", {})
    mapping: dict[str, Any] = {
        "$description": "Canonical token path <-> Pencil variable. Generated by tokens_to_pencil.py from tokens.json; do not hand-edit generated keys.",
        "source": {
            "tokens": tokens_path,
            "exploration": previous.get("source", {}).get("exploration", "docs/design-system/exploration.pen"),
            "status": previous.get("source", {}).get("status", "APPROVED <date> · PERSISTED <date>"),
            "generated": today,
        },
        "library": previous.get("library", {"file": library_file, "role": "approved reusable source", "importedBy": []}),
        "themes": {info["axis"]: info["modes"], "default": info["modes"][0],
                   "otherModeValueLocation": "$extensions['dev.pen.modes'].<mode>"},
        "variables": dict(sorted(names.items())),
        "counts": {
            "total": len(names),
            "primitive": sum(1 for k in names.values() if k.startswith("color.primitive.")),
            "semantic": sum(1 for k in names.values() if k.startswith("color.semantic.")),
            "component": sum(1 for k in names.values() if k.startswith("component.")),
            "scale": sum(1 for k in names.values() if not k.startswith(("color.", "component."))),
            "themed": sum(1 for v in payload.values() if isinstance(v["value"], list)),
        },
        "transforms": {f"{p.replace('.', '/')}*": "Pencil value = token $value × 100 (Pencil opacity variables are percent; literal node opacity is 0–1)"
                       for p in percent_prefixes if any(t.startswith(p) for t in info["transformed"])},
        "unsupported": {
            "size-binding": "Pencil width/height cannot bind to number variables (they resolve to 0); spacing tokens are applied via padding/gap only.",
            "typography": "Composite text styles are not Pencil variables; tokens are split into font.size / weight / letter-spacing / line-height and bound separately.",
            "shadow": "Composite shadows are split into elevation.N.offset-y / blur (number) + color.semantic.elevation.N.color (themed colour).",
            **{name: reason for name, reason in info["unsupported"].items()},
        },
        "library_canvas": previous.get("library_canvas", {
            "boards": DEFAULT_BOARDS,
            "usage_rules": "docs/design-system/token-usage.md (PROPOSED)",
            "note": "Documentation boards bind every swatch/scale to live variables; dark previews use theme mode=dark.",
        }),
        "components_status": previous.get("components_status", "NOT YET BUILT — component tokens persisted; reusable Pencil components pending."),
    }
    removed = sorted(set(prev_vars) - set(names))
    if removed:
        mapping["removed"] = {"since_previous_mapping": removed,
                              "note": "SetVariables merges: removed tokens stay in Pencil until SetVariables(payload, true) replaces the full set."}
    for key, value in previous.items():
        if key not in mapping and key not in GENERATED_KEYS:
            mapping[key] = value
    return mapping


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("tokens", type=Path, help="canonical DTCG tokens.json")
    parser.add_argument("--payload", type=Path, help="write the Pencil SetVariables payload here (default: <tokens dir>/pencil-variables.json)")
    parser.add_argument("--mapping", type=Path, help="write pencil-mapping.json here (default: <tokens dir>/pencil-mapping.json)")
    parser.add_argument("--library-file", default="docs/design-system/design-system.lib.pen")
    parser.add_argument("--percent-prefix", action="append", help="number token prefixes stored as percent in Pencil (default: opacity.)")
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--dry-run", action="store_true", help="print checksums and findings without writing files")
    args = parser.parse_args()
    percent = args.percent_prefix or ["opacity."]
    try:
        doc = json.loads(args.tokens.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: cannot read {args.tokens}: {exc}", file=sys.stderr)
        return 2
    payload, info, errors = build(doc, percent)
    for name, (node, _t) in info["flat"].items():
        for mode, v in [("default", node["$value"]), *node.get("$extensions", {}).get("dev.pen.modes", {}).items()]:
            if is_alias(v) and v[1:-1] not in info["flat"]:
                errors.append(f"{name} [{mode}]: alias target {v[1:-1]!r} does not exist")
    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1
    payload_path = args.payload or args.tokens.parent / "pencil-variables.json"
    mapping_path = args.mapping or args.tokens.parent / "pencil-mapping.json"
    previous: dict[str, Any] = {}
    if mapping_path.exists():
        try:
            previous = json.loads(mapping_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            print(f"WARN: existing {mapping_path} is not valid JSON; regenerating without preserved keys", file=sys.stderr)
    mapping = build_mapping(payload, info, previous, str(args.tokens), args.library_file, args.date, percent)
    sums = checksums(payload)
    mapping["checksum"] = {"algorithm": "fnv1a-32 over sorted 'name|type|canonical-value' lines", "total": sums["total"], "count": sums["count"]}
    if not args.dry_run:
        payload_path.write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
        mapping_path.write_text(json.dumps(mapping, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"wrote {payload_path} and {mapping_path}")
    print(f"variables {sums['count']}  total {sums['total']}  counts {json.dumps(mapping['counts'])}")
    for group, g in sums["groups"].items():
        print(f"  {group:<28} {g['count']:>4}  {g['fnv1a']}")
    if info["unsupported"]:
        print(f"unsupported (not emitted): {', '.join(sorted(info['unsupported']))}")
    if "removed" in mapping:
        print(f"REMOVED since previous mapping ({len(mapping['removed']['since_previous_mapping'])}): use SetVariables(payload, true)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
