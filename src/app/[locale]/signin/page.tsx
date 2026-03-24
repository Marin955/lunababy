'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { signInWithGoogle, signInWithFacebook } from '@/services/api/auth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import FacebookLoginButton from '@/components/auth/FacebookLoginButton';

export default function SignInPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/profile');
    }
  }, [isAuthenticated, router]);

  const handleGoogle = useCallback(async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await signInWithGoogle(credential);
      signIn(response.token, response.refresh_token, response.user);
      router.push('/profile');
    } catch {
      setError(t('signInError'));
    } finally {
      setLoading(false);
    }
  }, [signIn, router, t]);

  const handleFacebook = useCallback(async (accessToken: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await signInWithFacebook(accessToken);
      signIn(response.token, response.refresh_token, response.user);
      router.push('/profile');
    } catch {
      setError(t('signInError'));
    } finally {
      setLoading(false);
    }
  }, [signIn, router, t]);

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text-dark mb-3">
          {t('signIn')}
        </h1>
        <p className="text-text-mid">
          {t('signInDescription')}
        </p>
      </div>

      <div className="bg-white rounded-[--radius-lg] shadow-sm p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[--radius-sm] text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-text-mid py-2">
            {t('signingIn')}
          </div>
        )}

        <GoogleSignInButton onCredential={handleGoogle} />

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-text-light uppercase">{t('or')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <FacebookLoginButton onAccessToken={handleFacebook} />
      </div>
    </div>
  );
}
