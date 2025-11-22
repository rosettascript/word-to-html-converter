/**
 * Tests for core HTML processor
 */

import { describe, it, expect } from 'vitest';
import { processHTML } from './processor.js';

describe('processHTML', () => {
  it('should return empty string for empty input', () => {
    expect(processHTML('')).toBe('');
    expect(processHTML(null)).toBe('');
    expect(processHTML(undefined)).toBe('');
  });

  it('should process basic HTML', () => {
    const input = '<p>Hello world</p>';
    const result = processHTML(input, 'regular');
    expect(result).toContain('Hello world');
  });

  it('should remove inline styles', () => {
    const input = '<p style="color: red; font-size: 14px;">Hello</p>';
    const result = processHTML(input, 'regular');
    expect(result).not.toContain('style=');
    expect(result).toContain('Hello');
  });

  it('should handle different modes', () => {
    const input = '<p>Test</p>';
    expect(processHTML(input, 'regular')).toBeDefined();
    expect(processHTML(input, 'shopify-blogs')).toBeDefined();
    expect(processHTML(input, 'shopify-shoppables')).toBeDefined();
  });

  it('should handle malformed HTML gracefully', () => {
    const input = '<p>Unclosed paragraph';
    const result = processHTML(input, 'regular');
    expect(result).toContain('Unclosed paragraph');
  });
});