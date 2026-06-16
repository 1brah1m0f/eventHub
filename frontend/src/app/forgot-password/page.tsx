'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent bg-white';

export default function ForgotPasswordPage() {
  const { sendCode, verifyCode, isLoading } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error('E-poçt daxil edin');
      return;
    }
    try {
      await sendCode(email, 'password_reset');
      setStep('code');
      toast.success('Kod e-poçtunuza göndərildi');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Kod göndərilmədi');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Kodu daxil edin');
      return;
    }
    setStep('password');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Şifrə ən azı 6 simvol olmalıdır');
      return;
    }
    try {
      await verifyCode(email, code, 'password_reset', newPassword);
      toast.success('Şifrə yeniləndi');
      router.push('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Əməliyyat uğursuz oldu');
    }
  };

  const handleLoginWithCode = async () => {
    if (!code.trim()) {
      toast.error('Kodu daxil edin');
      return;
    }
    try {
      await verifyCode(email, code, 'password_reset');
      toast.success('Daxil oldunuz');
      router.push('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Giriş uğursuz oldu');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Girişə qayıt
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar size={22} className="text-violet-800" />
            <span className="text-xl font-bold text-gray-900">NextEvent</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Şifrəni unutdum</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'email' && 'E-poçtunuza kod göndərək'}
            {step === 'code' && 'E-poçtunuza gələn kodu daxil edin'}
            {step === 'password' && 'Yeni şifrə təyin edin və ya kodla daxil olun'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-poçt</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 transition-all text-sm"
              >
                {isLoading ? 'Göndərilir...' : 'Kod göndər'}
              </button>
            </div>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Təsdiq kodu</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className={`${inputClass} text-center text-lg tracking-[0.4em] font-semibold`}
                  placeholder="000000"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-all text-sm"
              >
                Davam et
              </button>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full text-violet-700 text-sm font-medium hover:underline disabled:opacity-50"
              >
                Kodu yenidən göndər
              </button>
            </form>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni şifrə</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Ən azı 6 simvol"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-all text-sm"
                >
                  {isLoading ? 'Yenilənir...' : 'Şifrəni yenilə və daxil ol'}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">və ya</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoginWithCode}
                disabled={isLoading}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Kodla daxil ol (şifrə dəyişmədən)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
