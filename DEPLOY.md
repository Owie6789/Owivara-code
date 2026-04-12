# 🚀 Owivara Deployment Guide

## Prerequisites
- **VPS** (Ubuntu 24.04) with root access
- **Domain name** pointing to your VPS IP (optional but recommended)
- **InsForge account** with active project
- **GitHub account** with this repo

## Step 1: Environment Setup

### Create `.env` files locally (DO NOT commit these)

**apps/dashboard/.env**
```
VITE_INSFORGE_URL=https://[your-project].insforge.app
VITE_INSFORGE_ANON_KEY=ik_[your_anon_key]
```

**apps/bot/.env**
```
INSFORGE_URL=https://[your-project].insforge.app
INSFORGE_SERVICE_ROLE_KEY=ik_[your_service_role_key]
SESSION_PATH=./baileys-sessions
PORT=3000
LOG_LEVEL=info
DASHBOARD_URL=http://your-vps-ip-or-domain
```

### InsForge Secrets (set via CLI)
```bash
npx @insforge/cli secrets add PXXL_WEBHOOK_URL "http://YOUR_VPS_IP/webhook"
npx @insforge/cli secrets add BOT_WEBHOOK_SECRET "your-random-webhook-secret"
```

## Step 2: VPS Setup

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Run the automated setup
curl -fsSL https://raw.githubusercontent.com/Owie6789/Owivara-code/main/scripts/deploy.sh | bash
```

Or manually:
```bash
apt update && apt upgrade -y
apt install -y nodejs npm git build-essential nginx certbot python3-certbot-nginx curl
curl -fsSL https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
source ~/.bashrc
npm install -g pm2

# Clone and build
mkdir -p /opt/owivara && cd /opt/owivara
git clone https://github.com/Owie6789/Owivara-code.git .
pnpm install --frozen-lockfile
pnpm run build

# Create bot .env
cat > apps/bot/.env << 'EOF'
INSFORGE_URL=https://[your-project].insforge.app
INSFORGE_SERVICE_ROLE_KEY=ik_[your_service_role_key]
SESSION_PATH=./baileys-sessions
PORT=3000
LOG_LEVEL=info
DASHBOARD_URL=http://YOUR_VPS_IP
EOF

# Setup Nginx (see nginx.conf in this directory)
# Start bot with PM2
cd /opt/owivara/apps/bot
pm2 start "pnpm start" --name owivara-bot --max-memory-restart 3200M
pm2 save
pm2 startup

# Configure firewall
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## Step 3: SSL Setup (After Domain is Pointed)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 4: Update InsForge Webhook URL

```bash
npx @insforge/cli secrets add PXXL_WEBHOOK_URL "http://YOUR_VPS_IP/webhook"
# Or with domain: "https://yourdomain.com/webhook"
```

## Step 5: Verify

```bash
# Check dashboard
curl -I http://YOUR_VPS_IP

# Check bot health
curl http://YOUR_VPS_IP/health

# Check webhook
curl -X POST http://YOUR_VPS_IP/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{"event":"test","data":{"test":true}}'
```

## Future Updates

```bash
# On your local machine
git add . && git commit -m "Your changes" && git push origin main

# On VPS
cd /opt/owivara && git pull && pnpm install --frozen-lockfile && pnpm run build
pm2 restart owivara-bot && systemctl reload nginx
```
