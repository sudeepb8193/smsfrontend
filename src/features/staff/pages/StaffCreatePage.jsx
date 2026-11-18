import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Input from '../../../components/shared/Input';
import CharCount from '../../../components/shared/CharCount';
import CustomSelector from '../../../components/shared/CustomSelector';
import MediaUpload from '../../../components/shared/MediaUpload';
import DatePicker from '../../../components/shared/DatePicker';
import { useBranch } from '../../branch/hooks/useBranch';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useAuth } from '../../../hooks/useAuth';
import { useDebounce } from '../../../hooks/useDebounce';
import { userService } from '../../../services/userService';
import { createStaff as apiCreateStaff, suggestEmployeeCode } from '../api/staffApi';
import { fetchBranches } from '../../branch/api/branchApi';
import { queryKeys } from '../../../config/queryClient';
import {
  User,
  Building2,
  Phone,
  Shield,
  Sparkles,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
} from 'lucide-react';

/** Timezone-safe local calendar date helper (YYYY-MM-DD) */
const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Reusable section card header matching SMS standard design */
const SectionHeader = ({
  icon: Icon,
  title,
  description,
  iconColor = 'text-primary-500',
  iconBg = 'bg-primary-500/10',
  iconBorder = 'border-primary-500/20',
  action,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-color)]">
    <div className="flex items-center gap-2.5">
      <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} border ${iconBorder} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="text-[11px] text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export function StaffCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);

  // Authentication & Multi-Tenant Organization Context
  const { user } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { currentBranch } = useBranch();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  // Track component unmount for async safety
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // UI & Error State
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);

  // User Linking Section State (Lazy TanStack Query activation)
  const [showUserLink, setShowUserLink] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [selectedUserObj, setSelectedUserObj] = useState(null);
  const debouncedUserSearch = useDebounce(userSearch, 350);

  // Reset user page to 1 when search text changes
  useEffect(() => {
    setUserPage(1);
  }, [debouncedUserSearch]);

  // Master Form State
  const [formData, setFormData] = useState({
    // Identity
    fullName: '',
    employeeCode: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    profilePhotoUrl: '',
    employmentStatus: 'active',
    homeBranchId: '',
    userId: '',

    // Initial Employment
    designation: '',
    department: '',
    employmentType: 'full_time',
    joiningDate: getLocalDateString(),
    confirmationDate: '',

    // Contact & National ID
    personalPhone: '',
    personalEmail: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'IN',
    bloodGroup: '',
    maritalStatus: 'single',
    nationalIdNumber: '',
  });

  // Dynamic field update with instant inline error clearance
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ─── QUERY 1: BACKEND-ONLY ELIGIBLE BRANCHES FETCHING ───
  // Server returns only active branches. Zero client-side filtering needed.
  const {
    data: branchesRes,
    isLoading: loadingBranches,
  } = useQuery({
    queryKey: queryKeys.branches.list(effectiveOrgId, {
      status: 'active',
      limit: 50,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
    queryFn: () =>
      fetchBranches({
        organizationId: effectiveOrgId,
        status: 'active',
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc',
      }),
    enabled: Boolean(effectiveOrgId),
    staleTime: 5 * 60 * 1000,
  });

  const eligibleBranches = useMemo(() => {
    if (Array.isArray(branchesRes?.data)) return branchesRes.data;
    if (Array.isArray(branchesRes?.items)) return branchesRes.items;
    if (Array.isArray(branchesRes)) return branchesRes;
    return [];
  }, [branchesRes]);

  // Safely assign Home Branch: cannot automatically select closed or inactive branch
  useEffect(() => {
    if (eligibleBranches.length === 0) return;

    setFormData((prev) => {
      // If current selected homeBranchId is already among active branches, keep it
      if (prev.homeBranchId && eligibleBranches.some((b) => b.id === prev.homeBranchId)) {
        return prev;
      }
      // If topbar active branch is active and in eligible list, choose it
      const isTopBarBranchActive =
        currentBranch?.id && eligibleBranches.some((b) => b.id === currentBranch.id);
      const chosenBranchId = isTopBarBranchActive ? currentBranch.id : eligibleBranches[0].id;
      return { ...prev, homeBranchId: chosenBranchId };
    });
  }, [eligibleBranches, currentBranch]);

  // Handle Organization Context switch safely
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      homeBranchId: '',
      userId: '',
    }));
    setSelectedUserObj(null);
    setUserSearch('');
    setUserPage(1);
    setErrors({});
    setError(null);
  }, [effectiveOrgId]);

  // ─── QUERY 2: LAZY USER ACCOUNTS FETCHING ───
  // Executes ONLY when showUserLink is true. Initial page load makes ZERO user requests.
  const {
    data: usersRes,
    isLoading: loadingUsers,
    isFetching: fetchingUsers,
  } = useQuery({
    queryKey: queryKeys.users.list(effectiveOrgId, {
      page: userPage,
      limit: 10,
      search: debouncedUserSearch || undefined,
      status: 'active',
    }),
    queryFn: () =>
      userService.getUsers({
        organizationId: effectiveOrgId,
        page: userPage,
        limit: 10,
        search: debouncedUserSearch ? debouncedUserSearch.trim() : undefined,
        status: 'active',
      }),
    enabled: Boolean(showUserLink && effectiveOrgId),
    staleTime: 60 * 1000,
  });

  const usersList = useMemo(() => {
    if (Array.isArray(usersRes?.users)) return usersRes.users;
    if (Array.isArray(usersRes?.data)) return usersRes.data;
    if (Array.isArray(usersRes?.items)) return usersRes.items;
    if (Array.isArray(usersRes)) return usersRes;
    return [];
  }, [usersRes]);

  const totalUserPages = useMemo(() => {
    const meta = usersRes?.meta || usersRes?.pagination;
    if (meta?.totalPages) return meta.totalPages;
    if (meta?.total) return Math.ceil(meta.total / 10);
    return usersList.length >= 10 ? userPage + 1 : userPage;
  }, [usersRes, usersList.length, userPage]);

  // ─── SUGGEST EMPLOYEE CODE (CONCURRENCY-SAFE) ───
  const handleSuggestCode = async () => {
    if (isSuggestingCode || !effectiveOrgId) return;
    setIsSuggestingCode(true);
    try {
      const res = await suggestEmployeeCode('EMP', effectiveOrgId);
      if (isMountedRef.current && res?.employeeCode) {
        handleFieldChange('employeeCode', res.employeeCode);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to suggest employee code:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSuggestingCode(false);
      }
    }
  };

  // Comprehensive Client-Side Validation
  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) {
      errs.fullName = 'Full name is required';
    }
    if (!formData.homeBranchId) {
      errs.homeBranchId = 'Home Branch assignment is required';
    }
    if (!formData.joiningDate) {
      errs.joiningDate = 'Joining date is required';
    }
    if (
      formData.personalEmail?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail.trim())
    ) {
      errs.personalEmail = 'Please enter a valid email address';
    }
    if (
      formData.personalPhone?.trim() &&
      !/^\+?[0-9\s-]{7,20}$/.test(formData.personalPhone.trim())
    ) {
      errs.personalPhone = 'Please enter a valid phone number (7-20 digits)';
    }
    if (formData.dateOfBirth) {
      const today = getLocalDateString();
      if (formData.dateOfBirth > today) {
        errs.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    if (
      formData.joiningDate &&
      formData.confirmationDate &&
      formData.confirmationDate < formData.joiningDate
    ) {
      errs.confirmationDate = 'Confirmation date cannot be before joining date';
    }
    return errs;
  };

  // Safe Backend Validation Error Normalizer
  const normalizeBackendErrors = (err) => {
    const data = err?.response?.data;
    const code = data?.code;
    const msg = data?.message || err?.message || 'Failed to create employee profile';

    const normalized = {};

    // 1. Direct Error Codes from Backend
    if (code === 'DUPLICATE_EMPLOYEE_CODE') {
      normalized.employeeCode = data.message || 'This employee code is already taken. Please auto-generate or use a different code.';
      return { inline: normalized, banner: null };
    }
    if (code === 'USER_ALREADY_LINKED') {
      normalized.userId = 'This user account is already linked to another employee.';
      return { inline: normalized, banner: null };
    }
    if (code === 'USER_NOT_ACTIVE') {
      normalized.userId = 'Cannot link an inactive user account.';
      return { inline: normalized, banner: null };
    }
    if (code === 'USER_NOT_FOUND') {
      normalized.userId = 'The selected user was not found in your organization.';
      return { inline: normalized, banner: null };
    }
    if (code === 'BRANCH_NOT_ACTIVE' || code === 'BRANCH_CLOSED') {
      normalized.homeBranchId = data.message || 'Cannot assign to a closed or inactive branch.';
      return { inline: normalized, banner: null };
    }
    if (code === 'BRANCH_NOT_FOUND') {
      normalized.homeBranchId = 'Selected home branch does not belong to your organization.';
      return { inline: normalized, banner: null };
    }

    // 2. Class-Validator Array Messages
    if (Array.isArray(msg)) {
      msg.forEach((m) => {
        const lower = m.toLowerCase();
        if (lower.includes('fullname') || lower.includes('name')) normalized.fullName = m;
        else if (lower.includes('homebranchid') || lower.includes('branch')) normalized.homeBranchId = m;
        else if (lower.includes('personalemail') || lower.includes('email')) normalized.personalEmail = m;
        else if (lower.includes('personalphone') || lower.includes('phone')) normalized.personalPhone = m;
        else if (lower.includes('employeecode') || lower.includes('code')) normalized.employeeCode = m;
        else if (lower.includes('userid') || lower.includes('user')) normalized.userId = m;
        else if (lower.includes('dateofbirth')) normalized.dateOfBirth = m;
        else if (lower.includes('joiningdate')) normalized.joiningDate = m;
        else if (lower.includes('confirmationdate')) normalized.confirmationDate = m;
      });
      if (Object.keys(normalized).length > 0) {
        return { inline: normalized, banner: null };
      }
      return { inline: {}, banner: msg.join(', ') };
    }

    // 3. String Message Pattern Matching
    if (typeof msg === 'string') {
      const lower = msg.toLowerCase();
      if (lower.includes('code') && (lower.includes('exist') || lower.includes('duplicate'))) {
        normalized.employeeCode = msg;
        return { inline: normalized, banner: null };
      }
      if (lower.includes('user') && lower.includes('linked')) {
        normalized.userId = msg;
        return { inline: normalized, banner: null };
      }
      if (lower.includes('branch')) {
        normalized.homeBranchId = msg;
        return { inline: normalized, banner: null };
      }
      if (lower.includes('email')) {
        normalized.personalEmail = msg;
        return { inline: normalized, banner: null };
      }
      if (lower.includes('phone')) {
        normalized.personalPhone = msg;
        return { inline: normalized, banner: null };
      }
      return { inline: {}, banner: msg };
    }

    return { inline: {}, banner: 'Failed to create employee profile' };
  };

  // ─── TANSTACK QUERY MUTATION: CREATE STAFF ───
  const createStaffMutation = useMutation({
    mutationFn: (payload) => apiCreateStaff(payload, effectiveOrgId),
    onSuccess: (res) => {
      // Invalidate only staff listings to reflect the new employee
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      const newStaffId = res?.id || res?.data?.id;
      if (newStaffId) {
        navigate(`/staff/${newStaffId}`);
      } else {
        navigate('/staff');
      }
    },
    onError: (err) => {
      console.error('Failed to create staff:', err);
      const { inline, banner } = normalizeBackendErrors(err);
      if (Object.keys(inline).length > 0) {
        setErrors((prev) => ({ ...prev, ...inline }));
      }
      if (banner) {
        setError(banner);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const targetEl =
        document.getElementById(firstField) || document.querySelector(`[name="${firstField}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setErrors({});

    const payload = {
      fullName: formData.fullName.trim(),
      employeeCode: formData.employeeCode?.trim() || undefined,
      homeBranchId: formData.homeBranchId,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender,
      profilePhotoUrl: formData.profilePhotoUrl || undefined,
      employmentStatus: formData.employmentStatus,
      userId: formData.userId || undefined,

      // Employment
      designation: formData.designation?.trim() || undefined,
      department: formData.department?.trim() || undefined,
      employmentType: formData.employmentType,
      joiningDate: formData.joiningDate || undefined,
      confirmationDate: formData.confirmationDate || undefined,

      // Contact & Identification
      personalPhone: formData.personalPhone?.trim() || undefined,
      personalEmail: formData.personalEmail?.trim() || undefined,
      addressLine1: formData.addressLine1?.trim() || undefined,
      addressLine2: formData.addressLine2?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      state: formData.state?.trim() || undefined,
      postalCode: formData.postalCode?.trim() || undefined,
      countryCode: formData.countryCode || undefined,
      bloodGroup: formData.bloodGroup || undefined,
      maritalStatus: formData.maritalStatus,
      nationalIdNumber: formData.nationalIdNumber?.trim() || undefined,
    };

    createStaffMutation.mutate(payload);
  };

  const isSubmitting = createStaffMutation.isPending;

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Page Title Header */}
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Onboard New Employee
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
            Create master HR employee profile, establish Home Branch, and initialize position details.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* ─── SECTION 1: PROFILE & IDENTITY ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={User}
            title="Profile & Identity"
            description="Employee name, unique code, gender, birth date and profile photo"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Photo */}
            <div>
              <MediaUpload
                label="Profile Photo (Optional)"
                helperText="Upload employee headshot · PNG, JPG up to 5 MB"
                value={formData.profilePhotoUrl}
                onChange={(url) => handleFieldChange('profilePhotoUrl', url)}
                folder="staff"
                aspectRatio="square"
              />
            </div>

            {/* Identity Fields */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  maxLength={150}
                  showCharCount
                  onChange={(e) => handleFieldChange('fullName', e.target.value.slice(0, 150))}
                  placeholder="e.g. Sarah Jenkins"
                  error={errors.fullName}
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-[var(--text-primary)]">
                      Employee Code
                    </label>
                    <div className="flex items-center gap-2">
                      <CharCount current={formData.employeeCode} max={30} />
                      <button
                        type="button"
                        onClick={handleSuggestCode}
                        disabled={isSuggestingCode}
                        className="text-[11px] text-primary-500 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isSuggestingCode ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Sparkles size={11} />
                        )}
                        Auto-generate
                      </button>
                    </div>
                  </div>
                  <Input
                    id="employeeCode"
                    name="employeeCode"
                    value={formData.employeeCode}
                    maxLength={30}
                    onChange={(e) => handleFieldChange('employeeCode', e.target.value.slice(0, 30))}
                    placeholder="e.g. EMP-0042 (Auto if blank)"
                    error={errors.employeeCode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <DatePicker
                    id="dateOfBirth"
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(val) => handleFieldChange('dateOfBirth', val?.target?.value ?? val)}
                    error={errors.dateOfBirth}
                  />
                </div>

                <div>
                  <CustomSelector
                    id="gender"
                    label="Gender"
                    value={formData.gender}
                    onChange={(val) => handleFieldChange('gender', val)}
                    options={[
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ]}
                    isSearchable={false}
                    isClearable={false}
                  />
                </div>

                <div>
                  <CustomSelector
                    id="employmentStatus"
                    label="Initial Status"
                    value={formData.employmentStatus}
                    onChange={(val) => handleFieldChange('employmentStatus', val)}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'on_leave', label: 'On Leave' },
                      { value: 'suspended', label: 'Suspended' },
                    ]}
                    isSearchable={false}
                    isClearable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: HOME BRANCH & POSITION ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={Building2}
            title="Home Branch & Initial Position"
            description="Operational salon home branch assignment, designation, department and joining details"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            iconBorder="border-emerald-500/20"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <CustomSelector
                id="homeBranchId"
                label="Designated Home Branch"
                placeholder={loadingBranches ? 'Loading active branches...' : 'Select Home Branch...'}
                value={formData.homeBranchId}
                onChange={(val) => handleFieldChange('homeBranchId', val)}
                options={eligibleBranches.map((b) => ({
                  value: b.id,
                  label: `${b.name} (${b.code})`,
                }))}
                isSearchable={true}
                isClearable={false}
                error={errors.homeBranchId}
                required
                disabled={loadingBranches}
                helperText="Every employee belongs to exactly one Home Branch for base scheduling."
              />
            </div>

            <div>
              <CustomSelector
                id="employmentType"
                label="Employment Type"
                value={formData.employmentType}
                onChange={(val) => handleFieldChange('employmentType', val)}
                options={[
                  { value: 'full_time', label: 'Full-time' },
                  { value: 'part_time', label: 'Part-time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'intern', label: 'Intern' },
                ]}
                isSearchable={false}
                isClearable={false}
                error={errors.employmentType}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Input
              id="designation"
              name="designation"
              label="Designation / Title"
              value={formData.designation}
              maxLength={100}
              showCharCount
              onChange={(e) => handleFieldChange('designation', e.target.value.slice(0, 100))}
              placeholder="e.g. Master Stylist"
              error={errors.designation}
            />

            <Input
              id="department"
              name="department"
              label="Department"
              value={formData.department}
              maxLength={100}
              showCharCount
              onChange={(e) => handleFieldChange('department', e.target.value.slice(0, 100))}
              placeholder="e.g. Hair Care, Spa"
              error={errors.department}
            />

            <div>
              <DatePicker
                id="joiningDate"
                label="Joining Date"
                value={formData.joiningDate}
                onChange={(val) => handleFieldChange('joiningDate', val?.target?.value ?? val)}
                error={errors.joiningDate}
                required
              />
            </div>

            <div>
              <DatePicker
                id="confirmationDate"
                label="Confirmation Date"
                value={formData.confirmationDate}
                onChange={(val) => handleFieldChange('confirmationDate', val?.target?.value ?? val)}
                error={errors.confirmationDate}
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: PERSONAL CONTACT, ADDRESS & NATIONAL ID ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={Phone}
            title="Personal Contact & National ID (Optional)"
            description="Contact information, physical address and encrypted national identity documentation"
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
            iconBorder="border-blue-500/20"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              id="personalPhone"
              name="personalPhone"
              label="Personal Phone"
              value={formData.personalPhone}
              maxLength={20}
              showCharCount
              onChange={(e) => handleFieldChange('personalPhone', e.target.value.slice(0, 20))}
              placeholder="+91 9876543210"
              error={errors.personalPhone}
            />

            <Input
              id="personalEmail"
              name="personalEmail"
              label="Personal Email"
              type="email"
              value={formData.personalEmail}
              maxLength={150}
              showCharCount
              onChange={(e) => handleFieldChange('personalEmail', e.target.value.slice(0, 150))}
              placeholder="employee@personal.com"
              error={errors.personalEmail}
            />
          </div>

          {/* Complete Address Fields: Address Line 1 & Address Line 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              id="addressLine1"
              name="addressLine1"
              label="Address Line 1"
              value={formData.addressLine1}
              maxLength={200}
              showCharCount
              onChange={(e) => handleFieldChange('addressLine1', e.target.value.slice(0, 200))}
              placeholder="Street address, flat / unit number"
              error={errors.addressLine1}
            />

            <Input
              id="addressLine2"
              name="addressLine2"
              label="Address Line 2 (Optional)"
              value={formData.addressLine2}
              maxLength={200}
              showCharCount
              onChange={(e) => handleFieldChange('addressLine2', e.target.value.slice(0, 200))}
              placeholder="Apartment, suite, building, floor, landmark"
              error={errors.addressLine2}
            />
          </div>

          {/* City, State & Postal Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              id="city"
              name="city"
              label="City"
              value={formData.city}
              maxLength={80}
              showCharCount
              onChange={(e) => handleFieldChange('city', e.target.value.slice(0, 80))}
              placeholder="City"
              error={errors.city}
            />

            <Input
              id="state"
              name="state"
              label="State / Province"
              value={formData.state}
              maxLength={80}
              showCharCount
              onChange={(e) => handleFieldChange('state', e.target.value.slice(0, 80))}
              placeholder="State / Region"
              error={errors.state}
            />

            <Input
              id="postalCode"
              name="postalCode"
              label="Postal Code"
              value={formData.postalCode}
              maxLength={20}
              showCharCount
              onChange={(e) => handleFieldChange('postalCode', e.target.value.slice(0, 20))}
              placeholder="ZIP / PIN Code"
              error={errors.postalCode}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 border-t border-[var(--border-color)]">
            <div>
              <CustomSelector
                label="Blood Group"
                placeholder="Select blood group..."
                value={formData.bloodGroup}
                onChange={(val) => handleFieldChange('bloodGroup', val)}
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
                isSearchable={false}
                isClearable={true}
              />
            </div>

            <div>
              <CustomSelector
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={(val) => handleFieldChange('maritalStatus', val)}
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ]}
                isSearchable={false}
                isClearable={false}
              />
            </div>

            <div>
              <Input
                label="National ID (Encrypted at rest)"
                value={formData.nationalIdNumber}
                maxLength={100}
                showCharCount
                onChange={(e) => handleFieldChange('nationalIdNumber', e.target.value.slice(0, 100))}
                placeholder="e.g. Aadhaar / SSN"
                helperText="Encrypted with AES-256 in backend database before storage."
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION 4: LOGIN ACCOUNT (LAZY TANSTACK QUERY) ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={Shield}
            title="Link System Login Account (Optional)"
            description="Independent login credentials. Employees can exist with or without a system login."
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
            iconBorder="border-purple-500/20"
            action={
              <button
                type="button"
                onClick={() => {
                  setShowUserLink((prev) => {
                    const next = !prev;
                    if (!next) {
                      handleFieldChange('userId', '');
                      setSelectedUserObj(null);
                    }
                    return next;
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  showUserLink
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Shield size={13} />
                {showUserLink ? 'Linking Enabled' : 'Enable Account Linking'}
              </button>
            }
          />

          {!showUserLink ? (
            <div className="p-4 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-input)]/40 text-xs text-[var(--text-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                No login user account is linked. Click <strong>Enable Account Linking</strong> to attach an existing active login user.
              </span>
              <button
                type="button"
                onClick={() => setShowUserLink(true)}
                className="text-xs font-semibold text-purple-500 hover:underline cursor-pointer shrink-0"
              >
                Link User Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selected User Display */}
              {formData.userId && selectedUserObj && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {selectedUserObj.displayName?.[0]?.toUpperCase() || selectedUserObj.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {selectedUserObj.displayName || selectedUserObj.email}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{selectedUserObj.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleFieldChange('userId', '');
                      setSelectedUserObj(null);
                    }}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Remove user link"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Backend-Powered Search Bar */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search active users by name or email (page size: 10)..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => setUserSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {errors.userId && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.userId}</p>
              )}

              {/* User Selection List */}
              <div className="rounded-xl border border-[var(--border-color)] divide-y divide-[var(--border-color)] overflow-hidden bg-[var(--bg-input)]/20">
                {loadingUsers || fetchingUsers ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                    <Loader2 size={16} className="animate-spin text-purple-500" />
                    <span>Loading users from backend...</span>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="p-5 text-center text-xs text-[var(--text-muted)]">
                    No active eligible users found matching your search.
                  </div>
                ) : (
                  usersList.map((u) => {
                    const isSelected = formData.userId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleFieldChange('userId', '');
                            setSelectedUserObj(null);
                          } else {
                            handleFieldChange('userId', u.id);
                            setSelectedUserObj(u);
                          }
                        }}
                        className={`w-full p-2.5 text-left flex items-center justify-between gap-3 text-xs transition cursor-pointer hover:bg-[var(--bg-card-hover)] ${
                          isSelected ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">
                            {u.displayName || u.email}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">{u.email}</p>
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[var(--border-color)] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Server-Side Pagination Controls */}
              {totalUserPages > 1 && (
                <div className="flex items-center justify-between pt-1 text-xs text-[var(--text-muted)]">
                  <span>
                    Page {userPage} of {totalUserPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage <= 1 || loadingUsers}
                      className="p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                      disabled={userPage >= totalUserPages || loadingUsers}
                      className="p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-primary-500/25 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              <span>{isSubmitting ? 'Onboarding...' : 'Complete Onboarding'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default StaffCreatePage;
