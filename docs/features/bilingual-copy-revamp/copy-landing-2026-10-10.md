# Landing copy review — 2026-10-10

Scope: public landing page `/`, added to the bilingual copy scope at the Owner’s request. The page should use the same EN/ID switch behavior as the workspace and must not fall back across languages.

## Source coverage

| Source | Strings reviewed |
|---|---|
| `src/features/landing/ui/landing-page/landing-page.copy.ts` | Wordmark, “Coming soon”, audience label, hero description, laptop/phone alt text, footer landmark, copyright, Contact, contact email, Privacy |
| `src/features/landing/ui/rotating-headline/rotating-headline.copy.ts` | Rotating words, stable headline, accessible heading |
| `src/features/landing/ui/waitlist-form/waitlist-form.copy.ts` | Email label/placeholder, submit and submitting labels, launch promise, privacy/removal note, bot label, validation errors, rate-limit/server errors, success title/body |
| `src/app/page.copy.ts` | Site name, page title, page description, share-image alt text |

All rendered states are represented in section 19 of the copy deck, including accessible names and metadata.

## English changes

The hero description is qualified from “All in one place.” to “All in one workspace.” in the deck. This keeps the useful product description while avoiding an unqualified all-in-one claim that could imply unsupported automatic storage, sending, syncing, or a completed end-to-end MVP. The metadata descriptions and share alt text receive the same claim-boundary treatment. Other English source wording is retained.

## Open questions for the Owner

- Where should the language switch appear on the public landing page, and should it use the same control placement as the workspace?
- If a waitlist confirmation email is introduced later, should it follow the visitor’s selected language, and where is that preference stored?
- Should the public-page language preference persist, and should it be scoped to the landing page, browser, or signed-in workspace preference?
- The current source has no landing-specific language-switch strings or implementation, so the switch’s exact accessible name and pending/error states need confirmation against the shared workspace control.

## Unmapped strings

No source string in the four reviewed copy modules was left unmapped. The decorative product mockup contains visual UI text that is part of the image asset, not a runtime string; its localization is not verifiable from these sources.
