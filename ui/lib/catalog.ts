import catalogJson from "@/content/catalog.json";

export type CatalogEntry = {
  id: string;
  category: string;
  slug: string;
  title: string;
  path: string;
  sections: { id: string; heading: string }[];
};

export type CatalogCategory = {
  id: string;
  label: string;
  blurb: string;
  count: number;
  entryIds: string[];
};

export type Catalog = {
  totalEntries: number;
  categories: CatalogCategory[];
  entries: CatalogEntry[];
};

export const catalog = catalogJson as Catalog;

export function getCategory(id: string): CatalogCategory | undefined {
  return catalog.categories.find((c) => c.id === id);
}

export function getEntry(category: string, slug: string): CatalogEntry | undefined {
  return catalog.entries.find((e) => e.category === category && e.slug === slug);
}

export function entriesInCategory(category: string): CatalogEntry[] {
  return catalog.entries.filter((e) => e.category === category);
}
