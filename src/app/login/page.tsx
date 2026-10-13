'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Sparkles,
  Users,
  Shield,
  KeyRound,
  UserRoundCheck,
  LayoutGrid,
  Activity,
  CheckCircle2,
  FileText,
  Database,
  BellRing,
  Loader2,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();


  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // 原本登入邏輯，不更動
      const res = await api.post(
        '/auth/login',
        {
          username,
          pwd,
        }
      );

      const {
        token,
        user,
      } = res.data;

      login(
        token,
        user
      );

      router.push('/');

    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          '登入失敗，請檢查帳號密碼'
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f6fc] text-zinc-900">

      {/* =====================================================
          BACKGROUND LIGHT
      ====================================================== */}

      <div className="pointer-events-none absolute -left-64 -top-64 h-[820px] w-[820px] rounded-full bg-violet-300/35 blur-[170px]" />

      <div className="pointer-events-none absolute -bottom-64 -right-52 h-[850px] w-[850px] rounded-full bg-blue-300/30 blur-[175px]" />

      <div className="pointer-events-none absolute left-[38%] top-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-[150px]" />


      {/* =====================================================
          BACKGROUND PRODUCT WALL
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >

        {/* 01 USERS */}
        <div className="absolute left-[4%] top-[11%] w-[320px] rotate-[-5deg] rounded-[30px] border border-white/80 bg-white/72 p-7 shadow-[0_28px_80px_rgba(79,70,229,0.10)] backdrop-blur-md">

          <div className="flex items-center justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>

            <span className="text-[9px] font-semibold tracking-[0.17em] text-zinc-300">
              USERS
            </span>

          </div>


          <div className="mt-7">

            <div className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400">
              USER DIRECTORY
            </div>

            <div className="mt-4 flex -space-x-2">

              {['A', 'Y', 'D', 'M'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[11px] font-semibold text-zinc-600"
                  >
                    {item}
                  </div>
                )
              )}

              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-50 text-[10px] font-semibold text-indigo-500">
                +4
              </div>

            </div>

          </div>

        </div>


        {/* 02 PERMISSION */}
        <div className="absolute right-[4%] top-[9%] w-[355px] rotate-[4deg] rounded-[30px] border border-white/80 bg-white/72 p-7 shadow-[0_28px_80px_rgba(79,70,229,0.10)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <KeyRound className="h-5 w-5" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.16em] text-zinc-400">
                PERMISSION
              </div>

              <div className="mt-1 text-sm font-semibold text-zinc-800">
                User / Create
              </div>

            </div>

          </div>


          <div className="mt-6 h-px bg-zinc-100" />


          <div className="mt-5 flex items-center justify-between text-xs">

            <span className="text-zinc-400">
              Resource
            </span>

            <span className="font-medium text-zinc-700">
              User
            </span>

          </div>


          <div className="mt-3 flex items-center justify-between text-xs">

            <span className="text-zinc-400">
              Action
            </span>

            <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-600">
              CREATE
            </span>

          </div>

        </div>


        {/* 03 ACCESS MATRIX */}
        <div className="absolute left-[18%] top-[38%] w-[230px] rotate-[6deg] rounded-[25px] border border-white/75 bg-white/58 p-5 shadow-[0_22px_65px_rgba(79,70,229,0.07)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <LayoutGrid className="h-4 w-4" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400">
                ACCESS MATRIX
              </div>

              <div className="mt-1 text-xs font-medium text-zinc-700">
                Role Mapping
              </div>

            </div>

          </div>


          <div className="mt-5 grid grid-cols-4 gap-2">

            {Array.from({
              length: 8,
            }).map((_, i) => (

              <div
                key={i}
                className={`h-6 rounded-lg ${
                  i % 3 === 0
                    ? 'bg-indigo-100'
                    : i % 3 === 1
                      ? 'bg-violet-100'
                      : 'bg-zinc-100'
                }`}
              />

            ))}

          </div>

        </div>


        {/* 04 ACTIVITY */}
        <div className="absolute right-[19%] top-[39%] w-[240px] rotate-[-6deg] rounded-[25px] border border-white/75 bg-white/58 p-5 shadow-[0_22px_65px_rgba(79,70,229,0.07)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-400">
              <Activity className="h-4 w-4" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400">
                ACTIVITY
              </div>

              <div className="mt-1 text-xs font-medium text-zinc-700">
                Recent Actions
              </div>

            </div>

          </div>


          <div className="mt-5 space-y-2.5">

            <div className="h-7 rounded-lg bg-zinc-100/90" />

            <div className="h-7 w-[82%] rounded-lg bg-zinc-100/70" />

          </div>

        </div>


        {/* 05 GROUP */}
        <div className="absolute bottom-[8%] left-[6%] w-[340px] rotate-[3deg] rounded-[30px] border border-white/75 bg-white/68 p-7 shadow-[0_28px_80px_rgba(79,70,229,0.09)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRoundCheck className="h-5 w-5" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.16em] text-zinc-400">
                GROUP
              </div>

              <div className="mt-1 text-sm font-semibold text-zinc-800">
                Developers
              </div>

            </div>

          </div>


          <div className="mt-6 flex -space-x-2">

            {['A', 'Y', 'D', '+4'].map(
              (item) => (

                <div
                  key={item}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[10px] font-semibold text-zinc-600"
                >
                  {item}
                </div>

              )
            )}

          </div>

        </div>


        {/* 06 ROLE */}
        <div className="absolute bottom-[9%] right-[6%] w-[320px] rotate-[-4deg] rounded-[30px] border border-white/75 bg-white/68 p-7 shadow-[0_28px_80px_rgba(79,70,229,0.09)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="h-5 w-5" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.16em] text-zinc-400">
                ROLE
              </div>

              <div className="mt-1 text-sm font-semibold text-zinc-800">
                Administrator
              </div>

            </div>

          </div>


          <div className="mt-6 flex gap-2">

            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-medium text-violet-600">
              UPDATE
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-medium text-blue-600">
              CREATE
            </span>

          </div>

        </div>


        {/* 07 SYSTEM STATUS */}
        <div className="absolute bottom-[5%] left-[30%] w-[220px] rotate-[-3deg] rounded-[23px] border border-white/70 bg-white/54 p-5 shadow-[0_20px_60px_rgba(79,70,229,0.06)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400">
                STATUS
              </div>

              <div className="mt-1 text-xs font-medium text-zinc-700">
                Operational
              </div>

            </div>

          </div>


          <div className="mt-4 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[10px] text-zinc-400">
              All systems running
            </span>

          </div>

        </div>


        {/* 08 IDENTITY LOG */}
        <div className="absolute bottom-[6%] right-[29%] w-[230px] rotate-[3deg] rounded-[23px] border border-white/70 bg-white/54 p-5 shadow-[0_20px_60px_rgba(79,70,229,0.06)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400">
                RECORD
              </div>

              <div className="mt-1 text-xs font-medium text-zinc-700">
                Identity Log
              </div>

            </div>

          </div>


          <div className="mt-4 space-y-2">

            <div className="h-1.5 rounded-full bg-zinc-100" />

            <div className="h-1.5 w-[83%] rounded-full bg-zinc-100" />

            <div className="h-1.5 w-[64%] rounded-full bg-zinc-100" />

          </div>

        </div>


        {/* 09 IDENTITY STORE */}
        <div className="absolute left-[33%] top-[6%] w-[215px] rotate-[5deg] rounded-[23px] border border-white/70 bg-white/54 p-5 shadow-[0_20px_60px_rgba(79,70,229,0.06)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Database className="h-4 w-4" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400">
                STORAGE
              </div>

              <div className="mt-1 text-xs font-medium text-zinc-700">
                Identity Store
              </div>

            </div>

          </div>


          <div className="mt-4 space-y-2">

            <div className="h-1.5 rounded-full bg-sky-100" />

            <div className="h-1.5 w-[76%] rounded-full bg-indigo-100" />

          </div>

        </div>


        {/* 10 POLICY */}
        <div className="absolute right-[32%] top-[7%] w-[220px] rotate-[-5deg] rounded-[23px] border border-white/70 bg-white/54 p-5 shadow-[0_20px_60px_rgba(79,70,229,0.06)] backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-500">
              <BellRing className="h-4 w-4" />
            </div>

            <div>

              <div className="text-[9px] font-semibold tracking-[0.14em] text-zinc-400">
                POLICY
              </div>

              <div className="mt-1 text-xs font-medium text-zinc-700">
                Access Updated
              </div>

            </div>

          </div>


          <div className="mt-4 flex gap-2">

            <span className="h-2 flex-1 rounded-full bg-violet-100" />

            <span className="h-2 w-8 rounded-full bg-indigo-100" />

          </div>

        </div>

      </div>


      {/* =====================================================
          DEPTH / SPOTLIGHT
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 bg-white/12 backdrop-blur-[0.7px]" />

      {/* 中央聚焦範圍刻意縮小，不把背景全部洗白 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.50)_16%,rgba(255,255,255,0.18)_31%,rgba(246,246,252,0.03)_48%,rgba(246,246,252,0)_64%)]" />

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_190px_rgba(99,102,241,0.09)]" />


      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="absolute left-8 top-8 z-30 flex items-center gap-3 md:left-12 md:top-10">

        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 shadow-[0_8px_24px_rgba(99,102,241,0.30)]">

          <Sparkles className="h-[18px] w-[18px] text-white" />

          <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/30 blur-md" />

        </div>


        <div>

          <div className="text-sm font-bold tracking-tight text-zinc-900">
            Aether Access
          </div>

          <div className="mt-0.5 text-[9px] font-medium tracking-[0.17em] text-zinc-400">
            IAM CONSOLE
          </div>

        </div>

      </div>


      {/* =====================================================
          CENTER LOGIN
      ====================================================== */}

      <div className="relative z-20 flex min-h-screen items-center justify-center px-6 py-20">

        {/* Login Card */}
        <div className="relative w-full max-w-[500px] overflow-hidden rounded-[36px] border border-white bg-white/[0.97] p-10 shadow-[0_50px_150px_rgba(67,56,202,0.22),0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-indigo-100/80 backdrop-blur-2xl sm:p-12">

          {/* 卡片頂部柔光 */}
          <div className="pointer-events-none absolute inset-x-12 -top-10 h-28 rounded-full bg-indigo-300/20 blur-[48px]" />


          {/* HEADER */}
          <div className="relative">

            <div className="text-[10px] font-semibold tracking-[0.18em] text-indigo-500">
              SECURE ACCESS
            </div>


            <h1 className="mt-3 text-[38px] font-bold tracking-[-0.045em] text-zinc-900">
              歡迎回來
            </h1>


            <p className="mt-2 text-sm leading-6 text-zinc-400">
              登入您的帳號以繼續
            </p>

          </div>


          {/* ERROR */}
          {error && (

            <div className="relative mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>

          )}


          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="relative mt-8 space-y-5"
          >

            {/* USERNAME */}
            <div>

              <label className="mb-2 block text-[12px] font-semibold text-zinc-700">
                帳號
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
                placeholder="輸入帳號"
                className="h-[54px] w-full rounded-xl border border-zinc-200 bg-[#fafafd] px-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-300 hover:border-zinc-300 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

            </div>


            {/* PASSWORD */}
            <div>

              <label className="mb-2 block text-[12px] font-semibold text-zinc-700">
                密碼
              </label>


              <input
                type="password"
                required
                value={pwd}
                onChange={(e) =>
                  setPwd(
                    e.target.value
                  )
                }
                placeholder="輸入密碼"
                className="h-[54px] w-full rounded-xl border border-zinc-200 bg-[#fafafd] px-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-300 hover:border-zinc-300 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

            </div>


            {/* FOOTER */}
            <div className="flex items-center justify-between gap-4 pt-2">

              {/* Security */}
              <div className="flex items-center gap-2">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

                </span>


                <span className="hidden text-[9px] font-medium tracking-[0.10em] text-zinc-400 sm:block">
                  SECURE AUTHENTICATION
                </span>

              </div>


              {/* Login Button - RIGHT ALIGNED */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-[44px] min-w-[148px] items-center justify-between rounded-full bg-gradient-to-r from-[#5959dc] to-[#6670ee] py-1.5 pl-5 pr-1.5 text-[13px] font-semibold text-white shadow-[0_10px_26px_rgba(91,92,226,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_15px_34px_rgba(91,92,226,0.32)] disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span>
                  {loading
                    ? '登入中...'
                    : '登入'}
                </span>


                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/10 transition-all duration-200 group-hover:bg-white/25">

                  {loading ? (

                    <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  ) : (

                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />

                  )}

                </span>

              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}