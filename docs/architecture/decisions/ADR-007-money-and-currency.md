# ADR-007: Exact decimal money, IDR-only with persisted currency codes, no tax

Status: Accepted
Date: 2026-09-25

## Context
MVP targets Indonesia. Future multi-currency must not require a data migration of historical records.

## Decision
- Store money as `numeric(18,3)`; never floating point. Represent money in TypeScript with a decimal-safe type (no JS `number` arithmetic for money).
- Persist ISO currency codes on Workspace default, Service, Project snapshot, and Invoice; MVP allows `IDR` only, displayed as whole rupiah.
- Add-ons inherit Project currency; InvoiceItems/Payments inherit Invoice currency. No mixing, conversion, or tax.

## Consequences
### Positive
- Historical data ready for more currencies.
### Negative / Trade-offs
- Decimal handling overhead in app code.

## Related
- Business rules: BR-CUR-*, BR-PRJ-007
