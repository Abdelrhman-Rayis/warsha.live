#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 user@server-ip-or-host"
  exit 1
fi

TARGET="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

ssh "${TARGET}" "mkdir -p /var/www/learning-platform"

rsync -avz \
  --delete \
  --exclude '.DS_Store' \
  --exclude 'node_modules' \
  --exclude '.git' \
  "${PROJECT_DIR}/" "${TARGET}:/var/www/learning-platform/"

echo
echo "Project synced to ${TARGET}:/var/www/learning-platform"
echo "Then SSH into the server and run:"
echo "  DOMAIN=yourdomain.com bash /var/www/learning-platform/deploy/setup-server.sh"
