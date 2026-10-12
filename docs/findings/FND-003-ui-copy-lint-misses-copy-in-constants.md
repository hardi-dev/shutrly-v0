# FND-003 — `local/ui-copy` misses copy held in a constant

Status: FIXED (2026-10-12, option A, Owner) · Found: 2026-10-12 · Found by: skeleton translation audit (F-24 follow-up, Owner request) · Area: lint / coding rules (`eslint/local-rules.mjs`) · Severity: medium. Untranslated or hard-coded text can reach the UI without any gate failing, which breaks BR-L10N-002. One real case shipped.

## Symptom
`src/features/booking/ui/catalog-skeletons/catalog-skeletons.tsx` held the Indonesian titles *Layanan*, *Kategori*, *Item paket* and *Memuat layanan* in a module-level `TITLES` constant. They rendered as `<SectionCard title={TITLES[variant]}>`, so the English UI showed Indonesian loading titles, and project pages showed the service title. Lint, the pre-commit hook and the copy parity gate all passed.

## Evidence
- `local/ui-copy` (`eslint/local-rules.mjs`, lines 52–92) reports only:
  - non-empty `JSXText`;
  - a string `Literal` or `TemplateLiteral` written **directly** as the value of a copy prop (`title`, `label`, `aria-label`, …).
- A copy prop whose value is an `Identifier` or `MemberExpression` (`TITLES[variant]`, `LABEL`) is not checked, whatever the identifier holds.
- `catalog-parity` compares the EN and ID keys of registered copy modules. It never sees strings outside `*.copy.ts`.
- Fixed for this one case in `5d39543` (`fix(catalog): translate the catalog and project loading titles`).

## What still works
- Text written inline in JSX, or inline in a copy prop, is still caught.
- On 2026-10-12, a PCRE search for common Indonesian words in `.ts`/`.tsx` outside copy modules found no other case. That search is not exhaustive: it covers only the words searched and doesn't catch English text hard-coded the same way.

## Suspected cause (unproven unless stated)
Proven by reading the rule: it inspects the syntax of the attribute value and doesn't follow identifiers back to where they were declared.

## How to reproduce
In any `src/**/*.tsx`, add `const T = { a: "Teks" } as const;` and render `<SectionCard title={T.a} />`. Run `npx eslint <file>`: no error.

## Fix plan
To decide, with the Owner. Each option comes with a case in `tests/lint/coding-rules.test.ts` that reproduces the miss:
- **A.** When a copy prop's value is an `Identifier` or `MemberExpression`, resolve it with ESLint scope analysis. If it points to a module-level `const` whose initializer contains a non-empty string literal (directly, or inside an object or array literal), report `inline`. Narrow, few false positives, catches this case.
- **B.** Report any module-level `const` in `src/**/*.tsx` (outside tests) whose object or array initializer holds a string literal containing a letter, except known non-copy keys (`className`, `variant`, `href`, `data-*`, ids). Broader, noisier.
- **C.** A repo test, in the style of the skeleton audit, that fails on any string in `.tsx` matching an Indonesian-word list. Cheap, but not a real fix.

Recommendation: **A**, plus a one-time sweep with the new rule to find any other cases.

## Related
- BR-L10N-002 · `docs/coding-rules.md` › Copy · F-24 build notes › *Follow-up: loading copy*
- F-22 bilingual copy revamp (the 42 `DECK GAP` strings are a different case: they live in copy modules, EN = ID on purpose)

## Resolution (2026-10-12)
Option A, chosen by the Owner. `local/ui-copy` now traces a copy prop's value, and a JSX child expression, back through ESLint scope analysis. It reports when the value reads a module-level `const` whose initializer holds a non-empty string (directly, or inside an object, array, `as`/`satisfies` or conditional). Imported bindings and local variables are not checked: copy modules are imported, and props and `t()` results are not constants.
- Tests in `tests/lint/coding-rules.test.ts`: two rejects (constant into `title`, constant as a child) and one accept (number constant, key map passed to `t()`, imported namespace, prop). Red first (2 failed), then 8/8 passed.
- Sweep: ESLint over all 380 `src/**/*.tsx` (tests and stories excluded): 0 `local/ui-copy` reports and no other messages. The pre-fix `catalog-skeletons.tsx` (`5d39543^`) is reported at `title={TITLES[variant]}`, so the rule catches the original case.
- `docs/coding-rules.md` › Copy now describes the wider rule.
