'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Plus,
  RefreshCw,
  UsersRound,
  UserPlus,
  Pencil,
  Trash2,
  X,
  UserMinus,
} from 'lucide-react';

import api from '@/lib/axios';
import HasAccess from '@/components/HasAccess';


interface Group {
  gid?: number;
  groupId?: number;
  id?: number;

  groupName?: string;
  group_name?: string;
  name?: string;

  describe?: string;
  description?: string;
}


interface User {
  uid?: number;
  userId?: number;
  id?: number;
  username: string;
}


interface GroupMember {
  id: number;
  gid: number;
  uid: number;
}


export default function GroupsPage() {

  const [
    groups,
    setGroups,
  ] = useState<Group[]>([]);

  const [
    allUsers,
    setAllUsers,
  ] = useState<User[]>([]);

  const [
    groupMembers,
    setGroupMembers,
  ] = useState<GroupMember[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // Group 新增 / 編輯
  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    editingGroup,
    setEditingGroup,
  ] = useState<Group | null>(
    null
  );

  const [
    groupNameInput,
    setGroupNameInput,
  ] = useState('');

  const [
    describeInput,
    setDescribeInput,
  ] = useState('');


  // GroupMember
  const [
    isMemberModalOpen,
    setIsMemberModalOpen,
  ] = useState(false);

  const [
    activeGroup,
    setActiveGroup,
  ] = useState<Group | null>(
    null
  );

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState('');


  // =====================================================
  // API：以下邏輯維持原本
  // =====================================================

  const fetchGroups = async () => {

    setLoading(true);

    try {

      const res =
        await api.get(
          '/groups'
        );

      setGroups(
        res.data.data ||
        res.data ||
        []
      );

    } catch (err: any) {

      console.error(
        '取得群組列表失敗',
        err
      );

    } finally {

      setLoading(false);

    }

  };


  const fetchUsers = async () => {

    try {

      const res =
        await api.get(
          '/users'
        );

      setAllUsers(
        res.data.data ||
        res.data ||
        []
      );

    } catch (err) {

      console.error(
        '取得使用者失敗',
        err
      );

    }

  };


  const fetchGroupMembers =
    async () => {

      try {

        const res =
          await api.get(
            '/group-members'
          );

        setGroupMembers(
          res.data.data ||
          res.data ||
          []
        );

      } catch (err) {

        console.error(
          '取得群組成員失敗',
          err
        );

      }

    };


  useEffect(() => {

    fetchGroups();

    fetchUsers();

    fetchGroupMembers();

  }, []);


  // =====================================================
  // Group CRUD
  // =====================================================

  const handleOpenCreate =
    () => {

      setEditingGroup(null);

      setGroupNameInput('');

      setDescribeInput('');

      setIsModalOpen(true);

    };


  const handleOpenEdit = (
    group: Group
  ) => {

    setEditingGroup(
      group
    );

    setGroupNameInput(
      group.groupName ||
      group.group_name ||
      group.name ||
      ''
    );

    setDescribeInput(
      group.describe ||
      group.description ||
      ''
    );

    setIsModalOpen(true);

  };


  const handleSaveGroup =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();


      const payload = {

        groupName:
          groupNameInput.trim(),

        describe:
          describeInput.trim(),

      };


      try {

        if (editingGroup) {

          const targetId =
            editingGroup.gid ??
            editingGroup.groupId ??
            editingGroup.id;


          if (!targetId) {

            alert(
              '無法取得群組 ID'
            );

            return;

          }


          await api.patch(
            `/groups/${targetId}`,
            payload
          );

        } else {

          await api.post(
            '/groups',
            payload
          );

        }


        setIsModalOpen(
          false
        );

        await fetchGroups();

      } catch (err: any) {

        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '操作失敗'
        );

      }

    };


  const handleDeleteGroup =
    async (
      group: Group
    ) => {

      const targetId =
        group.gid ??
        group.groupId ??
        group.id;


      const name =
        group.groupName ||
        group.group_name ||
        group.name ||
        '';


      if (!targetId) {

        alert(
          '無法取得群組 ID'
        );

        return;

      }


      if (
        !confirm(
          `確定要刪除群組 ${name} 嗎？`
        )
      ) {

        return;

      }


      try {

        await api.delete(
          `/groups/${targetId}`
        );

        await fetchGroups();

      } catch (err: any) {

        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '刪除失敗'
        );

      }

    };


  // =====================================================
  // GroupMember
  // =====================================================

  const handleOpenMembers = (
    group: Group
  ) => {

    setActiveGroup(
      group
    );

    setSelectedUserId('');

    setIsMemberModalOpen(
      true
    );

  };


  const handleAddUserToGroup =
    async () => {

      if (
        !selectedUserId ||
        !activeGroup
      ) {

        return;

      }


      const targetGid =
        activeGroup.gid ??
        activeGroup.groupId ??
        activeGroup.id;


      if (!targetGid) {

        alert(
          '無法取得群組 ID'
        );

        return;

      }


      try {

        await api.post(
          '/group-members',
          {

            gid: Number(
              targetGid
            ),

            uid: Number(
              selectedUserId
            ),

          }
        );


        await fetchGroupMembers();


        setSelectedUserId('');


        alert(
          '已將使用者加入群組'
        );

      } catch (err: any) {

        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '加入成員失敗'
        );

      }

    };


  const handleRemoveMember =
    async (
      member: GroupMember
    ) => {

      const user =
        allUsers.find(
          (u) =>
            Number(
              u.uid ??
              u.userId ??
              u.id
            ) ===
            member.uid
        );


      if (
        !confirm(
          `確定要將 ${
            user?.username ||
            `UID ${member.uid}`
          } 移出群組嗎？`
        )
      ) {

        return;

      }


      try {

        await api.delete(
          `/group-members/${member.id}`
        );

        await fetchGroupMembers();

      } catch (err: any) {

        alert(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          '移除成員失敗'
        );

      }

    };


  // =====================================================
  // 純 UI 顯示用衍生資料
  // 不會發 API，也不改資料邏輯
  // =====================================================

  const activeGroupId =
    activeGroup
      ? activeGroup.gid ??
        activeGroup.groupId ??
        activeGroup.id
      : null;


  const activeMembers =
    activeGroupId
      ? groupMembers.filter(
          (member) =>
            member.gid ===
            Number(
              activeGroupId
            )
        )
      : [];


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
          群組管理 (Group)
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          管理群組與群組成員
        </p>
      </div>


      {/* Count */}
      <div className="flex h-[56px] w-[120px] items-center border-l border-gray-200 pl-7">

        <div>
          <div className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
            {groups.length}
          </div>

          <div className="mt-2 whitespace-nowrap text-[10px] font-medium tracking-[0.08em] text-gray-400">
            目前群組
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
          群組列表
        </div>


        <div className="flex items-center gap-2">

          {/* Refresh */}
          <button
            onClick={() => {
              fetchGroups();
              fetchGroupMembers();
            }}
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


          {/* Create */}
          <HasAccess
            resource="Group"
            action="create"
          >

            <button
              onClick={
                handleOpenCreate
              }
              className="flex h-9 w-[128px] items-center justify-center gap-2 rounded-lg bg-[#5b5ce2] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.20)] transition hover:bg-[#5051d8]"
            >

              <Plus className="h-4 w-4" />

              新增群組

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
              <col className="w-[190px]" />
              <col className="w-[170px]" />
            </colgroup>

            <thead>

              <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-500">

                <th className="w-[80px] px-4 py-3">
                  #
                </th>

                <th className="px-4 py-3">
                  群組
                </th>

                <th className="px-4 py-3">
                  描述
                </th>

                <th className="w-[190px] px-4 py-3">
                  成員
                </th>

                <th className="w-[190px] px-4 py-3 text-right">
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

              ) : groups.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-gray-400"
                  >
                    無群組資料
                  </td>

                </tr>

              ) : (

                groups.map(
                  (
                    group,
                    idx
                  ) => {

                    const gid =
                      group.gid ??
                      group.groupId ??
                      group.id ??
                      idx + 1;


                    const name =
                      group.groupName ||
                      group.group_name ||
                      group.name ||
                      '-';


                    const description =
                      group.describe ||
                      group.description ||
                      '-';


                    const members =
                      groupMembers.filter(
                        (member) =>
                          member.gid ===
                          Number(
                            gid
                          )
                      );


                    const memberUsers =
                      members
                        .map(
                          (
                            member
                          ) =>
                            allUsers.find(
                              (u) =>
                                Number(
                                  u.uid ??
                                  u.userId ??
                                  u.id
                                ) ===
                                member.uid
                            )
                        )
                        .filter(
                          Boolean
                        ) as User[];


                    return (

                      <tr
                        key={gid}
                        className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-indigo-50/25"
                      >

                        {/* Number */}
                        <td className="px-4 py-3.5 text-sm text-gray-400">

                          {String(
                            idx + 1
                          ).padStart(
                            2,
                            '0'
                          )}

                        </td>


                        {/* Group */}
                        <td className="px-4 py-3.5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-sm font-semibold uppercase text-indigo-600 ring-1 ring-indigo-100">

                              {name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>


                            <div>

                              <div className="font-semibold text-gray-800">
                                {name}
                              </div>

                              <div className="mt-0.5 text-[10px] text-gray-400">
                                GID {gid}
                              </div>

                            </div>

                          </div>

                        </td>


                        {/* Description */}
                        <td className="px-4 py-3.5 text-sm text-gray-600">

                          {description}

                        </td>


                        {/* Members */}
                        <td className="px-4 py-3.5">

                          <div className="flex items-center gap-3">

                            {members.length ===
                            0 ? (

                              <span className="text-xs text-gray-400">
                                尚無成員
                              </span>

                            ) : (

                              <>

                                <div className="flex -space-x-2">

                                  {memberUsers
                                    .slice(
                                      0,
                                      4
                                    )
                                    .map(
                                      (
                                        memberUser,
                                        memberIndex
                                      ) => {

                                        const uid =
                                          memberUser.uid ??
                                          memberUser.userId ??
                                          memberUser.id ??
                                          memberIndex;


                                        return (

                                          <div
                                            key={
                                              uid
                                            }
                                            title={
                                              memberUser.username
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-50 text-[10px] font-semibold uppercase text-indigo-600 ring-1 ring-indigo-100/60"
                                          >

                                            {memberUser.username
                                              .charAt(
                                                0
                                              )
                                              .toUpperCase()}

                                          </div>

                                        );

                                      }
                                    )}


                                  {members.length >
                                    4 && (

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-semibold text-gray-500">

                                      +
                                      {members.length -
                                        4}

                                    </div>

                                  )}

                                </div>


                                <span className="text-xs text-gray-400">
                                  {members.length}
                                </span>

                              </>

                            )}

                          </div>

                        </td>


                        {/* Actions */}
                        <td className="px-4 py-3.5">

                          <div className="flex items-center justify-end gap-1">

                            {/* Members */}
                            <button
                              onClick={() =>
                                handleOpenMembers(
                                  group
                                )
                              }
                              title="成員管理"
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/60 px-2.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                            >

                              <UsersRound className="h-3.5 w-3.5" />

                              成員

                            </button>


                            {/* Edit */}
                            <HasAccess
                              resource="Group"
                              action="update"
                            >

                              <button
                                onClick={() =>
                                  handleOpenEdit(
                                    group
                                  )
                                }
                                title="編輯群組"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                              >

                                <Pencil className="h-4 w-4" />

                              </button>

                            </HasAccess>


                            {/* Delete */}
                            <HasAccess
                              resource="Group"
                              action="delete"
                            >

                              <button
                                onClick={() =>
                                  handleDeleteGroup(
                                    group
                                  )
                                }
                                title="刪除群組"
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



      {/* =================================================
    CREATE / EDIT GROUP MODAL
================================================== */}

{isModalOpen && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-sm">

    <div className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-white bg-white p-7 shadow-[0_35px_100px_rgba(49,46,129,0.16)]">


      {/* Header */}
      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-bold tracking-[-0.025em] text-gray-900">
            {editingGroup
              ? '編輯群組'
              : '新增群組'}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            {editingGroup
              ? '修改群組名稱與描述資訊'
              : '建立新的系統群組'}
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
        onSubmit={handleSaveGroup}
        className="mt-6 space-y-5"
      >


        {/* Group Name */}
        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            群組名稱
          </label>

          <input
            type="text"
            required
            value={groupNameInput}
            onChange={(e) =>
              setGroupNameInput(
                e.target.value
              )
            }
            placeholder="輸入群組名稱"
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
            value={describeInput}
            onChange={(e) =>
              setDescribeInput(
                e.target.value
              )
            }
            placeholder="輸入群組描述"
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


          {editingGroup ? (

            <HasAccess
              resource="Group"
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
              resource="Group"
              action="create"
            >

              <button
                type="submit"
                className="h-10 rounded-xl bg-[#5b5ce2] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.18)] transition hover:bg-[#5051d8]"
              >
                新增群組
              </button>

            </HasAccess>

          )}

        </div>

      </form>

    </div>

  </div>

)}



      {/* =================================================
          MEMBER MANAGEMENT MODAL
      ================================================== */}

      {/* =================================================
    MEMBER MANAGEMENT MODAL
================================================== */}

{isMemberModalOpen &&
  activeGroup && (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-sm">

      <div className="flex max-h-[82vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_35px_100px_rgba(49,46,129,0.16)]">


        {/* ==============================
            HEADER
        ============================== */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-7 py-6">

          <div>

            <div className="flex items-center gap-3">

              <div>

                <h2 className="text-xl font-bold tracking-[-0.025em] text-gray-900">
                  成員管理
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  管理群組中的使用者
                </p>

              </div>

            </div>


            <div className="mt-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold uppercase text-indigo-600 ring-1 ring-indigo-100">

                {(
                  activeGroup.groupName ||
                  activeGroup.group_name ||
                  activeGroup.name ||
                  'G'
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <div className="text-sm font-semibold text-gray-800">

                  {activeGroup.groupName ||
                    activeGroup.group_name ||
                    activeGroup.name}

                </div>

                <div className="mt-0.5 text-xs text-gray-400">
                  {activeMembers.length} 位成員
                </div>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              setIsMemberModalOpen(
                false
              )
            }
            title="關閉"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >

            <X className="h-4 w-4" />

          </button>

        </div>



        {/* ==============================
            ADD MEMBER
        ============================== */}

        <HasAccess
          resource="GroupMember"
          action="create"
        >

          <div className="shrink-0 border-b border-gray-100 bg-gray-50/60 px-7 py-5">

            <div className="mb-3">

              <div className="text-sm font-semibold text-gray-700">
                新增成員
              </div>

              <div className="mt-1 text-xs text-gray-400">
                選擇使用者加入此群組
              </div>

            </div>


            <div className="flex gap-3">

              <select
                value={
                  selectedUserId
                }
                onChange={(e) =>
                  setSelectedUserId(
                    e.target.value
                  )
                }
                className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >

                <option value="">
                  選擇使用者
                </option>


                {allUsers.map(
                  (
                    u,
                    idx
                  ) => {

                    const uid =
                      u.uid ??
                      u.userId ??
                      u.id ??
                      idx;


                    return (

                      <option
                        key={
                          uid
                        }
                        value={
                          uid
                        }
                      >

                        {u.username}
                        {' '}
                        (UID: {uid})

                      </option>

                    );

                  }
                )}

              </select>


              <button
                type="button"
                onClick={
                  handleAddUserToGroup
                }
                disabled={
                  !selectedUserId
                }
                className="flex h-11 w-[108px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5b5ce2] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,92,226,0.18)] transition hover:bg-[#5051d8] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
              >

                <Plus className="h-4 w-4" />

                加入

              </button>

            </div>

          </div>

        </HasAccess>



        {/* ==============================
            MEMBER LIST
        ============================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">


          {/* List Header */}
          <div className="mb-3 flex items-center justify-between">

            <div className="text-sm font-semibold text-gray-700">
              目前成員
            </div>

            <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-indigo-50 px-2 text-xs font-semibold text-indigo-600">
              {activeMembers.length}
            </div>

          </div>



          {/* Empty */}
          {activeMembers.length ===
          0 ? (

            <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-300 shadow-sm">

                <UsersRound className="h-5 w-5" />

              </div>

              <div className="mt-4 text-sm font-medium text-gray-500">
                此群組目前沒有成員
              </div>

              <div className="mt-1 text-xs text-gray-400">
                可從上方選擇使用者加入群組
              </div>

            </div>

          ) : (

            <div className="overflow-hidden rounded-xl border border-gray-200">

              {activeMembers.map(
                (
                  member
                ) => {

                  const memberUser =
                    allUsers.find(
                      (u) =>
                        Number(
                          u.uid ??
                          u.userId ??
                          u.id
                        ) ===
                        member.uid
                    );


                  const displayName =
                    memberUser?.username ||
                    `UID ${member.uid}`;


                  return (

                    <div
                      key={
                        member.id
                      }
                      className="flex min-h-[64px] items-center justify-between border-b border-gray-200 px-4 py-3 transition last:border-b-0 hover:bg-indigo-50/25"
                    >


                      {/* User */}
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 text-xs font-semibold uppercase text-indigo-600 ring-1 ring-indigo-100">

                          {displayName
                            .charAt(0)
                            .toUpperCase()}

                        </div>


                        <div className="min-w-0">

                          <div className="truncate text-sm font-semibold text-gray-800">
                            {displayName}
                          </div>

                          <div className="mt-0.5 text-[11px] text-gray-400">
                            UID {member.uid}
                          </div>

                        </div>

                      </div>



                      {/* Remove */}
                      <HasAccess
                        resource="GroupMember"
                        action="delete"
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(
                              member
                            )
                          }
                          title="移除成員"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        >

                          <UserMinus className="h-4 w-4" />

                        </button>

                      </HasAccess>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </div>



        {/* ==============================
            FOOTER
        ============================== */}

        <div className="flex shrink-0 justify-end border-t border-gray-100 bg-gray-50/40 px-7 py-4">

          <button
            type="button"
            onClick={() =>
              setIsMemberModalOpen(
                false
              )
            }
            className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            完成
          </button>

        </div>

      </div>

    </div>

)}

    </div>
  );
}