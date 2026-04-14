/**
 * RailGuard AI — Auth Context
 * Provides user state, login, and logout to the entire app.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginUser } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // { username, role, full_name }
  const [token, setToken]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(username, password);
      localStorage.setItem('rg_token', data.access_token);
      setToken(data.access_token);
      setUser({ username: data.username, role: data.role, full_name: data.full_name });
      return true;
    } catch (e) {
      setError(
        e.response?.status === 401
          ? 'Invalid username or password.'
          : 'Cannot reach backend. Is the server running on port 8000?'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rg_token');
    setUser(null);
    setToken(null);
    setError('');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, error, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
