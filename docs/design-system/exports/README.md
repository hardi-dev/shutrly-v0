# Design-system HTML exports

These files are inspectable HTML matrix fixtures for the approved Pencil components:

- `c01-button.html`: 3 types × 2 sizes × 4 states.
- `c03-input.html`: default/search state matrices plus the documented configurations.
- `c18-text-field.html`: all 5 field states with the C03 input anatomy.

They load `src/ui/theme/tokens.css` directly, so the visual checks use the approved token values and dark-mode selector. Open them through the Codex file preview or serve a repository-root preview and visit `/docs/design-system/exports/<file>.html`.

The shared code-only [Icon primitive](../components/icon.md) is not a Pencil matrix export. Its semantic registry is consumed by C01 Button, C03 Input and C18 Text field.
