"use client";
import { useEffect } from 'react';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // S'assurer que i18n est initialisé côté client
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return <>{children}</>;
}
