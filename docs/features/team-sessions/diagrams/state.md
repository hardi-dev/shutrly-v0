# F-08 Team — State Model

The images are rendered from the Mermaid sources below them. After you edit a source, save it to a `.mmd` file and render it again with `npx -y @mermaid-js/mermaid-cli@11 -i <name>.mmd -o img/<name>.svg -b white`.

## Assignment (BR-TEAM-006, BR-TEAM-007)

![Assignment state diagram](img/state-assignment.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
stateDiagram-v2
    [*] --> Unpaid: Tambah penugasan (project not CANCELLED)

    Unpaid --> Unpaid: Ubah member / role / fee (project not CANCELLED)
    Unpaid --> Paid: Tandai dibayar (paidOn ≤ today)
    Paid --> Unpaid: Batalkan pembayaran (clears paidOn)

    Unpaid --> [*]: Hapus (project not CANCELLED)
    Unpaid --> [*]: Session or draft project deleted (cascade)

    note right of Paid
        Locked: no edit, no remove.
        Blocks deleting its session
        and its draft project.
    end note
```

</details>

Paying and undoing a payment are allowed in every project status, `CANCELLED` included. A project's status never changes because of an assignment, and an assignment's state never changes because of the project's status (BR-PRJ-006). Sessions have no state of their own (BR-TEAM-002).

## Team member (BR-TEAM-004)

![Team member state diagram](img/state-member.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
stateDiagram-v2
    [*] --> Active: Tambah anggota
    Active --> Active: Ubah
    Active --> Archived: Arsipkan
    Archived --> Active: Pulihkan / undo toast
    Archived --> Archived: Ubah
    Active --> [*]: Hapus (no assignments)
    Archived --> [*]: Hapus (no assignments)
```

</details>

Only `Active` members can be picked for a new assignment, or put on an existing one. An archived member keeps their assignments, and those can still be paid and edited, fee only (BR-TEAM-006).

## Role (BR-TEAM-005)

A role has no lifecycle beyond being created, renamed and deleted while unused, so it has no diagram.
