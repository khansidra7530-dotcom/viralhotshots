import {
  callAiModel,
  getGroqBodyModel,
  groqPause,
  GROQ_BODY_MAX_OUTPUT,
} from "@/lib/ai/client";
import { parseModelJson } from "@/lib/ai/json-parse";
import {
  buildArticleContinuationPrompt,
  buildExpandPrompt,
} from "@/lib/ai/prompts";
import { countWords } from "@/lib/utils";
import type { KeywordSet } from "@/lib/ai/keywords";

type Context = {
  title: string;
  keywords: KeywordSet;
  category: string;
  metaModel: string;
};

/** Grow article body until it meets minimum word count (body only, no footer/sources). */
export async function ensureMinBodyWords(
  content: string,
  minWords: number,
  ctx: Context
): Promise<string> {
  let body = content.trim();
  const bodyModel = getGroqBodyModel();
  const metaModel = ctx.metaModel;

  for (let attempt = 0; attempt < 4 && countWords(body) < minWords; attempt++) {
    await groqPause(2000);
    const current = countWords(body);
    const shortfall = minWords - current;

    if (current < minWords * 0.75) {
      const contPrompt = buildArticleContinuationPrompt({
        title: ctx.title,
        existingContent: body,
        keywords: ctx.keywords,
        minAdditionalWords: Math.max(shortfall, 300),
      });
      const raw = await callAiModel(
        bodyModel,
        "Output only valid JSON. Continue the article.",
        contPrompt,
        { maxTokens: GROQ_BODY_MAX_OUTPUT }
      );
      const part = parseModelJson<{ content: string }>(raw);
      if (part.content?.trim()) {
        body = `${body}\n\n${part.content.trim()}`;
      }
    } else {
      const expandRaw = await callAiModel(
        attempt % 2 === 0 ? bodyModel : metaModel,
        "Expand article to required length. Output only valid JSON.",
        buildExpandPrompt(body, minWords, current),
        { maxTokens: GROQ_BODY_MAX_OUTPUT }
      );
      const expanded = parseModelJson<{ content: string }>(expandRaw);
      if (
        expanded.content?.trim() &&
        countWords(expanded.content) > countWords(body)
      ) {
        body = expanded.content.trim();
      }
    }
  }

  return body;
}
