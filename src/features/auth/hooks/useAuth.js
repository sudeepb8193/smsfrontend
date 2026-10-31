import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { resolveRoleDestination } from '../utils/authRedirect';
import { verifyOrganisationContactEmail } from '../../organisation/api/organisationApi';

export { useAuthContext as useAuth };

/**
 * 1. State Management Hook for Login Page
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loginUser } = useAuthContext();

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
    if (e?.preventDefault) e.preventDefault();
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

  return {
    formData,
    fieldErrors,
    serverError,
    submitting,
    handleChange,
    handleSubmit,
    handleForgotPassword,
    handleGoogleSignIn,
  };
};

/**
 * 2. State Management Hook for Register Page
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, registerUser } = useAuthContext();

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
    if (e?.preventDefault) e.preventDefault();
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

  return {
    formData,
    fieldErrors,
    serverError,
    submitting,
    passwordStrength,
    handleChange,
    handleSubmit,
    handleGoogleSignUp,
  };
};

/**
 * 3. State Management Hook for Contact Email Verification Page
 */
export const useContactEmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [result, setResult] = useState(() => ({
    status: token ? 'loading' : 'error',
    message: token ? '' : 'This verification link is missing its token.',
  }));

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyOrganisationContactEmail(token)
      .then((response) => {
        if (active) setResult({ status: 'success', message: response.message });
      })
      .catch((error) => {
        if (active) setResult({ status: 'error', message: error.message });
      });
    return () => {
      active = false;
    };
  }, [token]);

  return {
    token,
    result,
  };
};

export default {
  useAuth: useAuthContext,
  useLogin,
  useRegister,
  useContactEmailVerification,
};

