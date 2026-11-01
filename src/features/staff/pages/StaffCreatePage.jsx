import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/shared/Input';
import CustomSelector from '../../../components/shared/CustomSelector';
import MediaUpload from '../../../components/shared/MediaUpload';
import DatePicker from '../../../components/shared/DatePicker';
import { useStaff } from '../hooks/useStaff';
import { useBranch } from '../../branch/hooks/useBranch';
import { userService } from '../../../services/userService';
import { suggestEmployeeCode } from '../api/staffApi';
import {
  User,
  Building2,
  Phone,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/** Reusable section card header matching BranchForm style */
const SectionHeader = ({
  icon: Icon,
  title,
  description,
  iconColor = 'text-primary-500',
  iconBg = 'bg-primary-500/10',
  iconBorder = 'border-primary-500/20',
  action,
}) => (
  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-color)]">
    <div className="flex items-center gap-2.5">
      <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} border ${iconBorder}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="text-[11px] text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
    {action}
  </div>
);

export function StaffCreatePage() {
  const navigate = useNavigate();
  const { branches, currentBranch } = useBranch();
  const { createStaff, effectiveOrgId } = useStaff();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    // Identity
    fullName: '',
    employeeCode: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    profilePhotoUrl: '',
    employmentStatus: 'active',
    homeBranchId: currentBranch?.id || '',
    userId: '',

    // Initial Employment
    designation: '',
    department: '',
    employmentType: 'full_time',
    joiningDate: new Date().toISOString().slice(0, 10),
    confirmationDate: '',

    // Contact
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

  // Comprehensive client-side inline validation
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
    if (formData.personalEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail.trim())) {
      errs.personalEmail = 'Please enter a valid email address';
    }
    if (formData.personalPhone?.trim() && !/^\+?[0-9\s-]{7,15}$/.test(formData.personalPhone.trim())) {
      errs.personalPhone = 'Please enter a valid phone number (at least 7 digits)';
    }
    if (formData.dateOfBirth) {
      const today = new Date().toISOString().slice(0, 10);
      if (formData.dateOfBirth > today) {
        errs.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    if (formData.joiningDate && formData.confirmationDate && formData.confirmationDate < formData.joiningDate) {
      errs.confirmationDate = 'Confirmation date cannot be before joining date';
    }
    return errs;
  };

  // Default Home Branch to active topbar branch or first active branch
  useEffect(() => {
    if (currentBranch?.id && !formData.homeBranchId) {
      setFormData((prev) => ({ ...prev, homeBranchId: currentBranch.id }));
    } else if (branches.length > 0 && !formData.homeBranchId) {
      const activeBranch = branches.find((b) => b.status === 'active') || branches[0];
      setFormData((prev) => ({ ...prev, homeBranchId: activeBranch.id }));
    }
  }, [branches, currentBranch, formData.homeBranchId]);

  // Load available organization users for optional linking
  useEffect(() => {
    if (effectiveOrgId) {
      setLoadingUsers(true);
      userService
        .getUsers({ organizationId: effectiveOrgId, limit: 100 })
        .then((res) => {
          const list = res?.users || res?.data || res || [];
          setUsers(Array.isArray(list) ? list : []);
        })
        .catch((err) => console.error('Failed to load users for linking:', err))
        .finally(() => setLoadingUsers(false));
    }
  }, [effectiveOrgId]);

  // Suggest Concurrency-Safe Employee Code
  const handleSuggestCode = async () => {
    try {
      const res = await suggestEmployeeCode('EMP', effectiveOrgId);
      if (res?.employeeCode) {
        setFormData((prev) => ({ ...prev, employeeCode: res.employeeCode }));
      }
    } catch (err) {
      console.error('Failed to suggest employee code:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Smoothly scroll to the first invalid field
      const firstField = Object.keys(validationErrors)[0];
      const targetEl = document.getElementById(firstField) || document.querySelector(`[name="${firstField}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
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

        // Contact
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

      const res = await createStaff(payload);
      const newStaffId = res?.id || res?.data?.id;
      if (newStaffId) {
        navigate(`/staff/${newStaffId}`);
      } else {
        navigate('/staff');
      }
    } catch (err) {
      console.error('Failed to create staff:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to create employee profile';
      if (typeof msg === 'string') {
        if (msg.toLowerCase().includes('code')) {
          setErrors((prev) => ({ ...prev, employeeCode: msg }));
        } else if (msg.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, personalEmail: msg }));
        } else {
          setError(msg);
        }
      } else if (Array.isArray(msg)) {
        const inlineMap = {};
        msg.forEach((m) => {
          if (m.toLowerCase().includes('name')) inlineMap.fullName = m;
          else if (m.toLowerCase().includes('branch')) inlineMap.homeBranchId = m;
          else if (m.toLowerCase().includes('email')) inlineMap.personalEmail = m;
          else if (m.toLowerCase().includes('code')) inlineMap.employeeCode = m;
        });
        if (Object.keys(inlineMap).length > 0) {
          setErrors((prev) => ({ ...prev, ...inlineMap }));
        } else {
          setError(msg.join(', '));
        }
      } else {
        setError('Failed to create employee profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Page Title Header matching BranchForm (No back button in header) */}
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
                onChange={(url) => setFormData((prev) => ({ ...prev, profilePhotoUrl: url }))}
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
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  error={errors.fullName}
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-[var(--text-primary)]">
                      Employee Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSuggestCode}
                      className="text-[11px] text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      Auto-generate
                    </button>
                  </div>
                  <Input
                    id="employeeCode"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={(e) => handleFieldChange('employeeCode', e.target.value)}
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
                placeholder="Select Home Branch..."
                value={formData.homeBranchId}
                onChange={(val) => handleFieldChange('homeBranchId', val)}
                options={branches
                  .filter((b) => b.status !== 'permanently_closed')
                  .map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }))}
                isSearchable={true}
                isClearable={false}
                error={errors.homeBranchId}
                required
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
              onChange={(e) => handleFieldChange('designation', e.target.value)}
              placeholder="e.g. Master Stylist"
              error={errors.designation}
            />

            <Input
              id="department"
              name="department"
              label="Department"
              value={formData.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
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

        {/* ─── SECTION 3: PERSONAL CONTACT & NATIONAL ID ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={Phone}
            title="Personal Contact & National ID (Optional)"
            description="Contact information and encrypted national identity documentation"
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
              onChange={(e) => handleFieldChange('personalPhone', e.target.value)}
              placeholder="+91 9876543210"
              error={errors.personalPhone}
            />

            <Input
              id="personalEmail"
              name="personalEmail"
              label="Personal Email"
              type="email"
              value={formData.personalEmail}
              onChange={(e) => handleFieldChange('personalEmail', e.target.value)}
              placeholder="employee@personal.com"
              error={errors.personalEmail}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              id="addressLine1"
              name="addressLine1"
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
              placeholder="Street address, flat / unit number"
              error={errors.addressLine1}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                id="city"
                name="city"
                label="City"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="City"
                error={errors.city}
              />
              <Input
                id="postalCode"
                name="postalCode"
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                placeholder="ZIP / PIN"
                error={errors.postalCode}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 border-t border-[var(--border-color)]">
            <div>
              <CustomSelector
                label="Blood Group"
                placeholder="Select blood group..."
                value={formData.bloodGroup}
                onChange={(val) => setFormData({ ...formData, bloodGroup: val })}
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
                onChange={(val) => setFormData({ ...formData, maritalStatus: val })}
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
                onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                placeholder="e.g. Aadhaar / SSN"
                helperText="Encrypted with AES-256 before storage."
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION 4: LOGIN ACCOUNT (OPTIONAL) ─── */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={Shield}
            title="Link System Login Account (Optional)"
            description="Independent login credentials. Employees can exist with or without a system login."
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
            iconBorder="border-purple-500/20"
          />

          <div className="max-w-md">
            <CustomSelector
              label="Select User Account"
              placeholder="Search user account by name or email..."
              value={formData.userId}
              onChange={(val) => setFormData({ ...formData, userId: val })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.displayName || u.email} (${u.email})`,
              }))}
              disabled={loadingUsers}
              isSearchable={true}
              isClearable={true}
              helperText="You can also link or unlink a user account anytime from the employee profile."
            />
          </div>
        </div>

        {/* ─── FOOTER ACTIONS MATCHING BRANCHFORM ─── */}
        <div className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-primary-500/25 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Onboarding...' : 'Complete Onboarding'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default StaffCreatePage;
