'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const {
    user,
    token,
    loading,
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    // 未登入
    if (!token) {
      router.replace(
        '/login'
      );
      return;
    }

    if (!user) {
      return;
    }

    const hasResource = (
      resource: string
    ) =>
      user.operations?.some(
        (op) =>
          op.resource === resource
      ) ?? false;

    if (
      hasResource('User')
    ) {
      router.replace(
        '/users'
      );
      return;
    }

    if (
      hasResource('Group') ||
      hasResource(
        'GroupMember'
      )
    ) {
      router.replace(
        '/groups'
      );
      return;
    }

    if (
      hasResource('Role')
    ) {
      router.replace(
        '/roles'
      );
      return;
    }

    if (
      hasResource(
        'Permission'
      )
    ) {
      router.replace(
        '/permissions'
      );
      return;
    }

    router.replace(
      '/no-access'
    );
  }, [
    loading,
    token,
    user,
    router,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
      正在進入可使用的管理功能...
    </div>
  );
}