'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const handleAuthChanged = () => {
      setLoading(true);
      loadUser();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('authChanged', handleAuthChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('authChanged', handleAuthChanged);
      }
    };
  }, [loadUser]);

  const signOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('authChanged'));
      router.push('/login');
    }
  };

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signOut,
  };
}
