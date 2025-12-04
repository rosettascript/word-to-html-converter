/**
 * Regex Cache Utility
 * Pre-compiles and caches regex patterns for better performance
 * Avoids recompiling the same regex multiple times
 */

class RegexCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get a cached regex pattern, or compile and cache if not exists
   * @param {string} pattern - Regex pattern string
   * @param {string} flags - Regex flags (e.g., 'i', 'g', 'ig')
   * @returns {RegExp} - Compiled regex
   */
  get(pattern, flags = '') {
    const key = `${pattern}:::${flags}`; // Use ::: as separator to avoid conflicts
    
    if (!this.cache.has(key)) {
      this.cache.set(key, new RegExp(pattern, flags));
    }
    
    return this.cache.get(key);
  }

  /**
   * Pre-compile a set of common patterns
   * Call this once at module load for frequently used patterns
   * @param {Array<{pattern: string, flags: string}>} patterns
   */
  precompile(patterns) {
    patterns.forEach(({ pattern, flags = '' }) => {
      this.get(pattern, flags);
    });
  }

  /**
   * Clear the cache (useful for testing)
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      patterns: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const regexCache = new RegexCache();

// Pre-compile commonly used patterns for immediate performance gain
regexCache.precompile([
  // Whitespace patterns
  { pattern: '^\\s*$', flags: '' },
  { pattern: '\\s+', flags: 'g' },
  
  // HTML tag patterns
  { pattern: '^H[1-6]$', flags: '' },
  { pattern: '<\\/?[^>]+\\/?>', flags: 'g' },
  
  // Common content patterns
  { pattern: '[.!?]+', flags: 'g' },
  { pattern: '\\d{4}', flags: '' },
  
  // Trailing punctuation
  { pattern: ':\\s*$', flags: '' },
]);

