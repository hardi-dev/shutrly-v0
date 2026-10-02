# Technical Design — Hotel Booking

Status: APPROVED

## Relevant Authority
- C-003, C-004, C-005
- BR-BOOK-001 through BR-BOOK-006
- AC-BOOK-001 through AC-BOOK-004

## Server Flow
Validate input → authenticate → recheck availability → calculate final price → create booking atomically → return confirmation.

## Consistency
The initial availability check is informational. Booking creation is authoritative. Availability recheck and creation must be protected against double booking using database/transaction controls appropriate to the selected schema.

## Validation
Client validation improves UX. Server validation enforces authoritative rules.

## Testing
- Unit: date validation, capacity, overlap predicate, price calculation
- Integration: availability + booking creation consistency
- E2E: room → review → confirm → confirmation
