'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { register } from '@/services/api/auth';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/profile');
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await register(name.trim(), email.trim(), password, locale);
      signIn(response.data.token, response.data.refresh_token, response.data.user);
      router.push('/profile');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('registerError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text-dark mb-3">
          {t('register')}
        </h1>
        <p className="text-text-mid">
          {t('registerDescription')}
        </p>
      </div>

      <div className="bg-white rounded-[--radius-lg] shadow-sm p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[--radius-sm] text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <Input
            label={t('confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal shadow-md hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : t('register')}
          </button>
        </form>

        <p className="text-center text-sm text-text-mid">
          {t('haveAccount')}{' '}
          <Link href="/signin" className="text-teal-deep font-medium hover:underline">
            {t('signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
