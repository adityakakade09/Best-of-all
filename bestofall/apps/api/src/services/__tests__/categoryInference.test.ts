import { describe, expect, it } from 'vitest';
import { inferCategory } from '../categoryInference';

describe('inferCategory', () => {
  it('infers food from a pizza query', () => {
    expect(inferCategory('cheese pizza')).toBe('food');
  });
  it('infers electronics from an iphone query', () => {
    expect(inferCategory('iPhone 16 Pro')).toBe('electronics');
  });
  it('infers groceries from a milk query', () => {
    expect(inferCategory('Amul milk 1L')).toBe('groceries');
  });
  it('infers fashion from a shoes query', () => {
    expect(inferCategory('Nike running shoes')).toBe('fashion');
  });
  it('falls back to other for unknown queries', () => {
    expect(inferCategory('asdkjhaskjdh')).toBe('other');
  });
});
