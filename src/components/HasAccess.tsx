'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HasAccessProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode; // 權限不足時的替代畫面(預設為隱藏不渲染)
}

export default function HasAccess({ resource, action, children, fallback = null }: HasAccessProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 檢查使用者的 operations 中是否包含此 resource 與 action
  const hasPermission = user?.operations.some(
    (op) => op.resource === resource && op.action === action
  );

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}