# Activity / Flow — Client access

Two flows have real branching: the client gate (what a request is allowed to see) and the pick (what happens to one change). Rate limits run before any lookup so unknown tokens cost nothing.

## 1. Client request to `/g/{token}`

```mermaid
flowchart TD
    A[Client opens /g/token] --> B{Address over the unknown-token limit?}
    B -->|Yes| X[Refused, no lookup]
    B -->|No| C{Token belongs to a project whose gallery is PUBLISHED and not expired?}
    C -->|No| N[Neutral unavailable page, same status for every case]
    C -->|Yes| D{Valid session for this token and current passwordVersion?}
    D -->|Yes| G[Gallery]
    D -->|No| P[Password screen]
    P --> E{Over the password-attempt limit?}
    E -->|Yes| L[Too many attempts, wait n minutes, password not checked]
    E -->|No| F{Password matches the hash?}
    F -->|No| W[Password salah, attempt counted] --> P
    F -->|Yes| S[Create session bound to token + passwordVersion] --> G
    G --> H{Final delivery published?}
    H -->|No| I[Browse mode: folders, search, PROOF grid, no select controls]
    H -->|Yes| J[Tabs Foto and Hasil akhir; Hasil akhir shows EDITED and PRINT, not selectable]
    I --> K{Project has selection groups?}
    J --> K
    K -->|No| O[Browse only, no Mulai memilih]
    K -->|Yes| M[Mulai memilih in Page Header]
    M --> N1[Menu lists every group; SUBMITTED and LOCKED rows disabled]
    N1 --> N2[Selection mode for the chosen group: summary bar, select controls, Kirim pilihan, Kembali ke semua foto]
    N2 -->|Kembali ke semua foto| I
```

## 2. One pick change

```mermaid
flowchart TD
    A[Client picks, un-picks or changes a quantity] --> B{Session valid and gallery still available?}
    B -->|No| N[Neutral page or password screen]
    B -->|Yes| C{Over the selection-write limit?}
    C -->|Yes| X[Refused, try again shortly]
    C -->|No| D[Lock the group row]
    D --> E{Group OPEN?}
    E -->|No| R1[Pilihan sudah dikirim, refresh group]
    E -->|Yes| F{Photo is a visible PROOF of this project?}
    F -->|No| R2[Refused, nothing stored]
    F -->|Yes| G{Mode?}
    G -->|COUNT| H[Quantity = 1]
    G -->|QUANTITY| I{Whole number >= 1?}
    I -->|No| R2
    I -->|Yes| H2[Use quantity]
    H --> J{Usage after change <= effective limit?}
    H2 --> J
    J -->|No| R3[Batas pilihan tercapai, refresh group]
    J -->|Yes| K[Store pick, commit, return new usage]
```

## 3. Owner: deal edit, add-on, delivery, completion

```mermaid
flowchart TD
    subgraph Edit[Edit a project item while BOOKED]
      E1[Owner edits or removes a selection item] --> E2{Group has picks above the new value, or is not OPEN?}
      E2 -->|Yes| E3[Refused with current usage]
      E2 -->|No| E4[Group follows the item]
    end
    subgraph Addon[Add-on]
      A1[Owner creates DRAFT add-on] --> A2{Approve?}
      A2 -->|Cancel draft| A3[CANCELLED]
      A2 -->|Approve| A4{Target group OPEN or SUBMITTED?}
      A4 -->|No| A5[Refused]
      A4 -->|Yes| A6[APPROVED, extraLimit up, SUBMITTED group back to OPEN, actor + time, no invoice until F-14]
      A6 --> A7{Cancel later?}
      A7 -->|Limit would drop below usage| A8[Refused with usage]
      A7 -->|Safe| A9[CANCELLED, extraLimit down]
    end
    subgraph Deliver[Final delivery and completion]
      D1[Owner publishes final delivery] --> D2{Gallery PUBLISHED, finished file synced, status BOOKED, SHOOTING or POST_PROCESSING?}
      D2 -->|No| D3[Refused with reason]
      D2 -->|Yes| D4[Record publishedAt, project DELIVERED, one transaction]
      D4 --> D5[Owner marks complete, confirm] --> D6[COMPLETED, actor + time]
    end
```

## Notes
- The gate checks availability before the session, so a stale session on an expired gallery gets the neutral page, not the password screen.
- Rate-limit order: unknown-token limit, then lookup, then password-attempt limit, then the hash check.
- Link rotation (flow 4 of the spec) is a single action with no branches; it is in the sequence diagram.
