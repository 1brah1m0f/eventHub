'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().optional(),
  linkedin_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

type Form = z.infer<typeof schema>;

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent bg-white';

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await registerUser({ ...data, linkedin_url: data.linkedin_url || undefined });
      router.push('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar size={22} className="text-violet-800" />
            <span className="text-xl font-bold text-gray-900">NextEvent</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the community</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input {...register('name')} type="text" className={inputClass} placeholder="Your name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input {...register('email')} type="email" className={inputClass} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input {...register('password')} type="password" className={inputClass} placeholder="Min 6 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea {...register('bio')} rows={2} className={inputClass} placeholder="A short intro about yourself" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL <span className="text-gray-400 font-normal">(optional)</span></label>
              <input {...register('linkedin_url')} type="url" className={inputClass} placeholder="https://linkedin.com/in/..." />
              {errors.linkedin_url && <p className="text-red-500 text-xs mt-1">{errors.linkedin_url.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-indigo-600 hover:-translate-y-0.5 disabled:opacity-50 transition-all text-sm"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">və ya</span>
            </div>
          </div>

          <GoogleSignInButton />
        </div>

        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-800 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
