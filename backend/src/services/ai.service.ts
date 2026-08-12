import { getActiveProvider, listProviders } from '../ai/index.js';
import { AiCompletionRequest, AiCompletionResult } from '../ai/types.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface AiCallContext {
  userId: string;
  tenantId: string;
  agent: string;
}

/**
 * Central AI service.
 * Routes to the active provider, records usage/cost, and writes
 * an AI audit trail for governance.
 */
export async function runAiCompletion(
  context: AiCallContext,
  request: AiCompletionRequest,
): Promise<AiCompletionResult> {
  const provider = getActiveProvider();
  const started = Date.now();

  try {
    const result = await provider.complete(request);

    await prisma.aiUsage.create({
      data: {
        userId: context.userId,
        tenantId: context.tenantId,
        agent: context.agent,
        provider: result.provider,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        costUsd: result.costUsd,
        latencyMs: result.latencyMs,
        status: 'success',
      },
    });

    await prisma.aiAuditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        agent: context.agent,
        action: 'ai.completion',
        input: { messages: request.messages },
        output: { content: result.content },
        approved: false,
      },
    });

    return result;
  } catch (error) {
    const latencyMs = Date.now() - started;
    logger.error({ error, agent: context.agent }, 'ai.completion_failed');

    await prisma.aiUsage.create({
      data: {
        userId: context.userId,
        tenantId: context.tenantId,
        agent: context.agent,
        provider: provider.name,
        model: request.model ?? 'unknown',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
        latencyMs,
        status: 'error',
      },
    }).catch((logError) => {
      logger.error({ error: logError }, 'ai.usage_log_failed');
    });

    throw error;
  }
}

export function getAvailableProviders() {
  return listProviders();
}

export async function getAiUsageSummary(tenantId: string) {
  const [total, byAgent, recent] = await Promise.all([
    prisma.aiUsage.aggregate({
      where: { tenantId },
      _sum: { totalTokens: true, costUsd: true },
      _count: true,
    }),
    prisma.aiUsage.groupBy({
      by: ['agent'],
      where: { tenantId },
      _sum: { totalTokens: true, costUsd: true },
      _count: true,
    }),
    prisma.aiUsage.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return {
    totalTokens: total._sum.totalTokens ?? 0,
    totalCostUsd: total._sum.costUsd ?? 0,
    totalCalls: total._count,
    byAgent,
    recent,
  };
}