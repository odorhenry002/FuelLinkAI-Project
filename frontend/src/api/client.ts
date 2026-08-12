const API_BASE = '/api/v1';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tenantId: string;
  memberships: {
    organisationId: string;
    organisationName: string;
    organisationType: string;
    role: string;
    isDefault: boolean;
  }[];
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    latencyMs: number;
  };
}

export interface AgentResponse {
  agent: string;
  content: string;
  suggestedActions: {
    type: string;
    description: string;
    riskLevel: string;
    requiresApproval: boolean;
    isReadOnly?: boolean;
  }[];
  requiresHumanApproval: boolean;
  confidence: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let accessToken: string | null = localStorage.getItem('fuellink_access_token');

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) {
    localStorage.setItem('fuellink_access_token', token);
  } else {
    localStorage.removeItem('fuellink_access_token');
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? 'Request failed';
    const code = body?.error?.code;
    throw new ApiError(message, response.status, code);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    tenantName: string;
    tenantSlug: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) =>
    request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<{ user: User }>('/auth/me'),

  chat: (messages: ChatMessage[]) =>
    request<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),

  runAgent: (agent: string, intent: string, data?: Record<string, unknown>) =>
    request<AgentResponse>(`/agents/${agent}/run`, {
      method: 'POST',
      body: JSON.stringify({ intent, data }),
    }),

  listAgents: () => request<{ agents: string[] }>('/agents'),

  getProviders: () => request<{ providers: { name: string; available: boolean }[] }>('/ai/providers'),

  getUsage: () =>
    request<{
      usage: {
        totalTokens: number;
        totalCostUsd: number;
        totalCalls: number;
        byAgent: { agent: string; _sum: { totalTokens: number; costUsd: number }; _count: number }[];
        recent: unknown[];
      };
    }>('/ai/usage'),
};