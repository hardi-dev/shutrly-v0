#!/usr/bin/env bash
# Shows the named test Owner kept in the local, git-ignored test env file (never in the repo).
# Usage: scripts/dev/show-test-owner.sh [--reveal]   (the password is masked without --reveal)
set -euo pipefail

root="$(cd "$(git rev-parse --git-common-dir)/.." && pwd)"
file="${ENV_TEST_FILE:-$root/.env.test}"
if [[ ! -f "$file" ]]; then
  echo "No test env file at $file" >&2
  exit 1
fi

read_key() { grep -E "^$1=" "$file" | tail -n 1 | cut -d= -f2-; }
email="$(read_key TEST_OWNER_EMAIL)"
password="$(read_key TEST_OWNER_PASSWORD)"
if [[ -z "$email" || -z "$password" ]]; then
  echo "TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD are not set in $file" >&2
  exit 1
fi

echo "file:     $file"
echo "email:    $email"
if [[ "${1:-}" == "--reveal" ]]; then
  echo "password: $password"
else
  echo "password: ${password:0:2}$(printf '%*s' $((${#password} - 2)) '' | tr ' ' '*')  (run with --reveal to show it)"
fi
