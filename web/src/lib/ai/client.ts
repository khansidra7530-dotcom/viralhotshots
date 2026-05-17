import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

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

export function getGroqModel(settingsModel?: string | null): string {
  return (
    settingsModel?.trim() ||
    process.env.GROQ_MODEL?.trim() ||
    process.env.AI_MODEL?.trim() ||
    DEFAULT_GROQ_MODEL
  );
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

async function callGroqChat(
  client: OpenAI,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.75,
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty Groq response");
  return raw;
}

export async function callAiModel(
  model: string,
  system: string,
  user: string
): Promise<string> {
  const client = getGroqClient();
  return callGroqChat(client, model, system, user);
}

export function getAiProviderLabel(): string {
  return "groq";
}
