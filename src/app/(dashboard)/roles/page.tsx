'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import HasAccess from '@/components/HasAccess';
import { Plus, Trash2, Edit, RefreshCw, X } from 'lucide-react';

interface Role {
  rid: number;
  name: string;
  describe?: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescribe, setFormDescribe] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '無法取得角色資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormName(role.name);
      setFormDescribe(role.describe || '');
    } else {
      setEditingRole(null);
      setFormName('');
      setFormDescribe('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.rid}`, { name: formName, describe: formDescribe });
      } else {
        await api.post('/roles', { name: formName, describe: formDescribe });
      }
      closeModal();
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.error || '操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rid: number) => {
    if (!confirm('確定要刪除此角色嗎？')) return;
    try {
      await api.delete(`/roles/${rid}`);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.error || '刪除失敗');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">角色管理 (Role)</h1>
          <p className="text-sm text-gray-500">定義系統角色與權限分配組合</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchRoles}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
          >
            <RefreshCw className="w-4 h-4" /> 重新整理
          </button>

          <HasAccess resource="Role" action="create">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition"
            >
              <Plus className="w-4 h-4" /> 新增角色
            </button>
          </HasAccess>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">資料讀取中...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200">
                <th className="py-3 px-4 font-semibold">RID</th>
                <th className="py-3 px-4 font-semibold">角色名稱</th>
                <th className="py-3 px-4 font-semibold">描述</th>
                <th className="py-3 px-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {roles.map((r) => (
                <tr key={r.rid} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-3 px-4 text-gray-500">{r.rid}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{r.name}</td>
                  <td className="py-3 px-4 text-gray-500">{r.describe || '-'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <HasAccess resource="Role" action="update">
                      <button
                        onClick={() => openModal(r)}
                        className="inline-flex items-center p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </HasAccess>

                    <HasAccess resource="Role" action="delete">
                      <button
                        onClick={() => handleDelete(r.rid)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingRole ? '編輯角色' : '新增角色'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  角色名稱
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="例如：ADMIN, EDITOR, AUDITOR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={formDescribe}
                  onChange={(e) => setFormDescribe(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="說明此角色的權限層級"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? '儲存中...' : '儲存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}