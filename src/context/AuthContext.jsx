import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const u = await apiLogin({ username, password });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await apiRegister(data);
    setUser(u);
    return u;
  }, []);

  const setSessionUser = useCallback((u) => setUser(u), []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, checkingSession, login, register, logout, setSessionUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
