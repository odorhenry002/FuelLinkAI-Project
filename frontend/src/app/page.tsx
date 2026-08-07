'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container-max py-20">
        <div className="rounded-[2rem] bg-white/90 p-10 shadow-2xl ring-1 ring-slate-200">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                FuelLink AI
              </p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Africa's AI-powered energy marketplace.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Connect buyers, suppliers, transporters, depots, refineries, and service providers with intelligent tools for quoting,
                ordering, delivery tracking, and compliance.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="btn-primary inline-flex items-center justify-center px-6 py-3"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-secondary inline-flex items-center justify-center px-6 py-3"
                >
                  Register
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-slate-900">Buyer Portal</h2>
                <p className="mt-3 text-slate-600">
                  Request quotations, compare offers, and place orders with trusted energy suppliers.
                </p>
              </div>
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-slate-900">Supplier Portal</h2>
                <p className="mt-3 text-slate-600">
                  Manage inventory, submit quotes, and coordinate deliveries with real-time visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
