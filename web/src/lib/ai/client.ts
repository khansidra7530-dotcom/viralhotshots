import OpenAI from "openai";

export type AiProvider = "groq" | "gemini" | "openai";

export function isAiConfigured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim()
  );
}

export function resolveAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "groq" || explicit === "gemini" || explicit === "openai") {
    return explicit;
  }
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  throw new Error(
    "No AI API key configured. Add GROQ_API_KEY (free) or GEMINI_API_KEY or OPENAI_API_KEY."
  );
}

export function getDefaultModel(provider: AiProvider): string {
  switch (provider) {
    case "groq":
      return "llama-3.3-70b-versatile";
    case "gemini":
      return "gemini-2.0-flash";
    case "openai":
      return "gpt-4o-mini";
  }
}

export function resolveModel(settingsModel?: string | null): {
  provider: AiProvider;
  model: string;
} {
  const provider = resolveAiProvider();
  const model =
    settingsModel?.trim() ||
    process.env.AI_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    getDefaultModel(provider);
  return { provider, model };
}

async function callOpenAiCompatible(
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
  if (!raw) throw new Error("Empty AI response");
  return raw;
}

async function callGemini(model: string, system: string, user: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.75,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Empty Gemini response");
  return raw;
}

function getOpenAiCompatibleClient(provider: "groq" | "openai"): OpenAI {
  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
    return new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export async function callAiModel(
  model: string,
  system: string,
  user: string
): Promise<string> {
  const provider = resolveAiProvider();

  if (provider === "gemini") {
    return callGemini(model, system, user);
  }

  const client = getOpenAiCompatibleClient(provider);
  return callOpenAiCompatible(client, model, system, user);
}
