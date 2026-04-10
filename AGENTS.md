# Owivara Development — AI Agent System Prompt
# ================================================
# This file is read by OpenCode as its operating context.
# It is also read by any AI model beginning work on this project.
# Last resurrected: 2026-04-09 — Qwen2.5-Coder Resurrection Protocol
# Verified against: Creator's direct statements + forensic analysis
# Previous version issues corrected: Supabase→InsForge, OpenAI-only→Dual BYOK

## Project Identity

**Name:** Owivara
**Type:** Freemium SaaS / BaaS — WhatsApp Bot Control Panel
**Target Market:** Nigeria and African users/developers
**Status:** Active Development (v0.1.0)

## What Owivara Is

Owivara is a private-first WhatsApp bot orchestration platform where:

1. Users sign up and create accounts (via InsForge Auth)
2. Users link their personal WhatsApp accounts to get bot access
   (by scanning a QR code that activates a Baileys instance)
3. Owivara's dashboard serves as the control panel for their bots
   (see bot status, configure responses, view conversations)
4. Each user's data is completely private and isolated from other users
   (enforced by PostgreSQL Row Level Security via InsForge)
5. Users bring their own Google Gemini or OpenAI API key for AI features
   (stored encrypted in InsForge, retrieved per-request by bot)
6. The platform is freemium (free tier with limits, premium tier for more)

## System Architecture (THE LAW — Do Not Deviate)

Owivara has EXACTLY THREE components:

```
┌──────────────────────────────────────────────────────────┐
│ Component 1: Dashboard (apps/dashboard/)                  │
│ Tech: React 19 + Vite 8 + TypeScript + TailwindCSS v4     │
│ Host: pxxl.click (Nigerian Vercel, free tier)             │
│ Purpose: User-facing web application / control panel      │
│ Connects to: InsForge (for data + auth + realtime)        │
└──────────────────────────────────────────────────────────┘
                         ↕ InsForge SDK
┌──────────────────────────────────────────────────────────┐
│ Component 2: InsForge BaaS (managed — not our code)      │
│ Tech: InsForge cloud (PostgreSQL + Auth + Edge Functions) │
│ Host: InsForge managed cloud                              │
│ Purpose: Backend, authentication, database, serverless    │
│ This IS the backend. There is no other backend.           │
└──────────────────────────────────────────────────────────┘
                         ↕ InsForge SDK
┌──────────────────────────────────────────────────────────┐
│ Component 3: Bot Framework (apps/bot/)                    │
│ Tech: Node.js + baileys@7.0.0-rc.9 + Express              │
│ Host: pxxl.click (same platform, different deployment)    │
│ Purpose: WhatsApp bot engine — connects, receives, sends  │
│ Connects to: InsForge (for config + storage)              │
│              WhatsApp servers (via Baileys)               │
│              Google Gemini or OpenAI (via user's own key) │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack (Verified from actual package.json)

| Layer           | Technology              | Version        |
|-----------------|-------------------------|----------------|
| Frontend        | React                   | 19.2.4         |
| Build           | Vite                    | 8.0.1          |
| Language        | TypeScript              | ~5.9.3         |
| Styling         | TailwindCSS             | 4.2.2          |
| Backend/BaaS    | @insforge/sdk           | ^1.2.2         |
| WhatsApp        | baileys                 | ^7.0.0-rc.9    |
| AI (BYOK)       | @google/generative-ai   | ^0.21.0        |
| AI (BYOK)       | openai                  | ^4.77.0        |
| Package Manager | npm                     | 10.9.0         |
| State           | @tanstack/react-query   | ^5.96.2        |
| Routing         | react-router-dom        | ^7.14.0        |

## What You MUST NEVER Do

(These are learned from forensic analysis of the corrupted production environment)

1. ❌ **Never add NestJS, Express (as backend), Fastify, or any HTTP server framework**
   InsForge handles all backend needs. Express is ONLY used in apps/bot/ for the
   long-running Baileys WebSocket server.

2. ❌ **Never add LangChain, vLLM, Ollama, or self-hosted AI infrastructure**
   Users bring their own Gemini or OpenAI API key — that's the AI integration.
   Nothing more, nothing less.

3. ❌ **Never suggest AWS, Vercel, Fly.io, Netlify as hosting**
   pxxl.click is the chosen platform — it's Nigerian and free.

4. ❌ **Never reference package versions that don't exist**
   Always verify on npmjs.com before suggesting any version.

5. ❌ **Never add features outside the current task scope**
   Owivara has a clear scope — don't expand it without asking.

6. ❌ **Never bypass RLS — always filter queries by user ID**
   Privacy is the core promise. Never violate it.

7. ❌ **Never use @supabase/supabase-js in the bot framework**
   Use @insforge/sdk for ALL database operations.

## Common Development Tasks

Starting development:
```bash
cd "C:\Users\USER_6987\Desktop\Projects\Owivara - Development"
npm install
npm run dev  # starts both dashboard and bot
```

Individual apps:
```bash
npm run dev:dashboard  # dashboard only
npm run dev:bot        # bot framework only
```

Database:
- Schema: server/db/schema.sql (base) + server/db/schema-extended.sql (AI extensions)
- All tables have RLS policies — never write queries without user_id filter

Deployment:
- Dashboard: build with `npm run build:dashboard`, deploy dist/ to pxxl.click
- Bot: deploy apps/bot/ to pxxl.click as Node.js server

## Key Files to Know

| File | Purpose |
|------|---------|
| `packages/insforge/src/` | InsForge SDK wrapper — the ONLY place InsForge is initialized |
| `packages/baileys-core/src/` | Baileys connection management and QR handling |
| `packages/ai/src/` | Dual BYOK AI client (Gemini + OpenAI) |
| `packages/types/src/` | Shared TypeScript types |
| `apps/bot/src/index.ts` | Bot orchestrator — Express + Baileys + InsForge |
| `functions/` | InsForge Edge Functions (create-instance, bot-webhook, init-profile) |
| `server/db/schema.sql` | Database schema with RLS policies |
| `.kilocode/rules/` | Kilo Code rules — governs AI behavior in this project |

## Before You Write Any Code

1. Read this file completely ✓ (you just did)
2. Check if a similar file/function already exists
3. Verify any new package against package.json and npm registry
4. Ensure your implementation matches the architecture above
5. Check that user data isolation is maintained (RLS)

---
*Resurrected and corrected by Qwen2.5-Coder (Resurrection Protocol)*
*Based on forensic analysis of Owivara Production Environment*
*Original issues fixed: Supabase→InsForge, OpenAI-only→Dual BYOK, any→typed*
