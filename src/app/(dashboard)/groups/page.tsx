'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import HasAccess from '@/components/HasAccess';
import { Plus, Trash2, Edit, RefreshCw, X } from 'lucide-react';

interface Group {
  gid: number;
  name: string;
  describe?: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescribe, setFormDescribe] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 取得群組列表
  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '無法取得群組資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // 打開新增/編輯 Modal
  const openModal = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setFormName(group.name);
      setFormDescribe(group.describe || '');
    } else {
      setEditingGroup(null);
      setFormName('');
      setFormDescribe('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  // 表單送出 (新增或修改)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.gid}`, { name: formName, describe: formDescribe });
      } else {
        await api.post('/groups', { name: formName, describe: formDescribe });
      }
      closeModal();
      fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.error || '操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 刪除群組
  const handleDelete = async (gid: number) => {
    if (!confirm('確定要刪除此群組嗎？')) return;
    try {
      await api.delete(`/groups/${gid}`);
      fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.error || '刪除失敗');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">群組管理 (Group)</h1>
          <p className="text-sm text-gray-500">管理系統內的使用者群組架構</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchGroups}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
          >
            <RefreshCw className="w-4 h-4" /> 重新整理
          </button>

          <HasAccess resource="Group" action="create">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition"
            >
              <Plus className="w-4 h-4" /> 新增群組
            </button>
          </HasAccess>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>}

      {/* 表格 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">資料讀取中...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200">
                <th className="py-3 px-4 font-semibold">GID</th>
                <th className="py-3 px-4 font-semibold">群組名稱</th>
                <th className="py-3 px-4 font-semibold">描述</th>
                <th className="py-3 px-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {groups.map((g) => (
                <tr key={g.gid} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-3 px-4 text-gray-500">{g.gid}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{g.name}</td>
                  <td className="py-3 px-4 text-gray-500">{g.describe || '-'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <HasAccess resource="Group" action="update">
                      <button
                        onClick={() => openModal(g)}
                        className="inline-flex items-center p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </HasAccess>

                    <HasAccess resource="Group" action="delete">
                      <button
                        onClick={() => handleDelete(g.gid)}
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

      {/* 新增/編輯 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingGroup ? '編輯群組' : '新增群組'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  群組名稱
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="例如：研發部"
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
                  placeholder="說明此群組的用途"
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
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