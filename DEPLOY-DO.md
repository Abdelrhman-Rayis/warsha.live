# Deploy to DigitalOcean (SSH-blocked Droplet)

Target: Ubuntu 1 vCPU / 1 GB RAM droplet, app at `/var/www/learning-platform`,
managed by `learning-platform.service` (systemd), fronted by Nginx.

**SSH is blocked at the cloud firewall.** All server-side steps run in the
**DigitalOcean Web Console** (Droplet page -> "Console" button -> browser
TTY as `root`). No `scp` / `rsync` / `sftp` — code ships through GitHub
`main` only.

---

## 1. Prepare env values (local, once)

Decide the two BBB values you will paste into systemd later. Keep them in
your password manager — they are **not** committed to Git.

```
BBB_BASE_URL = https://your-bbb-host/bigbluebutton
BBB_SECRET   = <shared secret from `bbb-conf --secret`>
```

If you skip these, the server boots against the public Blindside test
server (`test-install.blindsidenetworks.com`). Fine for a smoke test, not
fine for real classes — the test server resets and has no recording.

---

## 2. Push the code (local)

```bash
cd /Users/rayis/Documents/Mazin/learning-platform
git add server.js app.js index.html classes/ DEPLOY-DO.md
git rm -r --cached docker-compose.yml .env.greenlight greenlight-config 2>/dev/null || true
git commit -m "Direct BBB integration; drop Greenlight/Docker"
git push origin main
```

---

## 3. Wire systemd env vars (Web Console, one time)

In the Web Console:

```bash
systemctl edit learning-platform.service
```

`systemctl edit` opens an override drop-in (nano). Paste **exactly**:

```ini
[Service]
Environment=BBB_BASE_URL=https://your-bbb-host/bigbluebutton
Environment=BBB_SECRET=your-shared-secret-here
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`). Then:

```bash
systemctl daemon-reload
```

Override lives at `/etc/systemd/system/learning-platform.service.d/override.conf`
and is preserved across `git pull` and package upgrades.

---

## 4. Pull + restart on the server (Web Console)

Every deploy:

```bash
cd /var/www/learning-platform
git pull --ff-only origin main
npm install --omit=dev      # only if package.json changed; usually skip
systemctl restart learning-platform.service
systemctl status learning-platform.service --no-pager | head -20
journalctl -u learning-platform.service -n 30 --no-pager
```

Look for `Local platform running at http://localhost:3000` and the
**absence** of the `[BBB] Using PUBLIC TEST SERVER defaults` warning — if
you see that warning, step 3's override didn't load.

Smoke test from the Web Console:

```bash
curl -s -X POST http://localhost:3000/api/class/create \
  -H 'Content-Type: application/json' \
  -d '{"className":"Smoke Test","educatorName":"Ops"}'
```

Should return JSON with `meetingId`, `moderatorJoinUrl`, `attendeeJoinUrl`.

---

## Persistence

Active classes live in `data/classes.json` (auto-created). It survives
`systemctl restart` but **not** `git clean -fdx`. Wiping the working tree
invalidates previously-shared join links — warn educators before doing it.

## Rolling back

```bash
cd /var/www/learning-platform
git log --oneline -10
git reset --hard <previous-sha>
systemctl restart learning-platform.service
```
