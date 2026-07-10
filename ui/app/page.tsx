import Link from "next/link";
import { catalog } from "@/lib/catalog";

export default function HomePage() {
  return (
    <main className="shell">
      <p className="brand">Interview Playbook</p>
      <p className="lede">
        Staff+ study notebook — system design, coding, interview craft, and behavioral rubrics in one
        place. Read the question, answer yourself, then compare.
      </p>

      <div className="nav-row">
        <a href="https://github.com/vpeetla-ai/ai-architect-interview-playbook">GitHub source</a>
        <a href="https://ai-architect-practice-arena.vercel.app">Practice Arena (graded)</a>
        <span className="muted">{catalog.totalEntries} entries</span>
      </div>

      <div className="table-wrap">
        <table className="catalog">
          <thead>
            <tr>
              <th>Category</th>
              <th>Focus</th>
              <th>Count</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {catalog.categories.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.label}</strong>
                </td>
                <td className="muted">{c.blurb}</td>
                <td className="count">{c.count}</td>
                <td>
                  <Link href={`/c/${c.id}/`}>Open →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
