<p align="center">
  <img src="assets/rama-copywriting-hero.webp" alt="Prabu Rama in Javanese wayang kulit style drawing a bow beside the rama-copywriting title" width="100%">
</p>

<h1 align="center">rama-copywriting</h1>

<p align="center">
  Evidence-informed copy for humans, written by agents.<br>
  Bahasa Indonesia + English · ads · landing pages · audits · transcreation
</p>

<p align="center">
  <a href="https://agentskills.io/specification"><img alt="Agent Skills open format" src="https://img.shields.io/badge/Agent%20Skills-open%20format-111827?style=flat-square"></a>
  <a href="LICENSE"><img alt="Apache-2.0 license" src="https://img.shields.io/badge/license-Apache--2.0-E34F26?style=flat-square"></a>
  <a href="#install"><img alt="Codex, Claude, Hermes, OpenClaw, and Pi" src="https://img.shields.io/badge/agents-Codex%20%7C%20Claude%20%7C%20Hermes%20%7C%20OpenClaw%20%7C%20Pi-7C3AED?style=flat-square"></a>
  <a href="references/language-id-en.md"><img alt="Bahasa Indonesia and English" src="https://img.shields.io/badge/languages-Bahasa%20Indonesia%20%2B%20English-0057B8?style=flat-square"></a>
  <a href="references/anti-slop.md"><img alt="Contextual anti-AI-slop editing" src="https://img.shields.io/badge/AI%20slop-contextual%20lint-F59E0B?style=flat-square"></a>
  <a href="#contributing"><img alt="Pull requests welcome" src="https://img.shields.io/badge/PRs-welcome-2EA44F?style=flat-square"></a>
</p>

An evidence-informed Agent Skill for writing, rewriting, auditing, and transcreating advertising copy in Indonesian and English.

It helps an agent turn product facts and customer context into clear copy without fabricating proof, forcing a copywriting formula, or falling into generic AI phrasing. It covers customer psychology, claims, voice, Indonesian and English register, code-switching, emoji, channel adaptation, accessibility, ethics, and test design.

## What makes it different

- Indonesian is treated as a first-class writing language, not a literal translation target.
- English localization distinguishes locale, global English, and brand voice.
- Anti-slop editing uses contextual patterns rather than a word blacklist or AI detector.
- Emoji decisions account for relationship, valence, professionalism, rendering, and accessibility.
- Psychology findings are labeled by strength and boundary; AIDA, PAS, scarcity, loss framing, and “power words” are not presented as universal laws.
- A claim ledger prevents invented statistics, testimonials, rankings, savings, urgency, and guarantees.
- The package follows the open Agent Skills format and has no runtime dependency, executable script, telemetry, or GitHub Actions workflow.

The research basis and caveats live in [psychology-and-evidence.md](references/psychology-and-evidence.md). Language, anti-slop, emoji, channel, and worked examples are loaded only when a task needs them.

## Install

### Codex, Pi, and OpenClaw

Current versions of these clients can discover personal skills under `~/.agents/skills`:

```bash
git clone https://github.com/RamaAditya49/rama-copywriting.git \
  ~/.agents/skills/rama-copywriting
```

For an older Codex release that only scans the legacy path, clone to `~/.codex/skills/rama-copywriting` instead.

Invoke it with `$rama-copywriting` in Codex, `/skill:rama-copywriting` in Pi, `/rama-copywriting` in OpenClaw, or ask naturally for the skill.

### Claude Code

```bash
git clone https://github.com/RamaAditya49/rama-copywriting.git \
  ~/.claude/skills/rama-copywriting
```

Invoke it with `/rama-copywriting` or let Claude load it from a matching request.

### Hermes Agent

```bash
git clone https://github.com/RamaAditya49/rama-copywriting.git \
  ~/.hermes/skills/marketing/rama-copywriting
```

Start a new session, then invoke `/rama-copywriting`. Hermes can also select it from a natural request.

### Claude.ai

Create a ZIP whose outer folder is named `rama-copywriting`, then upload it from **Customize → Skills**:

```bash
git clone https://github.com/RamaAditya49/rama-copywriting.git
zip -r rama-copywriting.zip rama-copywriting \
  -x 'rama-copywriting/.git/*'
```

GitHub’s automatic source ZIP uses a `-main` suffix, so make the upload ZIP manually when the client requires the folder name to match the skill name.

### Any other agent

Copy or clone this repository into the client’s Agent Skills directory. For an agent without a native skill loader, use:

```text
Read and follow rama-copywriting/SKILL.md.
Load only the referenced files needed for this task.

Task: [your request]
```

## Use

Indonesian paid-social example:

```text
Gunakan $rama-copywriting.
Buat iklan Meta untuk software rekonsiliasi invoice.
Audiens: tim finance bisnis jasa di Indonesia.
Fakta yang boleh dipakai: [facts].
Tujuan: trial yang menghubungkan rekening bank.
Bahasa: Indonesia netral, tanpa emoji.
```

English audit example:

```text
Use $rama-copywriting to audit this landing-page hero for unsupported claims,
AI slop, voice mismatch, and CTA friction. Return the exact issue and rewrite.

[copy]
```

Transcreation example:

```text
Use $rama-copywriting to transcreate this en-US ad into natural id-ID.
Preserve the promise, evidence, terms, and CTA. Use kami/Anda and only retain
English product terms that Indonesian finance teams actually use.

[source copy and verified facts]
```

Better inputs produce better copy. Include the audience’s situation, offer and terms, product mechanism, publishable proof, channel, locale, voice samples, prohibited claims, and one desired action when available.

## Structure

```text
rama-copywriting/
├── assets/
│   └── rama-copywriting-hero.webp
├── SKILL.md
├── README.md
├── LICENSE
├── agents/
│   └── openai.yaml
└── references/
    ├── anti-slop.md
    ├── emoji-and-channels.md
    ├── examples.md
    ├── language-id-en.md
    └── psychology-and-evidence.md
```

`SKILL.md` is the portable source of truth. `agents/openai.yaml` adds optional Codex UI metadata; other clients can ignore it.

Format and discovery references: [Agent Skills specification](https://agentskills.io/specification), [Codex](https://developers.openai.com/codex/skills/), [Claude Code](https://code.claude.com/docs/en/skills), [OpenClaw](https://docs.openclaw.ai/tools/skills), [Hermes Agent](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/guides/work-with-skills.md), and [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md).

## Evidence and responsibility

This skill synthesizes research and official guidance but cannot promise that a line of copy will convert. Run randomized tests against a control and measure the closest business outcome available. Recheck current platform policies and applicable law before publishing, especially for regulated products or sensitive audiences.

Examples in this repository are original and fictional. Do not publish their product facts as if they were real.

## Contributing

Open an issue or pull request with the customer context, proposed rule, evidence, boundary condition, and a before/after example. Avoid unsupported “always works” claims and copyrighted swipe-file copies.

## License

Apache-2.0. See [LICENSE](LICENSE).
