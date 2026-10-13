'use client';

import { ShieldAlert } from 'lucide-react';

export default function NoAccessPage() {
  return (
    <div className="min-h-full flex items-center justify-center">

      <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8 text-center">

        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-12 h-12 text-gray-400" />
        </div>

        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          目前沒有可使用的管理功能
        </h1>

        <p className="text-sm text-gray-500 mt-3 leading-6">
          此帳號目前沒有被授予任何系統操作權限。
          請由具有 Permission 管理權限的管理者進行授權。
        </p>

      </div>

    </div>
  );
}