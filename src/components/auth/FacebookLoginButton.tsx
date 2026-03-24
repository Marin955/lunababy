'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface FacebookLoginButtonProps {
  onAccessToken: (accessToken: string) => void;
}

declare global {
  interface Window {
    FB?: {
      init: (config: { appId: string; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        config: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function FacebookLoginButton({ onAccessToken }: FacebookLoginButtonProps) {
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  useEffect(() => {
    if (!appId) return;

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        version: 'v18.0',
      });
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [appId]);

  function handleClick() {
    if (!window.FB) return;
    setLoading(true);
    window.FB.login(
      (response) => {
        setLoading(false);
        if (response.authResponse?.accessToken) {
          onAccessToken(response.authResponse.accessToken);
        }
      },
      { scope: 'email,public_profile' }
    );
  }

  if (!appId) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-3 px-6 border border-gray-200 rounded-[--radius-md] text-text-light text-sm opacity-50"
      >
        {t('facebook')} ({t('notConfigured')})
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 px-6 bg-[#1877F2] text-white font-semibold rounded-[--radius-md] hover:bg-[#166FE5] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      {loading ? '...' : t('signInWith', { provider: t('facebook') })}
    </button>
  );
}
