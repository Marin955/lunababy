'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';
import AdminReviewsList from '@/components/reviews/admin/AdminReviewsList';

function ReviewsContent() {
  const t = useTranslations('admin.reviews');
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold text-text-dark mb-2">{t('title')}</h1>
      <p className="text-text-mid mb-6">{t('intro')}</p>
      <AdminReviewsList />
    </>
  );
}

export default function AdminReviewsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <AdminGuard>
        <AdminNav />
        <ReviewsContent />
      </AdminGuard>
    </div>
  );
}
