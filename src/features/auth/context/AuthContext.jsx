import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, refreshTokens, fetchMe } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-derive access token on app startup if a refresh token exists in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedRefreshToken = localStorage.getItem('salon_refresh_token');
      if (!storedRefreshToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await refreshTokens(storedRefreshToken);
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          localStorage.setItem('salon_jwt_token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('salon_refresh_token', data.refreshToken);
          }
          if (data.user) {
            setUser(data.user);
          } else {
            const profile = await fetchMe(data.accessToken);
            setUser(profile);
          }
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('salon_refresh_token');
        localStorage.removeItem('salon_jwt_token');
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    const data = await apiLogin({ email, password });
    if (data?.refreshToken) {
      localStorage.setItem('salon_refresh_token', data.refreshToken);
    }
    if (data?.accessToken) {
      localStorage.setItem('salon_jwt_token', data.accessToken);
    }
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const registerUser = async (payload) => {
    const data = await apiRegister(payload);
    if (data?.refreshToken) {
      localStorage.setItem('salon_refresh_token', data.refreshToken);
    }
    if (data?.accessToken) {
      localStorage.setItem('salon_jwt_token', data.accessToken);
    }
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('salon_refresh_token');
    localStorage.removeItem('salon_jwt_token');
    setAccessToken(null);
    setUser(null);
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!accessToken && !!user,
    loginUser,
    registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
