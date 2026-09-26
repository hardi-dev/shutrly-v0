# Icon component design

## Status

Approved direction: Icon registry backed by Hugeicons Free.

## Context

The C01 Button, C03 Input, and C18 Text Field primitives currently define SVG paths locally. This duplicates visual definitions and makes it difficult to keep decorative and interactive icons consistent. The component library needs one icon boundary while preserving the existing primitive APIs.

## Decision

Create a reusable icon unit at `src/ui/primitives/icon/` backed by Hugeicons Free. The unit exposes a stable semantic icon-name registry instead of exposing Hugeicons names to Button, Input, or TextField consumers.

The registry owns the mapping from the existing semantic names to Hugeicons Free icon exports. Consumers continue to use names such as `search`, `eye`, `eye-off`, `calendar`, `chevron-down`, `circle-alert`, `plus`, `send`, `arrow-right`, and `trash-2`.

## API

`Icon` accepts:

- `name`: a union of registered semantic icon names;
- `size`: a token-backed size variant, defaulting to the current 16 px icon size;
- `className`: merged with the icon's base classes;
- `aria-hidden`: decorative icons are hidden from assistive technology by default;
- standard SVG presentation props needed by the registry adapter.

Icon actions remain outside `Icon`. `Button` remains a semantic button, and C03/C18 adornment actions remain semantic React Aria buttons containing `Icon`. This prevents an SVG from becoming responsible for keyboard interaction or accessible naming.

Unknown names must be rejected by TypeScript and must not silently fall back to a different icon. The registry is the only file that imports Hugeicons Free icon definitions.

## Migration scope

- Add the Icon unit, types, registry, and co-located tests.
- Add Hugeicons Free runtime dependencies using exact versions.
- Replace inline SVG path registries in C01 Button and C03 Input with `Icon`.
- Keep C18 TextField composed through C03 Input; no duplicate icon mapping is added to TextField.
- Preserve existing icon names, action APIs, token-based sizing, focus styling, and accessibility behavior.
- Update Storybook stories and matrix coverage for decorative icons, leading/trailing actions, password visibility, disabled actions, and both light/dark themes.

## Testing

- Icon renders each registered semantic name through the Hugeicons adapter.
- Icon applies the default and explicit token-backed sizes.
- Decorative icons expose `aria-hidden` and do not create button roles.
- C01, C03, and C18 continue to pass their existing matrices.
- C03 and C18 leading/trailing actions remain keyboard-accessible and disabled with the input.
- Password visibility toggles between `eye` and `eye-off`.

## Constraints

- Use existing design tokens; do not introduce raw color, spacing, or size values in `src/ui`.
- Do not edit `.pen` files directly.
- Do not expose Hugeicons package names through public primitive props.
- Keep the registry isolated so a future icon library migration changes one boundary.
