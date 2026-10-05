#!/usr/bin/env bash
# Builds and deploys to Netlify (ADR-020).
# Usage: scripts/deploy/netlify-deploy.sh <staging|prod> [--yes] [--dry-run]
#   staging  draft deploy with the stable alias  https://staging--<site>.netlify.app
#   prod     deploy to the site's main URL; only from a clean, up-to-date `main`, and it asks first
# The site comes from the linked project (`netlify init`, stored in the git-ignored .netlify/).
set -euo pipefail

CLI="netlify-cli@27.11.0"
target="${1:-}"
shift || true
assume_yes=false
dry_run=false
for arg in "$@"; do
  case "$arg" in
    --yes) assume_yes=true ;;
    --dry-run) dry_run=true ;;
    --) ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean; commit or stash first (a deploy builds what is on disk)." >&2
  exit 1
fi

case "$target" in
  staging) args=(deploy --build --alias staging) ;;
  prod)
    if [[ "$branch" != "main" ]]; then
      echo "Production deploys only from main (current branch: $branch)." >&2
      exit 1
    fi
    git fetch -q origin main
    if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
      echo "Local main differs from origin/main; pull or push first." >&2
      exit 1
    fi
    args=(deploy --build --prod)
    ;;
  *) echo "Usage: $0 <staging|prod> [--yes] [--dry-run]" >&2; exit 2 ;;
esac

echo "Deploy target: $target (branch $branch, commit $(git rev-parse --short HEAD))"
echo "Command: npx --yes $CLI ${args[*]}"
if $dry_run; then exit 0; fi

if [[ "$target" == "prod" ]] && ! $assume_yes; then
  read -r -p "Deploy to the PRODUCTION URL? [y/N] " answer
  [[ "$answer" == "y" || "$answer" == "Y" ]] || { echo "Cancelled."; exit 1; }
fi

exec npx --yes "$CLI" "${args[@]}"
