import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../App';
import { api } from '../api/client';

interface UsageSummary {
  totalTokens: number;
  totalCostUsd: number;
  totalCalls: number;
  byAgent: { agent: string; _sum: { totalTokens: number; costUsd: number }; _count: number }[];
  recent: unknown[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getUsage()
      .then((res) => setUsage(res.usage))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load usage'))
      .finally(() => setLoading(false));
  }, []);

  const defaultOrganisation = user?.memberships?.find((m) => m.isDefault) ?? user?.memberships?.[0];

  return (
    <AppLayout title="Dashboard" subtitle="Overview of your workspace">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Organisation</div>
          <div className="stat-value">{defaultOrganisation?.organisationName ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Role</div>
          <div className="stat-value">{defaultOrganisation?.role?.toLowerCase() ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Calls</div>
          <div className="stat-value">{loading ? '…' : usage?.totalCalls ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Cost (USD)</div>
          <div className="stat-value">${usage?.totalCostUsd?.toFixed(4) ?? '0.0000'}</div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="card card-pad mb-4">
        <h3 className="card-title">Workspace</h3>
        <p className="card-desc">
          Your workspace is ready. Use the AI Copilot for natural-language queries about your
          procurement, suppliers, finance, logistics, and inventory data.
        </p>
        <div className="card-grid">
          <div className="card card-pad">
            <h4 className="card-title">AI Copilot</h4>
            <p className="card-desc">Ask questions and get intelligent recommendations.</p>
            <a href="/copilot" className="btn btn-primary">
              Open Copilot
            </a>
          </div>
          <div className="card card-pad">
            <h4 className="card-title">AI Agents</h4>
            <p className="card-desc">
              Run specialised agents for procurement, finance, logistics, risk and more.
            </p>
            <a href="/agents" className="btn btn-outline">
              Open Agents
            </a>
          </div>
        </div>
      </div>

      {usage && usage.byAgent.length > 0 && (
        <div className="card">
          <div className="card-pad">
            <h3 className="card-title">AI Usage by Agent</h3>
            <p className="card-desc">Token consumption and cost per AI agent.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Calls</th>
                    <th>Tokens</th>
                    <th>Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.byAgent.map((a) => (
                    <tr key={a.agent}>
                      <td>{a.agent}</td>
                      <td>{a._count}</td>
                      <td>{a._sum.totalTokens ?? 0}</td>
                      <td>${(a._sum.costUsd ?? 0).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}