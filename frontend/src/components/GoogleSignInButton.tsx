'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export function GoogleSignInButton() {
  const { googleLogin } = useAuthStore();
  const router = useRouter();

  return (
    <div className="w-full [&>div]:!w-full [&>div>div]:!w-full">
      <GoogleLogin
        onSuccess={async (response) => {
          if (!response.credential) return;
          try {
            await googleLogin(response.credential);
            router.push('/events');
          } catch (err: any) {
            toast.error(err.response?.data?.error || 'Google giriş uğursuz oldu');
          }
        }}
        onError={() => toast.error('Google giriş uğursuz oldu')}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    </div>
  );
}
