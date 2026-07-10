"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function MarkdownBody({ source }: { source: string }) {
  // Drop the first H1 — page already renders title from catalog
  const body = source.replace(/^#\s+.+\n+/, "");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h2: ({ children, ...props }) => {
          const text = String(children);
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return (
            <h2 id={id} {...props}>
              {children}
            </h2>
          );
        },
        a: ({ href, children, ...props }) => {
          if (href?.endsWith(".md")) {
            const cleaned = href.replace(/^\.\.\//, "").replace(/\.md$/, "");
            const parts = cleaned.split("/");
            if (parts.length >= 2) {
              const cat = parts[parts.length - 2];
              const slug = parts[parts.length - 1];
              return (
                <a href={`/q/${cat}/${slug}/`} {...props}>
                  {children}
                </a>
              );
            }
          }
          return (
            <a href={href} {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
