#!/usr/bin/env python3
"""Validate the supported DTCG subset used by sdv-design-tokens-system.

Checks:
  - structure: tokens vs groups, supported $type, duplicate normalized Pencil names
  - values: colours are #RGB, #RRGGBB or #RRGGBBAA; numbers/strings/booleans typed
  - aliases: {path} targets exist, match type, and do not form cycles
  - modes: root $extensions["dev.pen.themes"] declares the axis; every
    $extensions["dev.pen.modes"].<mode> is declared, typed, and resolves
  - layers (auto when color.semantic / component roots exist):
      color.semantic.* aliases color.primitive.* only (every mode)
      component.* aliases semantic or scale tokens only; never a primitive,
      another component token, or a raw value
  - optional: --mapping pencil-mapping.json variables equal the token set;
              --payload pencil-variables.json equals the payload derived from tokens.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

ALIAS = re.compile(r"^\{([^{}]+)\}$")
HEX = re.compile(r"^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$")
SUPPORTED = {"color", "number", "string", "boolean"}


def load(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read JSON from {path}: {exc}") from exc


def join_path(parts: list[str]) -> str:
    return ".".join(parts) or "$"


def is_token(value: Any) -> bool:
    return isinstance(value, dict) and "$value" in value


def flatten(document: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], list[str]]:
    tokens: dict[str, dict[str, Any]] = {}
    errors: list[str] = []

    def walk(node: Any, path: list[str], inherited_type: str | None) -> None:
        if not isinstance(node, dict):
            errors.append(f"{join_path(path)}: expected an object")
            return
        local_type = node.get("$type", inherited_type)
        if local_type is not None and not isinstance(local_type, str):
            errors.append(f"{join_path(path)}: $type must be a string")
        if is_token(node):
            name = join_path(path)
            if name in tokens:
                errors.append(f"{name}: duplicate token")
            modes = node.get("$extensions", {}).get("dev.pen.modes", {})
            tokens[name] = {"value": node["$value"], "type": local_type, "path": name, "modes": modes}
            if any(not key.startswith("$") for key in node):
                errors.append(f"{name}: a token cannot also contain child groups")
            return
        for key, child in node.items():
            if key.startswith("$"):
                continue
            walk(child, path + [key], local_type)

    walk(document, [], None)
    return tokens, errors


def check_value(name: str, token_type: str | None, value: Any, tokens: dict[str, dict[str, Any]], label: str) -> list[str]:
    where = f"{name}{label}"
    match = ALIAS.match(value) if isinstance(value, str) else None
    if match:
        target = match.group(1)
        if target not in tokens:
            return [f"{where}: alias target {target!r} does not exist"]
        if tokens[target]["type"] != token_type:
            return [f"{where}: alias type {token_type!r} does not match {target} ({tokens[target]['type']!r})"]
        return []
    if token_type == "color" and not (isinstance(value, str) and HEX.match(value)):
        return [f"{where}: color must be #RGB, #RRGGBB, #RRGGBBAA or a single-token alias, got {value!r}"]
    if token_type == "number" and (isinstance(value, bool) or not isinstance(value, (int, float))):
        return [f"{where}: number must be numeric or a single-token alias"]
    if token_type == "string" and not isinstance(value, str):
        return [f"{where}: string must be a string or a single-token alias"]
    if token_type == "boolean" and not isinstance(value, bool):
        return [f"{where}: boolean must be true/false or a single-token alias"]
    return []


def alias_target(value: Any) -> str | None:
    match = ALIAS.match(value) if isinstance(value, str) else None
    return match.group(1) if match else None


def check_cycles(tokens: dict[str, dict[str, Any]]) -> list[str]:
    errors = []
    for name, token in tokens.items():
        for label, value in [("", token["value"]), *[(f" [{m}]", v) for m, v in token["modes"].items()]]:
            seen = [name]
            target = alias_target(value)
            while target and target in tokens:
                if target in seen:
                    errors.append(f"{name}{label}: alias cycle {' -> '.join(seen + [target])}")
                    break
                seen.append(target)
                target = alias_target(tokens[target]["value"])
    return errors


def check_layers(tokens: dict[str, dict[str, Any]]) -> list[str]:
    errors = []
    for name, token in tokens.items():
        values = [("", token["value"]), *[(f" [{m}]", v) for m, v in token["modes"].items()]]
        for label, value in values:
            target = alias_target(value)
            if name.startswith("color.semantic."):
                if not (target and target.startswith("color.primitive.")):
                    errors.append(f"{name}{label}: semantic colour must alias a color.primitive.* token")
            elif name.startswith("component."):
                if target is None:
                    errors.append(f"{name}{label}: component token holds a raw value; alias a semantic or scale token")
                elif target.startswith("color.primitive."):
                    errors.append(f"{name}{label}: component token aliases a primitive ({target}); use a semantic token")
                elif target.startswith("component."):
                    errors.append(f"{name}{label}: component token aliases another component token ({target})")
                elif target.startswith("color.") and not target.startswith("color.semantic."):
                    errors.append(f"{name}{label}: component colour must alias color.semantic.*")
    return errors


def validate(path: Path, layers: str = "auto", mapping: Path | None = None, payload: Path | None = None) -> tuple[list[str], list[str]]:
    document = load(path)
    if not isinstance(document, dict):
        return ["$: root must be an object"], []
    tokens, errors = flatten(document)
    warnings: list[str] = []

    themes = document.get("$extensions", {}).get("dev.pen.themes")
    declared: list[str] = []
    if themes is not None:
        if not isinstance(themes, dict) or not themes or not all(isinstance(v, list) and v for v in themes.values()):
            errors.append("$extensions.dev.pen.themes: expected {axis: [default, other, ...]}")
        else:
            if len(themes) > 1:
                errors.append(f"$extensions.dev.pen.themes: exactly one axis is supported, found {list(themes)}")
            declared = next(iter(themes.values()))[1:]

    for name, token in tokens.items():
        token_type = token["type"]
        if token_type not in SUPPORTED:
            errors.append(f"{name}: unsupported or missing $type {token_type!r} (split composites into scalar tokens)")
            continue
        errors += check_value(name, token_type, token["value"], tokens, "")
        if not isinstance(token["modes"], dict):
            errors.append(f"{name}: $extensions.dev.pen.modes must be an object")
            continue
        for mode, value in token["modes"].items():
            if themes is None:
                errors.append(f"{name} [{mode}]: mode values exist but root $extensions.dev.pen.themes is missing")
            elif mode not in declared:
                errors.append(f"{name} [{mode}]: mode is not a non-default value of the declared axis {declared}")
            errors += check_value(name, token_type, value, tokens, f" [{mode}]")
            if value == token["value"]:
                warnings.append(f"{name} [{mode}]: mode value equals $value; drop the redundant mode entry")

    errors += check_cycles(tokens)

    run_layers = layers == "on" or (layers == "auto" and any(n.startswith(("color.semantic.", "component.")) for n in tokens))
    if run_layers:
        errors += check_layers(tokens)

    normalized: dict[str, str] = {}
    for name in tokens:
        pencil_name = name.replace(".", "/")
        if pencil_name in normalized:
            errors.append(f"{name}: duplicate normalized Pencil name {pencil_name!r}")
        normalized[pencil_name] = name

    if mapping is not None:
        m = load(mapping)
        variables = m.get("variables", {})
        for pn, name in normalized.items():
            if variables.get(pn) != name:
                errors.append(f"mapping: {pn} missing or not mapped to {name}")
        for pn in set(variables) - set(normalized):
            errors.append(f"mapping: extra variable {pn} (not in tokens)")
        counts = m.get("counts", {})
        if counts.get("total") not in (None, len(normalized)):
            errors.append(f"mapping: counts.total {counts.get('total')} != {len(normalized)}")

    if payload is not None:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from tokens_to_pencil import build, canon  # noqa: E402

        expected, _info, build_errors = build(document, ["opacity."])
        errors += [f"payload derivation: {e}" for e in build_errors]
        actual = load(payload)
        for pn, var in expected.items():
            if pn not in actual:
                errors.append(f"payload: missing {pn}")
            elif actual[pn].get("type") != var["type"] or canon(actual[pn].get("value")) != canon(var["value"]):
                errors.append(f"payload: {pn} is {actual[pn]!r}, expected {var!r}")
        for pn in set(actual) - set(expected):
            errors.append(f"payload: extra {pn} (not in tokens)")
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("tokens", type=Path, help="DTCG-compatible JSON token file")
    parser.add_argument("--layers", choices=["auto", "on", "off"], default="auto", help="enforce primitive → semantic → component layer rules")
    parser.add_argument("--mapping", type=Path, help="compare against pencil-mapping.json")
    parser.add_argument("--payload", type=Path, help="compare against a Pencil SetVariables payload (pencil-variables.json)")
    args = parser.parse_args()
    try:
        errors, warnings = validate(args.tokens, args.layers, args.mapping, args.payload)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    for warning in warnings:
        print(f"WARN: {warning}", file=sys.stderr)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"OK: {args.tokens}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
