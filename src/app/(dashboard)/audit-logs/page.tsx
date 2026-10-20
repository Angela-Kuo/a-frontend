'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import api from '@/lib/axios';

interface AuditLog {
  id: number;
  actorUid: number;
  action: 'PERMISSION_CREATE' | 'PERMISSION_DELETE';
  permissionId: number;
  rid: number;
  memberType: 'User' | 'Group';
  memberId: number;
  createdAt: string;
}

const PAGE_SIZE = 10;

const ACTION_LABEL: Record<AuditLog['action'], string> = {
  PERMISSION_CREATE: '授予權限',
  PERMISSION_DELETE: '取消權限',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour12: false,
  });
}

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async (nextOffset: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/audit-logs', {
        params: { limit: PAGE_SIZE, offset: nextOffset },
      });
      setItems(res.data.items ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err: any) {
      console.error('取得稽核紀錄失敗', err);
      setError(err?.response?.data?.error || '取得稽核紀錄失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(offset);
  }, [offset, fetchLogs]);

  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex min-h-[calc(100dvh-145px)] flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-800">
            稽核紀錄 (Audit Logs)
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            誰在何時授予或取消了誰的哪項權限
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="border-l border-gray-200 pl-6">
            <div className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
              {total}
            </div>
            <div className="mt-2 text-[10px] font-medium tracking-[0.08em] text-gray-400">
              紀錄總數
            </div>
          </div>

          <button
            onClick={() => fetchLogs(offset)}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            重新整理
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">編號</th>
              <th className="px-5 py-3 font-medium">執行者</th>
              <th className="px-5 py-3 font-medium">動作</th>
              <th className="px-5 py-3 font-medium">對象</th>
              <th className="px-5 py-3 font-medium">時間</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr
                key={log.id}
                data-testid={`row-audit-${log.id}`}
                className="border-t border-gray-100"
              >
                <td className="px-5 py-3 text-gray-400">#{log.id}</td>
                <td className="px-5 py-3 text-gray-800">UID {log.actorUid}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      log.action === 'PERMISSION_CREATE'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {ACTION_LABEL[log.action]} ({log.action})
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {log.memberType} {log.memberId}，RID {log.rid}（Permission #
                  {log.permissionId}）
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {formatTime(log.createdAt)}
                </td>
              </tr>
            ))}

            {!loading && items.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  目前沒有稽核紀錄
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <span className="text-sm text-gray-500">
          第 {page} / {pageCount} 頁
        </span>
        <button
          data-testid="audit-prev"
          onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          disabled={!hasPrev || loading}
          className="h-9 rounded-xl border border-gray-200 px-4 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          上一頁
        </button>
        <button
          data-testid="audit-next"
          onClick={() => setOffset(offset + PAGE_SIZE)}
          disabled={!hasNext || loading}
          className="h-9 rounded-xl border border-gray-200 px-4 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一頁
        </button>
      </div>
    </div>
  );
}
