import { describe, expect, it } from 'vitest';
import { formatInr, formatEta, formatDistance } from '../format';

describe('formatInr', () => {
  it('formats whole rupee amounts without decimals', () => {
    expect(formatInr(1999)).toContain('1,999');
  });
});

describe('formatEta', () => {
  it('formats minutes under an hour as minutes', () => {
    expect(formatEta(25)).toBe('25 min');
  });
  it('formats hours for anything under a day', () => {
    expect(formatEta(120)).toBe('2 hrs');
  });
  it('formats days for multi-day estimates', () => {
    expect(formatEta(60 * 48)).toBe('2 days');
  });
});

describe('formatDistance', () => {
  it('returns null when no distance is given', () => {
    expect(formatDistance(undefined)).toBeNull();
  });
  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistance(0.4)).toBe('400 m');
  });
  it('formats larger distances in kilometers', () => {
    expect(formatDistance(3.2)).toBe('3.2 km');
  });
});
