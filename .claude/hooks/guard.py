#!/usr/bin/env python3
"""PreToolUse guard for the AGENTS.md hard stops. Exit 2 blocks and tells Claude why."""
import json
import re
import sys

data = json.load(sys.stdin)
tool = data.get("tool_name", "")
inp = data.get("tool_input", {})


def block(reason):
    print(f"Blocked by .claude/hooks/guard.py: {reason}", file=sys.stderr)
    sys.exit(2)


PEN = re.compile(r"\.pen\b")
PEN_READERS = re.compile(
    r"\b(cat|less|more|head|tail|sed|awk|grep|rg|strings|xxd|od|hexdump|cp|mv|tee|vim?|nano)\b[^|;&]*\.pen\b"
)
SECRET_FILES = re.compile(r"(^|[\s/'\"])(\.dev\.vars[\w.]*|\.env(?!\.example\b)[\w.]*)(\s|$|['\"])")

if tool in ("Read", "Edit", "Write", "NotebookEdit", "Grep", "Glob"):
    target = inp.get("file_path") or inp.get("path") or inp.get("notebook_path") or ""
    if PEN.search(target):
        block(".pen files are encrypted and may only be touched through the Pencil MCP tools (AGENTS.md hard stop).")

if tool == "Bash":
    cmd = inp.get("command", "")
    if PEN_READERS.search(cmd):
        block(".pen files may only be read or edited through the Pencil MCP tools (AGENTS.md hard stop).")
    if re.search(r"\bgit\s+(add|commit)\b", cmd) and SECRET_FILES.search(cmd):
        block("never commit .dev.vars or .env* files (AGENTS.md hard stop).")
    if re.search(r"(db:migrate|drizzle-kit\s+migrate)", cmd) and re.search(r"\bprod(uction)?\b", cmd, re.I):
        block("never run db:migrate against production; development uses the non-production database from .dev.vars (AGENTS.md hard stop).")

sys.exit(0)
