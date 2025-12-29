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
 * Smart search that handles:
 * - Multi-word queries (words can be in any order)
 * - Partial matches
 * - Typos and missing characters
 * - Case-insensitive matching
 */
export function smartSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm || !searchTerm.trim()) {
    return items;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);

  // If single word or short query, use fuzzy search
  if (searchWords.length === 1 || normalizedSearch.length < 4) {
    return fuzzySearch(items, normalizedSearch, {
      keys: searchFields.map(field => String(field)),
      threshold: 0.4,
      ignoreLocation: true,
    });
  }

  // For multi-word queries, score items based on how many words match
  // Combine all searchable fields into a single searchable string for better matching
  const scoredItems = items.map(item => {
    let score = 0;
    let matchedWords = 0;

    // Combine all searchable field values into one string for comprehensive matching
    const combinedSearchText = searchFields
      .map(field => {
        const value = item[field];
        return value ? String(value).toLowerCase() : '';
      })
      .filter(Boolean)
      .join(' ');

    for (const word of searchWords) {
      let wordMatched = false;
      
      // Check in combined text first (most flexible)
      if (combinedSearchText.includes(word)) {
        score += 10;
        wordMatched = true;
      } else {
        // Check individual fields for exact word match
        for (const field of searchFields) {
          const fieldValue = item[field];
          if (fieldValue) {
            const normalizedValue = String(fieldValue).toLowerCase();
            
            // Exact word match (highest score)
            if (normalizedValue.includes(word)) {
              score += 10;
              wordMatched = true;
              break;
            }
            
            // Check if word appears as a whole word (not just substring)
            const wordsInField = normalizedValue.split(/\s+/);
            if (wordsInField.some(fieldWord => fieldWord.includes(word) || word.includes(fieldWord))) {
              score += 8;
              wordMatched = true;
              break;
            }
          }
        }
        
        // Fuzzy match (partial word) - check if all characters appear in order
        if (!wordMatched && combinedSearchText.length >= word.length) {
          let charIndex = 0;
          for (let i = 0; i < combinedSearchText.length && charIndex < word.length; i++) {
            if (combinedSearchText[i] === word[charIndex]) {
              charIndex++;
            }
          }
          if (charIndex === word.length) {
            score += 5;
            wordMatched = true;
          }
        }
      }
      
      if (wordMatched) {
        matchedWords++;
      }
    }

    // Bonus for matching all words
    if (matchedWords === searchWords.length) {
      score += 20;
    }

    return { item, score, matchedWords };
  });

  // Filter items that matched at least one word and sort by score
  // For multi-word queries, prioritize items that matched all words
  return scoredItems
    .filter(({ matchedWords }) => matchedWords > 0)
    .sort((a, b) => {
      // First, prioritize items that matched ALL words
      const aMatchedAll = a.matchedWords === searchWords.length;
      const bMatchedAll = b.matchedWords === searchWords.length;
      if (aMatchedAll !== bMatchedAll) {
        return bMatchedAll ? 1 : -1;
      }
      // Then sort by number of matched words (descending)
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      // Then by score (descending)
      return b.score - a.score;
    })
    .map(({ item }) => item);
}

/**
 * Hybrid search: combines fuzzy search for typos with smart multi-word matching
 */
export function hybridSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm || !searchTerm.trim()) {
    return items;
  }

  // Use smart search for multi-word queries
  const smartResults = smartSearch(items, searchTerm, searchFields);
  
  // If we have good results, return them
  if (smartResults.length > 0) {
    return smartResults;
  }

  // Fallback to fuzzy search for better typo tolerance
  return fuzzySearch(items, searchTerm, {
    keys: searchFields.map(field => String(field)),
    threshold: 0.5, // More lenient for typos
    ignoreLocation: true,
  });
}


