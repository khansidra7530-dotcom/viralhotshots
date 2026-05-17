import { NextResponse } from "next/server";
import { getGroqApiKey } from "@/lib/ai/client";

export async function GET() {
  const groqKey = getGroqApiKey();
  const groqKeyConfigured = Boolean(groqKey);
  const legacyOpenAiKey = Boolean(process.env.OPENAI_API_KEY?.trim());

  return NextResponse.json({
    ok: true,
    site: "viralhotshots",
    ai: {
      engine: "groq",
      groqKeyConfigured,
      /** Remove OPENAI_API_KEY from Vercel if true */
      legacyOpenAiKeyStillSet: legacyOpenAiKey,
      ready: groqKeyConfigured && !legacyOpenAiKey,
    },
  });
}
