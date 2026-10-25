import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { GoogleButton } from '../components/GoogleButton';
import { SecurityReassurance } from '../components/SecurityReassurance';
import { resolveRoleDestination } from '../utils/authRedirect';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loginUser } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      const target = resolveRoleDestination(user, from);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(() => {
    if (typeof window !== 'undefined') {
      const msg = sessionStorage.getItem('auth_error_message');
      if (msg) {
        sessionStorage.removeItem('auth_error_message');
        return msg;
      }
    }
    return '';
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    const emailTrimmed = formData.email.trim();

    if (!emailTrimmed) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setServerError('');

      const response = await loginUser(formData.email.trim(), formData.password);

      toast.success('Welcome back! Signed in successfully.');

      const from = location.state?.from?.pathname;
      const destination = resolveRoleDestination(response?.user || user, from);
      navigate(destination, { replace: true });
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Invalid email or password. Please verify your credentials.';
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset is available through your administrator or support team.');
  };

  const handleGoogleSignIn = () => {
    toast.info('Google OAuth integration is in progress. Please use email & password.');
  };

  return (
    <AuthLayout mode="login">
      {/* Heading & Subtitle */}
      <div className="mb-6 gsap-form-item">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-jakarta flex items-center gap-2">
          <span>Welcome Back</span>
          <span className="inline-block animate-wave">👋</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
          Sign in to your account to continue
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-fadeIn gsap-form-item">
          <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Address */}
        <div className="gsap-form-item">
          <AuthInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            error={fieldErrors.email}
            disabled={submitting}
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="gsap-form-item">
          <AuthInput
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            error={fieldErrors.password}
            disabled={submitting}
            required
            autoComplete="current-password"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1 gsap-form-item select-none">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 font-medium">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={submitting}
              className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/25 cursor-pointer accent-orange-500"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2 gsap-form-item">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative my-5 text-center gsap-form-item">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            OR
          </span>
        </div>

        {/* Google Sign In */}
        <div className="gsap-form-item">
          <GoogleButton onClick={handleGoogleSignIn} disabled={submitting} />
        </div>

        {/* Security Reassurance Message */}
        <div className="pt-2 gsap-form-item">
          <SecurityReassurance />
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
