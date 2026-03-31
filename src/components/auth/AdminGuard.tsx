'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isReady = useAuthStore((state) => state.isReady);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/signin');
    } else if (user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isReady, isAuthenticated, user, router]);

  // Show loading while auth state is being restored
  if (!isReady || !isAuthenticated || user?.role !== 'admin' || !token) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-[--radius-md]" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
