'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getBuyerDashboard, type BuyerDashboardResponse } from '@/lib/dashboard';

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();
  const [data, setData] = useState<BuyerDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && isAuthenticated && user?.role !== 'buyer' && user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (!loading && isAuthenticated) {
      getBuyerDashboard()
        .then((res) => {
          setData(res);
          setError(null);
        })
        .catch(() => {
          setData(null);
          setError('Unable to load buyer dashboard');
        });
    }
  }, [isAuthenticated, loading, router, user?.role]);

  if (loading || (!data && !error)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-xl">
          <p className="text-lg text-slate-600">Loading buyer dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container-max">
        <div className="rounded-[2rem] bg-white p-10 shadow-2xl ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          {data && (
            <div className="mt-6">
              <p className="text-slate-700">{data.message}</p>
              <h2 className="mt-4 font-semibold">Buyer actions</h2>
              <ul className="list-disc pl-6 mt-2 text-slate-700">
                {data.buyer_actions?.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
