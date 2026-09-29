# Pattern: `Toast`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-28 (Owner approved Toast as a distinct global feedback pattern).
- Pencil library: `design-system.lib.pen` › **C39 — Toast** (`GE357`).
- Reusable specimen: `Toast/Success` (`QCuMb`), composed from Alert/Success (C24).

## Purpose

Transient feedback after a completed or recoverable action. Toast confirms the outcome without
moving page content or replacing field-level validation.

## Composition and placement

- A Toast uses Alert's tone, title, optional body and Close treatment; it adds queue, timeout,
  elevation and responsive placement.
- Mobile places the stack at the top centre. Desktop and tablet place it at the bottom right.
- The stack is global, rendered through `AppProviders` into `document.body`; it is not inside a
  form, App Shell panel, Modal or Bottom Sheet.
- At most three toasts are visible. The default timeout is five seconds, and every Toast has a
  Close control.
- App Shell (`VJpuD`) and Mobile App Shell (`U4sG8K`) expose separate visual Toast slots. They
  never replace the Modal or Sheet Overlay slots.

## Content rules

- Title: concise outcome, such as *Perubahan tersimpan*.
- Body: optional one-sentence context; omit when the title is sufficient.
- Do not use Toast for invalid input, destructive confirmation, or required instructions. Keep
  those messages inline with the relevant field or action.

## Accessibility

- Use the React Aria Toast region and item semantics so a new item announces its title and
  optional description.
- Close has a translated accessible name and visible focus state.
- Route-driven feedback must be deduplicated across React Strict Mode and remounts. The current
  implementation claims a session-scoped key before queueing.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: **Toast/Danger** `C3PCyx` (Action *Coba lagi* on by default). Code `Toast` must add optional action support (F-17 plan). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- Adds a **Toast/Danger** specimen (from Alert/Danger).
- Adds an optional **Action**, for example *Coba lagi* after a failed workspace switch. The code `Toast` must support this.

## Implementation references

- Pencil: `C39 — Toast` (`GE357`), `Toast/Success` (`QCuMb`).
- Code: `src/ui/patterns/toast/toast.tsx`; global mount:
  `src/ui/providers/app-providers.tsx`.
- Visual primitive: [alert.md](alert.md), C24.
- Rules: `token-usage.md` G3, SP6, §6 and §8.
