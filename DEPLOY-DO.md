# Deploy To DigitalOcean

This project can be hosted on a single Ubuntu 24.04 Droplet exactly as it is now.

## Current deployment model

- Node.js runs [`server.js`](./server.js)
- Nginx proxies traffic from port 80 to port 3000
- `systemd` keeps the app alive after reboot

## Files added for deployment

- [`deploy/setup-server.sh`](./deploy/setup-server.sh): installs Node/Nginx, creates the service, enables the firewall, and wires Nginx
- [`deploy/push-to-droplet.sh`](./deploy/push-to-droplet.sh): syncs the project to `/var/www/learning-platform`
- [`deploy/learning-platform.service`](./deploy/learning-platform.service): service template
- [`deploy/nginx.learning-platform.conf`](./deploy/nginx.learning-platform.conf): Nginx template

## Fast path

From your local machine:

```bash
bash deploy/push-to-droplet.sh root@YOUR_SERVER_IP
```

On the server:

```bash
mkdir -p /var/www/learning-platform
DOMAIN=yourdomain.com bash /var/www/learning-platform/deploy/setup-server.sh
```

If you are deploying by IP only for now, omit the `DOMAIN` variable:

```bash
bash /var/www/learning-platform/deploy/setup-server.sh
```

## SSL after DNS is ready

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Notes

- The app is publicly hostable now, but its data model is still browser-local. Users, courses, chat messages, and enrollments are stored in `localStorage`, so this is a deployed frontend demo/MVP rather than a shared production SaaS.
- This deployment bundle is intentionally simple and suited to your current `1GB / 1vCPU` droplet.
