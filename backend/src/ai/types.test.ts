import { describe, it, expect } from 'vitest';
import { estimateCost } from './types.js';

describe('estimateCost', () => {
  it('calculates cost for known model pricing', () => {
    // gpt-4o-mini: $0.00015/1k input, $0.0006/1k output
    const cost = estimateCost('gpt-4o-mini', 1000, 1000);
    expect(cost).toBeCloseTo(0.00015 + 0.0006, 6);
  });

  it('uses default pricing for unknown models', () => {
    const cost = estimateCost('unknown-model', 1000, 1000);
    expect(cost).toBeGreaterThan(0);
  });

  it('returns zero for zero tokens', () => {
    const cost = estimateCost('gpt-4o-mini', 0, 0);
    expect(cost).toBe(0);
  });
});