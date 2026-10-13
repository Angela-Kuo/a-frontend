'use client';

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
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


interface Role {
  rid: number;
  describe?: string | null;
}


interface SystemRoleOption {
  describe: string;
  resource: string;
  action: string;
}


const SYSTEM_ROLE_OPTIONS: SystemRoleOption[] = [
  {
    describe: 'create user',
    resource: 'User',
    action: 'create',
  },
  {
    describe: 'update user',
    resource: 'User',
    action: 'update',
  },
  {
    describe: 'delete user',
    resource: 'User',
    action: 'delete',
  },

  {
    describe: 'create group',
    resource: 'Group',
    action: 'create',
  },
  {
    describe: 'update group',
    resource: 'Group',
    action: 'update',
  },
  {
    describe: 'delete group',
    resource: 'Group',
    action: 'delete',
  },

  {
    describe: 'create role',
    resource: 'Role',
    action: 'create',
  },
  {
    describe: 'update role',
    resource: 'Role',
    action: 'update',
  },
  {
    describe: 'delete role',
    resource: 'Role',
    action: 'delete',
  },

  {
    describe: 'create group member',
    resource: 'GroupMember',
    action: 'create',
  },
  {
    describe: 'delete group member',
    resource: 'GroupMember',
    action: 'delete',
  },

  {
    describe: 'create permission',
    resource: 'Permission',
    action: 'create',
  },
  {
    describe: 'delete permission',
    resource: 'Permission',
    action: 'delete',
  },
];


export default function RolesPage() {

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

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
    editingRole,
    setEditingRole,
  ] = useState<Role | null>(
    null
  );

  const [
    selectedDescribe,
    setSelectedDescribe,
  ] = useState('');


  // =====================================================
  // API
  // =====================================================

  const fetchRoles = async () => {

    setLoading(true);

    try {

      const res =
        await api.get(
          '/roles'
        );

      setRoles(
        res.data.data ||
        res.data ||
        []
      );

    } catch (err: any) {

      console.error(
        '取得 Role 列表失敗',
        err
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchRoles();

  }, []);


  // =====================================================
  // ROLE OPTIONS
  // =====================================================

  const missingRoleOptions =
    useMemo(() => {

      return SYSTEM_ROLE_OPTIONS.filter(
        (option) =>
          !roles.some(
            (role) =>
              role.describe ===
              option.describe
          )
      );

    }, [
      roles,
    ]);


  const editableRoleOptions =
    useMemo(() => {

      if (
        !editingRole
      ) {

        return missingRoleOptions;

      }


      return SYSTEM_ROLE_OPTIONS.filter(
        (option) => {

          if (
            option.describe ===
            editingRole.describe
          ) {

            return true;

          }


          return !roles.some(
            (role) =>
              role.rid !==
                editingRole.rid &&
              role.describe ===
                option.describe
          );

        }
      );

    }, [
      editingRole,
      roles,
      missingRoleOptions,
    ]);


  const getRoleMeta = (
    describe?: string | null
  ) => {

    return SYSTEM_ROLE_OPTIONS.find(
      (item) =>
        item.describe ===
        describe
    );

  };


  // =====================================================
  // CREATE
  // =====================================================

  const handleOpenCreate =
    () => {

      if (
        missingRoleOptions.length ===
        0
      ) {

        alert(
          '13 個系統 Role 都已建立，不需要再新增。'
        );

        return;

      }


      setEditingRole(
        null
      );

      setSelectedDescribe(
        missingRoleOptions[0]
          ?.describe ||
        ''
      );

      setIsModalOpen(
        true
      );

    };


  // =====================================================
  // EDIT
  // =====================================================

  const handleOpenEdit = (
    role: Role
  ) => {

    setEditingRole(
      role
    );

    setSelectedDescribe(
      role.describe ||
      ''
    );

    setIsModalOpen(
      true
    );

  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSaveRole =
    async (
      e: FormEvent
    ) => {

      e.preventDefault();


      if (
        !selectedDescribe
      ) {

        alert(
          '請選擇系統能力'
        );

        return;

      }


      const duplicate =
        roles.some(
          (role) =>
            role.describe ===
              selectedDescribe &&
            role.rid !==
              editingRole?.rid
        );


      if (
        duplicate
      ) {

        alert(
          '此 Role 已經存在，不能重複建立。'
        );

        return;

      }


      try {

        if (
          editingRole
        ) {

          await api.patch(
            `/roles/${editingRole.rid}`,
            {
              describe:
                selectedDescribe,
            }
          );

        } else {

          await api.post(
            '/roles',
            {
              describe:
                selectedDescribe,
            }
          );

        }


        setIsModalOpen(
          false
        );

        await fetchRoles();


      } catch (err: any) {

        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          'Role 儲存失敗'
        );

      }

    };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteRole =
    async (
      role: Role
    ) => {

      if (
        !confirm(
          `確定要刪除 Role #${role.rid}－${
            role.describe || ''
          } 嗎？`
        )
      ) {

        return;

      }


      try {

        await api.delete(
          `/roles/${role.rid}`
        );

        await fetchRoles();


      } catch (err: any) {

        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '刪除 Role 失敗'
        );

      }

    };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-[calc(100dvh-145px)] flex-col p-6">


      {/* ==============================
          PAGE HEADER
      ============================== */}

      <div className="mb-6 grid h-[76px] grid-cols-[1fr_120px] items-center gap-6">

        {/* Title */}
        <div>

          <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-800">
            角色管理 (Role)
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            管理系統角色與操作能力
          </p>

        </div>


        {/* Count */}
        <div className="flex h-[56px] w-[120px] items-center border-l border-gray-200 pl-7">

          <div>

            <div className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
              {roles.length}
            </div>

            <div className="mt-2 whitespace-nowrap text-[10px] font-medium tracking-[0.08em] text-gray-400">
              目前角色
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
            角色列表
          </div>


          <div className="flex items-center gap-2">

            {/* Refresh */}
            <button
              onClick={
                fetchRoles
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
              resource="Role"
              action="create"
            >

              <button
                onClick={
                  handleOpenCreate
                }
                disabled={
                  missingRoleOptions.length ===
                  0
                }
                title={
                  missingRoleOptions.length ===
                  0
                    ? '所有系統角色皆已建立'
                    : '新增角色'
                }
                className={`flex h-9 w-[128px] items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                  missingRoleOptions.length ===
                  0
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-[#5b5ce2] text-white shadow-[0_8px_20px_rgba(91,92,226,0.20)] hover:bg-[#5051d8]'
                }`}
              >

                <Plus className="h-4 w-4" />

                新增角色

              </button>

            </HasAccess>

          </div>

        </div>



        {/* ==============================
            TABLE
        ============================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">

          <div className="overflow-hidden rounded-xl border border-gray-200">

            <table className="w-full table-fixed border-collapse text-left">

              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[28%]" />
                <col className="w-[28%]" />
                <col className="w-[28%]" />
                <col className="w-[8%]" />
              </colgroup>


              <thead>

                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-500">

                  <th className="px-4 py-3">
                    RID
                  </th>

                  <th className="px-4 py-3">
                    資源
                  </th>

                  <th className="px-4 py-3">
                    動作
                  </th>

                  <th className="px-4 py-3">
                    系統能力
                  </th>

                  <th className="px-4 py-3 text-right">
                    操作
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      載入中...
                    </td>

                  </tr>

                ) : roles.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      無角色資料
                    </td>

                  </tr>

                ) : (

                  roles.map(
                    (
                      role
                    ) => {

                      const meta =
                        getRoleMeta(
                          role.describe
                        );


                      return (

                        <tr
                          key={
                            role.rid
                          }
                          className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-indigo-50/25"
                        >

                          {/* RID */}
                          <td className="px-4 py-3.5 font-mono text-sm text-gray-500">

                            {role.rid}

                          </td>


                          {/* Resource */}
                          <td className="px-4 py-3.5">

                              <span className="font-semibold text-gray-800">

                                {meta?.resource ||
                                  '-'}

                              </span>         

                          </td>


                          {/* Action */}
                          <td className="px-4 py-3.5">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                meta?.action ===
                                'create'
                                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                  : meta?.action ===
                                      'update'
                                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                    : meta?.action ===
                                        'delete'
                                      ? 'bg-red-50 text-red-500 ring-1 ring-red-100'
                                      : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100'
                              }`}
                            >

                              {meta?.action ||
                                '-'}

                            </span>

                          </td>


                          {/* Describe */}
                          <td className="px-4 py-3.5">

                            <span className="text-sm text-gray-600">
                              {role.describe ||
                                '-'}
                            </span>

                          </td>


                          {/* Actions */}
                          <td className="px-4 py-3.5">

                            <div className="flex items-center justify-end gap-1">

                              {/* Edit */}
                              <HasAccess
                                resource="Role"
                                action="update"
                              >

                                <button
                                  onClick={() =>
                                    handleOpenEdit(
                                      role
                                    )
                                  }
                                  title="編輯角色"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >

                                  <Pencil className="h-4 w-4" />

                                </button>

                              </HasAccess>


                              {/* Delete */}
                              <HasAccess
                                resource="Role"
                                action="delete"
                              >

                                <button
                                  onClick={() =>
                                    handleDeleteRole(
                                      role
                                    )
                                  }
                                  title="刪除角色"
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
    CREATE / EDIT ROLE MODAL
================================================== */}

{isModalOpen && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-sm">

    <div className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-white bg-white p-7 shadow-[0_35px_100px_rgba(49,46,129,0.16)]">


      {/* Header */}
      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-bold tracking-[-0.025em] text-gray-900">
            {editingRole
              ? '編輯角色'
              : '新增角色'}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            {editingRole
              ? '修改角色對應的系統能力'
              : '建立新的系統角色'}
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
        onSubmit={handleSaveRole}
        className="mt-6 space-y-5"
      >


        {/* Role Select */}
        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            系統能力
          </label>

          <select
            value={selectedDescribe}
            onChange={(e) =>
              setSelectedDescribe(
                e.target.value
              )
            }
            required
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >

            <option value="">
              請選擇系統能力
            </option>


            {editableRoleOptions.map(
              (
                option
              ) => (

                <option
                  key={
                    option.describe
                  }
                  value={
                    option.describe
                  }
                >

                  {option.resource}
                  {' / '}
                  {option.action}
                  {' — '}
                  {option.describe}

                </option>

              )
            )}

          </select>

        </div>



        {/* Selected Role Preview */}
        {selectedDescribe &&
          (() => {

            const meta =
              getRoleMeta(
                selectedDescribe
              );


            return meta ? (

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">

                <div className="mb-3 text-xs font-semibold text-indigo-500">
                  權限資訊
                </div>


                <div className="grid grid-cols-2 gap-4">

                  {/* Resource */}
                  <div>

                    <div className="text-xs text-gray-400">
                      資源
                    </div>

                    <div className="mt-1 text-sm font-semibold text-gray-700">
                      {meta.resource}
                    </div>

                  </div>


                  {/* Action */}
                  <div>

                    <div className="text-xs text-gray-400">
                      動作
                    </div>

                    <div className="mt-1">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          meta.action === 'create'
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                            : meta.action === 'update'
                              ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                              : meta.action === 'delete'
                                ? 'bg-red-50 text-red-500 ring-1 ring-red-100'
                                : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100'
                        }`}
                      >

                        {meta.action}

                      </span>

                    </div>

                  </div>

                </div>


                {/* Role Describe */}
                <div className="mt-4 border-t border-indigo-100 pt-3">

                  <div className="text-xs text-gray-400">
                    系統能力
                  </div>

                  <div className="mt-1 text-sm font-medium text-gray-700">
                    {selectedDescribe}
                  </div>

                </div>

              </div>

            ) : null;

          })()}



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


          {editingRole ? (

            <HasAccess
              resource="Role"
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
              resource="Role"
              action="create"
            >

              <button
                type="submit"
                className="h-10 rounded-xl bg-[#5b5ce2] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.18)] transition hover:bg-[#5051d8]"
              >
                新增角色
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