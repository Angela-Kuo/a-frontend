'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import api from '@/lib/axios';
import HasAccess from '@/components/HasAccess';


interface Permission {
  id: number;
  rid: number;
  memberType: 'User' | 'Group';
  memberId: number;
}


interface Role {
  rid: number;
  describe?: string | null;
}


interface User {
  uid: number;
  username: string;
  describe?: string | null;
}


interface Group {
  gid: number;
  groupName: string;
  describe?: string | null;
}


const ROLE_OPERATION_MAP: Record<
  string,
  {
    resource: string;
    action: string;
  }
> = {
  'create user': {
    resource: 'User',
    action: 'create',
  },
  'update user': {
    resource: 'User',
    action: 'update',
  },
  'delete user': {
    resource: 'User',
    action: 'delete',
  },

  'create group': {
    resource: 'Group',
    action: 'create',
  },
  'update group': {
    resource: 'Group',
    action: 'update',
  },
  'delete group': {
    resource: 'Group',
    action: 'delete',
  },

  'create role': {
    resource: 'Role',
    action: 'create',
  },
  'update role': {
    resource: 'Role',
    action: 'update',
  },
  'delete role': {
    resource: 'Role',
    action: 'delete',
  },

  'create group member': {
    resource: 'GroupMember',
    action: 'create',
  },
  'delete group member': {
    resource: 'GroupMember',
    action: 'delete',
  },

  'create permission': {
    resource: 'Permission',
    action: 'create',
  },
  'delete permission': {
    resource: 'Permission',
    action: 'delete',
  },

  // T2 新增：讀取權限
  'read user': {
    resource: 'User',
    action: 'read',
  },
  'read group': {
    resource: 'Group',
    action: 'read',
  },
  'read audit log': {
    resource: 'AuditLog',
    action: 'read',
  },
};


export default function PermissionsPage() {
  const [
    permissions,
    setPermissions,
  ] = useState<Permission[]>([]);

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    users,
    setUsers,
  ] = useState<User[]>([]);

  const [
    groups,
    setGroups,
  ] = useState<Group[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // =====================================================
  // CREATE PERMISSION STATE
  // =====================================================

  const [
    selectedRid,
    setSelectedRid,
  ] = useState('');

  const [
    memberType,
    setMemberType,
  ] = useState<'User' | 'Group'>(
    'User'
  );

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState('');


  // =====================================================
  // API
  // =====================================================

  const fetchPermissions =
    async () => {
      const res =
        await api.get(
          '/permissions'
        );

      setPermissions(
        res.data.data ||
        res.data ||
        []
      );
    };


  const fetchAll =
    async () => {
      setLoading(true);

      try {
        /**
         * T2：/users 與 /groups 現在需要 User/read、Group/read。
         * 用 allSettled，讓其中一個 403 不會拖垮整頁。
         */
        const [
          permissionsRes,
          rolesRes,
          usersRes,
          groupsRes,
        ] = await Promise.allSettled([
          api.get('/permissions'),
          api.get('/roles'),
          api.get('/users'),
          api.get('/groups'),
        ]);

        const pick = (
          result: PromiseSettledResult<any>
        ) =>
          result.status === 'fulfilled'
            ? result.value.data.data ||
              result.value.data ||
              []
            : [];

        setPermissions(pick(permissionsRes));
        setRoles(pick(rolesRes));
        setUsers(pick(usersRes));
        setGroups(pick(groupsRes));

      } catch (err) {
        console.error(
          '取得 Permission 頁資料失敗',
          err
        );

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchAll();
  }, []);


  // =====================================================
  // MEMBER TYPE
  // =====================================================

  const handleMemberTypeChange = (
    type: 'User' | 'Group'
  ) => {
    setMemberType(type);

    setSelectedMemberId('');
  };


  // =====================================================
  // SELECTED ROLE
  // =====================================================

  const selectedRole =
    roles.find(
      (role) =>
        role.rid ===
        Number(selectedRid)
    );


  const selectedRoleMeta =
    selectedRole?.describe
      ? ROLE_OPERATION_MAP[
          selectedRole.describe
        ]
      : undefined;


  // =====================================================
  // DUPLICATE CHECK
  // =====================================================

  const isDuplicate =
    useMemo(() => {
      if (
        !selectedRid ||
        !selectedMemberId
      ) {
        return false;
      }

      return permissions.some(
        (permission) =>
          permission.rid ===
            Number(selectedRid) &&
          permission.memberType ===
            memberType &&
          permission.memberId ===
            Number(
              selectedMemberId
            )
      );

    }, [
      permissions,
      selectedRid,
      selectedMemberId,
      memberType,
    ]);


  // =====================================================
  // CREATE PERMISSION
  // =====================================================

  const handleCreatePermission =
    async () => {
      if (!selectedRid) {
        alert(
          '請先選擇 Role'
        );

        return;
      }

      if (!selectedMemberId) {
        alert(
          memberType === 'User'
            ? '請先選擇 User'
            : '請先選擇 Group'
        );

        return;
      }

      if (isDuplicate) {
        alert(
          '這筆 Permission 已經存在。'
        );

        return;
      }

      try {
        await api.post(
          '/permissions',
          {
            rid: Number(
              selectedRid
            ),

            memberType,

            memberId: Number(
              selectedMemberId
            ),
          }
        );

        await fetchPermissions();

        setSelectedRid('');
        setSelectedMemberId('');

        alert(
          '角色授予成功'
        );

      } catch (err: any) {
        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '角色授予失敗'
        );
      }
    };


  // =====================================================
  // DELETE PERMISSION
  // =====================================================

  const handleDeletePermission =
    async (
      permission: Permission
    ) => {
      if (
        !confirm(
          '確定要取消這筆角色授予嗎？'
        )
      ) {
        return;
      }

      try {
        await api.delete(
          `/permissions/${permission.id}`
        );

        await fetchPermissions();

      } catch (err: any) {
        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '取消授予失敗'
        );
      }
    };


  // =====================================================
  // HELPERS
  // =====================================================

  const getRole = (
    rid: number
  ) => {
    return roles.find(
      (role) =>
        role.rid === rid
    );
  };


  const getRoleMeta = (
    rid: number
  ) => {
    const role =
      getRole(rid);

    if (!role?.describe) {
      return undefined;
    }

    return ROLE_OPERATION_MAP[
      role.describe
    ];
  };


  const getMemberText = (
    permission: Permission
  ) => {
    if (
      permission.memberType ===
      'User'
    ) {
      const user =
        users.find(
          (item) =>
            item.uid ===
            permission.memberId
        );

      return user
        ? `${user.username} (UID: ${user.uid})`
        : `User #${permission.memberId}`;
    }

    const group =
      groups.find(
        (item) =>
          item.gid ===
          permission.memberId
      );

    return group
      ? `${group.groupName} (GID: ${group.gid})`
      : `Group #${permission.memberId}`;
  };


  const getActionClass = (
    action?: string
  ) => {
    if (
      action === 'create'
    ) {
      return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100';
    }

    if (
      action === 'update'
    ) {
      return 'bg-blue-50 text-blue-600 ring-1 ring-blue-100';
    }

    if (
      action === 'delete'
    ) {
      return 'bg-red-50 text-red-500 ring-1 ring-red-100';
    }

    return 'bg-gray-50 text-gray-500 ring-1 ring-gray-100';
  };


  const directUserCount =
    permissions.filter(
      (permission) =>
        permission.memberType ===
        'User'
    ).length;


  const groupCount =
    permissions.filter(
      (permission) =>
        permission.memberType ===
        'Group'
    ).length;


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-[calc(100dvh-145px)] flex-col p-6">


      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <div className="mb-6 grid h-[76px] grid-cols-[1fr_120px] items-center gap-6">

        {/* Title */}
        <div>

          <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-800">
            權限授予 (Permission)
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            管理使用者與群組的角色權限
          </p>

        </div>


        {/* Count */}
        <div className="flex h-[56px] w-[120px] items-center border-l border-gray-200 pl-7">

          <div>

            <div className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
              {permissions.length}
            </div>

            <div className="mt-2 whitespace-nowrap text-[10px] font-medium tracking-[0.08em] text-gray-400">
              目前權限
            </div>

          </div>

        </div>

      </div>



      {/* =================================================
          MAIN PANEL
      ================================================== */}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


        {/* =================================================
            TOOLBAR
        ================================================== */}

        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200 px-5">

          <div>

            <div className="text-sm font-semibold text-gray-700">
              權限授予管理
            </div>

            <div className="mt-0.5 text-[11px] text-gray-400">
              User {directUserCount} ・ Group {groupCount}
            </div>

          </div>


          <button
            type="button"
            onClick={fetchAll}
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

        </div>



        {/* =================================================
            SCROLL AREA
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">


          {/* =================================================
              CREATE PERMISSION
          ================================================== */}

          <HasAccess
            resource="Permission"
            action="create"
          >

            <div className="border-b border-gray-200 px-5 py-5">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="text-sm font-semibold text-gray-800">
                    新增角色授予
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    選擇角色能力與授予對象
                  </p>

                </div>

              </div>


              {/* Select Area */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.8fr_1.4fr_auto]">


                {/* Role */}
                <div>

                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    1. 選擇角色
                  </label>

                  <select
                    value={
                      selectedRid
                    }
                    onChange={(e) =>
                      setSelectedRid(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >

                    <option value="">
                      請選擇 Role
                    </option>

                    {roles.map(
                      (role) => {
                        const meta =
                          role.describe
                            ? ROLE_OPERATION_MAP[
                                role.describe
                              ]
                            : undefined;

                        return (
                          <option
                            key={
                              role.rid
                            }
                            value={
                              role.rid
                            }
                          >
                            RID {role.rid}
                            {' — '}
                            {meta
                              ? `${meta.resource}/${meta.action}`
                              : role.describe ||
                                'Unknown'}
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>



                {/* Member Type */}
                <div>

                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    2. 授予類型
                  </label>

                  <select
                    value={
                      memberType
                    }
                    onChange={(e) =>
                      handleMemberTypeChange(
                        e.target
                          .value as
                          | 'User'
                          | 'Group'
                      )
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >

                    <option value="User">
                      User
                    </option>

                    <option value="Group">
                      Group
                    </option>

                  </select>

                </div>



                {/* Member */}
                <div>

                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    3. 授予對象
                  </label>

                  <select
                    value={
                      selectedMemberId
                    }
                    onChange={(e) =>
                      setSelectedMemberId(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >

                    <option value="">
                      請選擇
                      {' '}
                      {memberType}
                    </option>

                    {memberType ===
                    'User'
                      ? users.map(
                          (
                            user
                          ) => (

                            <option
                              key={
                                user.uid
                              }
                              value={
                                user.uid
                              }
                            >
                              {user.username}
                              {' '}
                              (UID: {user.uid})
                            </option>

                          )
                        )

                      : groups.map(
                          (
                            group
                          ) => (

                            <option
                              key={
                                group.gid
                              }
                              value={
                                group.gid
                              }
                            >
                              {group.groupName}
                              {' '}
                              (GID: {group.gid})
                            </option>

                          )
                        )}

                  </select>

                </div>



                {/* Create Button */}
                <div className="flex items-end">

                  <button
                    type="button"
                    onClick={
                      handleCreatePermission
                    }
                    disabled={
                      isDuplicate
                    }
                    className={`flex h-11 min-w-[136px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                      isDuplicate
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-[#5b5ce2] text-white shadow-[0_8px_20px_rgba(91,92,226,0.20)] hover:bg-[#5051d8]'
                    }`}
                  >

                    <Plus className="h-4 w-4" />

                    建立授予

                  </button>

                </div>

              </div>



              {/* Role Preview */}
              {selectedRole && (

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3">

                  <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-indigo-400">
                    ROLE PREVIEW
                  </div>


                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">

                    <div>
                      RID
                      <span className="ml-2 font-semibold text-gray-700">
                        {
                          selectedRole.rid
                        }
                      </span>
                    </div>

                    <div>
                      系統能力
                      <span className="ml-2 font-semibold text-gray-700">
                        {
                          selectedRole.describe ||
                          '-'
                        }
                      </span>
                    </div>

                    <div>
                      資源
                      <span className="ml-2 font-semibold text-gray-700">
                        {
                          selectedRoleMeta
                            ?.resource ||
                          '-'
                        }
                      </span>
                    </div>

                    <div>
                      動作
                      <span className="ml-2 font-semibold text-gray-700">
                        {
                          selectedRoleMeta
                            ?.action ||
                          '-'
                        }
                      </span>
                    </div>

                  </div>

                </div>

              )}



              {/* Duplicate */}
              {isDuplicate && (

                <div className="mt-3 text-xs font-medium text-red-500">
                  此 Role 已經授予給這個
                  {' '}
                  {memberType}
                  ，不能重複建立。
                </div>

              )}

            </div>

          </HasAccess>



          {/* =================================================
              PERMISSION LIST
          ================================================== */}

          <div className="px-5 pb-5 pt-4">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold text-gray-700">
                  目前角色授予紀錄
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  查看 User 與 Group 目前被授予的 Role
                </p>

              </div>

            </div>



            <div className="overflow-hidden rounded-xl border border-gray-200">

              <table className="w-full table-fixed border-collapse text-left">


                <colgroup>

                  {/* ID */}
                  <col className="w-[7%]" />

                  {/* RID */}
                  <col className="w-[7%]" />

                  {/* Resource */}
                  <col className="w-[13%]" />

                  {/* Action */}
                  <col className="w-[12%]" />

                  {/* Role.describe */}
                  <col className="w-[19%]" />

                  {/* Type */}
                  <col className="w-[11%]" />

                  {/* Member */}
                  <col className="w-[23%]" />

                  {/* Actions */}
                  <col className="w-[8%]" />

                </colgroup>


                <thead>

                  <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-500">

                    <th className="px-4 py-3">
                      PID
                    </th>

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

                    <th className="px-4 py-3">
                      類型
                    </th>

                    <th className="px-4 py-3">
                      授予對象
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
                        colSpan={8}
                        className="py-10 text-center text-sm text-gray-400"
                      >
                        載入中...
                      </td>

                    </tr>

                  ) : permissions.length ===
                    0 ? (

                    <tr>

                      <td
                        colSpan={8}
                        className="py-10 text-center text-sm text-gray-400"
                      >
                        目前沒有角色授予紀錄
                      </td>

                    </tr>

                  ) : (

                    permissions.map(
                      (
                        permission
                      ) => {
                        const role =
                          getRole(
                            permission.rid
                          );

                        const meta =
                          getRoleMeta(
                            permission.rid
                          );

                        return (

                          <tr
                            key={
                              permission.id
                            }
                            className="border-b border-gray-200 transition-colors last:border-b-0 hover:bg-indigo-50/25"
                          >


                            {/* PID */}
                            <td className="px-4 py-3.5 font-mono text-sm text-gray-500">

                              {
                                permission.id
                              }

                            </td>



                            {/* RID */}
                            <td className="px-4 py-3.5 font-mono text-sm text-gray-500">

                              {
                                permission.rid
                              }

                            </td>



                            {/* Resource */}
                            <td className="px-4 py-3.5">

                              <span className="font-semibold text-gray-800">

                                {
                                  meta
                                    ?.resource ||
                                  '-'
                                }

                              </span>

                            </td>



                            {/* Action */}
                            <td className="px-4 py-3.5">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getActionClass(
                                  meta?.action
                                )}`}
                              >

                                {
                                  meta?.action ||
                                  '-'
                                }

                              </span>

                            </td>



                            {/* Role Describe */}
                            <td className="px-4 py-3.5">

                              <span className="text-sm text-gray-600">

                                {
                                  role
                                    ?.describe ||
                                  '-'
                                }

                              </span>

                            </td>



                            {/* Type */}
                            <td className="px-4 py-3.5">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  permission.memberType ===
                                  'User'
                                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                    : 'bg-violet-50 text-violet-600 ring-1 ring-violet-100'
                                }`}
                              >

                                {
                                  permission.memberType
                                }

                              </span>

                            </td>



                            {/* Member */}
                            <td className="truncate px-4 py-3.5 text-sm text-gray-600">

                              {
                                getMemberText(
                                  permission
                                )
                              }

                            </td>



                            {/* Actions */}
                            <td className="px-4 py-3.5">

                              <div className="flex items-center justify-end">

                                <HasAccess
                                  resource="Permission"
                                  action="delete"
                                >

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeletePermission(
                                        permission
                                      )
                                    }
                                    title="取消授予"
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



          {/* =================================================
              AUTHORIZATION FLOW
          ================================================== */}

          <div className="mx-5 mb-5 rounded-xl border border-indigo-100 bg-indigo-50/35 px-4 py-3">

            <div className="text-xs font-semibold text-indigo-500">
              五表授權流程
            </div>

            <div className="mt-2 font-mono text-xs text-gray-600">
              User / Group
              {' → '}
              Permission
              {' → '}
              Role.describe
              {' → '}
              Authorization Logic
              {' → '}
              resource + action
            </div>

            <div className="mt-2 text-[11px] text-gray-400">
              Group 的 Permission 會透過 GroupMember 被群組內使用者繼承。
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}