'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useT } from '@/lib/i18n';

export function GoogleSignInButton() {
  const { googleLogin } = useAuthStore();
  const router = useRouter();
  const t = useT();

  return (
    <div className="w-full [&>div]:!w-full [&>div>div]:!w-full">
      <GoogleLogin
        onSuccess={async (response) => {
          if (!response.credential) return;
          try {
            await googleLogin(response.credential);
            router.push('/events');
          } catch (err: any) {
            toast.error(err.response?.data?.error || t('googleLoginFailed'));
          }
        }}
        onError={() => toast.error(t('googleLoginFailed'))}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    </div>
  );
}
