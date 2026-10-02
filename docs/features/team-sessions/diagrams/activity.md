# F-08 Team — Activity

The images are rendered from the Mermaid sources below them. After you edit a source, save it to a `.mmd` file and render it again with `npx -y @mermaid-js/mermaid-cli@11 -i <name>.mmd -o img/<name>.svg -b white`.

## Save an assignment (BR-TEAM-006)

The prefill runs in the form. The server re-checks everything on save (C-004).

![Save an assignment activity diagram](img/activity-save-assignment.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TD
    A[Owner picks a member in the Penugasan form] --> B{Member has a rate?}
    B -- no --> E[Fee empty: Isi honor secara manual]
    B -- yes --> C{Unit}
    C -- SESSION / DAY --> F[Fee = rate]
    C -- HOUR / MINUTE --> D{Session has start and end?}
    D -- no --> E
    D -- yes, HOUR --> G["Fee = rate × ceil(minutes / 60)"]
    D -- yes, MINUTE --> H[Fee = rate × minutes]
    E & F & G & H --> I[Owner may change role and fee, then saves]

    I --> J[Server: verify workspace, lock project row]
    J --> K{Project CANCELLED?}
    K -- yes --> X1[Proyek dibatalkan; tim tidak bisa diubah.]
    K -- no --> L{Session belongs to the project?}
    L -- no --> X2[not found]
    L -- yes --> M{Adding, or member/role changed?}
    M -- "edit, fee only" --> P
    M -- yes --> N{Member active, not on session yet, holds the role?}
    N -- no --> X3[Form error, nothing saved]
    N -- yes --> P{Editing a PAID assignment?}
    P -- yes --> X4[Honor sudah ditandai dibayar]
    P -- no --> Q{Fee whole IDR ≥ 0?}
    Q -- no --> X5[Field error]
    Q -- yes --> R[Store the UNPAID assignment, toast]
```

</details>

## Delete a session or a draft project (BR-TEAM-006, BR-TEAM-003, BR-PRJ-010)

![Delete a session or draft activity diagram](img/activity-delete-session-or-draft.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TD
    A[Owner selects Hapus on a session or Hapus draf] --> B{Any assignments?}
    B -- none --> C[F-07 confirmation as is]
    B -- unpaid only --> D[Confirmation names the team that will be removed]
    C & D --> E[Server: lock project row]
    E --> F{"Session: last one of a BOOKED-or-later project?"}
    F -- yes --> X1[Blocked, F-07 hint]
    F -- no --> G{Any PAID assignment in scope?}
    G -- yes --> X2[Ada honor yang sudah dibayar di sesi ini.]
    G -- no --> H[Delete with its unpaid assignments, toast]
    B -- some paid --> I[Hapus shown, server still decides] --> E
```

</details>

The UI can't know about a payment made in another tab, so the paid check always runs on the server under the lock.
