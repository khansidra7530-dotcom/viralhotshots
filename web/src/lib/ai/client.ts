import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const BODY_GROQ_MODEL = "llama-3.1-8b-instant";
const FALLBACK_GROQ_MODEL = "llama-3.1-8b-instant";

/** Groq free tier TPM per request is often 12k — keep input + max_tokens under this. */
export const GROQ_SAFE_MAX_OUTPUT = 5500;
export const GROQ_BODY_MAX_OUTPUT = 4800;
export const GROQ_META_MAX_OUTPUT = 2048;

/** Reads GROQ_API_KEY (also accepts common Vercel typo Groq_API_KEY). */
export function getGroqApiKey(): string | undefined {
  return (
    process.env.GROQ_API_KEY?.trim() ||
    process.env.Groq_API_KEY?.trim() ||
    undefined
  );
}

export function isAiConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

const NON_GROQ_MODEL_PREFIXES = /^(gpt-|o[0-9]|claude-|gemini-)/i;

export function getGroqModel(settingsModel?: string | null): string {
  const requested =
    settingsModel?.trim() ||
    process.env.GROQ_MODEL?.trim() ||
    process.env.AI_MODEL?.trim() ||
    "";

  if (requested && !NON_GROQ_MODEL_PREFIXES.test(requested)) {
    return requested;
  }

  return DEFAULT_GROQ_MODEL;
}

/** Model for article body — defaults to 70b for length/quality; override with GROQ_BODY_MODEL. */
export function getGroqBodyModel(settingsModel?: string | null): string {
  const requested = process.env.GROQ_BODY_MODEL?.trim() ?? "";
  if (requested && !NON_GROQ_MODEL_PREFIXES.test(requested)) {
    return requested;
  }
  const settings = settingsModel?.trim();
  if (settings && !NON_GROQ_MODEL_PREFIXES.test(settings)) {
    return settings;
  }
  return DEFAULT_GROQ_MODEL;
}

function getGroqClient(): OpenAI {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com/keys"
    );
  }
  return new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
}

function groqErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
}

function isGroqJsonFailure(err: unknown): boolean {
  const msg = groqErrorMessage(err);
  return (
    msg.includes("failed to generate json") ||
    msg.includes("failed_generation") ||
    msg.includes("json_validate_failed")
  );
}

function isGroqTokenLimit(err: unknown): boolean {
  const msg = groqErrorMessage(err);
  return (
    msg.includes("413") ||
    msg.includes("too large") ||
    msg.includes("tpm") ||
    msg.includes("request too large")
  );
}

function isRetryableGroqError(err: unknown): boolean {
  return isGroqJsonFailure(err) || isGroqTokenLimit(err);
}

async function callGroqChat(
  client: OpenAI,
  model: string,
  system: string,
  user: string,
  options?: { jsonMode?: boolean; maxTokens?: number }
): Promise<string> {
  const jsonMode = options?.jsonMode ?? true;
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: jsonMode ? 0.6 : 0.75,
    max_tokens: options?.maxTokens ?? (jsonMode ? GROQ_META_MAX_OUTPUT : GROQ_SAFE_MAX_OUTPUT),
    ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty Groq response");
  return raw;
}

export async function callAiModel(
  model: string,
  system: string,
  user: string,
  options?: { jsonMode?: boolean; maxTokens?: number }
): Promise<string> {
  const client = getGroqClient();
  const baseMax = options?.maxTokens ?? GROQ_SAFE_MAX_OUTPUT;
  const models = [
    model,
    ...(model !== BODY_GROQ_MODEL ? [BODY_GROQ_MODEL] : []),
    ...(model !== FALLBACK_GROQ_MODEL ? [FALLBACK_GROQ_MODEL] : []),
  ];
  const uniqueModels = [...new Set(models)];

  const attempts: { model: string; jsonMode: boolean; maxTokens: number }[] = [];
  for (const m of uniqueModels) {
    attempts.push({ model: m, jsonMode: options?.jsonMode ?? true, maxTokens: baseMax });
    attempts.push({
      model: m,
      jsonMode: options?.jsonMode ?? true,
      maxTokens: Math.min(3500, baseMax),
    });
    if (options?.jsonMode !== false) {
      attempts.push({ model: m, jsonMode: false, maxTokens: Math.min(3500, baseMax) });
    }
  }

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      return await callGroqChat(client, attempt.model, system, user, {
        jsonMode: attempt.jsonMode,
        maxTokens: attempt.maxTokens,
      });
    } catch (err) {
      lastError = err;
      if (!isRetryableGroqError(err)) throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Groq request failed");
}

export function groqPause(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAiProviderLabel(): string {
  return "groq";
}
