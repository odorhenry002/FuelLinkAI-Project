'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SiteHeader() {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container-max flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          FuelLink AI
        </Link>
        <nav className="flex flex-wrap items-center gap-3">
          {loading ? (
            <span className="text-sm text-slate-500">Checking session...</span>
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-slate-700 hover:text-primary">
                Dashboard
              </Link>
              <span className="text-sm text-slate-600">
                {user?.first_name ? `Hello, ${user.first_name}` : 'Welcome'}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="btn-secondary px-4 py-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 hover:text-primary">
                Login
              </Link>
              <Link
                href="/register"
                className="btn-primary px-4 py-2 text-sm"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
