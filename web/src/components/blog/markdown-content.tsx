import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="article-body w-full min-w-0 max-w-full overflow-hidden">
      <div className="prose prose-lg prose-neutral dark:prose-invert w-full max-w-none break-words prose-headings:scroll-mt-20 prose-headings:break-words prose-p:leading-relaxed prose-li:leading-relaxed prose-a:break-words prose-a:text-accent prose-strong:break-words prose-img:mx-auto prose-img:max-h-72 prose-img:w-full prose-img:max-w-full prose-img:rounded-xl prose-img:object-cover">
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
            p: ({ children }) => <p className="break-words">{children}</p>,
            li: ({ children }) => <li className="break-words">{children}</li>,
            a: ({ href, children }) => (
              <a href={href} className="break-words" rel="noopener noreferrer">
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="my-6 w-full max-w-full overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-0 text-left text-sm">{children}</table>
              </div>
            ),
            pre: ({ children }) => (
              <pre className="max-w-full overflow-x-auto rounded-xl bg-muted p-4 text-sm">
                {children}
              </pre>
            ),
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
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
