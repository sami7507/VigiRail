/**
 * VigiRail — authentication context.
 * Session = { token, user } persisted in localStorage; validated against
 * /api/auth/me on boot so expired tokens never leave a ghost session.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY, USER_KEY, errMsg, fetchMe, loginUser } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [booting, setBooting] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate any persisted token once on mount.
  useEffect(() => {
    let cancelled = false;
    if (!localStorage.getItem(TOKEN_KEY)) return undefined;
    fetchMe()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        // 401 → interceptor already cleared storage; network errors keep the
        // optimistic session (SensorContext will surface connectivity).
        if (!cancelled && !localStorage.getItem(TOKEN_KEY)) setUser(null);
      })
      .finally(() => !cancelled && setBooting(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(username.trim().toLowerCase(), password);
      const profile = {
        username: data.username,
        role: data.role,
        full_name: data.full_name,
      };
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return true;
    } catch (err) {
      setError(
        err.response?.status === 429
          ? 'Too many attempts — please wait a minute and try again.'
          : err.response?.status === 401
            ? 'Incorrect username or password.'
            : errMsg(err, 'Cannot reach the API. Check your connection.')
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setError('');
  }, []);

  const value = useMemo(
    () => ({ user, booting, loading, error, login, logout, setError }),
    [user, booting, loading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
