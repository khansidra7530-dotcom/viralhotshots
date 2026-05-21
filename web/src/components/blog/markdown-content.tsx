import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { SITE_URL } from "@/lib/constants";
import { resizeImageUrl } from "@/lib/image-utils";
import { sanitizeArticleContent } from "@/lib/sanitize-content";

/** Strip accidental code-fence wrappers so the whole article is not one <pre> block. */
function normalizeArticleMarkdown(content: string): string {
  let text = content.trim();
  const wrapped = text.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```\s*$/i);
  if (wrapped) text = wrapped[1].trim();
  return text;
}

function isBlockedHref(href: string | undefined): boolean {
  if (!href?.startsWith("http")) return false;
  try {
    const host = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
    const blocked = ["example.com", "example.org", "aiwriter.com", "aiassistant.com", "aianalytics.com"];
    return blocked.some((b) => host === b || host.endsWith(`.${b}`));
  } catch {
    return true;
  }
}

export function MarkdownContent({ content }: { content: string }) {
  const markdown = normalizeArticleMarkdown(sanitizeArticleContent(content));

  return (
    <div className="article-body w-full min-w-0 max-w-full">
      <div className="prose prose-lg prose-neutral dark:prose-invert w-full max-w-none font-sans break-words prose-headings:scroll-mt-20 prose-headings:break-words prose-p:font-sans prose-p:leading-relaxed prose-p:whitespace-normal prose-li:leading-relaxed prose-li:whitespace-normal prose-a:break-words prose-a:text-accent prose-strong:break-words prose-code:break-words prose-pre:whitespace-pre-wrap prose-pre:break-words prose-img:mx-auto prose-img:h-auto prose-img:w-full prose-img:max-w-full prose-img:rounded-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            h2: ({ children }) => (
              <h2 className="font-display text-2xl font-bold tracking-tight break-words">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-xl font-semibold break-words">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="whitespace-normal break-words font-sans">{children}</p>
            ),
            li: ({ children }) => (
              <li className="whitespace-normal break-words">{children}</li>
            ),
            a: ({ href, children }) => {
              if (isBlockedHref(href)) {
                return <span className="break-words">{children}</span>;
              }
              const isExternal =
                href?.startsWith("http") &&
                !href.startsWith(SITE_URL) &&
                !href.includes("viralhotshots.com");
              return (
                <a
                  href={href}
                  className="break-words"
                  {...(isExternal
                    ? { rel: "noopener noreferrer sponsored", target: "_blank" }
                    : {})}
                >
                  {children}
                </a>
              );
            },
            table: ({ children }) => (
              <div className="my-6 w-full max-w-full overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-0 table-fixed text-left text-sm">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="break-words px-3 py-2 align-top font-sans">{children}</th>
            ),
            td: ({ children }) => (
              <td className="break-words px-3 py-2 align-top font-sans">{children}</td>
            ),
            pre: ({ children }) => (
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/50 p-4 font-sans text-sm">
                {children}
              </pre>
            ),
            code: ({ children, className }) => {
              const isBlock = Boolean(className);
              if (isBlock) {
                return <code className={className}>{children}</code>;
              }
              return (
                <code className="break-words rounded bg-muted/60 px-1.5 py-0.5 font-sans text-sm">
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => {
              const raw = typeof src === "string" ? src : "";
              const optimized =
                raw.startsWith("http") ? resizeImageUrl(raw, 768) : raw;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={optimized}
                  alt={alt ?? ""}
                  loading="lazy"
                  decoding="async"
                  width={768}
                  height={478}
                  className="mx-auto h-auto w-full max-w-full rounded-xl"
                />
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
