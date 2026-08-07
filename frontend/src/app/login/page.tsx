'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '@/lib/auth';
import { loginSchema, LoginFormValues } from '@/lib/schemas';

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await loginUser(data);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChanged'));
      }
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to FuelLink AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the AI-powered energy marketplace.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="Email address"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="Password"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-center"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
