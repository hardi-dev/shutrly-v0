# Component: `Alert`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26. The Owner renamed the former `Toast` component to `Alert` for persistent inline guidance in F-01 Auth. The existing component IDs and tone variants remain linked.
- Pencil library: `design-system.lib.pen` › **C24 — Alert** (`NFr0T`)
- Feature evidence: `auth.pen` › verification instruction on desktop and mobile

## Purpose

An inline message that stays in the page flow while its information is relevant. Use it for verification instructions, form-level feedback, and status messages tied to nearby content. It does not disappear on a timer.

## Anatomy

| Part | Layer | Contract |
|---|---|---|
| Container | root | Fills its content area; tone background and border, `alert.radius`, padding 12, icon/text gap 12. |
| Icon | `Icon` (`k7lq2`) | 16 px, matching the tone. |
| Title | `Title` (`m0dqT6`) | Short, scannable heading; body-sm 13/600. |
| Body | `Body` (`fhch4`) | Optional supporting sentence; label 12/400. |
| Action | `Action` (`M54Ca`) | Optional single contextual action; off by default. |
| Close | `Close align` (`IXhZl`) | Optional nested Icon Button/Ghost/SM with an ×; **off by default**. |

Title, body, and action use `alert.text-gap` (2). The shared private base is `_Alert/Base` (`B50hT`). The approved tones retain their IDs: Success `E4PkTw`, Info `S5bhVn`, Warning `pt1q7`, Danger `F3GrC5`, and Highlight `ef21N`.

## Behavior and placement

- Place the Alert next to the content or action it explains. Use `width: fill_container` in forms; the 360 px library specimen is an example width.
- Alerts persist while the relevant state persists. They do not stack as floating notifications or dismiss automatically.
- Keep **Close** hidden when the message is necessary to complete the task, including verification instructions. Enable it only for optional information that can safely be dismissed.
- Use Info for the verification email guidance. The resend button stays outside the Alert.

## Accessibility

- Static guidance is part of normal reading order and should not be announced as a new live event on page load.
- When an Alert is inserted or updated as feedback, use `role=status` for non-urgent information and `role=alert` for urgent errors. Keep field errors adjacent to their fields.
- If Close is enabled, give it an accessible label and preserve the message elsewhere when users still need it.
- Icon and title communicate tone alongside colour; never rely on tint alone.

## Implementation references

- Pencil: `C24 — Alert` (`NFr0T`), base `B50hT`
- Tokens: `component.alert.*`
- Rules: `token-usage.md` G3, SP6, §2 *Status*, §6, §8
