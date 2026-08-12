import { AiProvider, AiProviderName } from './types.js';
import { MockAiProvider } from './providers/mock.provider.js';
import { OpenAiProvider } from './providers/openai.provider.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

/**
 * AI Provider Factory
 * -------------------
 * Selects the active provider based on configuration.
 * Falls back to the mock provider when a configured provider
 * is unavailable (e.g. missing API key) to keep the system usable.
 */
const providers: Record<AiProviderName, AiProvider> = {
  mock: new MockAiProvider(),
  openai: new OpenAiProvider(),
  anthropic: new OpenAiProvider(), // placeholder — swap for Anthropic SDK
  'azure-openai': new OpenAiProvider(), // placeholder — uses AI_BASE_URL
};

export function getActiveProvider(): AiProvider {
  const configured = providers[env.AI_PROVIDER as AiProviderName];
  if (configured && configured.isAvailable()) {
    return configured;
  }

  if (configured && !configured.isAvailable()) {
    logger.warn(
      { provider: env.AI_PROVIDER },
      'Configured AI provider unavailable — falling back to mock provider',
    );
  }

  return providers.mock;
}

export function listProviders(): { name: AiProviderName; available: boolean }[] {
  return (Object.keys(providers) as AiProviderName[]).map((name) => ({
    name,
    available: providers[name].isAvailable(),
  }));
}