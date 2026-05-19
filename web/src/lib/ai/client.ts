import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_GROQ_MODEL = "llama-3.1-8b-instant";

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

function getGroqClient(): OpenAI {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com/keys"
    );
  }
  return new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
}

function isGroqJsonFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("failed to generate json") ||
    msg.includes("failed_generation") ||
    msg.includes("json_validate_failed")
  );
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
    max_tokens: options?.maxTokens ?? (jsonMode ? 8192 : 12000),
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
  const models = [model, model !== FALLBACK_GROQ_MODEL ? FALLBACK_GROQ_MODEL : model];
  const attempts: { model: string; jsonMode: boolean }[] = [];

  for (const m of models) {
    attempts.push({ model: m, jsonMode: options?.jsonMode ?? true });
    if (options?.jsonMode !== false) {
      attempts.push({ model: m, jsonMode: false });
    }
  }

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const { model: attemptModel, jsonMode } = attempts[i];
    try {
      return await callGroqChat(client, attemptModel, system, user, {
        jsonMode,
        maxTokens: options?.maxTokens,
      });
    } catch (err) {
      lastError = err;
      if (!isGroqJsonFailure(err) && i === 0) throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Groq request failed");
}

export function getAiProviderLabel(): string {
  return "groq";
}
