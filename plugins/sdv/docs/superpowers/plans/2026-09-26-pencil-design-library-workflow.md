# Pencil Design Library Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the SDV design skill and `/sdv:help` so the design workflow explicitly separates provisional exploration files from approved Pencil design libraries and consumer feature files.

**Architecture:** Keep `exploration.pen` as the structured, provisional workspace for mood exploration, observed tokens, and expanded token proposals. After approval, persist variables, themes, primitives, and components into an approved `.lib.pen` source library; feature `.pen` files import that library and consume linked instances. Keep repository token JSON as the interchange and validation representation.

**Tech Stack:** Markdown skill/command instructions, DTCG-compatible JSON templates, Pencil `.pen`/`.lib.pen` workflow conventions.

## Global Constraints

- Never persist provisional exploration values before explicit user approval.
- Never overwrite an existing project `.pen` file without confirmation.
- Preserve Pencil library links for reusable components; do not silently replace them with copied geometry.
- Report `DESIGN TOKEN GAP`, `CONFLICT`, and drift findings explicitly.

---

### Task 1: Update design-system skill lifecycle

**Files:**
- Modify: `skills/sdv-design-tokens-system/SKILL.md`

- [ ] Add the exploration, approval, library, consumer, synchronization, and verification lifecycle.
- [ ] Define `exploration.pen`, `design-system.lib.pen`, and feature consumer `.pen` responsibilities.
- [ ] Preserve the existing token layering and approval constraints.
- [ ] Add Pencil library-specific rules for imports, linked instances, slots, and source updates.

### Task 2: Update `/sdv:help`

**Files:**
- Modify: `commands/help.md`

- [ ] Replace the shortened design-system branch with the complete Pencil-first workflow.
- [ ] Explain the separate exploration, library, and consumer artifacts.
- [ ] Explain the approval boundary and recommended next commands.

### Task 3: Validate the updated package

**Files:**
- Test: `skills/sdv-design-tokens-system/SKILL.md`
- Test: `commands/help.md`

- [ ] Run the bundled skill validator.
- [ ] Validate token JSON and command frontmatter.
- [ ] Check required library lifecycle terms and command references.
- [ ] Review the diff for contradictory source-of-truth instructions.
