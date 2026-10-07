# Landing — desktop design exploration

Status: PROVISIONAL · 2026-10-07 · Owner review pending

## Current direction — selected Repli reference

The Owner found the text-only version too simple and selected reference `zRSW6` for its layout and background. Current frame: `XQfZm` — **SHUTRLY / Desktop · reference-inspired waitlist**, 1440 × 1100.

- Compact header, centered headline and email form above a single wide product preview, following the selected reference's hierarchy.
- Waitlist row `KksJZ` is a connected full-rounded pill: white shared shell, borderless email input and inset blue pill button, with no gap between input and button. Visible email label is disabled; placeholder reads “Enter your email”. Implementation must retain a visually hidden label or equivalent accessible name.
- Pale background with blue `#2F5BFF` glow at the lower left and lime `#C6F432` glow at the lower right; Plus Jakarta Sans and direct style values retained.
- No decorative avatars, stacked cards, extra feature sections or invented social proof.
- Hero panel `MNjz7` is inset 16px from the page edges, with 32px bottom corner radii and clipping enabled. Its blue/lime background ends at the rounded bottom edge.
- Product viewport `K9YTW5` masks the lower portion of image `KCWKt`: the full original `assets/product-ui/sn4a4.png` Projects export is shown at its native aspect ratio inside an intentionally overflowing preview. The mask cuts the screenshot flush with the hero bottom, hiding its lower frame border. Source UI is not redrawn or modified.
- Footer `bcn90` sits outside the hero in a separate 104px white section.
- The Owner selected alternative A, requested no icons or rounded corners, and asked to apply it to the hero. Heading `W65qV` now shows “Less busywork.” above the stable “More photography.” line, with a square lime highlight behind “busywork.” and no visible icon. “Less” uses weight 500, the highlighted word and second line weight 700; type remains Plus Jakarta Sans, 68px. Hero alignment stays centered. The waitlist, rounded hero, product mask and footer are unchanged. Visual inspection found only the intended screenshot clipping.
- Rotation board `vxDeG`, below the desktop frame, documents three static states: **busywork** (list-checks), **paperwork** (receipt-text), **back-and-forth** (messages-square). Proposed implementation: hold 2.8 seconds, slide/fade 300ms; animate the first line as one centered unit, leaving the second line and form stationary. Reserve headline height and show the default busywork state without rotation for reduced-motion users. No live animation was implemented in the canvas.
- Three heading treatment boards remain for comparison: `RKnSZ` **A / Editorial highlight** (lime-highlighted phrase, now without icons or rounded corners), `ZRCms` **B / Blue capsule** (centered blue rotating pill), and `T6uc4N` **C / After hours** (muted crossed-out admin above a lime promise on dark navy). Each contains all three static word states. frontend-design guided their distinct alignment, emphasis and contrast treatments. All three were visually inspected with no reported clipping. Alternative A is selected and applied to the hero as described above; the comparison boards remain intact.
- Marketing copy remains English; the native product screenshot preserves its Indonesian interface.
- Four reference images and source product files remain untouched. Earlier eight long-page sections remain disabled for recovery.
- frontend-design informed the reference adaptation, hierarchy and restrained use of background color. Full-screen visual inspection completed; the only reported clipping is the intentional product-preview mask (`m9YIr`), and the root placeholder flag is cleared.
- Static canvas only. Contact/privacy destinations, form states and responsive implementation remain outstanding. Pen requires the Owner to save with ⌘S; persistence is not verified.

## Desktop variant — techy hero background

Frame `iNAZm`, **SHUTRLY / Desktop · techy hero background**, below `k8cwV`. A copy of the desktop frame; only the hero background (`zWcrE`) changes. It's an option for the Owner to compare, not approved yet.

- Base `#F7F9FD`, a soft blue radial glow behind the product preview and a small lime glow at the lower right.
- Grid layer `c0m7V` (decorative, `aria-hidden`): a 56px blueprint grid of 1px `#2F5BFF` lines at ~7% opacity, six lightly tinted cells and six small square nodes in blue and lime.
- A radial fade keeps the grid strongest behind the headline and fades it out toward the edges; a top fade keeps the header clean.
- Implementation note: build it in CSS (a `linear-gradient` grid with a radial `mask-image`), not as separate elements.

## Desktop variant — techy grid + brand mesh material

Frame `sW37g`, **SHUTRLY / Desktop · techy + brand mesh gradient**, below `iNAZm`. **Owner's chosen gradient direction (2026-10-07).** The hero runs to the top edge of the page: the frame has no top padding, the hero `smR1X` has square top corners (`[0,0,32,32]`), is 996px tall, and keeps 28px top padding so the header doesn't move. It follows Figma's newest material features: shader fills from Config 2026 (for example an animated brand-color mesh gradient with subtle noise), the Noise & Texture effects, and Glass.

- Mesh gradient `rc5Dr` (a 4×4 grid of color points): primary `#2F5BFF` on the left and secondary `#C6F432` on the right. It's transparent at the top, so the headline and form stay on a clean surface, and rises in curved, uneven shapes behind the product.
- Grain `J8rBbX`: shader `assets/shaders/grain.glsl` at 5% with overlay blend, similar to Figma's Noise effect.
- The blueprint grid from `iNAZm` stays underneath. The product is the Owner's laptop mockup, unchanged. A glass effect doesn't apply because the mockup is a flat image.
- Implementation: layered radial gradients, or a small WebGL mesh-gradient canvas with slow motion; static under `prefers-reduced-motion`. Grain: a tiled noise image at ~5%. Everything is decorative (`aria-hidden`).

### Gradient shape explorations (A–D)

Four copies of `sW37g`, placed in a row to its right. Each changes only the material layer; the grid, grain, copy, form and laptop mockup are the same. The Owner kept `sW37g` and deleted A, B, C and E. D (`H4TzfF`) is still on the canvas.

| Frame | Shape | Material layer |
|---|---|---|
| `fM2Zp` A · Horizon arc | Planet-like horizon: lime halo, blue body, bright lime rim rising behind the laptop | `fADje` |
| `QvASS` B · Diagonal ribbon | Two blurred ribbons from lower left to upper right, lime on the left and blue on the right | `Fjwyg` |
| `etWMg` C · Aurora beams | A fan of seven light beams, blue and lime alternating, rising from the bottom and fading upward | `IGDnT` |
| `H4TzfF` D · Conic glow | A large blurred conic (angular) halo in blue and lime with a soft light core behind the laptop | `NAooO` |

| `qbhZh` E · Logo viewfinder | Parts of the Shutrly symbol, enlarged and blurred: four blue viewfinder corners frame the hero (top two at 40%, bottom two at 90%) and the lime S-curve sweeps behind the form and laptop | `hHeNi` |

E redraws the symbol's two parts as simple vector paths, because the logo PNG has a white background and can't be blurred as-is. In code they'd be inline SVG with blur.

Each shape is built from blurred ellipses or rectangles with gradients. In code: CSS radial, conic and linear gradients with `filter: blur()`, all `aria-hidden`. In A, the lime halo reaches up to the waitlist form; check the contrast of the helper text if A is chosen.

## Mobile — reference-inspired waitlist

Frame `kE8Eu` — **SHUTRLY / Mobile · reference-inspired waitlist**, 390 × 879, to the right of the desktop frame. Mobile version of the same hero; not approved yet.

- Inset hero `hPCA8` with 8px gutters, `[8,8,28,28]` corners and the same blue/lime glow, recentred for a tall frame (blue lower left, lime lower right). Header keeps the selected logo (30px symbol, 20px wordmark) and "Coming soon".
- Headline alternative A at 32px in every state. The longest rotating state, "Less back-and-forth." (≈334px), fits the 350px column, so the line doesn't resize when the word rotates.
- Waitlist keeps the connected full-rounded pill (54px), with a shorter button label "Join waitlist". The accessible-name rule from desktop still applies.
- **Mobile showcase:** the Owner's phone mockup `Navy Smartphone Project Dashboard Mockup.png` (rectangle `XczC7`, 519 × 925, showing the native mobile Projects UI). The hero panel `hPCA8` is the mask (clip, rounded bottom corners, fixed height 799). The mockup sits absolutely inside it at the exact position the Owner placed it (x −106, y 342), so its lower part is cut by the hero's rounded bottom edge. The earlier inner viewport `YqER5` was removed. The earlier glass surround and its `liVLL.png` export were deleted at the Owner's request.
- **Background (Owner 2026-10-07):** same material as desktop `sW37g`. Hero `hPCA8` runs to the top edge (frame top padding 0, corners `[0,0,28,28]`, 807px tall, 16px top padding), base `#F7F9FD`, blueprint grid `DnIy7` with 40px cells, brand mesh `N7ZSe` (same fill as desktop `rc5Dr`, from y 300), and grain `t1s7Q` at 5%. The phone mockup keeps the Owner's size and position, shifted down 8px so it doesn't move on the page.
- Footer `LXKAW` sits outside the hero: copyright on the left, Contact and Privacy on the right.
- Layout check: only sub-pixel (0.12px) clipping reports and the intended product mask. Save the canvas with ⌘S.

## Logo exploration — separate board

**Selected logo applied:** the Owner selected group `adXw8`, containing an imported blue/lime symbol image and dark Plus Jakarta Sans wordmark. It was copied proportionally at 45% into the landing header as `G4IO0Z`; the original crop, colors and typography were preserved. The previous text-only header wordmark is disabled. The source selection was not modified. Header and full-page visual checks passed. This selected symbol is a PNG, not one of the generated vector options below.

The Owner requested a new frame with several logo options. Board `IYksd` — **SHUTRLY / Logo explorations · 4 directions** — is separate from the landing and does not change its current wordmark.

1. **Shutter S:** geometric S monogram in blue.
2. **Focus window:** photographic focus brackets with a lime focal point.
3. **Gallery mark:** paired photographic frames in blue and lime.
4. **Wordmark only:** Plus Jakarta Sans lettering without a separate symbol.

The three symbols were generated as native vectors through Pencil, normalized to the exact brand colors, and made reusable. Each includes 24px and 32px instances for small-size comparison. All four cards were visually inspected; no layout clipping or pending artwork remains, and the board placeholder is cleared. frontend-design guided distinct symbol-versus-type directions and consistent comparison layouts. These are provisional options, not a selected or trademark-cleared identity. The existing landing logo is unchanged; save the Pen canvas manually.

### Additional logo directions — 05–08

The Owner requested four more options, two explicitly using negative space. New board `sBSeg` — **SHUTRLY / Logo explorations · 05–08** — preserves the first four options and the landing.

- **05 / Hidden S:** an S-shaped cutout through a blue circular silhouette.
- **06 / Delivery Cut:** an arrow-shaped cutout through a blue photo-print silhouette.
- **07 / Aperture Bloom:** four broad shutter blades in blue and lime.
- **08 / Ribbon S:** a fluid, folded positive-space S monogram.

All four native vector marks are complete, normalized to exact brand colors and made reusable. Hidden S's generated white overlay was converted into a true transparent compound-path cutout; Delivery Cut also uses an even-odd cutout. Each option includes 24px and 32px samples and a lime-background transparency check. All cards were visually inspected with no layout clipping, and the board placeholder is cleared. frontend-design guided the distinct silhouettes and consistent comparison layout. No identity has been selected or applied; existing options 01–04 and the landing remain unchanged. Save the canvas manually.

## Previous direction — simple waitlist

The Owner rejected the long, screenshot-heavy concept and approved a one-screen, text-only direction. The current frame is `XQfZm` — **SHUTRLY / Desktop · simple waitlist**, 1440 × 960.

- White background, dark typography, blue CTA, small lime launch-status dot; Plus Jakarta Sans throughout. All values are direct styles, not new tokens.
- Header `hvn6W`: Shutrly wordmark and “Coming soon”.
- Main `viLSL`: “Less admin. More photography.”, a short explanation of projects, photo selections and invoices, and one email-only waitlist form.
- Footer `bcn90`: copyright, Contact and Privacy.
- English marketing copy only. No screenshots, photography, feature cards, pricing, testimonials or Claude affiliation claims.
- The frontend-design skill informed the restrained typography, spacing and single-action hierarchy.
- The four reference images are untouched. Earlier eight sections are disabled, not deleted, so the discarded concept can be recovered.
- Visual inspection completed for the screen, headline and form; MCP reports zero visible layout problems. The root placeholder flag is cleared.
- This is a static idle-state design, not a working form. The contact address, privacy destination, form states, responsive design and implementation remain outstanding. No HTML implementation exports have been approved.
- Pen canvas persistence is not verified; the Owner must save with ⌘S.

## Historical record — superseded reference-led concept

Everything below records the earlier rejected concept, not the current implementation reference. Its source assets remain available but are unused in the visible design.

### Previous Owner direction

- Landing copy is English-only (Owner, this conversation).
- Keep Shutrly's primary blue, secondary lime and font; use direct values for all other styling rather than design tokens (Owner: "just follow the primary & secondary color & font, the rest is dont use tokens").
- Rebuild desktop only using the four reference images the Owner placed on the canvas. The earlier desktop/mobile attempts were deleted by the Owner and are not design sources.

## Canvas reference

File: `docs/features/landing/landing.pen` in the `feat/landing` worktree.

Desktop frame: `XQfZm` — **SHUTRLY / Desktop · reference-led concept**.

The Owner's reference images are preserved unchanged:

| Node | Applied direction |
|---|---|
| `E6LOx` | Compact floating navigation, large photography panel, oversized type, alternating product stories |
| `SLVlL` | Compact horizontal workflow strip with small product details |
| `zRSW6` | Centered SaaS hero, large product preview, floating contextual panels |
| `zqIoL` | Soft atmospheric background and a dominant product composition |

## Section map

| Frame | Section |
|---|---|
| `mKUJB` | Hero, navigation, waitlist and original Projects UI |
| `TGX3S` | Three-part workflow strip |
| `MHP42` | Wide photographic statement and original session/team panel |
| `hQ8l1` | Client gallery, selection limits and final delivery |
| `Ymond` | Agreed package, sessions/team, invoices and manual payments |
| `QB4MO` | Google Drive and owner-sent WhatsApp workflow |
| `GTlr7` | Closing waitlist |
| `ALZZo` | Footer and removal contact |

## Original product UI sources

Owner direction: check and reuse the actual UI in existing `.pen` files instead of redrawing it. Product previews are native PNG exports at 2× scale, stored in `assets/product-ui/`. Source frames, their data and their Indonesian interface copy are preserved; the surrounding marketing copy remains English. Source `.pen` files were inspected and exported through MCP, not modified.

Paths below are relative to the main repository's `.claude/worktrees/` directory.

| Source file | Exported node / asset | Landing placement |
|---|---|---|
| `landing/docs/features/projects/projects.pen` | `sn4a4.png` — Proyek / List / Aktif / Desktop | Main hero preview |
| `landing/docs/features/projects/projects.pen` | `H2WfK.png` — Isi paket | Workflow strip and operations |
| `pull-branch-main-21161f/docs/features/client-access/client-access.pen` | `U6NYNS.png` — Pilih · edit · Desktop | Client gallery |
| `pull-branch-main-21161f/docs/features/client-access/client-access.pen` | `WbeP0.png` — Group Summary | Workflow strip |
| `pull-branch-main-21161f/docs/features/client-access/client-access.pen` | `d7YbjO.png` — Pilih foto | Floating hero panel |
| `landing/docs/features/team-sessions/team-sessions.pen` | `N6PIGq.png` — Jadwal | Photography panel and operations |
| `feature-status-table-da0944/docs/features/billing/billing.pen` | `XfMNH.png` — Ringkasan | Workflow strip and operations |

The gallery now shows the existing client-selection screen, without invented navigation tabs or selection badges. These are existing product design screenshots, not evidence of shipped functionality or approved landing implementation exports.

## Styling and validation

- Blue `#2F5BFF`, lime `#C6F432`, Plus Jakarta Sans. Direct style values throughout, per the Owner's instruction; no new shared tokens or library edits.
- All design edits were made through Pencil MCP. Photography is stock imagery used in the design concept.
- Both forms are idle-state representations. Navigation and product screenshots are not functional prototypes.
- Product previews use the original UI exports listed above, rather than reconstructed controls.
- Final MCP inspection: no reported layout problems. Hero, gallery, operations, workflow strip and photography panel were visually inspected after the original UI replacements. Landing text uses Plus Jakarta Sans; source UI typography is preserved in the exports.
- Canvas edits are complete; source-file persistence has not been verified. Pen requires a manual save.

## Outstanding before implementation

- Owner review of this desktop concept; it is not an approved implementation reference yet.
- Replace `[contact email]` with the Owner's removal-request address.
- Align the intent, spec, acceptance criteria and scoped coding-rule exception with the Owner's English-only decision. Those documents still describe Indonesian copy.
- Design remaining form states and mobile only when requested for the next phase.
- No approved HTML exports or implementation plan have been produced from this exploration.
