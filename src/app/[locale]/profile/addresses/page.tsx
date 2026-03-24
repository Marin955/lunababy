'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { fetchProfile } from '@/services/api/profile';
import { createAddress, updateAddress, deleteAddress } from '@/services/api/profile';
import AuthGuard from '@/components/auth/AuthGuard';
import AddressList from '@/components/profile/AddressList';
import AddressForm from '@/components/profile/AddressForm';
import type { Address } from '@/types';

function AddressesContent() {
  const t = useTranslations('addresses');
  const token = useAuthStore((state) => state.token);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchProfile(token)
      .then((user) => setAddresses(user.addresses))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(data: Omit<Address, 'id'>) {
    if (!token) return;
    if (editingAddress) {
      const updated = await updateAddress(editingAddress.id, data, token);
      setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await createAddress(data, token);
      setAddresses((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditingAddress(null);
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await deleteAddress(id, token);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-32 bg-gray-100 rounded-[--radius-md]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-text-dark">
          {t('title')}
        </h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setEditingAddress(null); setShowForm(true); }}
            className="text-sm bg-teal-deep text-white font-semibold py-2 px-4 rounded-[--radius-sm] hover:bg-teal transition-colors cursor-pointer"
          >
            {t('addNew')}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
          <AddressForm
            address={editingAddress || undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingAddress(null); }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-[--radius-lg] shadow-sm p-6">
          <AddressList
            addresses={addresses}
            onEdit={(address) => { setEditingAddress(address); setShowForm(true); }}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

export default function AddressesPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <AuthGuard>
        <AddressesContent />
      </AuthGuard>
    </div>
  );
}
