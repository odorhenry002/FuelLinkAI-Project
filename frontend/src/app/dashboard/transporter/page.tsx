'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getTransporterDashboard, type TransporterDashboardResponse } from '@/lib/dashboard';

export default function TransporterDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [data, setData] = useState<TransporterDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && isAuthenticated && user?.role !== 'transporter') {
      router.push('/dashboard');
      return;
    }

    if (!loading && isAuthenticated) {
      const loadDashboard = async () => {
        setError(null);

        try {
          const res = await getTransporterDashboard();
          setData(res);
        } catch {
          setData(null);
          setError('Unable to load transporter dashboard');
        }
      };

      loadDashboard();
    }
  }, [isAuthenticated, loading, router, user?.role]);

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await getTransporterDashboard();
      setData(res);
    } catch {
      setError('Unable to refresh transporter dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading || (!data && !error)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-xl">
          <p className="text-lg text-slate-600">Loading transporter dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container-max">
        <div className="rounded-[2rem] bg-white p-10 shadow-2xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold">Transporter Dashboard</h1>
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          {data ? (
            <div className="mt-6">
              <p className="text-slate-700">{data.message}</p>
              <h2 className="mt-4 font-semibold">Transporter actions</h2>
              {data.transporter_actions?.length ? (
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.transporter_actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-slate-500">No transporter actions are available right now.</p>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-slate-700">Unable to show transporter details at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
