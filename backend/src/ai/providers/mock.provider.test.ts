import { describe, it, expect } from 'vitest';
import { MockAiProvider } from './mock.provider.js';

describe('MockAiProvider', () => {
  const provider = new MockAiProvider();

  it('is always available', () => {
    expect(provider.isAvailable()).toBe(true);
  });

  it('returns a completion result', async () => {
    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Compare suppliers for diesel generators' }],
    });

    expect(result.content.length).toBeGreaterThan(0);
    expect(result.provider).toBe('mock');
    expect(result.totalTokens).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns JSON when responseFormat is json', async () => {
    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Analyse this data' }],
      responseFormat: 'json',
    });

    const parsed = JSON.parse(result.content);
    expect(parsed).toHaveProperty('summary');
    expect(parsed).toHaveProperty('suggestions');
  });

  it('returns quote comparison guidance for quote intents', async () => {
    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Compare quotes from suppliers' }],
    });

    expect(result.content.toLowerCase()).toContain('supplier');
  });
});