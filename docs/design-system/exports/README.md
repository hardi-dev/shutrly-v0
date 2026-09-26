# Design-system HTML exports

These files are inspectable HTML matrix fixtures for the approved Pencil components:

- `c01-button.html`: 3 types × 2 sizes × 4 states.
- `c03-input.html`: default/search state matrices plus the documented configurations.
- `c18-text-field.html`: all 5 field states with the C03 input anatomy.

They load `src/ui/theme/tokens.css` directly, so the visual checks use the approved token values and dark-mode selector. Open them through the Codex file preview or serve a repository-root preview and visit `/docs/design-system/exports/<file>.html`.
