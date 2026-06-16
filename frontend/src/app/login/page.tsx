'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

type LoginMode = 'password' | 'code';

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent bg-white';

export default function LoginPage() {
  const { login, sendCode, verifyCode, isLoading, mockLogin } = useAuthStore();
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('E-poçt daxil edin');
      return;
    }
    if (!password) {
      toast.error('Şifrə daxil edin');
      return;
    }
    try {
      await login(email, password);
      router.push('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Giriş uğursuz oldu');
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error('E-poçt daxil edin');
      return;
    }
    try {
      await sendCode(email, 'login');
      setCodeSent(true);
      toast.success('Kod e-poçtunuza göndərildi');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Kod göndərilmədi');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Kodu daxil edin');
      return;
    }
    try {
      await verifyCode(email, code, 'login');
      router.push('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Giriş uğursuz oldu');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar size={22} className="text-violet-800" />
            <span className="text-xl font-bold text-gray-900">NextEvent</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Xoş gəldiniz</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'password' ? 'E-poçt və şifrənizlə daxil olun' : 'E-poçtunuza göndərilən kodla daxil olun'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'password'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Şifrə ilə
            </button>
            <button
              type="button"
              onClick={() => setMode('code')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'code'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kod ilə
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-poçt</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifrə</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-indigo-600 hover:-translate-y-0.5 disabled:opacity-50 transition-all text-sm"
              >
                {isLoading ? 'Giriş edilir...' : 'Daxil ol'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-poçt</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  disabled={codeSent && isLoading}
                />
              </div>

              {codeSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Giriş kodu</label>
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
              )}

              {!codeSent ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-indigo-600 hover:-translate-y-0.5 disabled:opacity-50 transition-all text-sm"
                >
                  {isLoading ? 'Göndərilir...' : 'Kod göndər'}
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-violet-500/20 hover:from-violet-600 hover:to-indigo-600 hover:-translate-y-0.5 disabled:opacity-50 transition-all text-sm"
                  >
                    {isLoading ? 'Yoxlanılır...' : 'Daxil ol'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full text-violet-700 text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    Kodu yenidən göndər
                  </button>
                </>
              )}
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">və ya</span>
            </div>
          </div>

          <GoogleSignInButton />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">və ya</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              mockLogin();
              router.push('/events');
            }}
            className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Demo istifadəçi kimi davam et
          </button>
        </div>

        <p className="text-sm text-center mt-4 text-gray-500">
          <Link href="/forgot-password" className="text-violet-800 font-medium hover:underline">
            Şifrəni unutdum
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-500">
          Hesabınız yoxdur?{' '}
          <Link href="/register" className="text-violet-800 font-medium hover:underline">
            Qeydiyyatdan keç
          </Link>
        </p>
      </div>
    </div>
  );
}
