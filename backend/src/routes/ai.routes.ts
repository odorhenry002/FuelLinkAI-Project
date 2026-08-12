import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { runAiCompletion, getAvailableProviders, getAiUsageSummary } from '../services/ai.service.js';
import { authenticate } from '../middleware/auth.js';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1).max(10000),
    }),
  ).min(1).max(50),
  model: z.string().optional(),
  responseFormat: z.enum(['text', 'json']).optional(),
});

export async function registerAiRoutes(app: FastifyInstance): Promise<void> {
  app.post('/ai/chat', { preHandler: authenticate }, async (request, reply) => {
    const auth = request.auth!;
    const body = chatSchema.parse(request.body);

    const result = await runAiCompletion(
      { userId: auth.userId, tenantId: auth.tenantId, agent: 'copilot' },
      {
        messages: body.messages,
        model: body.model,
        responseFormat: body.responseFormat,
      },
    );

    return reply.send({
      content: result.content,
      model: result.model,
      provider: result.provider,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        costUsd: result.costUsd,
        latencyMs: result.latencyMs,
      },
    });
  });

  app.get('/ai/providers', { preHandler: authenticate }, async () => ({
    providers: getAvailableProviders(),
  }));

  app.get('/ai/usage', { preHandler: authenticate }, async (request) => {
    const auth = request.auth!;
    const summary = await getAiUsageSummary(auth.tenantId);
    return { usage: summary };
  });
}