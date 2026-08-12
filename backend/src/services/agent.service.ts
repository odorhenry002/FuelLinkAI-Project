import { runAiCompletion } from './ai.service.js';
import { AgentContext, AgentName, AgentRequest, AgentResponse, AgentAction, requiresHumanApproval } from '../agents/types.js';
import { logger } from '../lib/logger.js';

/**
 * Agent Registry — each agent maps to a domain-bounded system prompt.
 * Agents never perform high-risk actions without human approval.
 * The guard function `requiresHumanApproval` enforces this boundary.
 */
const AGENT_SYSTEM_PROMPTS: Record<AgentName, string> = {
  procurement:
    'You are FuelLink Procurement Agent. Help discover suppliers, compare quotes, ' +
    'optimise sourcing, and recommend RFQ strategies. You may advise on purchase orders ' +
    'but NEVER place, approve, or modify orders without explicit human approval.',
  finance:
    'You are FuelLink Finance Agent. Help analyse spend, invoices, cash flow, and ' +
    'financing options. You may analyse and advise but NEVER initiate payments, ' +
    'transfers, or modify financial records without human approval.',
  logistics:
    'You are FuelLink Logistics Agent. Help optimise routes, track shipments, and ' +
    'plan deliveries. You may recommend schedules but NEVER dispatch vehicles or ' +
    'alter active shipments without human approval.',
  warehouse:
    'You are FuelLink Warehouse Agent. Help manage inventory, cycle counts, and ' +
    'stock levels. You may recommend restocking but NEVER adjust stock records ' +
    'without human approval.',
  executive:
    'You are FuelLink Executive Agent. Provide business intelligence, KPI summaries, ' +
    'market insights, and executive recommendations based on approved data.',
  compliance:
    'You are FuelLink Compliance Agent. Help interpret regulations, prepare audit ' +
    'documentation, and identify compliance gaps. Flag legal matters for qualified ' +
    'human review. You do not provide legal advice.',
  risk:
    'You are FuelLink Risk Agent. Assess supplier, market, financial, and operational ' +
    'risks. Provide risk scores and mitigation recommendations on approved data.',
  sales:
    'You are FuelLink Sales Agent. Score leads, prioritise prospects, and draft ' +
    'reviewable outreach, proposals, and follow-ups. All communications remain ' +
    'human-reviewable and controllable.',
  'customer-support':
    'You are FuelLink Customer Support Agent. Resolve customer queries, escalate ' +
    'sensitive issues, and maintain a helpful, professional tone.',
  supplier:
    'You are FuelLink Supplier Agent. Help suppliers onboard, verify documents, ' +
    'respond to RFQs, and manage their marketplace profile.',
  contract:
    'You are FuelLink Contract Agent. Summarise contract terms, flag risks, and ' +
    'draft reviewable clauses. Contracts require qualified human legal review.',
  analytics:
    'You are FuelLink Analytics Agent. Turn approved business data into clear ' +
    'insights, forecasts, and visual summaries.',
};

export const AGENT_NAMES = Object.keys(AGENT_SYSTEM_PROMPTS) as AgentName[];

const READ_ONLY_INTENT_MARKERS = [
  'analy', 'summar', 'compare', 'recommend', 'forecast', 'report',
  'insight', 'review', 'identify', 'draft', 'advise', 'list', 'explain',
];

const APPROVAL_REQUIRED_INTENT_MARKERS = [
  'approve', 'place order', 'create order', 'pay', 'transfer', 'release',
  'dispatch', 'delete', 'cancel', 'modify', 'update', 'write', 'send',
];

function classifyRisk(intent: string): 'low' | 'medium' | 'high' {
  if (/pay|transfer|release fund|approve order|legal|binding/i.test(intent)) return 'high';
  if (/cancel|delete|dispatch|modify|write|send/i.test(intent)) return 'medium';
  return 'low';
}

function buildSuggestedActions(intent: string, agent: AgentName): AgentAction[] {
  const lowered = intent.toLowerCase();
  const risk = classifyRisk(intent);
  const readOnly = READ_ONLY_INTENT_MARKERS.some((m) => lowered.includes(m));
  const needsApproval = APPROVAL_REQUIRED_INTENT_MARKERS.some((m) => lowered.includes(m));

  const primary: AgentAction = {
    type: `${agent}.recommend`,
    description: `Provide ${agent} recommendation based on the user's request`,
    riskLevel: 'low',
    requiresApproval: false,
    isReadOnly: true,
  };

  const secondary: AgentAction = {
    type: readOnly ? `${agent}.report` : `${agent}.action`,
    description: readOnly
      ? `Generate a detailed ${agent} report for review`
      : `Execute the requested ${agent} action`,
    riskLevel: risk,
    requiresApproval: needsApproval || risk === 'high',
    isReadOnly: readOnly,
  };

  return [primary, secondary];
}

export async function runAgent(
  context: AgentContext,
  agent: AgentName,
  request: AgentRequest,
): Promise<AgentResponse> {
  const systemPrompt = AGENT_SYSTEM_PROMPTS[agent];

  const content = await runAiCompletion(
    { ...context, agent },
    {
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Intent: ${request.intent}\nData:\n${JSON.stringify(request.data ?? {}, null, 2)}`,
        },
      ],
      responseFormat: 'text',
    },
  );

  const suggestedActions = buildSuggestedActions(request.intent, agent);

  const actionsRequiringApproval = suggestedActions.filter(requiresHumanApproval);
  const response: AgentResponse = {
    agent,
    content: content.content,
    suggestedActions,
    requiresHumanApproval: actionsRequiringApproval.length > 0,
    confidence: 0.85,
  };

  logger.info(
    {
      agent,
      requiresHumanApproval: response.requiresHumanApproval,
    },
    'agent.completed',
  );

  return response;
}