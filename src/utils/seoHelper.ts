/**
 * SEO Helper Utilities
 * Provides auto-suggestions and generation for SEO fields
 */

/**
 * Generate SEO title from name/title
 */
export const generateSEOTitle = (name: string, maxLength: number = 60): string => {
  if (!name) return '';
  
  // Remove extra spaces and trim
  let title = name.trim().replace(/\s+/g, ' ');
  
  // If too long, truncate at word boundary
  if (title.length > maxLength) {
    title = title.substring(0, maxLength).trim();
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 0) {
      title = title.substring(0, lastSpace);
    }
    title += ' | WAINSO';
  } else {
    title += ' | WAINSO';
  }
  
  return title;
};

/**
 * Generate SEO description from content
 */
export const generateSEODescription = (
  shortDescription: string,
  description: string,
  maxLength: number = 160
): string => {
  // Prefer short description, fallback to description
  let content = shortDescription || description || '';
  
  // Strip HTML tags if present
  content = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // If too long, truncate at word boundary
  if (content.length > maxLength) {
    content = content.substring(0, maxLength).trim();
    const lastSpace = content.lastIndexOf(' ');
    if (lastSpace > 0) {
      content = content.substring(0, lastSpace);
    }
    content += '...';
  }
  
  return content;
};

/**
 * Generate SEO keywords from name, description, and category
 */
export const generateSEOKeywords = (
  name: string,
  description: string,
  category?: string,
  brand?: string,
  location?: string
): string[] => {
  const keywords: string[] = [];
  
  // Add name words (2+ characters)
  if (name) {
    const nameWords = name
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !['the', 'and', 'or', 'for', 'with'].includes(w));
    keywords.push(...nameWords);
  }
  
  // Add category
  if (category) {
    keywords.push(category.toLowerCase());
  }
  
  // Add brand
  if (brand) {
    keywords.push(brand.toLowerCase());
  }
  
  // Add location
  if (location) {
    keywords.push(location.toLowerCase());
  }
  
  // Extract important words from description (common SEO terms)
  if (description) {
    const descLower = description.toLowerCase();
    const importantTerms = [
      'professional',
      'quality',
      'service',
      'installation',
      'maintenance',
      'support',
      'warranty',
      'certified',
      'authorized',
      'dealer',
      'expert',
      'best',
      'top',
      'leading',
      'trusted'
    ];
    
    importantTerms.forEach((term) => {
      if (descLower.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
      }
    });
  }
  
  // Add common location-based keywords if location exists
  if (location) {
    keywords.push(`${location} services`, `${location} dealer`);
  }
  
  // Remove duplicates and limit to 10
  return Array.from(new Set(keywords)).slice(0, 10);
};

/**
 * Generate Open Graph title
 */
export const generateOGTitle = (name: string): string => {
  return generateSEOTitle(name, 60);
};

/**
 * Generate Open Graph description
 */
export const generateOGDescription = (shortDescription: string, description: string): string => {
  return generateSEODescription(shortDescription, description, 200);
};

/**
 * Generate canonical URL
 */
export const generateCanonicalURL = (slug: string, baseUrl: string = 'https://wainso.com'): string => {
  return `${baseUrl}/${slug}`;
};



