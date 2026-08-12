import { useState, useEffect, FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import { api, AgentResponse } from '../api/client';

interface AgentResult {
  agent: string;
  response: AgentResponse;
}

const AGENT_DESCRIPTIONS: Record<string, string> = {
  procurement: 'Supplier discovery, quote comparison, sourcing optimisation',
  finance: 'Spend analysis, invoices, cash flow, financing options',
  logistics: 'Route optimisation, shipment tracking, delivery planning',
  warehouse: 'Inventory management, cycle counts, stock levels',
  executive: 'Business intelligence, KPIs, market insights',
  compliance: 'Regulations, audit documentation, compliance gaps',
  risk: 'Supplier, market, financial and operational risk assessment',
  sales: 'Lead scoring, prospect prioritisation, outreach drafting',
  'customer-support': 'Customer queries, escalation, professional support',
  supplier: 'Supplier onboarding, document verification, RFQ responses',
  contract: 'Contract summarisation, risk flagging, clause drafting',
  analytics: 'Business data insights, forecasts, visual summaries',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('procurement');
  const [intent, setIntent] = useState('');
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AgentResult[]>([]);

  useEffect(() => {
    api
      .listAgents()
      .then((res) => {
        setAgents(res.agents);
        if (res.agents.length > 0) setSelectedAgent(res.agents[0]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load agents'))
      .finally(() => setLoadingAgents(false));
  }, []);

  const runSelectedAgent = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = intent.trim();
    if (!trimmed || running) return;

    setRunning(true);
    setError(null);

    try {
      const res = await api.runAgent(selectedAgent, trimmed);
      setResults((prev) => [{ agent: selectedAgent, response: res }, ...prev].slice(0, 10));
      setIntent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agent request failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <AppLayout title="AI Agents" subtitle="Run specialised agents within strict permissions and approval boundaries">
      <div className="card card-pad mb-4">
        <h3 className="card-title">Run an Agent</h3>
        <p className="card-desc">
          Agents provide recommendations and insights. High-risk actions always require human approval.
        </p>

        <form onSubmit={runSelectedAgent} className="auth-form">
          <label className="field">
            <span>Agent</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              disabled={loadingAgents}
            >
              {agents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {AGENT_DESCRIPTIONS[selectedAgent] && (
              <span className="card-desc" style={{ marginTop: 4 }}>
                {AGENT_DESCRIPTIONS[selectedAgent]}
              </span>
            )}
          </label>

          <label className="field">
            <span>Intent</span>
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Describe what you want the agent to analyse or recommend…"
              rows={3}
              required
              disabled={running}
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={running || !intent.trim()}>
            {running ? 'Running…' : `Run ${selectedAgent} agent`}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="card-grid">
          {results.map((r, i) => (
            <div key={i} className="card card-pad agent-card">
              <div>
                <h4 className="agent-name">{r.agent}</h4>
                <span className="agent-badge">AI Agent</span>
              </div>

              <div className="agent-response">{r.response.content}</div>

              {r.response.suggestedActions.length > 0 && (
                <div>
                  <p className="card-desc">Suggested actions:</p>
                  <ul className="action-list">
                    {r.response.suggestedActions.map((action, ai) => (
                      <li key={ai} className="action-item">
                        <span
                          className={`action-risk risk-${action.riskLevel}`}
                        >
                          {action.riskLevel}
                        </span>
                        <span>{action.description}</span>
                        {action.requiresApproval && <span className="agent-badge">Approval required</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.response.requiresHumanApproval && (
                <div className="alert alert-info">⚠️ Human approval required for this agent's actions.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !running && (
        <div className="card">
          <div className="empty-state">
            <h3>No agent runs yet</h3>
            <p>Select an agent above and describe what you need to get started.</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}