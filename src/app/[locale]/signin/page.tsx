'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { login, signInWithGoogle, signInWithFacebook } from '@/services/api/auth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import FacebookLoginButton from '@/components/auth/FacebookLoginButton';
import Input from '@/components/ui/Input';

export default function SignInPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/profile');
    }
  }, [isAuthenticated, router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setLoading(true);
    try {
      const response = await login(email.trim(), password);
      signIn(response.data.token, response.data.refresh_token, response.data.user);
      router.push('/profile');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('signInError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogle = useCallback(async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await signInWithGoogle(credential);
      signIn(response.data.token, response.data.refresh_token, response.data.user);
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
      signIn(response.data.token, response.data.refresh_token, response.data.user);
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

      <div className="bg-white rounded-[--radius-lg] shadow-sm p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[--radius-sm] text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : t('signIn')}
          </button>
        </form>

        <p className="text-center text-sm text-text-mid">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-teal-deep font-medium hover:underline">
            {t('registerLink')}
          </Link>
        </p>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-text-light uppercase">{t('or')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="space-y-3">
          <GoogleSignInButton onCredential={handleGoogle} />
          <FacebookLoginButton onAccessToken={handleFacebook} />
        </div>
      </div>
    </div>
  );
}
