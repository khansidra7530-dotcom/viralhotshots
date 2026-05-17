import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { SocialShare } from "@/components/blog/social-share";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleActions } from "@/components/blog/article-actions";
import { CommentSection } from "@/components/blog/comment-section";
import { auth } from "@/lib/auth";
import { AdSlot } from "@/components/ads/ad-slot";
import { prisma } from "@/lib/prisma";
import { buildMetadata, articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate, absoluteUrl } from "@/lib/utils";
import { getRelatedArticles, incrementViewCount } from "@/lib/articles";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/blog/${slug}`,
    image: article.featuredImage,
    type: "article",
    publishedTime: article.publishedAt?.toISOString(),
    modifiedTime: article.updatedAt.toISOString(),
    tags: article.tags,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      author: true,
      comments: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!article) notFound();

  const session = await auth();
  await incrementViewCount(article.id);

  const related = await getRelatedArticles(article.id, article.categoryId);
  const url = absoluteUrl(`/blog/${slug}`);
  const faq = (article.faq as { question: string; answer: string }[] | null) ?? [];

  const jsonLd = [
    articleJsonLd({
      title: article.title,
      description: article.metaDescription,
      url,
      image: article.featuredImage,
      datePublished: article.publishedAt?.toISOString() ?? article.createdAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      authorName: article.author.name,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: absoluteUrl("/") },
      { name: article.category.name, url: absoluteUrl(`/category/${article.category.slug}`) },
      { name: article.title, url },
    ]),
    ...(faq.length ? [faqJsonLd(faq)] : []),
  ];

  return (
  <>
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
          <div>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: article.category.name, href: `/category/${article.category.slug}` },
                { label: article.title },
              ]}
            />
            <header>
              <p className="section-label w-fit">{article.category.name}</p>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {article.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>By {article.author.name}</span>
                {article.publishedAt && (
                  <time dateTime={article.publishedAt.toISOString()}>
                    {formatDate(article.publishedAt)}
                  </time>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readingTimeMinutes} min read
                </span>
              </div>
              <div className="mt-6">
                <SocialShare title={article.title} slug={article.slug} />
              </div>
              <ArticleActions articleId={article.id} isLoggedIn={Boolean(session?.user)} />
            </header>

            <div className="relative mt-8 aspect-[2/1] max-h-[min(420px,55vh)] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-border sm:rounded-3xl">
              <Image
                src={article.featuredImage ?? "/og-default.png"}
                alt={article.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>

            <AdSlot slot="in-article-top" className="my-8" />

            <div className="mt-8">
              <MarkdownContent content={article.content} />
            </div>

            <AdSlot slot="in-article-bottom" className="my-8" />

            {faq.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                <dl className="mt-6 space-y-6">
                  {faq.map((item) => (
                    <div key={item.question}>
                      <dt className="font-semibold">{item.question}</dt>
                      <dd className="mt-2 text-muted-foreground">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <CommentSection
              articleId={article.id}
              initialComments={article.comments.map((c) => ({
                id: c.id,
                name: c.name,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
              }))}
            />
          </div>

          <aside className="mt-10 space-y-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              <AdSlot slot="sidebar-sticky" format="vertical" />
              <div>
                <h3 className="font-semibold">Related articles</h3>
                <ul className="mt-4 space-y-3">
                  {related.map((r) => (
                    <li key={r.id}>
                      <a href={`/blog/${r.slug}`} className="text-sm hover:text-accent">
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="text-2xl font-bold">You might also like</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ArticleCard
                  key={r.id}
                  slug={r.slug}
                  title={r.title}
                  excerpt={r.excerpt}
                  featuredImage={r.featuredImage}
                  category={r.category}
                  publishedAt={r.publishedAt}
                  readingTimeMinutes={r.readingTimeMinutes}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
