import fs from "fs";
import path from "path";
import Link from "next/link";
import { catalog, entriesInCategory, getEntry } from "@/lib/catalog";
import { MarkdownBody } from "@/components/MarkdownBody";

export function generateStaticParams() {
  return catalog.entries.map((e) => ({ category: e.category, slug: e.slug }));
}

function readMarkdown(category: string, slug: string): string {
  const file = path.join(process.cwd(), "content", "markdown", category, `${slug}.md`);
  return fs.readFileSync(file, "utf8");
}

export default function QuestionPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const entry = getEntry(params.category, params.slug);
  if (!entry) {
    return (
      <main className="shell">
        <p>Entry not found.</p>
        <Link href="/">← Home</Link>
      </main>
    );
  }

  const md = readMarkdown(params.category, params.slug);
  const siblings = entriesInCategory(params.category);
  const idx = siblings.findIndex((e) => e.id === entry.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const category = catalog.categories.find((c) => c.id === params.category);

  return (
    <main className="shell">
      <p className="crumb">
        <Link href="/">Playbook</Link>
        {" / "}
        <Link href={`/c/${params.category}/`}>{category?.label ?? params.category}</Link>
        {" / "}
        <span>{entry.title}</span>
      </p>

      <div className="notebook">
        <aside className="toc">
          <h2>On this page</h2>
          <ol>
            {entry.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="article">
          <h1>{entry.title}</h1>
          <MarkdownBody source={md} />

          <div className="pager">
            {prev ? (
              <Link href={`/q/${prev.category}/${prev.slug}/`}>← {prev.title}</Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/q/${next.category}/${next.slug}/`}>{next.title} →</Link>
            ) : (
              <span />
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
