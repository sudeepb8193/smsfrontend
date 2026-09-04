import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/auth.api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('salon_jwt_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch (err) {
          // Token expired or invalid
          authApi.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ identifier, password });
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid email/phone or password.');
      throw err;
    }
  };

  const seedDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.seedDemo();
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to seed demo admin.');
      throw err;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'SUPER_ADMIN',
        isAuthenticated: !!user,
        loading,
        error,
        login,
        seedDemo,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
