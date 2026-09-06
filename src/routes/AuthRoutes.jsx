import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';

export const AuthRoutes = [
  <Route key="root-redirect" path="/" element={<Navigate to="/login" replace />} />,
  <Route key="auth-login" path="/login" element={<LoginPage />} />,
  <Route key="auth-register" path="/register" element={<RegisterPage />} />,
];
