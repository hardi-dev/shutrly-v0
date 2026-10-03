# F-07 Projects — Component inventory

Read from the code on `feat/projects` after merging `main` (F-06), 2026-10-03. Specs are in `docs/design-system/components/`.

| Component | Spec | Status | Path | Needed change | First used in |
|---|---|---|---|---|---|
| Combobox (C36) | `combobox.md` | new | `src/ui/patterns/combobox/` | No unit exists. Create it per `ComboboxProps` in plan.md › Slice 1 (inline menu, group label, create row). | 1.4 |
| Checkbox (C05) | `checkbox.md` | new | `src/ui/primitives/checkbox/` | No unit exists. Needed by the filter (Slice 4). | 4.1 |
| MultiSelect (C20) | `multi-select.md` | new | `src/ui/patterns/multi-select/` | No unit exists. Needed by the filter (Slice 4). | 4.1 |
| DateField + C25 calendar | `date-field.md` | new | `src/ui/patterns/date-field/` | No unit exists. Create per `DateFieldProps` (`display: "date" \| "weekday"`). Add `@internationalized/date`. | 1.4 |
| TimeField | `time-field.md` | new | `src/ui/primitives/time-field/` | No unit exists. Create per `TimeFieldProps`. | 1.4 |
| Select | `select.md` | extend | `src/ui/patterns/select/` | Add `section?: string` to `SelectOption`; render a `MenuGroupLabel` per section on desktop and a grouped list in the phone sheet. | 1.4 |
| IconButton | — | exists | `src/ui/primitives/icon-button/` | `badgeCount` already exists. Reuse for the filter button and the ⋯ buttons. | 4.1 |
| Icon | — | extend | `src/ui/primitives/icon/` | Registry lacks `calendar-check`, `circle-check-big`, `calendar-plus` (step buttons, empty state). `camera`, `more-horizontal`, `pencil`, `trash-2` exist. | 1.5 |
| PageHeader | `page-header.md` | extend | `src/ui/patterns/page-header/` | Add `titleAdornment?: ReactNode` (status chip) and `meta?: ReactNode`. `tabs` and `action` exist. | 2.2 |
| PageHeadingOverride | — | extend | `src/features/workspace/ui/page-heading-override/` | `PageHeadingOverrideValue` has only `title`, `subtitle`, `parent`. Add optional `titleAdornment` and `meta` for the detail header. | 2.2 |
| CompactBar | `page-header.md` | extend | `src/ui/patterns/compact-bar/` | `actions` prop exists, but `AppShell` renders `<CompactBar title parent />` without it. Pass the override's phone actions through. | 2.2 |
| DataTable / DataTableSkeleton | `table.md` | exists | `src/ui/patterns/data-table/` | Reuse for the project list (F-06). | 3.1 |
| SheetItem | `bottom-sheet.md` | exists | `src/ui/patterns/sheet-item/` | `isDisabled`, `isPending`, `href` already exist. | 5.2 |
| Alert | — | exists | `src/ui/patterns/alert/` | Reuse for the blocked states. | 5.1 |
| Toast + ToastOnMount | — | exists | `src/ui/patterns/toast/` | `showToast` with `action`, and `ToastOnMount { tone, title, body, dedupeKey }`. | 1.5 |
| Modal | `modal.md` | exists | `src/ui/patterns/modal/` | Reuse `size` `sm`/`md` and `isDestructive`. | 1.5 |
| BottomSheet | `bottom-sheet.md` | exists | `src/ui/patterns/bottom-sheet/` | Reuse `variant` `form` and `actions`. | 1.5 |
| EmptyState (in card) | `empty-state.md` | exists | `src/ui/patterns/empty-state/` | `placement="in-card"` exists. | 1.5 |
| StatusChip | — | exists | `src/ui/primitives/status-chip/` | `hasDot` exists (COMPLETED uses `hasDot={false}`). | 2.2 |
| SegmentedControl | `segmented-control.md` | exists | `src/ui/patterns/segmented-control/` | `isFullWidth` exists (phone tabs). | 3.2 |
| Tabs / Page Header tabs | `tabs.md` | exists | `src/ui/patterns/tabs/` | Reuse as in F-06. | 3.2 |
| Menu (group label, divider, disabled item with description) | `menu.md` | exists | `src/ui/patterns/menu/` | `MenuGroupLabel`, `MenuDivider`, `MenuItem` `isDisabled` + `description` exist. | 4.1 |
| ActionMenu SM/MD | `menu.md` | exists | `src/ui/patterns/menu/` | `MenuTrigger` + `Menu`. Reuse for row and project ⋯. | 5.1 |
| Textarea | — | exists | `src/ui/primitives/textarea/` | Reuse for notes and cancel reason. | 1.5 |
| TextField | — | exists | `src/ui/primitives/text-field/` | `isDisabled`, `prefix`, `isOptional`, `description` exist. | 1.5 |
| Button | — | exists | `src/ui/primitives/button/` | `variant="danger"` and `isPending` exist. `ButtonIconName` lacks `calendar-check`/`camera`/`circle-check-big`: add them with the icons. | 2.2 |
| SectionCard | `section-card.md` | exists | `src/ui/patterns/section-card/` | Reuse for the form cards. | 1.5 |
| ListCardItem | `list-card.md` | exists | `src/ui/patterns/list-card-item/` | Reuse for item and session rows. | 1.5 |
| PageActions | — | exists | `src/ui/patterns/page-actions/` | Reuse for the desktop page actions. | 2.2 |
