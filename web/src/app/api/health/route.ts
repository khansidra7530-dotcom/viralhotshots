import { NextResponse } from "next/server";

export async function GET() {
  const groqKeyConfigured = Boolean(process.env.GROQ_API_KEY?.trim());
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
