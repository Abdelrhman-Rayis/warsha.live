#!/usr/bin/env bash
# Schedule a one-shot newsletter send on the DigitalOcean droplet.
#
# IMPORTANT: per the warsha.live Project Guide, the DigitalOcean Web
# Console swallows output from scripts invoked with `bash`. In the DO
# Console, prefer the inline `at ... <<EOF ... EOF` block documented in
# mailer/OPERATIONS.md (section 2). This script is provided for
# SSH/local use, or for advanced users who source it directly.
#
# Usage (NOT in DO Console):
#   ./schedule-send.sh 001 "tomorrow 08:00"
#
# Arguments:
#   $1  issue number, e.g. 001
#   $2  send time in "YYYY-MM-DD HH:MM" UTC. Default: tomorrow 08:00 UTC = 11:00 AST.
#
# Behavior:
#   - Validates RESEND_API_KEY is set (from systemd override or shell).
#   - Sanity-checks the issue file exists.
#   - Schedules the send via 'at' so the droplet handles it even if no one
#     is logged in.
#   - Writes a runlog under /var/log/warsha-newsletter/.

set -euo pipefail

ISSUE="${1:-}"
WHEN="${2:-tomorrow 08:00}"

if [[ -z "$ISSUE" ]]; then
  echo "Usage: $0 <issue-number> [\"YYYY-MM-DD HH:MM\" UTC]"
  exit 1
fi

PROJECT_DIR="/var/www/learning-platform"
ISSUE_FILE="$PROJECT_DIR/mailer/issues/issue-${ISSUE}.json"
if [[ ! -f "$ISSUE_FILE" ]]; then
  echo "Issue config not found: $ISSUE_FILE"
  echo "Did you run 'git pull --ff-only origin main' first?"
  exit 1
fi

# Require RESEND_API_KEY. Read from the systemd env file if not in the shell.
if [[ -z "${RESEND_API_KEY:-}" ]]; then
  OVERRIDE="/etc/systemd/system/learning-platform.service.d/override.conf"
  if [[ -f "$OVERRIDE" ]]; then
    key="$(grep -E '^Environment=RESEND_API_KEY=' "$OVERRIDE" | head -n1 | sed 's/^Environment=RESEND_API_KEY=//')"
    if [[ -n "$key" ]]; then
      export RESEND_API_KEY="$key"
      echo "Loaded RESEND_API_KEY from systemd override."
    fi
  fi
fi
if [[ -z "${RESEND_API_KEY:-}" ]]; then
  echo "RESEND_API_KEY is not set. Add it to systemd override:"
  echo "  systemctl edit learning-platform.service"
  echo "  -> Environment=RESEND_API_KEY=re_..."
  exit 1
fi

# Check 'at' is installed
if ! command -v at >/dev/null 2>&1; then
  echo "'at' is not installed. Installing..."
  apt-get install -y at
  systemctl enable --now atd
fi

LOG_DIR="/var/log/warsha-newsletter"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/issue-${ISSUE}-$(date -u +%Y%m%dT%H%M%SZ).log"

echo "Scheduling Issue #${ISSUE} send at ${WHEN} UTC..."
echo "Log will be at: $LOG_FILE"
echo ""

# Schedule via 'at'. The job inherits RESEND_API_KEY from our env.
at "$(date -u -d "$WHEN" '+%H:%M %Y-%m-%d')" <<EOF
export RESEND_API_KEY='${RESEND_API_KEY}'
cd $PROJECT_DIR
node mailer/send-newsletter.js --issue=${ISSUE} >> $LOG_FILE 2>&1
EOF

echo ""
echo "Pending 'at' jobs:"
atq
echo ""
echo "To inspect a queued job: atq, then  at -c <jobid>"
echo "To cancel:               atrm <jobid>"
echo ""
echo "After it runs you can grep results with:"
echo "  tail -n 50 $LOG_FILE"
echo "  cat $PROJECT_DIR/mailer/logs/issue-${ISSUE}-sent.log   # one line per successful send"
echo "  cat $PROJECT_DIR/mailer/logs/issue-${ISSUE}-failed.log # one line per failure (if any)"
