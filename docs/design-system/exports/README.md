# Design-system HTML exports

These files are inspectable HTML matrix fixtures for the approved Pencil components:

- `c01-button.html`: 3 types × 2 sizes × 4 states.
- `c03-input.html`: default/search state matrices plus the documented configurations.
- `c18-text-field.html`: all 5 field states with the C03 input anatomy.

They load `src/ui/theme/tokens.css` directly, so the visual checks use the approved token values and dark-mode selector. Open them through the Codex file preview or serve a repository-root preview and visit `/docs/design-system/exports/<file>.html`.

The shared code-only [Icon primitive](../components/icon.md) is not a Pencil matrix export. Its semantic registry is consumed by C01 Button, C03 Input and C18 Text field.

## Pencil page exports (F-02, 2026-09-27)

Full component pages exported from `design-system.lib.pen` through Pencil MCP `Export(…, "html-tailwind", …)`, for the F-02 Batch A build (see `docs/features/workspace/technical-design.md`):

- `c02-icon-button`, `c04-textarea`, `c13-count-badge`, `c16-avatar`, `c24-alert`
- `c22-nav-item`, `c34-bottom-nav`, `c37-nav-rail`
- `c09-menu-item`, `c10-menu`, `c31-modal`, `c32-bottom-sheet`
- `c28-app-panel`, `c29-sidebar`, `c30-app-shell`, `c35-mobile-app-shell`

These files are generated snapshots: never edit them by hand. Re-export a page after its Pencil component changes.

## Pencil page exports (2026-10-01)

- `c43-section-card`: C43 Section Card page (component set, configurations, content, modes, usage and accessibility), exported for the Settings v3 build.
