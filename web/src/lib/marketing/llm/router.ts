import OpenAI from "openai";
import { callAiModel as callGroq, getGroqModel, isAiConfigured } from "@/lib/ai/client";

export type LlmProvider = "groq" | "openai" | "anthropic";

export function getPreferredLlm(settingsPreferred?: string | null): LlmProvider {
  const pref = (
    settingsPreferred ??
    process.env.PREFERRED_LLM ??
    process.env.AI_PROVIDER ??
    "groq"
  )
    .trim()
    .toLowerCase();

  if (pref === "openai" && process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (pref === "anthropic" && process.env.ANTHROPIC_API_KEY?.trim()) return "anthropic";
  if (pref === "claude" && process.env.ANTHROPIC_API_KEY?.trim()) return "anthropic";
  return "groq";
}

async function callOpenAi(system: string, user: string, jsonMode = true): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty OpenAI response");
  return raw;
}

async function callAnthropic(system: string, user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}

/** Route prompts to Groq, OpenAI, or Claude based on settings/env. */
export async function callMarketingLlm(
  system: string,
  user: string,
  options?: { jsonMode?: boolean; settingsModel?: string | null; settingsPreferred?: string | null; provider?: LlmProvider }
): Promise<{ text: string; provider: LlmProvider }> {
  const provider = options?.provider ?? getPreferredLlm(options?.settingsPreferred);

  if (provider === "openai") {
    return {
      text: await callOpenAi(system, user, options?.jsonMode ?? true),
      provider,
    };
  }

  if (provider === "anthropic") {
    const prompt =
      options?.jsonMode !== false
        ? `${user}\n\nRespond with valid JSON only.`
        : user;
    return { text: await callAnthropic(system, prompt), provider };
  }

  if (!isAiConfigured()) {
    throw new Error("No LLM configured. Set GROQ_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.");
  }

  return {
    text: await callGroq(getGroqModel(options?.settingsModel), system, user, {
      jsonMode: options?.jsonMode ?? true,
    }),
    provider: "groq",
  };
}
