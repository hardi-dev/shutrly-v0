# Token Architecture

This guidance follows the Figma model of variables, aliases, collections, modes, styles, component properties, and published libraries, while using DTCG-compatible JSON for repository interchange. See [Figma variables and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes), [Figma styles vs. variables](https://help.figma.com/hc/en-us/articles/15871097384471-The-difference-between-variables-and-styles), [Figma component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties), and the [DTCG specification](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/).

## Recommended layers

Use a stable three-layer model:

```text
color.primitive.forest.600
  -> color.semantic.action.primary
    -> component.button.primary.background
```

Primitives describe the available values. Semantic tokens describe intent. Component tokens describe a component contract. `validate_tokens.py` enforces the layers:

- `color.semantic.*` aliases `color.primitive.*` only, in every mode.
- `component.*` aliases semantic colours or scale tokens (`space.*`, `radius.*`, `font.*`, …) only. It never aliases a primitive, another component token, or a raw value.
- Scale tokens (`space`, `radius`, `opacity`, `elevation`, `font`) hold raw numbers and strings and are mode-invariant unless the approved system says otherwise.
- Component tokens cover colour, padding/gap and radius for each component.

## DTCG-compatible shape

Use objects with `$value` for tokens and objects without `$value` for groups. `$type` may be declared on a token or inherited from a parent group. `$description` documents purpose. Aliases use `{path.to.token}`.

```json
{
  "color": {
    "$type": "color",
    "primitive": {
      "blue-600": { "$value": "#2563EB", "$description": "Brand blue" }
    },
    "semantic": {
      "action-primary": { "$value": "{color.primitive.blue-600}" }
    }
  }
}
```

The validator accepts scalar values that pen.dev can represent: `color` (`#RGB`, `#RRGGBB` or `#RRGGBBAA`), `number`, `string` and `boolean`. Composite DTCG values such as typography or shadow objects must be split into scalar tokens (size, weight, letter-spacing and line-height; offset-y, blur and a themed colour) and recorded under `pencil-mapping.json › unsupported`. Never flatten them silently.

## Naming

- Use lowercase dot-separated paths in source JSON.
- Use purpose and role for semantic names (`color.text.primary`, `space.control.gap`).
- Keep component names scoped (`button.primary.background`).
- Let adapters normalize names for Pencil or CSS; preserve the canonical source names in mappings.
- Avoid names that encode a temporary screen, implementation detail, or theme when a mode can express it.

## Modes and themes

Keep one file and one token identity. The default mode lives in `$value`; other modes live in the token's `$extensions["dev.pen.modes"]`; the root declares the theme axis:

```json
{
  "$extensions": { "dev.pen.themes": { "mode": ["light", "dark"] } },
  "color": { "$type": "color", "semantic": {
    "surface": { "panel": {
      "$value": "{color.primitive.stone.0}",
      "$extensions": { "dev.pen.modes": { "dark": "{color.primitive.stone.900}" } }
    } }
  } }
}
```

- The first value on the axis is the default, stored in `$value`.
- A mode value must be declared on the axis, have the token's type, and resolve.
- A token without a mode entry is mode-invariant by design, not missing.
- Dark tints are alpha primitives (`#RRGGBBAA`), not opacity.

`scripts/tokens_to_pencil.py` turns each moded token into a themed Pencil variable. See [pen-dev-mapping.md](pen-dev-mapping.md).

## Governance

When changing a token:

1. Identify affected semantic/component aliases.
2. Check contrast and interaction states where the token is used.
3. Record breaking renames or removals with a replacement and migration note.
4. Edit `tokens.json` only, then run `validate_tokens.py` and `tokens_to_pencil.py`. Sync Pencil (removed tokens need a full replace plus rebinding) and CSS outputs.
5. Refresh the token canvas's static labels, then review the representative component and screen previews.
6. Update `token-usage.md` when a role's meaning changes. A rules change returns them to `PROPOSED` until the user approves again.
