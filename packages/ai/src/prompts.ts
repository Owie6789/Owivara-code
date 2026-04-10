/**
 * @file prompts.ts
 * @project Owivara - Development
 * @package @owivara/ai
 * @module Prompt Templates
 *
 * @description
 * Predefined prompt templates for WhatsApp bot AI features.
 * Centralized so prompts are consistent across providers.
 *
 * @resurrection_source CLEAN_SLATE — No prompt templates existed in old project
 * @resurrection_status CLEAN_SLATE
 * @hallucination_check PASSED
 */

/** Bot command help prompt template */
export const PROMPT_HELP = `You are Owivara, a WhatsApp bot management platform.
Explain the available commands:
- .help - Show this help message
- .ai <message> - Get AI-powered response
- .status - Check bot status
- .plugins - List enabled plugins

Keep the response under 200 characters.`;

/** AI chatbot system prompt */
export const SYSTEM_PROMPT_CHATBOT = `You are a helpful WhatsApp bot assistant powered by Owivara.
Your role is to:
1. Answer user questions politely and concisely
2. Keep responses under 500 characters (WhatsApp-friendly)
3. Use simple formatting without markdown
4. Be helpful and friendly
5. If you don't know, say so politely

Remember: this is a messaging app, so keep responses brief.`;

/** Intent classification prompt */
export function PROMPT_INTENT(message: string): string {
  return `Classify the intent of this WhatsApp message.
Return ONLY one of: question, command, greeting, farewell, complaint, other

Message: "${message}"

Intent:`;
}

/** Auto-reply suggestion prompt */
export function PROMPT_AUTO_REPLY(
  context: string,
  incomingMessage: string
): string {
  return `Given this conversation context, suggest a helpful auto-reply.

Context: ${context}
Incoming message: "${incomingMessage}"

Suggest a concise, friendly reply (under 300 characters):`;
}

/** Summarize conversation prompt */
export function PROMPT_SUMMARY(messages: string[]): string {
  return `Summarize this WhatsApp conversation in 3 bullet points:

${messages.slice(-20).join('\n')}

Summary:`;
}
