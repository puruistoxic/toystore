/**
 * Smart search helper for SQL queries
 * Handles multi-word searches where words can be in any order
 * 
 * @param {string} searchTerm - The search query
 * @param {Array<string>} fields - Array of field names to search in
 * @returns {Object} - { condition: string, params: Array }
 */
function buildSmartSearchCondition(searchTerm, fields) {
  if (!searchTerm || !searchTerm.trim()) {
    return { condition: '', params: [] };
  }

  const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (searchWords.length === 0) {
    return { condition: '', params: [] };
  }

  // For each word, it must appear in at least one field
  // This allows words to be in any order
  const wordConditions = searchWords.map(() => {
    return `(${fields.map(field => `${field} LIKE ?`).join(' OR ')})`;
  }).join(' AND ');

  const params = [];
  searchWords.forEach(word => {
    const pattern = `%${word}%`;
    fields.forEach(() => {
      params.push(pattern);
    });
  });

  return { condition: `(${wordConditions})`, params };
}

module.exports = {
  buildSmartSearchCondition
};

