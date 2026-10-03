# F-06 Clients — Component inventory

| Component | Spec | Status | Path | Needed change | First used in |
|---|---|---|---|---|---|
| Table | `components/table.md` | new | `src/ui/patterns/data-table/` | Create token-backed React Aria `DataTable` and `DataTableSkeleton` (C27). | 1.1 |
| Tabs | `components/tabs.md` | exists | `src/ui/patterns/tabs/` | Reuse `Tabs` and `TabLink` for the desktop Page Header status tabs. | 1.8 |
| Page Header tabs | `components/page-header.md` | exists | `src/ui/patterns/page-header/` | Reuse `tabs: { label, tabs }` on `PageHeaderProps`. | 1.8 |
| Segmented Control | `components/segmented-control.md` | exists | `src/ui/patterns/segmented-control/` | Reuse `isFullWidth` for phone status tabs. | 1.10 |
| Input search | — | extend | `src/ui/primitives/input/` | Add `"x"` to `InputIconName` for the search clear action. | 5.1 |
| TextField | — | extend | `src/ui/primitives/text-field/` | Add exported `FieldNameProps`; make the visible `label` optional when `aria-label` names an unlabeled social-value field. | 1.2 |
| Select | `components/select.md` | extend | `src/ui/patterns/select/` | Take `FieldNameProps`; use `label ?? aria-label` for the ListBox and phone-picker title. | 1.2 |
| Textarea | — | extend | `src/ui/primitives/textarea/` | Take `FieldNameProps`, remove `isLabelHidden`, and migrate the template-editor caller to `aria-label`. | 1.2 |
| IconButton | — | exists | `src/ui/primitives/icon-button/` | Reuse for social-row removal and row actions. | 1.11 |
| Button | — | exists | `src/ui/primitives/button/` | Reuse `isPending`, add, edit, archive, restore, and delete variants. | 1.11 |
| Avatar | — | exists | `src/ui/primitives/avatar/` | Reuse `initials` with `size="md"` for client rows. | 1.2 |
| CountBadge | — | exists | `src/ui/primitives/count-badge/` | Reuse for additional social-link count. | 1.10 |
| List Card Item | `components/list-card.md` | extend | `src/ui/patterns/list-card-item/` | Make `icon` optional, add `avatarInitials`, and throw during development unless exactly one leading visual is supplied. | 1.2 |
| List Card Item skeleton | `components/list-card.md` | exists | `src/ui/patterns/list-card-item/` | Reuse for phone loading rows. | 1.10 |
| Section Card | `components/section-card.md` | exists | `src/ui/patterns/section-card/` | Reuse `content="flush"` and `actions` for the phone list. | 1.10 |
| Empty State | `components/empty-state.md` | exists | `src/ui/patterns/empty-state/` | Reuse `icon`, `iconTone`, `placement`, and `action`. | 1.10 |
| Menu / MenuItem / MenuTrigger | `components/menu.md` | extend | `src/ui/patterns/menu/` | Add optional `href` and `target` to `MenuItem`; make `onSelect` optional for links. | 3.1 |
| SheetItem | `components/bottom-sheet.md` | extend | `src/ui/patterns/sheet-item/` | Add optional `href` and `target`, then `isPending` to show the loading icon and disable the row. | 3.1 |
| Modal | `components/modal.md` | exists | `src/ui/patterns/modal/` | Reuse `size="md"` for forms and `size="sm"` plus `isDestructive` for delete. | 1.11 |
| Bottom Sheet | `components/bottom-sheet.md` | exists | `src/ui/patterns/bottom-sheet/` | Reuse `variant="form"` and `variant="actions"`. | 1.11 |
| Alert | — | exists | `src/ui/patterns/alert/` | Reuse `tone="danger"` for the blocked-delete state. | 4.3 |
| Toast | — | exists | `src/ui/patterns/toast/` | Reuse `showToast` for mutation feedback and retry. | 1.11 |
| PageActions | — | exists | `src/ui/patterns/page-actions/` | Reuse to portal the desktop add action into the Page Header. | 1.10 |
| AppShell / Mobile Header | `components/page-header.md` | extend | `src/ui/patterns/app-shell/` | Add `mobileSubtitle?: string`; Mobile Header uses `mobileSubtitle ?? subtitle`. | 1.2 |
| Icon | — | extend | `src/ui/primitives/icon/` | Add `message-circle` backed by `MessageCircleIcon` to the registry and `IconName`. | 3.1 |

`DataTable` is new because none of the existing list, card, or shell patterns provides the required desktop React Aria grid with a toolbar, fixed-width columns, row actions, empty state, and footer. Every other planned Clients UI builds on an existing shared unit or one of the additive extensions above.
