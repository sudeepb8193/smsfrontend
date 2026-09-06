/**
 * Validation utilities for Authentication module (Login & Customer Registration)
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Allows optional +, spaces, dashes, parentheses and 7 to 15 digits
  const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
  return phoneRegex.test(phone.trim());
};

export const validateLoginForm = ({ identifier, password }) => {
  const errors = {};

  const cleanIdentifier = (identifier || '').trim();
  const cleanPassword = password || '';

  if (!cleanIdentifier) {
    errors.identifier = 'Email address or phone number is required.';
  } else if (!isValidEmail(cleanIdentifier) && !isValidPhoneNumber(cleanIdentifier)) {
    errors.identifier = 'Please enter a valid email address or phone number.';
  }

  if (!cleanPassword) {
    errors.password = 'Password is required.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const validateRegisterForm = ({
  fullName,
  email,
  phoneNumber,
  password,
  confirmPassword,
  agreeToTerms,
}) => {
  const errors = {};

  const cleanName = (fullName || '').trim();
  const cleanEmail = (email || '').trim();
  const cleanPhone = (phoneNumber || '').trim();
  const cleanPassword = password || '';
  const cleanConfirm = confirmPassword || '';

  if (!cleanName) {
    errors.fullName = 'Full Name is required.';
  } else if (cleanName.length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters.';
  }

  if (!cleanEmail) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(cleanEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!cleanPhone) {
    errors.phoneNumber = 'Phone Number is required.';
  } else if (!isValidPhoneNumber(cleanPhone)) {
    errors.phoneNumber = 'Please enter a valid phone number (e.g. 9876543210).';
  }

  if (!cleanPassword) {
    errors.password = 'Password is required.';
  } else if (cleanPassword.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (!cleanConfirm) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (cleanPassword !== cleanConfirm) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!agreeToTerms) {
    errors.agreeToTerms = 'You must accept the Terms & Conditions to register.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
