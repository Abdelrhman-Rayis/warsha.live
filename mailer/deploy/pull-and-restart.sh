#!/usr/bin/env bash
# Pull latest from main and restart the service.
#
# IMPORTANT: per the warsha.live Project Guide, the DigitalOcean Web
# Console swallows output from scripts invoked with `bash`. Prefer the
# inline commands documented in mailer/OPERATIONS.md when running in the
# DO Console. This script is provided for SSH/local use.
#
# Usage (NOT in DO Console):
#   ./pull-and-restart.sh

set -euo pipefail
cd /var/www/learning-platform

echo "Stashing any runtime mutations (workshops.json) ..."
git stash --include-untracked || true

echo "git pull..."
git pull origin main

echo "Restoring runtime mutations ..."
git stash pop || true

# Install only if package.json changed in this pull.
if git diff --name-only HEAD@{1} HEAD | grep -q '^package\(-lock\)\?\.json$'; then
  echo "package.json changed — running npm install --omit=dev"
  npm install --omit=dev
fi

echo "Restarting learning-platform.service..."
systemctl restart learning-platform.service
sleep 1
systemctl status learning-platform.service --no-pager | head -15
echo ""
echo "Tail logs:"
journalctl -u learning-platform.service -n 20 --no-pager
