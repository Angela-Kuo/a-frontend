'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface Operation {
  opid: number;
  resource: string;
  action: string;
  describe?: string;
}

export default function PermissionsPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPermissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/permissions');
      setOperations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '無法取得權限列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">權限授權清單 (Permission)</h1>
          <p className="text-sm text-gray-500">檢視系統定義之操作權限項目 (Resource & Action)</p>
        </div>

        <button
          onClick={fetchPermissions}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
        >
          <RefreshCw className="w-4 h-4" /> 重新整理
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">資料讀取中...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200">
                <th className="py-3 px-4 font-semibold">OPID</th>
                <th className="py-3 px-4 font-semibold">受控資源 (Resource)</th>
                <th className="py-3 px-4 font-semibold">操作動作 (Action)</th>
                <th className="py-3 px-4 font-semibold">描述說明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {operations.map((op) => (
                <tr key={op.opid} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-3 px-4 text-gray-500">{op.opid}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-mono text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {op.resource}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md font-mono text-xs font-medium">
                      {op.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{op.describe || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}