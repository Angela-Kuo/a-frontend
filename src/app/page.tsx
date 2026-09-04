'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/users');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      正轉向主控台...
    </div>
  );
}