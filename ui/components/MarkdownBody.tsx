"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MermaidDiagram } from "@/components/MermaidDiagram";

function codeComponent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match?.[1];
  const raw = String(children).replace(/\n$/, "");

  // fenced ```mermaid → live SVG (not a highlighted code block)
  if (lang === "mermaid") {
    return <MermaidDiagram source={raw} />;
  }

  // inline code vs block: react-markdown passes inline codes without language and often without newlines
  const isBlock = Boolean(lang) || String(children).includes("\n");
  if (!isBlock) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <pre>
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
}

const components: Components = {
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
  code: codeComponent,
  // Avoid double <pre> wrapping when we already emit <pre> from code for non-mermaid blocks.
  // react-markdown v9: pre receives the code element as child — for mermaid, code returns a div.
  pre: ({ children }) => <>{children}</>,
};

export function MarkdownBody({ source }: { source: string }) {
  const body = source.replace(/^#\s+.+\n+/, "");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
      components={components}
    >
      {body}
    </ReactMarkdown>
  );
}
