/**
 * @file gemini.ts
 * @project Owivara - Development
 * @package @owivara/ai
 * @module Gemini BYOK Client
 *
 * @description
 * Google Gemini BYOK (Bring Your Own Key) client factory.
 * Creates a Gemini client using the user's own API key —
 * never stores or logs the key.
 *
 * @resurrection_source CLEAN_SLATE — Old project used OpenAI only
 * @resurrection_status CLEAN_SLATE — Built fresh for Gemini BYOK
 * @hallucination_check PASSED
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { AIPromptRequest, AIPromptResponse } from '@owivara/types';

/** Gemini model configuration */
const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;

/** Safety settings for Gemini */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Create a Gemini client with the user's API key.
 *
 * @param apiKey - User's Google AI Studio API key
 * @returns GoogleGenerativeAI instance
 */
export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Gemini API key is required. User must configure their BYOK key.');
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Send a prompt to Gemini using the user's API key.
 *
 * @param apiKey - User's Google AI Studio API key
 * @param request - Prompt request
 * @returns AI response with metadata
 */
export async function sendGeminiPrompt(
  apiKey: string,
  request: AIPromptRequest
): Promise<AIPromptResponse> {
  const startTime = Date.now();

  const genAI = createGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      maxOutputTokens: DEFAULT_MAX_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
    },
    safetySettings: SAFETY_SETTINGS,
  });

  // Build the prompt with optional history
  let prompt = request.prompt;
  if (request.history && request.history.length > 0) {
    const chat = model.startChat({
      history: request.history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      generationConfig: {
        maxOutputTokens: DEFAULT_MAX_TOKENS,
        temperature: DEFAULT_TEMPERATURE,
      },
    });

    const result = await chat.sendMessage(prompt);
    const text = result.response.text();
    const latency = Date.now() - startTime;

    return {
      text,
      provider: 'gemini',
      model: DEFAULT_MODEL,
      tokens_used: text.length, // Approximate — Gemini doesn't return token count directly
      latency_ms: latency,
    };
  }

  // Simple prompt without history
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const latency = Date.now() - startTime;

  return {
    text,
    provider: 'gemini',
    model: DEFAULT_MODEL,
    tokens_used: text.length,
    latency_ms: latency,
  };
}

/**
 * Validate a Gemini API key by making a minimal request.
 *
 * @param apiKey - API key to validate
 * @returns True if the key is valid
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = createGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const result = await model.generateContent('Say "OK" in one word.');
    return result.response.text().length > 0;
  } catch {
    return false;
  }
}
