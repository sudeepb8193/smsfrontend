import React from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { GoogleButton } from '../components/GoogleButton';
import { SecurityReassurance } from '../components/SecurityReassurance';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';

export const LoginPage = () => {
  const {
    formData,
    fieldErrors,
    serverError,
    submitting,
    handleChange,
    handleSubmit,
    handleForgotPassword,
    handleGoogleSignIn,
  } = useLogin();

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
            className="group relative w-full h-12 py-3 sm:py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-primary-500 to-amber-500 hover:from-orange-600 hover:via-primary-600 hover:to-amber-600 hover:brightness-105 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer overflow-hidden select-none"
          >
            {/* Top edge subtle glowing reflection beam */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1.5" />
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
