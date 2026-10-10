#!/usr/bin/env bash
# Runs `pnpm db:seed` against Netlify staging with the site's own branch-deploy variables, read into
# this process's environment only (never written to a file or printed). Run it yourself; it needs
# a logged-in Netlify CLI and the linked site in .netlify/.
#
# Usage: scripts/dev/seed-staging.sh <owner-email> [final-drive-folder-link]
#   credentials go to .env.seed.staging-<name part of the email> (git-ignored, mode 600)
set -euo pipefail

OWNER_EMAIL="${1:?usage: scripts/dev/seed-staging.sh <owner-email> [final-drive-folder-link]}"
FINAL_FOLDER="${2:-}"
CLI="netlify-cli@27.11.0"
KEYS=(DATABASE_URL GALLERY_PASSWORD_KEY GOOGLE_DRIVE_API_KEY BETTER_AUTH_SECRET BETTER_AUTH_URL
  GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET APP_STAGE)

for key in "${KEYS[@]}"; do
  value="$(npx --yes "${CLI}" env:get "${key}" --context branch-deploy 2>/dev/null | tail -n 1)"
  [ -n "${value}" ] || { echo "${key} is empty in the branch-deploy context" >&2; exit 1; }
  export "${key}=${value}"
done
[ "${APP_STAGE}" != "production" ] || { echo "APP_STAGE is production; refusing" >&2; exit 1; }
echo "Staging: ${BETTER_AUTH_URL}, database $(sed -E 's#.*@([^/:]+).*#\1#' <<<"${DATABASE_URL}")"

export SEED_ENV_FILE=/dev/null
export SEED_OWNER_EMAIL="${OWNER_EMAIL}"
export SEED_CREDENTIALS_FILE=".env.seed.staging-${OWNER_EMAIL%%@*}"
[ -z "${FINAL_FOLDER}" ] || export SEED_FINAL_DRIVE_FOLDER="${FINAL_FOLDER}"
pnpm db:seed
