"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { catalog, getCategory, entriesInCategory } from "@/lib/catalog";

export default function CategoryClient({ categoryId }: { categoryId: string }) {
  const category = getCategory(categoryId);
  const [q, setQ] = useState("");
  const entries = useMemo(() => {
    const all = entriesInCategory(categoryId);
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((e) => e.title.toLowerCase().includes(needle) || e.slug.includes(needle));
  }, [categoryId, q]);

  if (!category) {
    return (
      <main className="shell">
        <p>Category not found.</p>
        <Link href="/">← Home</Link>
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="crumb">
        <Link href="/">Playbook</Link> / {category.label}
      </p>
      <h1 className="brand" style={{ fontSize: "2.2rem" }}>
        {category.label}
      </h1>
      <p className="lede">{category.blurb}</p>

      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter by title…"
        aria-label="Filter entries"
      />

      <div className="table-wrap">
        <table className="catalog">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id}>
                <td className="count muted">{String(i + 1).padStart(2, "0")}</td>
                <td>{e.title}</td>
                <td>
                  <Link href={`/q/${e.category}/${e.slug}/`}>Study →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: "1rem" }}>
        {entries.length} of {category.count} · total playbook {catalog.totalEntries}
      </p>
    </main>
  );
}
