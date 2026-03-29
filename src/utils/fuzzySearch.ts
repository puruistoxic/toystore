import Fuse from 'fuse.js';

export interface FuzzySearchOptions {
  keys: string[];
  threshold?: number; // 0.0 = perfect match, 1.0 = match anything
  distance?: number; // Maximum distance for character matching
  ignoreLocation?: boolean; // Whether to ignore location of matches
  minMatchCharLength?: number; // Minimum character length to match
  includeScore?: boolean; // Include match scores in results
}

/**
 * Performs fuzzy search on an array of items
 * @param items - Array of items to search through
 * @param searchTerm - Search query string
 * @param options - Fuse.js search options
 * @returns Array of matching items, sorted by relevance
 */
export function fuzzySearch<T>(
  items: T[],
  searchTerm: string,
  options: FuzzySearchOptions
): T[] {
  if (!searchTerm || !searchTerm.trim()) {
    return items;
  }

  const fuse = new Fuse(items, {
    keys: options.keys,
    threshold: options.threshold ?? 0.4, // 0.4 = allow some typos/missing chars
    distance: options.distance ?? 100, // Allow matches even if words are far apart
    ignoreLocation: options.ignoreLocation ?? true, // Don't care about word order
    minMatchCharLength: options.minMatchCharLength ?? 2, // Match at least 2 chars
    includeScore: options.includeScore ?? false,
    // Enable fuzzy matching for typos
    findAllMatches: true,
    // Weight exact matches higher
    shouldSort: true,
    // Use extended search for better multi-word matching
    useExtendedSearch: false, // Set to true for advanced operators, but false for simplicity
  });

  const results = fuse.search(searchTerm);
  return results.map(result => result.item);
}

/**
 * Hybrid search: substring match across fields first (predictable filters), then Fuse for typos.
 * Fuse-only matching was too loose at threshold 0.4–0.5 and surfaced unrelated rows (e.g. "EKTA"
 * still matching other products).
 */
export function hybridSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  const trimmed = searchTerm?.trim();
  if (!trimmed) {
    return items;
  }

  const q = trimmed.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 0);

  const haystack = (item: T) =>
    searchFields
      .map((field) => {
        const v = item[field];
        if (v == null) return '';
        return String(v).toLowerCase();
      })
      .join(' ');

  const substringMatches = items.filter((item) => {
    const h = haystack(item);
    return words.every((w) => h.includes(w));
  });

  if (substringMatches.length > 0) {
    return substringMatches;
  }

  return fuzzySearch(items, trimmed, {
    keys: searchFields.map((field) => String(field)),
    threshold: 0.35,
    ignoreLocation: true,
  });
}


