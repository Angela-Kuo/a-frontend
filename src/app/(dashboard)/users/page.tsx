'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

import api from '@/lib/axios';
import HasAccess from '@/components/HasAccess';


interface User {
  uid?: number;
  userId?: number;
  id?: number;

  username: string;

  describe?: string;
  description?: string;
}


export default function UsersPage() {

  const [
    users,
    setUsers,
  ] = useState<User[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // Modal
  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState<User | null>(
    null
  );


  // Form
  const [
    username,
    setUsername,
  ] = useState('');

  const [
    pwd,
    setPwd,
  ] = useState('');

  const [
    describe,
    setDescribe,
  ] = useState('');


  // =====================================================
  // API
  // =====================================================

  const fetchUsers = async () => {

    setLoading(true);

    try {

      const res =
        await api.get(
          '/users'
        );

      setUsers(
        res.data.data ||
        res.data ||
        []
      );

    } catch (err: any) {

      console.error(
        '取得使用者列表失敗',
        err
      );

      if (
        err.response?.status ===
        401
      ) {

        alert(
          '登入已過期或未登入，請重新登入！'
        );

      }

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchUsers();

  }, []);


  // =====================================================
  // CREATE / EDIT
  // =====================================================

  const handleOpenCreateModal =
    () => {

      setEditingUser(null);

      setUsername('');

      setPwd('');

      setDescribe('');

      setIsModalOpen(true);

    };


  const handleOpenEditModal = (
    user: User
  ) => {

    setEditingUser(
      user
    );

    setUsername(
      user.username || ''
    );

    setPwd('');

    setDescribe(
      user.describe ||
      user.description ||
      ''
    );

    setIsModalOpen(true);

  };


  const handleSaveUser = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    const targetId =
      editingUser
        ? editingUser.uid ??
          editingUser.userId ??
          editingUser.id
        : null;


    if (
      editingUser &&
      !targetId
    ) {

      alert(
        '無法取得該使用者的 ID，無法完成編輯'
      );

      return;

    }


    const payload: Record<
      string,
      any
    > = {

      username:
        username.trim(),

      describe:
        describe.trim(),

    };


    if (
      pwd.trim()
    ) {

      payload.pwd =
        pwd.trim();

    }


    try {

      if (
        editingUser
      ) {

        await api.patch(
          `/users/${targetId}`,
          payload
        );

      } else {

        if (
          !pwd.trim()
        ) {

          alert(
            '新增使用者時密碼為必填欄位'
          );

          return;

        }


        await api.post(
          '/users',
          payload
        );

      }


      setIsModalOpen(
        false
      );

      await fetchUsers();


    } catch (err: any) {

      console.error(
        '儲存失敗詳情:',
        err.response
      );


      const status =
        err.response?.status;


      const resData =
        err.response?.data;


      const errMsg =
        resData?.error ||
        resData?.message ||
        (
          typeof resData ===
          'string'
            ? resData
            : err.message
        );


      alert(
        `[HTTP ${
          status || '錯誤'
        }] 儲存失敗：\n${
          errMsg ||
          '伺服器拒絕更新'
        }`
      );

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteUser =
    async (
      user: User
    ) => {

      const targetId =
        user.uid ??
        user.userId ??
        user.id;


      if (
        !targetId
      ) {

        alert(
          '無效的使用者 ID'
        );

        return;

      }


      if (
        !confirm(
          `確定要刪除使用者 ${user.username} 嗎？`
        )
      ) {

        return;

      }


      try {

        await api.delete(
          `/users/${targetId}`
        );

        await fetchUsers();

      } catch (err: any) {

        const resData =
          err.response?.data;


        const errMsg =
          resData?.error ||
          resData?.message ||
          err.message;


        alert(
          `刪除失敗：${errMsg}`
        );

      }

    };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-[calc(100dvh-145px)] flex-col p-6">


      {/* PAGE HEADER */}
      <div className="mb-6 grid h-[76px] grid-cols-[1fr_120px] items-center gap-6">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-800">
          使用者管理 (User)
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          管理系統帳號與個人資訊
        </p>
      </div>


      {/* Count */}
      <div className="flex h-[56px] w-[120px] items-center border-l border-gray-200 pl-7">

        <div>
          <div className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
            {users.length}
          </div>

          <div className="mt-2 whitespace-nowrap text-[10px] font-medium tracking-[0.08em] text-gray-400">
            目前使用者
          </div>
        </div>

      </div>

    </div>



      {/* ==============================
          PANEL
      ============================== */}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


        {/* Toolbar */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200 px-5">

          <div className="text-sm font-semibold text-gray-700">
            使用者列表
          </div>


          <div className="flex items-center gap-2">

            {/* Refresh */}
            <button
              onClick={
                fetchUsers
              }
              title="重新整理"
              className="group flex h-9 w-[112px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600"
            >

              <RefreshCw
                className={`h-4 w-4 transition-transform ${
                  loading
                    ? 'animate-spin'
                    : 'group-hover:rotate-90'
                }`}
              />

              重新整理

            </button>


            {/* Add */}
            <HasAccess
              resource="User"
              action="create"
            >

              <button
                onClick={
                  handleOpenCreateModal
                }
                className="flex h-9 w-[128px] items-center justify-center gap-2 rounded-lg bg-[#5b5ce2] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.20)] transition hover:bg-[#5051d8]"
              >

                <Plus className="h-4 w-4" />

                新增使用者

              </button>

            </HasAccess>

          </div>

        </div>



        {/* ==============================
            TABLE
        ============================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">

          <div className="overflow-hidden rounded-xl border border-gray-200">

            <table className="w-full border-collapse text-left">
              <colgroup>
                <col className="w-[90px]" />
                <col className="w-[420px]" />
                <col />
                <col className="w-[170px]" />
              </colgroup>

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-500">

                  <th className="w-[110px] px-4 py-3">
                    UID
                  </th>

                  <th className="px-4 py-3">
                    帳號
                  </th>

                  <th className="px-4 py-3">
                    描述
                  </th>

                  <th className="w-[150px] px-4 py-3 text-right">
                    操作
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      載入中...
                    </td>

                  </tr>

                ) : users.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      無使用者資料
                    </td>

                  </tr>

                ) : (

                  users.map(
                    (
                      user,
                      idx
                    ) => {

                      const uid =
                        user.uid ??
                        user.userId ??
                        user.id ??
                        idx + 1;


                      return (

                        <tr
                          key={uid}
                          className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-indigo-50/25"
                        >

                          {/* UID */}
                          <td className="px-4 py-3.5 font-mono text-sm text-gray-500">

                            {uid}

                          </td>


                          {/* User */}
                          <td className="px-4 py-3.5">

                            <div className="flex items-center gap-3">

                              {/* Avatar */}
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 text-sm font-semibold uppercase text-indigo-600 ring-1 ring-indigo-100">

                                {user.username
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  'U'}

                              </div>


                              <div className="font-semibold text-gray-800">
                                {user.username}
                              </div>

                            </div>

                          </td>


                          {/* Description */}
                          <td className="px-4 py-3.5 text-sm text-gray-600">

                            {user.describe ||
                              user.description ||
                              '-'}

                          </td>


                          {/* Actions */}
                          <td className="px-4 py-3.5">

                            <div className="flex items-center justify-end gap-1">

                              {/* Edit */}
                              <HasAccess
                                resource="User"
                                action="update"
                              >

                                <button
                                  onClick={() =>
                                    handleOpenEditModal(
                                      user
                                    )
                                  }
                                  title="編輯使用者"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >

                                  <Pencil className="h-4 w-4" />

                                </button>

                              </HasAccess>


                              {/* Delete */}
                              <HasAccess
                                resource="User"
                                action="delete"
                              >

                                <button
                                  onClick={() =>
                                    handleDeleteUser(
                                      user
                                    )
                                  }
                                  title="刪除使用者"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                                >

                                  <Trash2 className="h-4 w-4" />

                                </button>

                              </HasAccess>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>



      {/* ==============================
          CREATE / EDIT MODAL
      ============================== */}

      {/* =================================================
    CREATE / EDIT USER MODAL
================================================== */}

{isModalOpen && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-sm">

    <div className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-white bg-white p-7 shadow-[0_35px_100px_rgba(49,46,129,0.16)]">


      {/* Header */}
      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-bold tracking-[-0.025em] text-gray-900">
            {editingUser
              ? '編輯使用者'
              : '新增使用者'}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            {editingUser
              ? '修改使用者帳號與個人資訊'
              : '建立新的系統使用者'}
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            setIsModalOpen(false)
          }
          title="關閉"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Form */}
      <form
        onSubmit={handleSaveUser}
        className="mt-6 space-y-5"
      >


        {/* Username */}
        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            帳號名稱
          </label>

          <input
            type="text"
            required
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            placeholder="輸入使用者帳號"
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />

        </div>



        {/* Password */}
        <div>

          <div className="mb-2 flex items-center justify-between">

            <label className="text-sm font-medium text-gray-700">
              密碼
            </label>

            {editingUser && (
              <span className="text-xs text-gray-400">
                留空表示不修改
              </span>
            )}

          </div>


          <input
            type="password"
            required={!editingUser}
            value={pwd}
            onChange={(e) =>
              setPwd(
                e.target.value
              )
            }
            placeholder={
              editingUser
                ? '若不修改密碼可留空'
                : '輸入使用者密碼'
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />

        </div>



        {/* Description */}
        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            描述
          </label>

          <input
            type="text"
            value={describe}
            onChange={(e) =>
              setDescribe(
                e.target.value
              )
            }
            placeholder="輸入使用者描述"
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />

        </div>



        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">

          <button
            type="button"
            onClick={() =>
              setIsModalOpen(false)
            }
            className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            取消
          </button>


          {editingUser ? (

            <HasAccess
              resource="User"
              action="update"
            >

              <button
                type="submit"
                className="h-10 rounded-xl bg-[#5b5ce2] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.18)] transition hover:bg-[#5051d8]"
              >
                儲存修改
              </button>

            </HasAccess>

          ) : (

            <HasAccess
              resource="User"
              action="create"
            >

              <button
                type="submit"
                className="h-10 rounded-xl bg-[#5b5ce2] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.18)] transition hover:bg-[#5051d8]"
              >
                新增使用者
              </button>

            </HasAccess>

          )}

        </div>

      </form>

    </div>

  </div>

)}

    </div>
  );
}