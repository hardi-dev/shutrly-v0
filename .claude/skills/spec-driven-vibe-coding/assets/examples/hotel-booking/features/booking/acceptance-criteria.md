# Acceptance Criteria — Hotel Booking

## AC-BOOK-001 — Reject invalid stay
Covers: BR-BOOK-001

**Given** check-in is 10 October  
**When** check-out is 10 October  
**Then** booking cannot continue.

## AC-BOOK-002 — Reject excess guests
Covers: BR-BOOK-002

**Given** room capacity is 2  
**When** guest count is 3  
**Then** booking cannot continue.

## AC-BOOK-003 — Reject overlap
Covers: BR-BOOK-003

**Given** an existing confirmed booking is 11–13 October  
**When** the requested stay is 10–12 October  
**Then** the room is unavailable.

## AC-BOOK-004 — Recheck on confirmation
Covers: BR-BOOK-004

**Given** the room was available during review  
**When** another booking reserves it before confirmation  
**Then** creation fails with `ROOM_NOT_AVAILABLE`.
