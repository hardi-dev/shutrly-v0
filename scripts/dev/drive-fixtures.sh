#!/usr/bin/env bash
# Builds public Google Drive test folders for the gallery cases, by server-side copy of photos from
# the Owner's example folder, then prints one "anyone with the link" URL per case.
#
# Needs rclone with a Drive remote of the Owner's own Google account (rclone config, type "drive",
# scope "drive"); the browser sign-in is done by the Owner, never by an agent.
#
# Usage: scripts/dev/drive-fixtures.sh [remote] [parent]
#   remote  rclone remote name (default gdrive)
#   parent  folder created in My Drive (default "Shutrly fixtures"); re-running reuses it
#   SOURCE_FOLDER_ID  the folder to copy photos from (default: the example folder of SEED_DRIVE_FOLDER)
#
# Cases (folder › what it tests):
#   final        proofs + edited/ + print/   › SEED_FINAL_DRIVE_FOLDER: final delivery, DELIVERED/COMPLETED, F-21 mapping
#   custom-names proofs + "Hasil Edit"/ + "Cetak"/ + "Hari 2/Hasil Edit"/   › F-21 mapping of non-standard and nested names
#   large-print  proofs + print/ with the largest photo   › Netlify 60 s / 20 MB stream limit on a Print download
#   flat         proofs only   › a gallery without final files (final delivery refused)
set -euo pipefail

REMOTE="${1:-gdrive}"
PARENT="${2:-Shutrly fixtures}"
SOURCE_FOLDER_ID="${SOURCE_FOLDER_ID:-1yyis5MpfzQHuJs1DZAE_StzDXC8HEvhC}"
SRC="${REMOTE},root_folder_id=${SOURCE_FOLDER_ID}:"
DST="${REMOTE}:${PARENT}"
# The source is the same account under another root, so copies stay on Google's side.
COPY=(rclone copy --drive-server-side-across-configs --no-traverse)

command -v rclone >/dev/null || { echo "rclone is not installed (brew install rclone)" >&2; exit 1; }
rclone listremotes | grep -qx "${REMOTE}:" || { echo "rclone remote ${REMOTE}: is missing (rclone config)" >&2; exit 1; }

echo "Listing ${SOURCE_FOLDER_ID}"
# Name order for stable picks; size order for the large file.
IMAGES=(--include "*.{jpg,jpeg,JPG,JPEG,png,PNG}")
BY_NAME=()
while IFS= read -r name; do BY_NAME+=("${name}"); done \
  < <(rclone lsf --files-only "${IMAGES[@]}" "${SRC}" | sort)
LARGEST="$(rclone lsf --files-only "${IMAGES[@]}" --format "sp" --separator "|" "${SRC}" | sort -t"|" -k1,1nr | sed -n '1p' | cut -d"|" -f2)"
(( ${#BY_NAME[@]} >= 30 )) || { echo "the source folder needs at least 30 photos, has ${#BY_NAME[@]}" >&2; exit 1; }

# copy_range <dest subpath> <first index> <count>
copy_range() {
  local dest="$1" first="$2" count="$3" list
  list="$(mktemp)"
  printf '%s\n' "${BY_NAME[@]:first:count}" > "${list}"
  "${COPY[@]}" --files-from "${list}" "${SRC}" "${DST}/${dest}"
  rm -f "${list}"
  echo "  ${dest}: ${count} photos"
}

echo "Building ${PARENT}/ on ${REMOTE}:"
copy_range "final" 0 12
copy_range "final/edited" 12 10
copy_range "final/print" 22 5

copy_range "custom-names" 0 8
copy_range "custom-names/Hasil Edit" 8 6
copy_range "custom-names/Cetak" 14 3
copy_range "custom-names/Hari 2/Hasil Edit" 17 4

copy_range "large-print" 0 6
"${COPY[@]}" --include "/${LARGEST}" "${SRC}" "${DST}/large-print/print"
echo "  large-print/print: ${LARGEST} ($(rclone size --json "${DST}/large-print/print" | sed -E 's/.*"bytes":([0-9]+).*/\1/') bytes)"

copy_range "flat" 0 15

echo
echo "Public links (anyone with the link can view):"
for case in final custom-names large-print flat; do
  id="$(rclone link "${DST}/${case}" | sed -E 's/.*[?&]id=([A-Za-z0-9_-]+).*/\1/')"
  printf '  %-13s https://drive.google.com/drive/folders/%s\n' "${case}" "${id}"
done
