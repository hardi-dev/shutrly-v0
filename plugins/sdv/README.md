# Spec-Driven Vibe Coding Skill

A provider-neutral Agent Skill for running a progressive software workflow:

**Idea → Product → Domain → Stack → Constitution/Coding Rules → Feature Spec → UML → Pencil → Technical Design → Build → Verify → Ship**

The package includes one `SKILL.md`, reusable templates, a hotel-booking example, a workflow reference, and an optional bootstrap script.

## Layout

```text
spec-driven-vibe-coding/
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── commands/                 # /sdv:* slash commands (Claude Code)
│   ├── init-project.md  discover-feature.md  model-feature.md  design-feature.md
│   ├── plan-feature.md  build-feature.md    verify-feature.md ship.md
│   └── help.md design-tokens.md design-system.md save-design-system.md design-rules.md sync-pencil.md verify-design-system.md
├── skills/
│   ├── spec-driven-vibe-coding/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── assets/
│   │   └── scripts/bootstrap_docs.py
│   └── sdv-design-tokens-system/
│       ├── SKILL.md
│       ├── references/        # token-architecture, pen-dev-mapping, pencil-canvas-builders
│       ├── assets/templates/  # exploration.pen, library.lib.pen (Forma DEMO token canvas, boards 00–08),
│       │                      # feature-consumer.pen, tokens.json, pencil-mapping.json, pencil-variables.json,
│       │                      # token-usage.md, component-spec.md, verification-report.md
│       └── scripts/           # validate_tokens.py, tokens_to_pencil.py
└── README.md
```

The package also includes `skills/sdv-design-tokens-system/`, which guides Pencil-first exploration, approved `.lib.pen` design libraries, DTCG-compatible repository token interchange, themes, and reusable components. Its bundled `.pen` templates can be copied into a project; users do not need to create blank Pencil files manually.

## Claude Code

This archive includes a Claude plugin manifest and a skill at:

`skills/spec-driven-vibe-coding/SKILL.md`

If your Claude Code setup uses repository/user skill directories rather than plugin archives, copy the `spec-driven-vibe-coding` skill directory (the directory containing `SKILL.md`) into the skills directory supported by your Claude Code version.

### Slash commands

The plugin is named `sdv`, so Claude Code namespaces its commands with that prefix and they never collide with other plugins or skills (e.g. gstack's `/ship`):

```text
/sdv:init-project [idea]
/sdv:discover-feature <slug>
/sdv:model-feature <slug>
/sdv:design-feature <slug>
/sdv:plan-feature <slug>
/sdv:build-feature <slug> [iteration]
/sdv:verify-feature <slug>
/sdv:ship [name]
/sdv:help [project, feature, or question]
/sdv:design-tokens [path]
/sdv:design-system <pencil-file> [preferences]
/sdv:save-design-system <exploration.pen> [tokens | canvas | components]
/sdv:design-rules [design-system.lib.pen] [approve]
/sdv:sync-pencil <pencil-file> [token-path]
/sdv:verify-design-system <pencil-file> [token-path]
```

The original feature commands load `spec-driven-vibe-coding`; the design-system commands load `sdv-design-tokens-system`. The original skill can still be invoked directly as `/sdv:spec-driven-vibe-coding`.

## Codex / OpenAI

The archive is a Codex plugin. Its `.codex-plugin/plugin.json` contains the Codex manifest and the
plugin exposes the two skills under `skills/`:

- `spec-driven-vibe-coding` for the product → domain → design → plan → build → verify → ship workflow.
- `sdv-design-tokens-system` for Pencil exploration, tokens, design-system libraries, and visual verification.

Install the archive through Codex's plugin UI or plugin CLI. After installation, invoke a skill by
name in the composer, for example:

```text
Use spec-driven-vibe-coding to bootstrap this project.
Use sdv-design-tokens-system to review the design tokens in this repository.
```

The files in `commands/` are reusable workflow prompt references. They preserve the original Claude
slash-command experience, but are not required for Codex skill discovery.

## Start a project

Ask the agent to use the skill and run the `/init-project` workflow conceptually, or bootstrap starter docs:

```bash
python skills/spec-driven-vibe-coding/scripts/bootstrap_docs.py .
```

The script does not overwrite existing files unless `--force` is supplied.

## Recommended usage

Examples:

- "Use spec-driven-vibe-coding to bootstrap this project."
- "Discover and specify the hotel booking feature."
- "Model this feature before UI design."
- "Review this Pencil design for spec gaps."
- "Plan the feature implementation."
- "Build iteration 1 only."
- "Verify this feature against its spec and design."

## Design integration

Pencil is the visual source of truth for composition and component appearance. For design-system values, repository token files are canonical; record the Pencil project/file/version in the feature's `design.md`.

For design-system values, `sdv-design-tokens-system` uses Pencil as the exploration surface first. After explicit user approval of the visual direction and expanded token set, the flow is:

persist tokens (`tokens.json` is canonical, then `tokens_to_pencil.py`, then Pencil variables, with a checksum check) → token canvas (library boards 00–06) → usage/spacing rules (`token-usage.md`, boards 07/08) → approve rules → build reusable library components → verify.

MCP edits count only after the file is saved in Pen (⌘S) and its size/mtime change is confirmed. Open files with `open -a Pen <absolute-path-to-file.pen>` and use Pencil MCP for all design inspection and modification; the `pen` CLI is not used for design content or synchronization.

## Philosophy

The package intentionally avoids forcing the agent to read every document before every edit. It loads only the context relevant to the current change while preserving an explicit authority hierarchy.
