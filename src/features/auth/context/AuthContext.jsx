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

  // Proactive session verification on window focus, storage sync, and periodic heartbeat
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'salon_jwt_token' && !e.newValue) {
        setUser(null);
        setAccessToken(null);
      }
      if (e.key === 'sms_permissions_last_updated') {
        refreshUser();
      }
    };

    const verifyActiveSession = async () => {
      const token = localStorage.getItem('salon_jwt_token');
      if (token) {
        try {
          const profile = await fetchMe(token);
          if (profile?.status && profile.status !== 'active') {
            logout();
            const msg =
              profile.status === 'deactivated'
                ? 'Your account has been deactivated. Please contact your administrator.'
                : 'Your account has been suspended. Please contact your administrator.';
            sessionStorage.setItem('auth_error_message', msg);
            window.location.href = '/login';
            return;
          }
          if (profile) {
            setUser(profile);
          }
        } catch (err) {
          // Handled by apiClient 401 interceptor
        }
      }
    };

    const handlePermissionsUpdated = () => {
      refreshUser();
    };

    // 1. Same-tab real-time event listener
    window.addEventListener('sms:permissions-updated', handlePermissionsUpdated);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', verifyActiveSession);
    const interval = setInterval(verifyActiveSession, 30000);

    // 2. Cross-tab BroadcastChannel listener
    let channel;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('sms_permissions_sync');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'PERMISSIONS_UPDATED') {
            refreshUser();
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    return () => {
      window.removeEventListener('sms:permissions-updated', handlePermissionsUpdated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', verifyActiveSession);
      clearInterval(interval);
      if (channel) {
        channel.close();
      }
    };
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

  const refreshUser = async () => {
    const token = localStorage.getItem('salon_jwt_token');
    if (token) {
      try {
        const profile = await fetchMe(token);
        if (profile) {
          setUser(profile);
          return profile;
        }
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    }
    return null;
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
    refreshUser,
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
