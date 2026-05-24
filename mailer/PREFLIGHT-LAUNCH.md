# Preflight. Issue #001 launch, tomorrow at 11:00 AST

One-time checklist for the launch send to **352 faculty at UAEU (185),
Zayed University (160), and HCT (7)**.

Server cheat sheet (from `warsha.live Project Guide`):

- Web droplet: **`24.144.80.48`** (Ubuntu 22.04). DO dashboard. Droplets.
  Click. Console.
- App path on droplet: `/var/www/learning-platform`
- Service: `learning-platform` (systemd)
- Resend verified sender: `newsletter@warsha.live`

Two rules from the Project Guide that apply throughout:

1. **Do NOT prefix commands with `bash` inside the DO Web Console.** Paste
   commands directly; wrappers swallow outputs.
2. **Always `git stash` before `git pull`.** Runtime-mutated
   `data/workshops.json` will otherwise cause merge conflicts.

Tick each box as you go.

---

## A. Tonight (before bed)

- [ ] **A1. Pull the new mailer code onto your laptop.** Done. The
  `mailer/` folder is already in your `Warsha live` workspace.

- [ ] **A2. Commit and push to GitHub.**
  ```bash
  cd "/Users/rayis/Documents/Claude/Projects/Warsha live"
  git status
  git add mailer/ server.js
  git commit -m "Issue #001 mailer: launch email, recipients, unsubscribe, deploy guide"
  git push origin main
  ```
  If `git push` asks for credentials and you don't remember, use a
  personal access token from github.com. Settings. Developer settings.
  Tokens.

- [ ] **A3. Smoke test render on your laptop.**
  ```bash
  cd "/Users/rayis/Documents/Claude/Projects/Warsha live"
  node mailer/send-newsletter.js --issue=001 --dry-run --limit=5
  ```
  Expect 5 lines like
  `[1/5] halashwal@uaeu.ac.ae  DRY  first_name=Hany  inst=UAEU`.

- [ ] **A4. Open the DO Web Console for the web droplet `24.144.80.48`.**
  DigitalOcean dashboard. Droplets. The droplet. Console.

- [ ] **A5. On the droplet: pull the new code.** Paste these as
  individual commands, do not wrap with `bash`:
  ```
  cd /var/www/learning-platform
  git stash
  git pull origin main
  git stash pop
  systemctl restart learning-platform
  systemctl status learning-platform --no-pager | head -15
  ```
  Look for `Active: active (running)`.

- [ ] **A6. On the droplet: install `at` (one-time only).**
  ```
  command -v at >/dev/null || apt-get install -y at
  systemctl enable --now atd
  ```

- [ ] **A7. On the droplet: set the Resend API key in systemd (one-time).**
  The Project Guide currently lists
  `re_S4XR2TnF_7rRvhsNfA3aiuoSTMxCXidfD`. The send script reads this
  from the systemd override file, not from the hardcoded constant in
  `server.js`. Wire it up:
  ```
  systemctl edit learning-platform.service
  ```
  In the editor that opens (nano), add exactly:
  ```
  [Service]
  Environment=RESEND_API_KEY=re_S4XR2TnF_7rRvhsNfA3aiuoSTMxCXidfD
  ```
  Save with Ctrl+O, Enter, Ctrl+X. Then:
  ```
  systemctl daemon-reload
  systemctl restart learning-platform
  systemctl show learning-platform --property=Environment | tr ' ' '\n' | grep RESEND
  ```
  You should see `RESEND_API_KEY=re_S4XR2TnF_...` printed.

  > **Security note**: this key is currently also hardcoded in
  > `server.js` (the `subscribe-ai` handler) and visible in the public
  > repo. Rotate it in the Resend dashboard once tonight's launch is
  > done, and replace the constant in `server.js` with
  > `process.env.RESEND_API_KEY`. Not urgent enough to block the launch.

- [ ] **A8. Five-recipient live smoke test, send to yourselves.**
  Add 4 of your + Mazin's addresses to the top of
  `mailer/recipients.json` locally, push, then on the droplet:
  ```
  cd /var/www/learning-platform
  git stash; git pull origin main; git stash pop
  RESEND_API_KEY="$(grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf | cut -d= -f3-)" \
    node mailer/send-newsletter.js --issue=001 --limit=5
  ```
  Confirm 5 emails arrive with:
  - subject: "What Gulf faculty should do about AI this semester"
  - your first name in the greeting
  - working "Read Issue #001" button
  - working "unsubscribe here" link (clicking opens the unsubscribe
    confirmation page)
  - **no em-dashes anywhere** (brand rule check)

  > Then **revert recipients.json locally**, push, and pull again on the
  > droplet so the real list is restored:
  > ```
  > git checkout mailer/recipients.json
  > git push origin main
  > # on droplet:
  > git stash; git pull origin main; git stash pop
  > ```
  > Also delete the smoke-test entries from
  > `mailer/logs/issue-001-sent.log` on the droplet so they aren't
  > skipped during the real send. The simplest way:
  > ```
  > rm mailer/logs/issue-001-sent.log
  > ```

- [ ] **A9. Schedule the real send for tomorrow 11:00 AST (08:00 UTC).**
  In the DO Console:
  ```
  RESEND_API_KEY="$(grep RESEND_API_KEY /etc/systemd/system/learning-platform.service.d/override.conf | cut -d= -f3-)" \
    at 08:00 tomorrow <<'EOF'
  cd /var/www/learning-platform
  node mailer/send-newsletter.js --issue=001 >> /var/log/warsha-newsletter-issue001.log 2>&1
  EOF
  atq
  ```
  `atq` should list one pending job at `2026-05-25 08:00`.

---

## B. Tomorrow morning (Saudi Arabia time)

- [ ] **B1. 10:55 AST.** Open the DO Console, confirm the job is queued:
  ```
  atq
  ```

- [ ] **B2. 11:01 AST.** Confirm the send started:
  ```
  ls -la /var/log/warsha-newsletter-issue001.log
  tail -f /var/log/warsha-newsletter-issue001.log
  ```

- [ ] **B3. ~11:08 AST.** Confirm completion. 352 sends × 120 ms ≈ 45 s,
  plus Resend queueing time. The log should end with
  `Done. OK=<n>  ERR=<n>`.

- [ ] **B4. Audit failures.**
  ```
  wc -l /var/www/learning-platform/mailer/logs/issue-001-sent.log
  cat   /var/www/learning-platform/mailer/logs/issue-001-failed.log
  ```
  A handful of bounces is normal (dead aliases). If an entire institution
  bounced (e.g., every `@uaeu.ac.ae`), pause and investigate; their mail
  server may have filtered us.

- [ ] **B5. Resend dashboard.** resend.com. Activity tab. Watch delivery,
  open, and click rates over the next few hours. If spam complaints
  exceed 0.3%, pause the next send.

---

## C. After the launch

1. **Inbox watch.** `newsletter@warsha.live`. Some recipients reply
   rather than click unsubscribe; respond manually and add them to the
   unsubscribe list via the API or admin page.
2. **Rotate the Resend API key** (carried over from A7).
3. **For Issue #002**, repeat the flow with `--issue=002`. Drop the new
   email files in `mailer/issues/`, refresh `recipients.json` if you've
   added a Saudi/Qatar/Bahrain list, push, deploy, schedule.

---

## Risks worth knowing

- **Cold outreach to 352 university addresses in one window** is more
  aggressive than ongoing newsletter sends. If too many recipients mark
  it spam, Resend can suspend the sending domain. Mitigations already in
  place: clear sender identity, real `List-Unsubscribe` header,
  one-click unsubscribe page, 120 ms throttle.
- **University spam filters** often greylist first-time senders. Some
  messages may not arrive immediately; "deferred" notices in Resend
  Activity usually clear within a few hours.
- **UAE/Saudi spam regulations.** B2B outreach to faculty published in
  public directories is generally permissible *with* a working
  unsubscribe. Not legal advice. The unsubscribe link is non-negotiable.
