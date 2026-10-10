# Acceptance Criteria — Message templates (F-03)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Seeding

## AC-MSG-001 — New workspace gets five default templates
Covers: BR-MSG-002, BR-MSG-005

**Given** a verified Owner
**When** they create a workspace (onboarding or the switcher)
**Then** the workspace has exactly five `WHATSAPP` templates, one per type, each with that type's default content, all active. If creating the workspace fails, no templates exist either.

## AC-MSG-002 — Existing workspaces are backfilled
Covers: BR-MSG-005

**Given** workspaces created before F-03, with no templates
**When** the F-03 migration is applied
**Then** each has exactly the five default templates, and applying it again creates no duplicates.

## AC-MSG-003 — Exactly one template per type
Covers: BR-MSG-002, C-003

**Given** a workspace that has its five templates
**When** anything tries to insert a second template for the same workspace, type and channel (including a concurrent seed)
**Then** the database rejects it and the workspace still has one template per type.

## List & editor

## AC-MSG-004 — Template list
Covers: BR-MSG-002, BR-WS-003 (A-5)

**Given** an Owner in their workspace
**When** they open *Template pesan*
**Then** they see the five types grouped under *Gallery* (Bagikan gallery, Pengingat seleksi, Hasil akhir) and *Invoice* (Bagikan invoice, Pengingat pembayaran), each with its purpose line; the nav item *Template pesan* is active and no *Segera hadir* placeholder is shown.

## AC-MSG-005 — Editor shows allowed variables and preview
Covers: BR-MSG-003, BR-MSG-006 (A-6)

**Given** the `GALLERY_SHARE` editor
**When** it opens
**Then** it shows the stored content, the variables `clientName`, `projectTitle`, `brandName`, `galleryUrl` (marked required) and `galleryPassword`, and a preview rendered with sample data in which the password appears as `••••••` with a note that it is entered when sharing.

## AC-MSG-006 — Insert variable
Covers: BR-MSG-006

**Given** the editor with the cursor in the content
**When** the Owner inserts `projectTitle`
**Then** `{{projectTitle}}` is inserted at the cursor and the preview updates.

## AC-MSG-007 — Saving valid content
Covers: BR-MSG-004, BR-MSG-006 (A-1, A-9)

**Given** the `INVOICE_SHARE` editor
**When** the Owner saves `Halo {{clientName}}, invoice {{invoiceNumber}}: {{invoiceUrl}}`
**Then** the content is stored for that type only, `updatedAt`/`updatedBy` are set, and a success toast is shown.

## Validation (server-enforced)

## AC-MSG-008 — Empty or too-long content is rejected
Covers: C-004 (A-1)

**Given** a save request with whitespace-only content, or more than 2,000 characters after trimming
**When** it reaches the server, even bypassing the form
**Then** nothing is stored and a field error is shown on the content.

## AC-MSG-009 — Unknown variable is rejected
Covers: BR-MSG-006, C-004

**Given** the `GALLERY_SHARE` template
**When** the Owner saves content containing `{{invoiceUrl}}` or `{{namaKlien}}`
**Then** nothing is stored and the field error names the variable that isn't allowed.

## AC-MSG-010 — Malformed placeholder is rejected
Covers: BR-MSG-006 (A-2)

**Given** any template
**When** the Owner saves content containing `{{clientName}`, `{{ clientName }}`, `{{}}` or a stray `}}`
**Then** nothing is stored and a field error explains the placeholder format.

## AC-MSG-011 — Required link is enforced
Covers: BR-MSG-006

**Given** the `PAYMENT_REMINDER` template
**When** the Owner saves content without `{{invoiceUrl}}`
**Then** nothing is stored and the field error says the invoice link is required. The same holds for `{{galleryUrl}}` in `GALLERY_SHARE`, `SELECTION_REMINDER` and `FINAL_DELIVERY`.

## AC-MSG-012 — Server error keeps stored content
Covers: C-007

**Given** a valid save that fails with an unexpected server error
**When** the Owner sees the error
**Then** the stored content is unchanged, a danger toast explains the failure with *Coba lagi*, the editor keeps their text, and they can retry.

## Restore default & unsaved changes

## AC-MSG-013 — Restore default is a draft change
Covers: BR-MSG-005 (A-4)

**Given** an edited `FINAL_DELIVERY` template
**When** the Owner chooses *Kembalikan ke default*
**Then** the editor shows the default content and nothing is stored until they save; saving stores the default for that type only.

## AC-MSG-014 — Unsaved changes are guarded
Covers: C-007 (A-7)

**Given** the editor with unsaved changes
**When** the Owner navigates away
**Then** they are asked to confirm; cancelling keeps them in the editor with their text.

## Isolation

## AC-MSG-015 — Another workspace's templates are not reachable
Covers: BR-WS-002, BR-WS-003, C-101

**Given** Owner A and Owner B's workspace W
**When** A opens or saves a template under W's URL, or sends W's ID in a request body
**Then** A gets the same *not found* as for a nonexistent workspace, and W's templates are neither shown nor changed.

## Renderer (for F-15)

## AC-MSG-016 — Rendering substitutes allowed variables
Covers: BR-MSG-004, BR-MSG-006

**Given** `GALLERY_SHARE` content `Halo {{clientName}}\n{{galleryUrl}}` and values for both
**When** it is rendered
**Then** the output is the content with both values substituted, as plain text.

## AC-MSG-017 — Rendering fails on missing values
Covers: BR-MSG-006

**Given** content using `{{projectTitle}}`
**When** it is rendered without a `projectTitle` value
**Then** rendering fails with a typed error; no partial text is returned.

## AC-MSG-018 — Values are sanitized and cannot inject placeholders
Covers: BR-MSG-004

**Given** a `clientName` value `Rina\u0007 {{galleryPassword}}\r\n`
**When** it is rendered
**Then** the control character is removed, the line ending normalized, the value trimmed, and `{{galleryPassword}}` appears literally (not resolved).

## AC-MSG-019 — Rendered text and templates are never logged
Covers: BR-MSG-004, C-103

**Given** rendering or saving fails
**When** the error is logged
**Then** the log contains the type and error code only, never the content, values or rendered text.

## Accessibility

## AC-MSG-020 — Keyboard and screen reader
Covers: C-008

**Given** the list and editor on desktop and mobile
**When** they are used with only a keyboard and checked with axe
**Then** every control is reachable and labelled, the content field is associated with its error, the preview is announced as a preview, and axe reports no violations.
