'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '@/lib/axios';

interface Operation {
  resource: string;
  action: string;
}

interface User {
  uid: number;
  username: string;
  describe?: string;
  operations: Operation[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;

  login: (
    token: string,
    user: User
  ) => void;

  logout: () => Promise<void>;

  loading: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  /**
   * 頁面重新整理時：
   *
   * 1. 從 localStorage 取得 JWT
   * 2. 呼叫 C 的 /auth/me 驗證 JWT
   * 3. Token 有效 → 恢復登入狀態
   * 4. Token 無效 → 清除登入資料
   */
  useEffect(() => {
    const storedToken =
      localStorage.getItem('token');

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((error) => {
        console.error(
          '登入狀態驗證失敗：',
          error
        );

        localStorage.removeItem(
          'token'
        );

        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * 登入成功
   *
   * Login API 回傳 JWT 與 User 後，
   * 將 JWT 儲存在 localStorage。
   */
  const login = (
    newToken: string,
    userData: User
  ) => {
    localStorage.setItem(
      'token',
      newToken
    );

    setToken(newToken);
    setUser(userData);
  };

  /**
   * 登出流程
   *
   * A
   * ↓
   * POST C /auth/logout
   * ↓
   * C 驗證 JWT
   * ↓
   * A 清除 localStorage token
   * ↓
   * 清除 React 登入狀態
   *
   * 就算 C 暫時無法連線，
   * A 仍然一定會清除本機 Token，
   * 避免使用者卡在登入狀態。
   */
  const logout = async () => {
    try {
      await api.post(
        '/auth/logout'
      );
    } catch (error) {
      console.warn(
        '呼叫後端 logout 失敗，仍會清除本機登入狀態：',
        error
      );
    } finally {
      localStorage.removeItem(
        'token'
      );

      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}