#!/usr/bin/env python3
"""Generate Codex skills from the Claude Code sdv commands.

Codex has no custom slash commands; it loads skills from .agents/skills and a
user runs one with `$name`. Each .claude/commands/sdv/<cmd>.md becomes
.agents/skills/sdv-<cmd>/ so `$sdv-<cmd>` does what `/sdv:<cmd>` does.
The command files stay the single source of truth: edit them, then rerun this.

    python3 scripts/sdv/sync-codex-skills.py          # write
    python3 scripts/sdv/sync-codex-skills.py --check  # exit 1 if out of date
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / ".claude" / "commands" / "sdv"
DST = ROOT / ".agents" / "skills"
MARK = "<!-- generated from .claude/commands/sdv/{cmd}.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->"


def parse(text):
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    meta = {}
    for line in m.group(1).splitlines():
        k, _, v = line.partition(":")
        meta[k.strip()] = v.strip().strip('"')
    return meta, m.group(2).lstrip("\n")


def render(cmd, meta, body):
    body = re.sub(r"/sdv:([a-z][a-z-]*)", r"$sdv-\1", body)
    hint = meta.get("argument-hint", "")
    args = (
        f"Arguments: whatever the user wrote after `$sdv-{cmd}` (expected: `{hint}`). "
        "Wherever the steps below say `$ARGUMENTS`, use that text.\n\n"
        if hint
        else ""
    )
    desc = meta["description"].replace('"', "'")
    return (
        f'---\nname: sdv-{cmd}\ndescription: "{desc}. Explicit use only: run when the user mentions $sdv-{cmd}."\n---\n\n'
        f"{MARK.format(cmd=cmd)}\n\n{args}{body}"
    )


def openai_yaml(cmd, meta):
    short = meta["description"].replace('"', "'")
    return (
        "interface:\n"
        f'  display_name: "sdv {cmd}"\n'
        f'  short_description: "{short}"\n'
        "policy:\n"
        "  allow_implicit_invocation: false\n"
    )


def main():
    check = "--check" in sys.argv
    want = {}
    for f in sorted(SRC.glob("*.md")):
        cmd = f.stem
        meta, body = parse(f.read_text())
        d = DST / f"sdv-{cmd}"
        want[d / "SKILL.md"] = render(cmd, meta, body)
        want[d / "agents" / "openai.yaml"] = openai_yaml(cmd, meta)

    stale = [p for p, c in want.items() if not p.exists() or p.read_text() != c]
    orphans = [
        d for d in DST.glob("sdv-*")
        if d.is_dir() and not d.is_symlink() and (d / "SKILL.md").exists()
        and (d / "SKILL.md").read_text().find("generated from .claude/commands/sdv/") != -1
        and d / "SKILL.md" not in want
    ]
    if check:
        for p in stale:
            print(f"out of date: {p.relative_to(ROOT)}")
        for d in orphans:
            print(f"orphan: {d.relative_to(ROOT)}")
        sys.exit(1 if stale or orphans else 0)

    for p in stale:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(want[p])
    for d in orphans:
        shutil.rmtree(d)
    print(f"{len(want) // 2} skills in .agents/skills ({len(stale)} files written, {len(orphans)} removed)")


main()
