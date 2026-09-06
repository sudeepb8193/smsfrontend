import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { authApi } from '../services/auth.api';
import { validateRegisterForm } from '../validation/authValidation';
import { getDashboardRouteForRole } from './LoginPage';
import { toast } from 'sonner';
import {
  Flame,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

export const RegisterPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetRoute = getDashboardRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError('');
    setFieldErrors({});

    // 1. Client-Side Field Validation
    const { errors, isValid } = validateRegisterForm(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    // 2. Submit Registration Request to Backend (No Role Payload Sent!)
    try {
      setLoading(true);
      await authApi.registerCustomer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });
      setLoading(false);

      toast.success('Your customer account was created successfully! Please sign in.');

      // 3. Redirect to /login with Toast Success Message
      navigate('/login', {
        state: {
          successMessage: 'Your customer account was registered successfully! Please sign in to continue.',
        },
        replace: true,
      });
    } catch (err) {
      setLoading(false);
      const msg = err.message || 'Failed to register customer account. Please try again.';
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
        <div className="lg:col-span-5 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden min-h-[320px] lg:min-h-full">
          
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 drop-shadow-sm">
              Join Us Today
            </h1>
            <p className="text-xs sm:text-sm text-primary-100 max-w-xs font-normal leading-relaxed opacity-90">
              Register as a customer to book and manage your salon appointments.
            </p>
          </div>

          {/* Bottom Accent */}
          <div className="relative z-10 text-center pb-2">
            <div className="text-[11px] font-semibold tracking-widest text-primary-200/80 uppercase">
              CUSTOMER REGISTRATION
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL FORM CONTAINER                                                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161722] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative">
          
          <div>
            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-600 dark:text-primary-400 tracking-tight mb-2">
                Create Your Account
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Register as a customer to book and manage your salon appointments.
              </p>
            </div>

            {/* Backend / Global API Error Notification */}
            {apiError && (
              <div className="p-3.5 px-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-medium mb-5 flex items-center gap-2.5 animate-fadeIn">
                <AlertTriangle size={16} className="shrink-0 text-rose-500" />
                <span>{apiError}</span>
              </div>
            )}

            {/* CUSTOMER REGISTRATION FORM */}
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Jane Doe"
                  disabled={loading}
                  className={`w-full px-5 py-3 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                    fieldErrors.fullName
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 ml-4">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className={`w-full px-5 py-3 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                      fieldErrors.email
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-500 font-semibold mt-1 ml-3">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    placeholder="e.g. 9876543210"
                    disabled={loading}
                    className={`w-full px-5 py-3 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                      fieldErrors.phoneNumber
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                    }`}
                  />
                  {fieldErrors.phoneNumber && (
                    <p className="text-xs text-rose-500 font-semibold mt-1 ml-3">
                      {fieldErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Grid: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Min 8 characters"
                      disabled={loading}
                      className={`w-full px-5 py-3 pr-12 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                        fieldErrors.password
                          ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-500 font-semibold mt-1 ml-3">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      disabled={loading}
                      className={`w-full px-5 py-3 pr-12 rounded-full bg-primary-500/10 dark:bg-primary-950/40 border text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                        fieldErrors.confirmPassword
                          ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1A1B28] focus:ring-2 focus:ring-primary-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-rose-500 font-semibold mt-1 ml-3">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-primary-500 focus:ring-primary-500/30 accent-primary-500 cursor-pointer shrink-0"
                  />
                  <span>
                    I agree to the <span className="text-primary-600 dark:text-primary-400 font-bold underline">Terms & Conditions</span> and Privacy Policy
                  </span>
                </label>
                {fieldErrors.agreeToTerms && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 ml-6">
                    {fieldErrors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Primary Create Customer Account Button */}
              <div className="pt-3 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-8 rounded-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : (
                    <span>CREATE CUSTOMER ACCOUNT</span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline ml-1"
            >
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
