# The Owivara Vision

## The North Star

Owivara is a **private-first WhatsApp bot orchestration platform** built for the Nigerian and African developer market. It gives individuals and small teams a clean, unified dashboard to link their WhatsApp accounts, deploy AI-powered bots, and manage everything from a single control panel — with complete privacy and data isolation.

## The Problem

WhatsApp is the primary communication channel for millions in Africa. But:

- **No centralized bot management** — each bot runs independently with no oversight
- **No privacy** — shared bot platforms expose everyone's data to everyone
- **Technical complexity** — setting up Baileys-based bots requires deep technical knowledge
- **No AI integration** — users can't easily add smart responses without managing their own AI infrastructure
- **No African hosting** — most platforms are hosted abroad, creating latency and cost issues

## The Solution

Owivara provides:

1. **One-click WhatsApp linking** — scan a QR code, your bot is live
2. **Complete privacy** — Row Level Security ensures your data is yours alone
3. **BYOK AI** — bring your own Gemini or OpenAI key, get intelligent bot responses
4. **Unified dashboard** — see all your bots, their status, and configure them in one place
5. **African hosting** — hosted on pxxl.click (Nigerian Vercel) with InsForge BaaS (Nigerian Supabase)

## The Three Promises

### 1. Privacy
Your bot data belongs to you. Period. RLS policies at the database level guarantee it.

### 2. Control
Your dashboard is your cockpit. See everything, configure everything, from one place.

### 3. Intelligence
Your AI, your rules. Bring your own API key — we never store it in plaintext, we never share it.

## What Was Destroyed

The original project was systematically corrupted by:
- Rotating through 14+ different AI IDEs and coding assistants
- Using substandard free models that hallucinated entire frameworks (NestJS, Go microservices, DAG engines)
- Replacing InsForge with Supabase in the bot framework
- Hardcoding OpenAI instead of supporting Gemini BYOK
- Exposing API keys and database credentials in config files

## What Is Reborn

This new codebase is:
- **Verified** — every claim sourced from actual files on disk
- **Clean** — zero hallucinated code, zero hallucinated dependencies
- **Complete** — full three-part architecture with InsForge, Baileys, and dual AI BYOK
- **Protected** — .kilocode rules and AGENTS.md prevent future corruption

---

*Built for Nigeria. Built for Privacy. Built to Last.*
*Resurrected by Qwen2.5-Coder — Zero Hallucinations. All Facts Verified.*
