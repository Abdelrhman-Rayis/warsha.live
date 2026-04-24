#!/usr/bin/env bash

set -euo pipefail

APP_NAME="learning-platform"
APP_DIR="/var/www/${APP_NAME}"
APP_PORT="${APP_PORT:-3000}"
DOMAIN="${DOMAIN:-_}"
SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"
NGINX_SITE="/etc/nginx/sites-available/${APP_NAME}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root."
  exit 1
fi

if [[ ! -d "${APP_DIR}" ]]; then
  echo "Expected app directory at ${APP_DIR}"
  echo "Upload the project first, then rerun this script."
  exit 1
fi

echo "Installing system packages..."
apt update
apt install -y curl git nginx ufw ca-certificates

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

echo "Installing app dependencies..."
cd "${APP_DIR}"
npm install --omit=dev

echo "Creating systemd service..."
cat > "${SERVICE_FILE}" <<EOF
[Unit]
Description=Learning Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${APP_NAME}"
systemctl restart "${APP_NAME}"

echo "Creating Nginx site..."
cat > "${NGINX_SITE}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf "${NGINX_SITE}" /etc/nginx/sites-enabled/${APP_NAME}
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo
echo "Deployment complete."
echo "App service: systemctl status ${APP_NAME}"
echo "Nginx: systemctl status nginx"
echo
echo "If you have a domain, point it to this droplet and then run:"
echo "  apt install -y certbot python3-certbot-nginx"
echo "  certbot --nginx -d yourdomain.com -d www.yourdomain.com"
