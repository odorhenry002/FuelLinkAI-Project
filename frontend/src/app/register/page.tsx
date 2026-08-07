'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '@/lib/auth';
import { registerSchema, RegisterFormValues } from '@/lib/schemas';

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);
      router.push('/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed. Please check your details.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-10 rounded-3xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your FuelLink AI account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register as a buyer, supplier, transporter, or admin.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="sr-only">
                First name
              </label>
              <input
                id="first_name"
                {...register('first_name')}
                type="text"
                className="input-field"
                placeholder="First name"
              />
              {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
            </div>
            <div>
              <label htmlFor="last_name" className="sr-only">
                Last name
              </label>
              <input
                id="last_name"
                {...register('last_name')}
                type="text"
                className="input-field"
                placeholder="Last name"
              />
              {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="Email address"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone number
              </label>
              <input
                id="phone"
                {...register('phone')}
                type="text"
                className="input-field"
                placeholder="Phone number"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                className="input-field"
              >
                <option value="buyer">Buyer</option>
                <option value="supplier">Supplier</option>
                <option value="transporter">Transporter</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                className="input-field"
                placeholder="Password"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
