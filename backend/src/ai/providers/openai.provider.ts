import { AiProvider, AiCompletionRequest, AiCompletionResult, AiProviderName, estimateCost } from '../types.js';
import { env } from '../../config/env.js';
import { AiProviderError } from '../../lib/errors.js';

/**
 * OpenAI-compatible provider.
 * Uses the standard Chat Completions API. Also compatible with
 * Azure OpenAI and other OpenAI-compatible endpoints via AI_BASE_URL.
 */
export class OpenAiProvider implements AiProvider {
  readonly name: AiProviderName = 'openai';

  isAvailable(): boolean {
    return Boolean(env.AI_API_KEY);
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    if (!this.isAvailable()) {
      throw new AiProviderError('OpenAI provider is not configured (missing AI_API_KEY)');
    }

    const started = Date.now();
    const model = request.model ?? env.AI_MODEL;
    const baseUrl = env.AI_BASE_URL ?? 'https://api.openai.com/v1';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS,
          temperature: request.temperature ?? env.AI_TEMPERATURE,
          response_format:
            request.responseFormat === 'json' ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(env.AI_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new AiProviderError(`OpenAI API error ${response.status}: ${body}`);
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      const content = data.choices[0]?.message?.content ?? '';
      const promptTokens = data.usage?.prompt_tokens ?? 0;
      const completionTokens = data.usage?.completion_tokens ?? 0;
      const latencyMs = Date.now() - started;

      return {
        content,
        model,
        provider: this.name,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        costUsd: estimateCost(model, promptTokens, completionTokens),
        raw: data,
      };
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError('OpenAI request failed', error);
    }
  }
}