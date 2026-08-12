/**
 * AI Provider Abstraction Layer
 * -----------------------------
 * FuelLink AI supports pluggable AI providers so models can be
 * swapped without rewriting application code.
 */

export type AiProviderName = 'mock' | 'openai' | 'anthropic' | 'azure-openai';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionRequest {
  messages: AiMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Structured output schema hint (provider-specific) */
  responseFormat?: 'text' | 'json';
}

export interface AiCompletionResult {
  content: string;
  model: string;
  provider: AiProviderName;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
  raw?: unknown;
}

export interface AiProvider {
  readonly name: AiProviderName;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
  isAvailable(): boolean;
}

/** Approximate USD cost per 1K tokens (used for cost tracking). */
export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
}

export const DEFAULT_PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  'gpt-4o': { inputPer1k: 0.0025, outputPer1k: 0.01 },
  'claude-3-5-sonnet': { inputPer1k: 0.003, outputPer1k: 0.015 },
  'claude-3-haiku': { inputPer1k: 0.00025, outputPer1k: 0.00125 },
};

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = DEFAULT_PRICING[model] ?? { inputPer1k: 0.001, outputPer1k: 0.002 };
  return (
    (promptTokens / 1000) * pricing.inputPer1k +
    (completionTokens / 1000) * pricing.outputPer1k
  );
}