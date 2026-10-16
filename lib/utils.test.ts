import { describe, expect, it } from 'vitest';

import { formatCurrency, parseJsonArray, slugify } from './utils';

describe('utils', () => {
  it('slugifies strings consistently', () => {
    expect(slugify('Casa & Conforto')).toBe('casa-conforto');
  });

  it('parses JSON arrays safely', () => {
    expect(parseJsonArray<string>('["a","b"]')).toEqual(['a', 'b']);
    expect(parseJsonArray<string>('not-json')).toEqual([]);
  });

  it('formats BRL values correctly', () => {
    expect(formatCurrency(17900)).toBe('R$ 179,00');
  });
});
