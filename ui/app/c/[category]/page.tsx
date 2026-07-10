import { catalog } from "@/lib/catalog";
import CategoryClient from "./CategoryClient";

export function generateStaticParams() {
  return catalog.categories.map((c) => ({ category: c.id }));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  return <CategoryClient categoryId={params.category} />;
}
