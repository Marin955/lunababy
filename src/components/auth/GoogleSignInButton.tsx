'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: { theme: string; size: string; width: number; text: string }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const t = useTranslations('auth');
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          onCredential(response.credential);
        },
      });
      if (buttonRef.current) {
        window.google?.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-3 px-6 border border-gray-200 rounded-[--radius-md] text-text-light text-sm opacity-50"
      >
        {t('google')} ({t('notConfigured')})
      </button>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
