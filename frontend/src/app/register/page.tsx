'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  bio: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
});

type Form = z.infer<typeof schema>;

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-950 to-blue-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of event organizers</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'bio', label: 'Bio (optional)', type: 'text' },
            { name: 'linkedin_url', label: 'LinkedIn URL (optional)', type: 'url' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input {...register(name as any)} type={type}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
              {(errors as any)[name] && (
                <p className="text-red-500 text-xs mt-1">{(errors as any)[name]?.message}</p>
              )}
            </div>
          ))}
          <button type="submit" disabled={isLoading}
            className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-center mt-5 text-gray-500">
          Already have an account? <Link href="/login" className="text-blue-800 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
