'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardOverview, type DashboardOverviewResponse } from '@/lib/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && isAuthenticated) {
      getDashboardOverview()
        .then((data) => {
          setOverview(data);
          setOverviewError(null);
        })
        .catch(() => {
          setOverview(null);
          setOverviewError('Unable to load dashboard overview. Please sign in again.');
        });
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !overview) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-xl">
          <p className="text-lg text-slate-600">Loading your dashboard...</p>
          {overviewError && <p className="mt-4 text-sm text-red-500">{overviewError}</p>}
        </div>
      </main>
    );
  }

  const renderRoleContent = () => {
    switch (user?.role) {
      case 'supplier':
        return (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Supplier toolkit</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li>• Manage inventory and available loads</li>
              <li>• Submit quotes to buyers</li>
              <li>• Track order fulfillment</li>
            </ul>
          </div>
        );
      case 'transporter':
        return (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Transporter dashboard</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li>• Monitor assigned deliveries</li>
              <li>• Coordinate with depots and drivers</li>
              <li>• Update delivery status in real time</li>
            </ul>
          </div>
        );
      case 'admin':
        return (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Admin controls</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li>• Manage user roles and system settings</li>
              <li>• Review audit logs and compliance workflows</li>
              <li>• Configure company access policies</li>
            </ul>
          </div>
        );
      default:
        return (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Buyer workspace</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li>• Compare supplier quotations</li>
              <li>• Manage purchase orders and approvals</li>
              <li>• Track deliveries and consumption forecasts</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container-max">
        <div className="rounded-[2rem] bg-white p-10 shadow-2xl ring-1 ring-slate-200">
          <h1 className="text-4xl font-bold text-slate-900">Welcome back, {user?.first_name ?? 'Member'}</h1>
          <p className="mt-4 text-lg text-slate-600">{overview.message}</p>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Your overview</h2>
            <p className="mt-3 text-slate-700">Role: {overview.role}</p>
            <p className="mt-3 text-slate-700">Resources available:</p>
            <ul className="mt-2 list-disc pl-5 text-slate-700">
              {overview.resources.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {renderRoleContent()}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Role actions</h2>
              <p className="mt-4 text-slate-700">Visit your role-specific dashboard page for deeper controls.</p>
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Admin Dashboard
                </Link>
              )}
              {user?.role === 'supplier' && (
                <Link
                  href="/dashboard/supplier"
                  className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Supplier Dashboard
                </Link>
              )}
              {user?.role === 'transporter' && (
                <Link
                  href="/dashboard/transporter"
                  className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Transporter Dashboard
                </Link>
              )}
              {(user?.role === 'buyer' || !user?.role) && (
                <Link
                  href="/dashboard/buyer"
                  className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Buyer Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
