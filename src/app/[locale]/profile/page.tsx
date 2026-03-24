'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchProfile } from '@/services/api/profile';
import AuthGuard from '@/components/auth/AuthGuard';
import ProfileForm from '@/components/profile/ProfileForm';
import { Link } from '@/i18n/navigation';
import type { User } from '@/types';

function ProfileContent() {
  const t = useTranslations('profile');
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchProfile(token)
      .then(setUserState)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  function handleUpdated(updated: User) {
    setUserState(updated);
    setUser(updated);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-[--radius-md]" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-text-mid">{t('loadError')}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-text-dark mb-2">
          {t('title')}
        </h1>
        <div className="flex gap-4 text-sm">
          <Link href="/profile/addresses" className="text-teal-deep hover:text-teal font-medium">
            {t('manageAddresses')}
          </Link>
          <Link href="/profile/orders" className="text-teal-deep hover:text-teal font-medium">
            {t('viewOrders')}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
        <ProfileForm user={user} onUpdated={handleUpdated} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <AuthGuard>
        <ProfileContent />
      </AuthGuard>
    </div>
  );
}
