# Layout pattern: Centered narrow content

Status: APPROVED (2026-09-26; Owner: "Setujui jadi aturan resmi"). Evidence: Auth Profile `t7CXVK` and Google-only Profile `TInkk` in `docs/features/auth/auth.pen`.

## Purpose

Use this layout for a single-column settings or form page whose content is much narrower than the Owner app panel. Center the **content region** horizontally inside Page Content, while keeping headings, labels, fields, and helper text left-aligned within that region. This is a layout rule, not a component or a change to the controls inside it.

## Structure

1. App Panel → Page Content keeps its approved outer padding and 1096-wide container (`size.content-max`).
2. A vertical layout frame spans that container and uses horizontal `alignItems: center`.
3. Each content section has the same narrow width. Dividers and supporting notices use that width too; the parent owns the section gap (`panel.app.content.gap`).
4. Actions align to the trailing edge **inside** their section. The whole page remains top-aligned in the panel.

Use `size.content-narrow = 720` for Profile and Password sections. On smaller viewports, the region fills the available width after Page Content padding, without horizontal clipping.

## When to use

- Single-column profile, account, preferences, or focused edit forms.
- Several related sections that should read as one centered column.

Use the full Page Content width for tables, dashboards, and multi-column work areas. Do not center each field independently or change its component-level padding, colours, or variants.

## Token and implementation

`size.content-narrow = 720` is a layout-size token. Pencil cannot bind width to variables, so its example uses a documented literal; implementation uses `width: 100%` and `max-width` from the token. The existing `size.content-max = 1096` remains the outer content width.

This pattern changes only the layout container. It does not change form controls or their component tokens.
