import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { runAgent, AGENT_NAMES } from '../services/agent.service.js';
import { authenticate } from '../middleware/auth.js';
import { AgentName } from '../agents/types.js';

const agentRequestSchema = z.object({
  intent: z.string().min(3).max(5000),
  data: z.record(z.unknown()).optional(),
});

export async function registerAgentRoutes(app: FastifyInstance): Promise<void> {
  app.get('/agents', { preHandler: authenticate }, async () => ({
    agents: AGENT_NAMES,
  }));

  app.post('/agents/:agent/run', { preHandler: authenticate }, async (request, reply) => {
    const auth = request.auth!;
    const { agent } = request.params as { agent: string };

    if (!AGENT_NAMES.includes(agent as AgentName)) {
      return reply.status(400).send({
        error: { code: 'INVALID_AGENT', message: `Unknown agent: ${agent}` },
      });
    }

    const body = agentRequestSchema.parse(request.body);

    const result = await runAgent(
      {
        tenantId: auth.tenantId,
        userId: auth.userId,
        permissions: [],
      },
      agent as AgentName,
      body,
    );

    return reply.send(result);
  });
}