# F-08 Team — Activity

The images are rendered from the Mermaid sources below them. After you edit a source, save it to a `.mmd` file and render it again with `npx -y @mermaid-js/mermaid-cli@11 -i <name>.mmd -o img/<name>.svg -b white`.

## Add or remove an assignment (BR-TEAM-006)

Assignments are never edited: to change the role, remove and add again. The form only offers valid choices. The server checks everything again on save (C-004).

![Save an assignment activity diagram](img/activity-save-assignment.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TD
    A0{Session has a team?} -- no --> A1[user-plus or ⋯ › Tambah tim] --> C
    A0 -- yes --> A2[Avatar group or ⋯ › Atur tim] --> B[Atur tim › Tambah anggota] --> C
    C[Penugasan form: pick member and role, then save]
    C --> J[Server: verify workspace, lock project row]
    J --> K{Project CANCELLED?}
    K -- yes --> X1[Proyek dibatalkan, tim tidak bisa diubah.]
    K -- no --> L{Session belongs to the project?}
    L -- no --> X2[not found]
    L -- yes --> N{Member active, not on the session yet, holds the role?}
    N -- no --> X3[Form error, nothing saved]
    N -- yes --> R[Store the assignment, toast]
    R --> U[Unique index on session and member backs the duplicate check]
    V[Atur tim › trash-2 on a row, confirm] --> W[Server: lock project row, not CANCELLED] --> Z[Delete the assignment, toast]
    Z --> Z1{Last assignment of the session?}
    Z1 -- yes --> Z2[Close Atur tim; session shows user-plus]
    Z1 -- no --> Z3[Atur tim stays open]
```

</details>

## Delete a session or a draft project (BR-TEAM-006, BR-TEAM-003, BR-PRJ-010)

![Delete a session or draft activity diagram](img/activity-delete-session-or-draft.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TD
    A[Owner selects Hapus sesi or Hapus draf] --> B{Any assignments?}
    B -- none --> C[F-07 confirmation as is]
    B -- yes --> D[Confirmation adds the team count: Penugasan ikut terhapus]
    C & D --> E[Server: lock project row]
    E --> F{"Session: last one of a BOOKED-or-later project?"}
    F -- yes --> X1[Blocked, F-07 hint]
    F -- no --> H[Delete with its assignments, toast; members stay in Tim]
```

</details>
