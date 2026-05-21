import { calculateSeoScore, normalizeMetaDescription, normalizeSeoTitle } from "@/lib/seo";
import { callMarketingLlm } from "@/lib/marketing/llm/router";
import { parseModelJson } from "@/lib/ai/json-parse";
import type { AgentResult } from "@/lib/marketing/types";

type SeoAuditInput = {
  title: string;
  metaDescription: string;
  content: string;
  tags: string[];
  primaryKeyword?: string;
  settingsModel?: string | null;
  settingsPreferred?: string | null;
};

type SeoAuditResult = {
  title: string;
  metaDescription: string;
  tags: string[];
  primaryKeyword: string;
  seoScore: number;
  suggestions: string[];
  aiSearchSnippets: string[];
};

export async function runSeoAgent(input: SeoAuditInput): Promise<AgentResult<SeoAuditResult>> {
  const started = Date.now();
  try {
    const system = `You are an expert SEO strategist focused on EEAT, Google Search, and AI answer engines (ChatGPT, Perplexity, Google AI Overviews).
Return JSON: { "title", "metaDescription", "tags": string[], "primaryKeyword", "suggestions": string[], "aiSearchSnippets": string[] }
Keep title 50-60 chars, meta 120-160 chars. Tags max 8.`;

    const user = `Optimize this article for SEO and AI search:
Title: ${input.title}
Meta: ${input.metaDescription}
Primary keyword hint: ${input.primaryKeyword ?? "infer from content"}
Tags: ${input.tags.join(", ")}
Content excerpt: ${input.content.slice(0, 2000)}`;

    const { text } = await callMarketingLlm(system, user, {
      settingsModel: input.settingsModel,
      settingsPreferred: input.settingsPreferred,
      jsonMode: true,
    });
    const parsed = parseModelJson<{
      title?: string;
      metaDescription?: string;
      tags?: string[];
      primaryKeyword?: string;
      suggestions?: string[];
      aiSearchSnippets?: string[];
    }>(text);

    const title = normalizeSeoTitle(parsed.title ?? input.title);
    const metaDescription = normalizeMetaDescription(parsed.metaDescription ?? input.metaDescription);
    const tags = (parsed.tags ?? input.tags).slice(0, 10);
    const primaryKeyword = parsed.primaryKeyword ?? input.primaryKeyword ?? tags[0] ?? "";

    const seoScore = calculateSeoScore({
      title,
      metaDescription,
      content: input.content,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      tags,
      primaryKeyword,
      hasFeaturedImage: true,
      hasFaq: input.content.toLowerCase().includes("faq"),
      hasSources: input.content.includes("http"),
    });

    return {
      agent: "seo",
      ok: true,
      data: {
        title,
        metaDescription,
        tags,
        primaryKeyword,
        seoScore,
        suggestions: parsed.suggestions ?? [],
        aiSearchSnippets: parsed.aiSearchSnippets ?? [],
      },
      durationMs: Date.now() - started,
    };
  } catch (error) {
    return {
      agent: "seo",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - started,
    };
  }
}
