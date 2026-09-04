'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import HasAccess from '@/components/HasAccess';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface User {
  uid: number;
  username: string;
  describe?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 載入使用者列表 (呼叫 C 服務 API: GET /api/users)
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '無法取得使用者資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 刪除使用者 (呼叫 C 服務 API: DELETE /api/users/:uid)
  const handleDelete = async (uid: number) => {
    if (!confirm('確定要刪除此使用者嗎？')) return;
    try {
      await api.delete(`/users/${uid}`);
      fetchUsers(); // 重新整理
    } catch (err: any) {
      alert(err.response?.data?.error || '刪除失敗');
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題與操作區 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">使用者管理</h1>
          <p className="text-sm text-gray-500">檢視與管理系統內所有使用者帳號</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
          >
            <RefreshCw className="w-4 h-4" />
            重新整理
          </button>

          {/* 只有具備 User / create 權限的人，才會看到這個按鈕 */}
          <HasAccess resource="User" action="create">
            <button
              onClick={() => alert('觸發新增使用者彈窗 (可接 Modal)')}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
            >
              <Plus className="w-4 h-4" />
              新增使用者
            </button>
          </HasAccess>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 資料表格 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">資料讀取中...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200">
                <th className="py-3 px-4 font-semibold">UID</th>
                <th className="py-3 px-4 font-semibold">帳號 (Username)</th>
                <th className="py-3 px-4 font-semibold">描述</th>
                <th className="py-3 px-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-3 px-4 text-gray-500">{u.uid}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">
                    {u.username}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{u.describe || '-'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {/* 編輯按鈕：需具備 User / update 權限 */}
                    <HasAccess resource="User" action="update">
                      <button
                        onClick={() => alert(`編輯 UID: ${u.uid}`)}
                        className="inline-flex items-center p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </HasAccess>

                    {/* 刪除按鈕：需具備 User / delete 權限 */}
                    <HasAccess resource="User" action="delete">
                      <button
                        onClick={() => handleDelete(u.uid)}
                        className="inline-flex items-center p-1 text-red-600 hover:bg-red-50 rounded"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </HasAccess>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}