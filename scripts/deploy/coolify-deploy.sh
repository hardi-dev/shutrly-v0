#!/usr/bin/env bash
# Builds the production image from origin/main and deploys it to Coolify (server 1).
# Usage: scripts/deploy/coolify-deploy.sh [--yes]
# Needs: docker (logged in to ghcr.io), ~/shutrly-secrets/coolify.token (Write + Deploy token).
# Runbook: docs/operations/production-runbook.md (sections 2.4 and 3).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
IMAGE="ghcr.io/hardi-dev/shutrly"
APP_UUID="paj7d979xt4ubruq6uuskwss"
COOLIFY="https://56.hardi.website/api/v1"
TOKEN_FILE="$HOME/shutrly-secrets/coolify.token"
YES=0
[ "${1:-}" = "--yes" ] && YES=1

cd "$REPO"
git fetch origin --quiet
TAG="main-$(git rev-parse --short=8 origin/main)"
echo "Image: $IMAGE:$TAG (built from origin/main)"

if [ "$YES" -ne 1 ]; then
  read -r -p "Deploy $TAG to production (shutrly.space)? [y/N] " answer
  [ "$answer" = "y" ] || { echo "cancelled"; exit 1; }
fi

WORK="$(mktemp -d "${TMPDIR:-/tmp}/shutrly-build-XXXXXX")"
trap 'git -C "$REPO" worktree remove --force "$WORK" >/dev/null 2>&1 || rm -rf "$WORK"' EXIT
git worktree add --detach "$WORK" origin/main >/dev/null
(cd "$WORK" && docker buildx build --platform linux/arm64 --load -t "$IMAGE:$TAG" .)
docker push "$IMAGE:$TAG"

TOKEN="$(tr -d '\r\n' < "$TOKEN_FILE")"
api() { curl -sS -f -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" -H "Content-Type: application/json" "$@"; }

api -X PATCH -d "{\"docker_registry_image_tag\":\"$TAG\"}" "$COOLIFY/applications/$APP_UUID" >/dev/null
DEP="$(api -X POST "$COOLIFY/applications/$APP_UUID/start" | python3 -c 'import json,sys; print(json.load(sys.stdin)["deployment_uuid"])')"
echo "Coolify deployment: $DEP"

status=""
for _ in $(seq 1 60); do
  status="$(api "$COOLIFY/deployments/$DEP" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("status", ""))')"
  case "$status" in
    finished) break ;;
    failed|cancelled-by-user) echo "deployment $status"; exit 1 ;;
  esac
  sleep 10
done
echo "deployment status: $status"

code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 https://shutrly.space/)"
echo "https://shutrly.space/ -> $code"
