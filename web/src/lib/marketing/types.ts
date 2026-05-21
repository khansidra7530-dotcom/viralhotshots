import type { Niche, SocialPlatform, TrendSource } from "@/generated/prisma/client";

export type RawTrendItem = {
  query: string;
  title: string;
  summary?: string;
  source: TrendSource;
  niche?: Niche;
  trafficScore: number;
  viralScore: number;
  keywords: string[];
  url?: string;
  metadata?: Record<string, unknown>;
};

export type ScoredTrend = RawTrendItem & {
  competitionScore: number;
  overallScore: number;
};

export type SocialPostDraft = {
  platform: SocialPlatform;
  content: string;
  threadParts?: string[];
  scheduledAt?: Date;
};

export type AgentResult<T = unknown> = {
  agent: string;
  ok: boolean;
  data?: T;
  error?: string;
  durationMs: number;
};

export type MarketingDailyReport = {
  researchRunId?: string;
  trendsFound: number;
  articlesCreated: number;
  socialPostsCreated: number;
  socialPostsPublished: number;
  articlesOptimized: number;
  errors: string[];
};
