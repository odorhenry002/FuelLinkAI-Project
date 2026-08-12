import { describe, it, expect } from 'vitest';
import { requiresHumanApproval, AgentAction } from './types.js';

describe('requiresHumanApproval', () => {
  it('returns true for high-risk actions', () => {
    const action: AgentAction = {
      type: 'finance.pay',
      description: 'Initiate payment',
      riskLevel: 'high',
      requiresApproval: false,
    };
    expect(requiresHumanApproval(action)).toBe(true);
  });

  it('returns true when requiresApproval is set', () => {
    const action: AgentAction = {
      type: 'procurement.action',
      description: 'Place order',
      riskLevel: 'low',
      requiresApproval: true,
    };
    expect(requiresHumanApproval(action)).toBe(true);
  });

  it('returns true for medium-risk non-read-only actions', () => {
    const action: AgentAction = {
      type: 'logistics.action',
      description: 'Dispatch vehicle',
      riskLevel: 'medium',
      requiresApproval: false,
    };
    expect(requiresHumanApproval(action)).toBe(true);
  });

  it('returns false for low-risk read-only actions', () => {
    const action: AgentAction = {
      type: 'analytics.report',
      description: 'Generate report',
      riskLevel: 'low',
      requiresApproval: false,
      isReadOnly: true,
    };
    expect(requiresHumanApproval(action)).toBe(false);
  });

  it('returns false for low-risk advisory actions', () => {
    const action: AgentAction = {
      type: 'procurement.recommend',
      description: 'Provide recommendation',
      riskLevel: 'low',
      requiresApproval: false,
      isReadOnly: true,
    };
    expect(requiresHumanApproval(action)).toBe(false);
  });
});