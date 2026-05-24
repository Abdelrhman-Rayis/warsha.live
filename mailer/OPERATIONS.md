# Newsletter operations. The only doc you need

This is the single page to open whenever you publish a new issue of
"AI in the Khaleej Classroom" and send it to the list. It covers:

1. Where the server lives and how to reach it.
2. How to update an issue.
3. How to send (one-shot or scheduled).
4. How to recover if something goes wrong.

Cross-references the **warsha.live Project Guide** in your Second-Brain
vault, which is the master spec sheet. This file is the operational
day-to-day; the Project Guide is the architecture reference.

---

## 0. The server, in one place

| Thing | Value |
| :--- | :--- |
| Domain | `warsha.live` |
| Web droplet IP | **`24.144.80.48`** (Ubuntu 22.04, 1 vCPU / 1 GB) |
| BBB droplet IP | `164.90.157.78` (BigBlueButton 3.0 server) |
| App path on web droplet | `/var/www/learning-platform` |
| Process manager | systemd, service `learning-platform` |
| Status check | `systemctl status learning-platform` |
| Repo | `https://github.com/Abdelrhman-Rayis/warsha.live.git` (branch `main`) |
| How to reach the server | DigitalOcean dashboard. Droplets. Click the `24.144.80.48` droplet. **Console** button. Browser TTY as `root`. (SSH port 22 is firewalled.) |
| Subscriber admin page | `https://warsha.live/ai-in-khaleej/admin.html` (passcode `gateflow2026`) |
| Resend verified sender | `newsletter@warsha.live` |
| BBB classroom URL | `https://meet.warsha.live/bigbluebutton/` |

> Two rules from the Project Guide that always apply on the droplet:
>
> 1. **Do NOT prefix commands with `bash` inside the DO Web Console.**
>    The web console spawns isolated subshells that swallow outputs.
>    Just paste the commands directly, no wrapper.
> 2. **Always `git stash` before `git pull`.** The droplet has runtime
>    mutations on `data/workshops.json` (free/paid enrollment state).
>    Pulling without stashing causes merge conflicts that wedge the
>    deploy.

---

## 1. Updating an issue (the editing flow)

All issue content lives in this repo. To publish a new issue:

1. **Write the issue body** (the page readers see on the site):
   - `ai-in-khaleej/issue-NNN.html`. The web version.
   - `ai-in-khaleej/issue-NNN.md`. Markdown source (archival).
   - Update `ai-in-khaleej/index.html` to point at the new issue.

2. **Write the email** (what we mail to the list):
   - `mailer/issues/issue-NNN-email.html`. HTML version.
   - `mailer/issues/issue-NNN-email.txt`. Plain-text version.
   - `mailer/issues/issue-NNN.json`. Subject + from + reply-to config.

   Copy `issue-001-*` as a template. Placeholders supported in both
   templates:
   - `{{first_name}}`. Recipient's first name (falls back to "there").
   - `{{email}}`. Recipient's email.
   - `{{email_url}}`. URL-encoded version of `{{email}}` for the
     unsubscribe link.

   Brand rules (from the Project Guide). Keep these tight:
   - **Surface background** `#faf8f3`. **Ink** `#1a1f2e`. **Gold accent**
     `#b08d3c`. **Muted grey** `#5b6478`. **Border** `#e6e1d4`.
   - **No em-dashes** anywhere in the copy. Use parentheses, colons, or
     periods. (This is a strict tone rule.)

3. **Commit and push:**
   ```bash
   cd "/Users/rayis/Documents/Claude/Projects/Warsha live"
   git add ai-in-khaleej/ mailer/
   git commit -m "Issue #NNN: <short title>"
   git push origin main
   ```

4. **Pull on the droplet** (DO Console at `24.144.80.48`).
   Paste these lines one by one. Do **not** wrap them in `bash`:
   ```bash
   cd /var/www/learning-platform
   git stash
   git pull origin main
   git stash pop
   systemctl restart learning-platform
   systemctl status learning-platform --no-pager | head -15
   ```

The new issue is live at `https://warsha.live/ai-in-khaleej/issue-NNN.html`.

---

## 2. Sending the email to the list

### One-shot, scheduled (the normal case)

In the DO Console at `24.144.80.48`. Paste each block as written:

```bash
# 1. Make sure 'at' is installed and the daemon runs.
command -v at >/dev/null || apt-get install -y at
systemctl enable --now atd

# 2. Confirm the RESEND_API_KEY is in the systemd override.
#    (One-time setup, see Recovery section if it isn't.)
grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf

# 3. Schedule the send. Adjust the issue number and time as needed.
#    Time is UTC. Saudi Arabia time is UTC+3, so 11:00 AST = 08:00 UTC.
RESEND_API_KEY="$(grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf | cut -d= -f3-)" \
  at 08:00 tomorrow <<'EOF'
cd /var/www/learning-platform
node mailer/send-newsletter.js --issue=001 >> /var/log/warsha-newsletter-issue001.log 2>&1
EOF

# 4. See what's queued.
atq
```

Note that the `at` job inherits the env we set on the wrapper command, so
`RESEND_API_KEY` is available inside the scheduled script.

Inspect / cancel:
```bash
atq                  # list queued jobs
at -c <jobid>        # show the exact command + env
atrm <jobid>         # cancel
```

### Send right now (no schedule)

```bash
cd /var/www/learning-platform
RESEND_API_KEY="$(grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf | cut -d= -f3-)" \
  node mailer/send-newsletter.js --issue=001
```

The script is resume-safe. If it dies halfway, re-run it. Addresses
already in `mailer/logs/issue-NNN-sent.log` are skipped automatically.

### Test before sending to the whole list

```bash
node mailer/send-newsletter.js --issue=001 --dry-run         # render, do not send
node mailer/send-newsletter.js --issue=001 --limit=5         # send first 5 only
node mailer/send-newsletter.js --issue=001 --only=you@x.com  # one-address smoke test
```

### Throttling

Default is 120 ms between sends (~8/sec, well under Resend's 10/sec rate
limit). To slow down, pass `--throttle=500`.

---

## 3. The recipient list

`mailer/recipients.json` is the canonical mailing list. Today: **352
deduped, validated addresses** from UAEU (185), Zayed University (160),
HCT (7).

To rebuild it from a new contact spreadsheet:

```bash
cd /var/www/learning-platform
npm install xlsx --no-save           # one-time, on the droplet
node mailer/build-recipients.js path/to/new-contacts.xlsx
git add mailer/recipients.json
git commit -m "Refresh recipients from <source>"
git push origin main
```

Expects a sheet named `Master_Contacts` with columns `full_name`,
`email`, `institution`, `department`, etc. Dedupes by email, drops
malformed addresses.

Quick stats:
```bash
jq 'length' mailer/recipients.json
jq -r '.[].institution' mailer/recipients.json | sort | uniq -c
```

### Unsubscribes are automatic

`mailer/send-newsletter.js` reads `data/unsubscribes.json` (populated
by `POST /api/unsubscribe`, the endpoint the in-email link calls).
Anyone in that file is filtered out before any send. No manual upkeep.

### Subscribers who opted in via the website

People who submitted the form at `/ai-in-khaleej/` are stored in
`ai-in-khaleej/subscribers.json` on the droplet (not in git, per the
Project Guide). To pull that list into the mailer recipients:

```bash
# on the droplet
cd /var/www/learning-platform
jq '[.[] | {email, first_name: (.name | split(" ")[0]), full_name: .name, institution: "Subscriber", department: null}]' \
  ai-in-khaleej/subscribers.json > mailer/recipients-subscribers.json
```

Or view them from the admin page at
`https://warsha.live/ai-in-khaleej/admin.html` (passcode `gateflow2026`)
and export the CSV.

### Hard-bounced addresses

`mailer/logs/issue-NNN-failed.log` is worth auditing after each send.
Typical bounces are dead aliases. To suppress them for future issues,
add them to the unsubscribe list via the API:

```bash
awk -F'\t' '{print $1}' mailer/logs/issue-001-failed.log | while read e; do
  curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"email\":\"$e\"}" http://localhost:3000/api/unsubscribe
done
```

---

## 4. Recovery: when something goes wrong

### "I scheduled the wrong send time"
```bash
atq               # find the jobid
atrm <jobid>      # cancel
# reschedule with the correct time
```

### "The send crashed halfway"
Just re-run the same command. Already-sent addresses are skipped via
`mailer/logs/issue-NNN-sent.log`.

### "Resend says my domain isn't verified"
`warsha.live` is verified in the Resend dashboard. If it ever flips to
unverified, check the SPF/DKIM records at Name.com (Project Guide,
section 2) and re-verify in the Resend dashboard.

### "RESEND_API_KEY isn't in the systemd override yet"
```bash
systemctl edit learning-platform.service
# adds an override file. Paste:
# [Service]
# Environment=RESEND_API_KEY=re_S4XR2TnF_7rRvhsNfA3aiuoSTMxCXidfD
# Save with Ctrl+O, Enter, Ctrl+X.
systemctl daemon-reload
systemctl restart learning-platform
```

Then verify:
```bash
systemctl show learning-platform --property=Environment | tr ' ' '\n' | grep RESEND
```

### "The git pull errored with merge conflicts"
This is what happens if you skip `git stash`. Recover with:
```bash
cd /var/www/learning-platform
git checkout -- data/workshops.json   # discard runtime mutations
git pull origin main
systemctl restart learning-platform
```
Then on next deploy, remember to `git stash` first.

### "The service won't restart"
```bash
journalctl -u learning-platform -n 50 --no-pager
```
Common causes: port 3000 already taken (`lsof -i :3000`), syntax error in
a recently-pushed file (revert and push again), missing `npm install`
after a `package.json` change.

---

## 5. Quick reference. Copy/paste blocks

**Local: edit + push a new issue**
```bash
cd "/Users/rayis/Documents/Claude/Projects/Warsha live"
git add . && git commit -m "Issue #NNN" && git push origin main
```

**DO Console: deploy a push**
```bash
cd /var/www/learning-platform
git stash; git pull origin main; git stash pop
systemctl restart learning-platform
```

**DO Console: schedule tomorrow's 11:00 AST send**
```bash
RESEND_API_KEY="$(grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf | cut -d= -f3-)" \
  at 08:00 tomorrow <<'EOF'
cd /var/www/learning-platform
node mailer/send-newsletter.js --issue=001 >> /var/log/warsha-newsletter-issue001.log 2>&1
EOF
atq
```

**DO Console: smoke test 5 sends now**
```bash
cd /var/www/learning-platform
RESEND_API_KEY="$(grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf | cut -d= -f3-)" \
  node mailer/send-newsletter.js --issue=001 --limit=5
```

**DO Console: see what's queued / results**
```bash
atq
tail -n 50 /var/log/warsha-newsletter-issue001.log
wc -l mailer/logs/issue-001-sent.log
cat mailer/logs/issue-001-failed.log
```
