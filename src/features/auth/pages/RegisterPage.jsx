import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { GoogleButton } from '../components/GoogleButton';
import { resolveRoleDestination } from '../utils/authRedirect';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, registerUser } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      const target = resolveRoleDestination(user, from);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCountryCode: '+1',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time password strength computation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-sky-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-slate-200' };
    }
  }, [formData.password]);

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
    const fullNameTrimmed = formData.fullName.trim();
    const emailTrimmed = formData.email.trim();

    if (!fullNameTrimmed) {
      errors.fullName = 'Full Name is required';
    } else if (fullNameTrimmed.length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters';
    }

    if (!emailTrimmed) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one letter and one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms & Conditions and Privacy Policy';
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

      // Public registration payload — customer role is enforced on the server
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneCountryCode: formData.phoneCountryCode || '+1',
        phoneNumber: formData.phoneNumber.trim() || undefined,
      };

      const response = await registerUser(payload);

      toast.success('Account created successfully! Welcome to SalonFlow Pro.');

      const from = location.state?.from?.pathname;
      const destination = resolveRoleDestination(response?.user || user, from);
      navigate(destination, { replace: true });
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Registration failed. Please check your details and try again.';
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info('Google OAuth registration is in progress. Please use the form below.');
  };

  return (
    <AuthLayout mode="register">
      {/* Heading & Subtitle */}
      <div className="mb-6 gsap-form-item">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-jakarta">
          Create Your Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
          Fill in the details below to get started as a customer
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-fadeIn gsap-form-item">
          <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3 sm:space-y-3.5">
        {/* Full Name */}
        <div className="gsap-form-item">
          <AuthInput
            id="fullName"
            name="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            icon={User}
            error={fieldErrors.fullName}
            disabled={submitting}
            required
            autoComplete="name"
          />
        </div>

        {/* Email Address & Phone Number (Responsive 2-column on sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 gsap-form-item">
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

          <AuthInput
            id="phoneNumber"
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            placeholder="+1 XXXXX XXXXX"
            value={formData.phoneNumber}
            onChange={handleChange}
            icon={Phone}
            error={fieldErrors.phoneNumber}
            disabled={submitting}
            autoComplete="tel"
          />
        </div>

        {/* Password */}
        <div className="gsap-form-item">
          <AuthInput
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            error={fieldErrors.password}
            disabled={submitting}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-2 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Password strength</span>
                <span className="font-bold text-slate-700">{passwordStrength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score >= step
                        ? passwordStrength.color
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500 font-medium">
                <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-emerald-600' : ''}`}>
                  {formData.password.length >= 8 ? <Check size={12} /> : <X size={12} />} Min 8 characters
                </span>
                <span className={`flex items-center gap-1 ${/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                  {/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password) ? <Check size={12} /> : <X size={12} />} Letters & numbers
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="gsap-form-item">
          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={Lock}
            error={fieldErrors.confirmPassword}
            disabled={submitting}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Terms & Conditions Acceptance */}
        <div className="pt-1 gsap-form-item">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={submitting}
              className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/25 cursor-pointer accent-orange-500 mt-0.5 shrink-0"
            />
            <span>
              I agree to the{' '}
              <span className="font-semibold text-primary-600 hover:underline cursor-pointer">
                Terms & Conditions
              </span>{' '}
              and{' '}
              <span className="font-semibold text-primary-600 hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </span>
          </label>
          {fieldErrors.agreeToTerms && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {fieldErrors.agreeToTerms}
            </p>
          )}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1.5" />
              </>
            )}
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative my-4 text-center gsap-form-item">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            OR
          </span>
        </div>

        {/* Google Sign In */}
        <div className="gsap-form-item">
          <GoogleButton
            text="Continue with Google"
            onClick={handleGoogleSignUp}
            disabled={submitting}
          />
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
