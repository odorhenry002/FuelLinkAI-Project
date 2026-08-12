/**
 * Specialised AI Agent framework.
 * Agents operate within strict permissions and human-approval
 * boundaries. High-risk actions always require human approval.
 */

export type AgentName =
  | 'procurement'
  | 'finance'
  | 'logistics'
  | 'warehouse'
  | 'executive'
  | 'compliance'
  | 'risk'
  | 'sales'
  | 'customer-support'
  | 'supplier'
  | 'contract'
  | 'analytics';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AgentAction {
  type: string;
  description: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  /** If true, the action is read-only / advisory and safe to auto-execute. */
  isReadOnly?: boolean;
}

export interface AgentContext {
  tenantId: string;
  userId: string;
  organisationId?: string;
  permissions: string[];
}

export interface AgentRequest {
  intent: string;
  data?: Record<string, unknown>;
}

export interface AgentResponse {
  agent: AgentName;
  content: string;
  suggestedActions: AgentAction[];
  requiresHumanApproval: boolean;
  confidence: number;
}

/**
 * Guard that determines whether an AI agent may perform an action.
 * High-risk and non-read-only actions always require human approval.
 */
export function requiresHumanApproval(action: AgentAction): boolean {
  if (action.riskLevel === 'high') return true;
  if (action.requiresApproval) return true;
  if (!action.isReadOnly && action.riskLevel === 'medium') return true;
  return false;
}