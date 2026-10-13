'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  Users,
  Shield,
  Lock,
  LogOut,
  UserCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import HasAccess from '@/components/HasAccess';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    token,
    logout,
    loading,
  } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  /**
   * 檢查是否具有某 Resource
   * 的至少一項 operation
   */
  const hasResourceAccess = (
    resource: string
  ) => {
    return (
      user?.operations?.some(
        (op) =>
          op.resource === resource
      ) ?? false
    );
  };

  /**
   * 各頁面的存取資格
   */
  const canAccessUsers =
    hasResourceAccess('User');

  /**
   * Group 頁同時承載：
   *
   * Group
   * GroupMember
   *
   * 所以只要兩者其中一種有權限，
   * 就應該允許進入 Group 頁。
   */
  const canAccessGroups =
    hasResourceAccess('Group') ||
    hasResourceAccess(
      'GroupMember'
    );

  const canAccessRoles =
    hasResourceAccess('Role');

  const canAccessPermissions =
    hasResourceAccess(
      'Permission'
    );

  /**
   * 找出目前使用者第一個
   * 可以進入的頁面。
   */
  const firstAccessiblePath =
    canAccessUsers
      ? '/users'
      : canAccessGroups
        ? '/groups'
        : canAccessRoles
          ? '/roles'
          : canAccessPermissions
            ? '/permissions'
            : '/no-access';

  /**
   * 判斷目前網址是否允許存取。
   *
   * /no-access 不做 Resource 限制。
   */
  const canAccessCurrentRoute = (() => {
    if (
      pathname.startsWith(
        '/users'
      )
    ) {
      return canAccessUsers;
    }

    if (
      pathname.startsWith(
        '/groups'
      )
    ) {
      return canAccessGroups;
    }

    if (
      pathname.startsWith(
        '/roles'
      )
    ) {
      return canAccessRoles;
    }

    if (
      pathname.startsWith(
        '/permissions'
      )
    ) {
      return canAccessPermissions;
    }

    return true;
  })();

  /**
   * 登入 + 頁面權限 Guard
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    /**
     * 沒登入
     */
    if (!token) {
      router.replace(
        '/login'
      );
      return;
    }

    /**
     * Token 還在，
     * 但 User 尚未準備完成
     */
    if (!user) {
      return;
    }

    /**
     * 有登入，
     * 但沒有目前頁面的 Resource 權限
     */
    if (
      !canAccessCurrentRoute
    ) {
      router.replace(
        firstAccessiblePath
      );
    }
  }, [
    loading,
    token,
    user,
    pathname,
    canAccessCurrentRoute,
    firstAccessiblePath,
    router,
  ]);

  /**
   * AuthContext 還在初始化
   */
  if (
    loading ||
    !token ||
    !user
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        載入中...
      </div>
    );
  }

  /**
   * 使用者手動輸入沒有權限的網址時，
   * 不先 render 原本頁面，
   * 避免畫面短暫閃一下。
   */
  if (
    !canAccessCurrentRoute
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        正在檢查頁面權限...
      </div>
    );
  }

  return (
  <div className="relative flex h-screen overflow-hidden bg-[#f7f7fb]">

    {/* Background glow */}
    <div className="pointer-events-none absolute -top-40 left-[30%] h-[420px] w-[420px] rounded-full bg-violet-200/40 blur-[120px]" />
    <div className="pointer-events-none absolute bottom-[-180px] right-[-80px] h-[460px] w-[460px] rounded-full bg-indigo-200/35 blur-[130px]" />


    {/* Sidebar */}
    <aside className="relative z-10 m-4 mr-0 flex w-[260px] flex-col rounded-[28px] border border-white/80 bg-white/85 shadow-[0_20px_60px_rgba(67,56,202,0.08)] backdrop-blur-xl">

      {/* Brand */}
      <div className="px-6 pb-6 pt-7">

        <div className="flex items-center gap-3">

          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 shadow-lg shadow-indigo-200">

            <Sparkles className="h-5 w-5 text-white" />

            <div className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/30 blur-md" />

          </div>

          <div>
            <div className="text-[15px] font-bold tracking-tight text-zinc-900">
              Aether Access
            </div>

            <div className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-zinc-400">
              IAM CONSOLE
            </div>
          </div>

        </div>

      </div>


      {/* Separator */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />


      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">

        <div className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-zinc-400">
          WORKSPACE
        </div>

        <div className="space-y-1.5">

          {canAccessUsers && (
            <Link
              href="/users"
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${
                pathname.startsWith('/users')
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >

              {pathname.startsWith('/users') && (
                <div className="absolute left-0 h-7 w-1 rounded-r-full bg-indigo-500" />
              )}

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  pathname.startsWith('/users')
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-400 group-hover:bg-white group-hover:text-zinc-600'
                }`}
              >
                <Users className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="text-[13px] font-semibold">
                  使用者管理
                </div>

                <div
                  className={`mt-0.5 text-[10px] ${
                    pathname.startsWith('/users')
                      ? 'text-indigo-400'
                      : 'text-zinc-400'
                  }`}
                >
                  Users
                </div>

              </div>

              <ChevronRight
                className={`h-4 w-4 transition ${
                  pathname.startsWith('/users')
                    ? 'text-indigo-400'
                    : 'text-zinc-300 opacity-0 group-hover:opacity-100'
                }`}
              />

            </Link>
          )}


          {canAccessGroups && (
            <Link
              href="/groups"
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${
                pathname.startsWith('/groups')
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >

              {pathname.startsWith('/groups') && (
                <div className="absolute left-0 h-7 w-1 rounded-r-full bg-indigo-500" />
              )}

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  pathname.startsWith('/groups')
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-400 group-hover:bg-white group-hover:text-zinc-600'
                }`}
              >
                <UserCheck className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="text-[13px] font-semibold">
                  群組管理
                </div>

                <div className="mt-0.5 text-[10px] text-zinc-400">
                  Groups
                </div>

              </div>

              <ChevronRight className="h-4 w-4 text-zinc-300 opacity-0 transition group-hover:opacity-100" />

            </Link>
          )}


          {canAccessRoles && (
            <Link
              href="/roles"
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${
                pathname.startsWith('/roles')
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >

              {pathname.startsWith('/roles') && (
                <div className="absolute left-0 h-7 w-1 rounded-r-full bg-indigo-500" />
              )}

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  pathname.startsWith('/roles')
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-400 group-hover:bg-white group-hover:text-zinc-600'
                }`}
              >
                <Shield className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="text-[13px] font-semibold">
                  角色管理
                </div>

                <div className="mt-0.5 text-[10px] text-zinc-400">
                  Roles
                </div>

              </div>

              <ChevronRight className="h-4 w-4 text-zinc-300 opacity-0 transition group-hover:opacity-100" />

            </Link>
          )}


          {canAccessPermissions && (
            <Link
              href="/permissions"
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${
                pathname.startsWith('/permissions')
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >

              {pathname.startsWith('/permissions') && (
                <div className="absolute left-0 h-7 w-1 rounded-r-full bg-indigo-500" />
              )}

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  pathname.startsWith('/permissions')
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'bg-zinc-50 text-zinc-400 group-hover:bg-white group-hover:text-zinc-600'
                }`}
              >
                <Lock className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="text-[13px] font-semibold">
                  權限授予
                </div>

                <div className="mt-0.5 text-[10px] text-zinc-400">
                  Permissions
                </div>

              </div>

              <ChevronRight className="h-4 w-4 text-zinc-300 opacity-0 transition group-hover:opacity-100" />

            </Link>
          )}

        </div>

      </nav>


      {/* System Status */}
      <div className="p-4">

        <div className="rounded-2xl border border-zinc-100 bg-gradient-to-br from-white to-indigo-50/60 p-4">

          <div className="flex items-center gap-2">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

            </span>

            <span className="text-[11px] font-semibold text-zinc-700">
              System operational
            </span>

          </div>

          <p className="mt-2 text-[10px] leading-4 text-zinc-400">
            Identity & Access Management
          </p>

        </div>

      </div>

    </aside>


    {/* Right */}
    <div className="relative z-10 flex min-w-0 flex-1 flex-col">

      {/* Header */}
      <header className="flex h-[88px] items-center justify-between px-8">

        <div>

          <div className="text-[11px] font-semibold tracking-[0.16em] text-indigo-500">
            ACCESS CONTROL
          </div>

          <div className="mt-1 text-sm font-medium text-zinc-500">
            Identity & Permission Management
          </div>

        </div>


        {/* Account */}
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-3 rounded-full border border-white bg-white/80 py-1.5 pl-1.5 pr-4 shadow-[0_8px_30px_rgba(24,24,27,0.06)] backdrop-blur-xl">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-200">
              {user.username
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="hidden sm:block">

              <div className="text-xs font-semibold text-zinc-800">
                {user.username}
              </div>

              <div className="text-[10px] text-zinc-400">
                {user.describe || 'Authenticated user'}
              </div>

            </div>

          </div>


          <button
            onClick={async () => {
              await logout();

              router.replace('/login');
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/80 text-zinc-400 shadow-[0_8px_30px_rgba(24,24,27,0.05)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-red-500 hover:shadow-lg"
            title="登出系統"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>

        </div>

      </header>


      {/* Content */}
      <main className="min-h-0 flex-1 overflow-y-auto px-8 pb-8">

        <div className="min-h-full rounded-[30px] border border-white/80 bg-white/72 p-1 shadow-[0_30px_80px_rgba(79,70,229,0.07)] backdrop-blur-xl">

          <div className="min-h-full rounded-[27px] bg-white/75">
            {children}
          </div>

        </div>

      </main>

    </div>

  </div>
);
}

