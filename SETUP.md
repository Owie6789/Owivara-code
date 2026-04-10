# Owivara Development Setup Guide

Get from zero to running in under 10 minutes.

## Prerequisites

- **Node.js** 20+ — [Download](https://nodejs.org)
- **npm** 10+ — comes with Node.js
- **InsForge account** — [insforge.io](https://insforge.io)
- **pxxl.click account** — for deployment
- **Google AI Studio account** — for Gemini BYOK features
- **OpenAI account** (optional) — for OpenAI BYOK features

## Step 1: Install Dependencies

```bash
cd "C:\Users\USER_6987\Desktop\Projects\Owivara - Development"
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example env file
copy .env.example .env

# Edit .env with your InsForge credentials:
# VITE_INSFORGE_URL=https://your-project.insforge.app
# VITE_INSFORGE_ANON_KEY=your_anon_key
# INSFORGE_URL=https://your-project.insforge.app
# INSFORGE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Set Up Database

Run the schema SQL in your InsForge dashboard:

1. Open InsForge dashboard → Database → SQL Editor
2. Paste contents of `server/db/schema.sql`
3. Execute
4. Paste contents of `server/db/schema-extended.sql`
5. Execute

## Step 4: Deploy Edge Functions

```bash
# Using InsForge CLI
npx @insforge/cli functions deploy create-instance
npx @insforge/cli functions deploy bot-webhook
npx @insforge/cli functions deploy init-profile
```

## Step 5: Start Development

```bash
# Start both dashboard and bot framework
npm run dev

# Or start individually:
npm run dev:dashboard  # http://localhost:5173
npm run dev:bot        # http://localhost:3000
```

## Step 6: Create Your Account

1. Open http://localhost:5173/signup
2. Create an account with email + password
3. Sign in

## Step 7: Link Your WhatsApp Account

1. Go to Bots page → Create new bot
2. Scan the QR code with your WhatsApp
3. Bot connects and shows "connected" status

## Step 8: Configure Your AI Key

1. Go to Settings
2. Choose Gemini or OpenAI
3. Paste your API key
4. Save

## Step 9: Verify Everything

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","active_instances":1,"connected":1}
```

## Troubleshooting

### InsForge connection fails
- Verify `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` are correct
- Check that your InsForge project is active
- Ensure RLS policies are applied (run schema.sql)

### Bot won't connect
- Check `INSFORGE_URL` and `INSFORGE_SERVICE_ROLE_KEY` in bot's .env
- Verify the bot can reach InsForge (no firewall blocking)
- Check logs in `apps/bot/` output

### QR code not showing
- The bot stores QR in InsForge database
- Dashboard polls for it — check browser console for errors
- Verify `whatsapp_instances` table exists with correct schema

### AI features not working
- Verify your API key in Settings is valid
- Check that `ai_provider_configs` table exists (run schema-extended.sql)
- Try both Gemini and OpenAI to isolate the issue

### Build fails
```bash
# Clean and reinstall
npm run clean
npm install
npm run build
```
