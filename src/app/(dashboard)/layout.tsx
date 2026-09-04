'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HasAccess from '@/components/HasAccess';
import { User, Users, Shield, Lock, LogOut, Settings, UserCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 若未登入，強制重新導向至 /login
  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        載入中...
      </div>
    );
  }

  // 檢查使用者是否擁有指定 Resource 的任何權限 (用來控制 SideNav 顯示與否)
  const hasResourceAccess = (resource: string) => {
    return user?.operations.some((op) => op.resource === resource) ?? false;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* 1. 左側導覽列 (Left Sidebar / Menu) */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 font-bold text-lg text-gray-800 dark:text-white">
          權限管理系統 (A)
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* 使用者管理頁面選單 */}
          {hasResourceAccess('User') && (
            <Link
              href="/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith('/users')
                  ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              使用者管理 (User)
            </Link>
          )}

          {/* 群組管理頁面選單 */}
          {hasResourceAccess('Group') && (
            <Link
              href="/groups"
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith('/groups')
                  ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              群組管理 (Group)
            </Link>
          )}

          {/* 角色管理頁面選單 */}
          {hasResourceAccess('Role') && (
            <Link
              href="/roles"
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith('/roles')
                  ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Shield className="w-5 h-5" />
              角色管理 (Role)
            </Link>
          )}

          {/* 權限授予頁面選單 */}
          {hasResourceAccess('Permission') && (
            <Link
              href="/permissions"
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith('/permissions')
                  ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Lock className="w-5 h-5" />
              權限授予 (Permission)
            </Link>
          )}
        </nav>
      </aside>

      {/* 右側主內容區塊 (Header + Content) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. 上方 Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
          {/* 白板 A: Quick Action Buttons (依權限動態出現/隱藏) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">
              快捷操作:
            </span>

            <HasAccess resource="User" action="create">
              <button
                onClick={() => router.push('/users?action=new')}
                className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md border border-blue-200 transition"
              >
                + 新增使用者
              </button>
            </HasAccess>

            <HasAccess resource="Group" action="create">
              <button
                onClick={() => router.push('/groups?action=new')}
                className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-600 rounded-md border border-green-200 transition"
              >
                + 新增群組
              </button>
            </HasAccess>

            <HasAccess resource="Role" action="create">
              <button
                onClick={() => router.push('/roles?action=new')}
                className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-md border border-purple-200 transition"
              >
                + 新增角色
              </button>
            </HasAccess>
          </div>

          {/* 白板 A: User Dropdown / Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{user?.username}</span>
              {user?.describe && (
                <span className="text-xs text-gray-400">({user.describe})</span>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
              title="登出系統"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </header>

        {/* 3. 中央主內容 Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}