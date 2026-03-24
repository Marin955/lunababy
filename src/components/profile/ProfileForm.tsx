'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { updateProfile } from '@/services/api/profile';
import Input from '@/components/ui/Input';
import type { User } from '@/types';

interface ProfileFormProps {
  user: User;
  onUpdated: (user: User) => void;
}

export default function ProfileForm({ user, onUpdated }: ProfileFormProps) {
  const t = useTranslations('profile');
  const token = useAuthStore((state) => state.token);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [language, setLanguage] = useState(user.language);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateProfile({ name, phone, language }, token);
      onUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label={t('email')}
        value={user.email}
        disabled
        onChange={() => {}}
      />
      <Input
        label={t('phone')}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1.5">
          {t('language')}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-[--radius-sm] bg-white text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
        >
          <option value="hr">Hrvatski</option>
          <option value="en">English</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-teal-deep font-medium">{t('saved')}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-teal-deep text-white font-semibold py-3 px-6 rounded-[--radius-md] hover:bg-teal transition-colors cursor-pointer disabled:opacity-50"
      >
        {saving ? '...' : t('save')}
      </button>
    </form>
  );
}
