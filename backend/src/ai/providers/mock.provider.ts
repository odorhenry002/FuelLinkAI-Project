import { AiProvider, AiCompletionRequest, AiCompletionResult, AiProviderName, estimateCost } from '../types.js';
import { env } from '../../config/env.js';

/**
 * Mock AI provider.
 * Returns deterministic, useful responses without any external API.
 * Used for development, testing, and as a safe fallback.
 */
export class MockAiProvider implements AiProvider {
  readonly name: AiProviderName = 'mock';

  isAvailable(): boolean {
    return true;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const started = Date.now();
    const model = request.model ?? env.AI_MODEL;
    const lastUserMessage = [...request.messages].reverse().find((m) => m.role === 'user');
    const prompt = lastUserMessage?.content ?? '';

    const content = this.generateResponse(prompt, request.responseFormat);

    const promptTokens = Math.max(1, Math.ceil(prompt.length / 4));
    const completionTokens = Math.max(1, Math.ceil(content.length / 4));
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
    };
  }

  private generateResponse(prompt: string, format?: 'text' | 'json'): string {
    const lower = prompt.toLowerCase();

    if (format === 'json') {
      return JSON.stringify({
        summary: 'Mock AI response',
        suggestions: ['Review supplier pricing', 'Optimise procurement spend'],
        confidence: 0.85,
      });
    }

    if (lower.includes('quote') || lower.includes('compare')) {
      return 'Based on the available data, I recommend comparing at least 3 suppliers. ' +
        'Consider total cost of ownership, delivery lead times, and supplier trust scores. ' +
        'The current best-value option balances price with verified delivery performance.';
    }

    if (lower.includes('risk')) {
      return 'Risk assessment: The supplier profile shows moderate risk. ' +
        'Recommend verifying certifications, checking recent performance scorecards, ' +
        'and setting up delivery milestone tracking before committing to a large order.';
    }

    if (lower.includes('forecast') || lower.includes('demand')) {
      return 'Demand forecast: Based on historical procurement patterns, ' +
        'expect a moderate increase in demand over the next quarter. ' +
        'Recommend increasing safety stock for critical items and negotiating ' +
        'volume discounts with top suppliers.';
    }

    return 'I understand your request. As your FuelLink AI assistant, I can help with ' +
      'supplier discovery, quote comparison, risk assessment, demand forecasting, ' +
      'and procurement optimisation. Please provide more specific details so I can ' +
      'give you a tailored recommendation.';
  }
}