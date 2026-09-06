import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { validateLoginForm } from '../validation/authValidation';
import { toast } from 'sonner';
import {
  Flame,
  Eye,
  EyeOff,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const getDashboardRouteForRole = (role) => {
  switch (role) {
    case 'CUSTOMER':
      return '/appointments';
    case 'SERVICE_STAFF':
    case 'STAFF':
      return '/staff/directory';
    case 'FRONT_DESK':
      return '/dashboard';
    case 'BRANCH_MANAGER':
    case 'MANAGER':
      return '/dashboard';
    case 'BRANCH_ADMIN':
    case 'SUPER_ADMIN':
      return '/organization/profile';
    default:
      return '/dashboard';
  }
};

export const LoginPage = () => {
  const { login, seedDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if redirected from Registration with success state
  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetRoute = getDashboardRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    setFieldErrors({});

    // 1. Client-Side Field Validation
    const { errors, isValid } = validateLoginForm({ identifier, password });
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    // 2. Call Login API
    try {
      setLoading(true);
      if (rememberMe) {
        localStorage.setItem('salon_remember_me', 'true');
      } else {
        localStorage.removeItem('salon_remember_me');
      }

      const res = await login(identifier.trim(), password);
      setLoading(false);

      toast.success(`Welcome back, ${res?.user?.displayName || 'User'}!`);

      // 3. Read authenticated user role and redirect
      const userRole = res?.user?.role || user?.role || 'SUPER_ADMIN';
      const destination = getDashboardRouteForRole(userRole);
      navigate(destination, { replace: true });
    } catch (err) {
      setLoading(false);
      const msg = err.message || 'Invalid email/phone or password. Please try again.';
      setApiError(msg);
      toast.error(msg);
    }
  };

  const handleQuickDemo = async () => {
    setApiError('');
    try {
      setLoading(true);
      const res = await seedDemo();
      setLoading(false);
      toast.success('Super Admin demo session launched successfully!');
      const userRole = res?.user?.role || 'SUPER_ADMIN';
      navigate(getDashboardRouteForRole(userRole), { replace: true });
    } catch (err) {
      setLoading(false);
      const msg = err.message || 'Failed to authenticate demo admin.';
      setApiError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 dark:bg-[#0E0F14] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#161722] rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] border border-slate-200/50 dark:border-white/10">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL HERO (Brand & Visual Curves using Tailwind CSS)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden min-h-[360px] lg:min-h-full">
          
          {/* Organic Background Curved Shapes using Pure Tailwind Classes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary-600/40 border-[35px] border-primary-500/30 -rotate-12" />
            <div className="absolute -right-20 top-1/4 w-[420px] h-[420px] bg-primary-600/60 rounded-[40%_60%_70%_30%/40%_50%_60%_50%]" />
            <div className="absolute -bottom-24 -left-20 w-[500px] h-[350px] bg-primary-900/80 rounded-[50%_50%_0_0/100%_100%_0_0]" />
          </div>

          {/* Top Brand Branding */}
          <div className="relative z-10 flex flex-col items-center text-center pt-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-primary-600 flex items-center justify-center shadow-xl shadow-primary-950/40 mb-3 transition-transform hover:scale-105">
              <Flame size={36} className="fill-primary-600 text-primary-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white/95 lowercase">
              blueflame
            </span>
            <span className="text-[10px] tracking-widest text-primary-200/80 font-bold uppercase mt-1">
              Salon Management System
            </span>
          </div>

          {/* Center Welcome Text */}
          <div className="relative z-10 flex flex-col items-center text-center my-8 sm:my-auto px-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 drop-shadow-sm">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-primary-100 max-w-sm font-normal leading-relaxed opacity-90">
              Sign in to continue to your account
            </p>
          </div>

          {/* Bottom Accent */}
          <div className="relative z-10 text-center pb-2">
            <div className="text-[11px] font-semibold tracking-widest text-primary-200/80 uppercase">
              ENTERPRISE AUTHENTICATION PORTAL
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL FORM CONTAINER                                                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-white dark:bg-[#161722] p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative">
          
          <div>
            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 lowercase tracking-tight mb-2">
                welcome
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Sign in to continue to your account
              </p>
            </div>

            {/* Backend / Global API Error Notification */}
            {apiError && (
              <div className="p-3.5 px-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-medium mb-6 flex items-center gap-2.5 animate-fadeIn">
                <AlertTriangle size={16} className="shrink-0 text-rose-500" />
                <span>{apiError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              
              {/* Email or Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Email or Phone
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) {
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                    }
                  }}
                  placeholder="Enter email or phone number"
                  disabled={loading}
                  className={`w-full px-6 py-3.5 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none transition-all ${
                    fieldErrors.identifier
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
                {fieldErrors.identifier && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-4">
                    {fieldErrors.identifier}
                  </p>
                )}
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder="Enter password"
                    disabled={loading}
                    className={`w-full px-6 py-3.5 pr-14 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none transition-all ${
                      fieldErrors.password
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-4">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary-500 focus:ring-primary-500/30 accent-primary-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Primary Sign In Button */}
              <div className="pt-3 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-56 py-3.5 px-8 rounded-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>SIGNING IN...</span>
                    </>
                  ) : (
                    <span>SIGN IN</span>
                  )}
                </button>
              </div>

              {/* Quick Demo Sign In Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={loading}
                  className="w-full py-2.5 px-5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                  Quick Demo Sign In (Super Admin)
                </button>
              </div>
            </form>
          </div>

          {/* Registration Redirect Link */}
          <div className="mt-8 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline ml-1"
            >
              Register as Customer
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
