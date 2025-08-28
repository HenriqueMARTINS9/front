'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (token) {
      router.replace('/home');
    } else {
      router.replace('/home');
    }
  }, []);

  return null; // pas besoin de contenu visible ici
}
