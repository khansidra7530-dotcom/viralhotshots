import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

/** Strip accidental code-fence wrappers so the whole article is not one <pre> block. */
function normalizeArticleMarkdown(content: string): string {
  let text = content.trim();
  const wrapped = text.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```\s*$/i);
  if (wrapped) text = wrapped[1].trim();
  return text;
}

export function MarkdownContent({ content }: { content: string }) {
  const markdown = normalizeArticleMarkdown(content);

  return (
    <div className="article-body w-full min-w-0 max-w-full">
      <div className="prose prose-lg prose-neutral dark:prose-invert w-full max-w-none font-sans break-words prose-headings:scroll-mt-20 prose-headings:break-words prose-p:font-sans prose-p:leading-relaxed prose-p:whitespace-normal prose-li:leading-relaxed prose-li:whitespace-normal prose-a:break-words prose-a:text-accent prose-strong:break-words prose-code:break-words prose-pre:whitespace-pre-wrap prose-pre:break-words prose-img:mx-auto prose-img:max-h-72 prose-img:w-full prose-img:max-w-full prose-img:rounded-xl prose-img:object-cover">
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
            a: ({ href, children }) => (
              <a href={href} className="break-words" rel="noopener noreferrer">
                {children}
              </a>
            ),
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
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src ?? ""}
                alt={alt ?? ""}
                loading="lazy"
                className="mx-auto max-h-72 w-full max-w-full rounded-xl object-cover"
              />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
