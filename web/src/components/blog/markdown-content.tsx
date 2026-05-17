import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-accent prose-img:mx-auto prose-img:max-h-72 prose-img:w-full prose-img:rounded-xl prose-img:object-cover">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h2: ({ children }) => (
            <h2 className="font-display text-2xl font-bold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-xl font-semibold">{children}</h3>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src ?? ""}
              alt={alt ?? ""}
              loading="lazy"
              className="mx-auto max-h-72 w-full rounded-xl object-cover"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
