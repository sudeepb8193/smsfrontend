import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import Modal from '../../../components/shared/Modal';
import Input from '../../../components/shared/Input';
import CustomSelector from '../../../components/shared/CustomSelector';
import { MediaUpload } from '../../../components/shared/MediaUpload';
import StaffStatusBadge from '../components/StaffStatusBadge';
import AddEmergencyContactModal from '../components/modals/AddEmergencyContactModal';
import AddQualificationModal from '../components/modals/AddQualificationModal';
import UploadDocumentModal from '../components/modals/UploadDocumentModal';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchMyProfile,
  updateMyProfile,
} from '../api/staffApi';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  FileText,
  Sparkles,
  Scissors,
  Edit2,
  Plus,
  UserCheck,
  ExternalLink,
  Camera,
} from 'lucide-react';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'contacts', label: 'Contact Details', icon: Phone },
  { id: 'emergency', label: 'Emergency Contacts', icon: Users },
  { id: 'employment', label: 'Employment History', icon: Briefcase },
  { id: 'skills', label: 'Skills & Qualifications', icon: Award },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'branches', label: 'My Branches', icon: Building2 },
];

export default function StaffSelfProfilePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'personal';

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    gender: 'prefer_not_to_say',
    profilePhotoUrl: '',
    personalPhone: '',
    personalEmail: '',
    addressLine1: '',
    city: '',
    postalCode: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyProfile();
      setStaff(data);
      if (data) {
        setEditFormData({
          fullName: data.fullName || '',
          gender: data.gender || 'prefer_not_to_say',
          profilePhotoUrl: data.profilePhotoUrl || '',
          personalPhone: data.contacts?.personalPhone || data.user?.phoneNumber || data.user?.phone || '',
          personalEmail: data.contacts?.personalEmail || data.user?.email || '',
          addressLine1: data.contacts?.addressLine1 || '',
          city: data.contacts?.city || '',
          postalCode: data.contacts?.postalCode || '',
        });
      }
    } catch (err) {
      console.error('Failed to load my staff profile:', err);
      setError(err?.message || 'Unable to retrieve your employee profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!staff) return;

    const errors = {};
    if (!editFormData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setSavingEdit(true);
      setEditErrors({});
      // Update staff profile and contacts atomically
      await updateMyProfile({
        fullName: editFormData.fullName.trim(),
        gender: editFormData.gender,
        profilePhotoUrl: editFormData.profilePhotoUrl || undefined,
        personalPhone: editFormData.personalPhone || undefined,
        personalEmail: editFormData.personalEmail || undefined,
        addressLine1: editFormData.addressLine1 || undefined,
        city: editFormData.city || undefined,
        postalCode: editFormData.postalCode || undefined,
      });

      setIsEditProfileOpen(false);
      await loadProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setEditErrors({ general: err?.message || 'Failed to update profile.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const birth = new Date(dateOfBirth);
      if (isNaN(birth.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? age : null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader size="lg" message="Loading your employee profile..." />
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <EmptyState
          icon={User}
          title="Profile Not Found"
          description={error || "Your user account is not yet connected to an active employee record. Please contact your Salon Manager."}
          action={
            <Button variant="primary" onClick={loadProfile}>
              Retry Loading
            </Button>
          }
        />
      </div>
    );
  }

  // Derive real collections from API response
  const emergencyContacts = staff.emergencyContacts || staff.staffEmergencyContacts || [];
  const primaryEmergency = emergencyContacts.find((c) => c.priority === 'primary') || emergencyContacts[0];
  const employmentHistory = staff.employmentHistory || staff.staffEmploymentHistory || [];
  const currentEmployment = staff.currentEmployment || employmentHistory[0] || {};
  const qualifications = staff.qualifications || staff.staffQualifications || [];
  const documents = staff.documents || staff.staffDocuments || [];
  const branchAssignments = staff.branchAssignments || staff.staffBranchAssignments || [];

  const age = calculateAge(staff.dateOfBirth);
  const userInitials = staff.fullName
    ? staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  // Construct real address string from available fields
  const addressParts = [
    staff.contacts?.addressLine1,
    staff.contacts?.addressLine2,
    staff.contacts?.city,
    staff.contacts?.state,
    staff.contacts?.postalCode,
    staff.contacts?.countryCode,
  ].filter(Boolean);
  const displayAddress = addressParts.length > 0 ? addressParts.join(', ') : '—';

  const designation = currentEmployment.designation || staff.currentDesignation || '—';
  const department = currentEmployment.department || staff.currentDepartment || '—';
  const phone = staff.contacts?.personalPhone || user?.phoneNumber || user?.phone || '—';
  const email = staff.contacts?.personalEmail || user?.email || '—';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-500/15 via-primary-500/8 to-transparent p-6 sm:p-8 backdrop-blur-md shadow-sm">
        <div className="absolute right-4 -bottom-6 pointer-events-none opacity-10 hidden md:block">
          <Scissors size={180} className="text-primary-600 rotate-45 transform" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Avatar & Identity */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {staff.profilePhotoUrl ? (
                <img
                  src={staff.profilePhotoUrl}
                  alt={staff.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-primary-500/30 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-primary-500/30">
                  {userInitials}
                </div>
              )}
              <span
                className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] shadow-xs"
                title="Active Service Staff"
              />
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-md border-2 border-[var(--bg-card)] transition-transform hover:scale-110 cursor-pointer"
                title="Edit Profile Photo"
              >
                <Camera size={13} />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {staff.fullName}
                </h1>
                <StaffStatusBadge status={staff.employmentStatus} />
              </div>

              <p className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                <span>{designation}</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">
                  {staff.employeeCode || '—'}
                </span>
              </p>

              {staff.homeBranch?.name && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pt-0.5">
                  <MapPin size={13} className="text-primary-500 shrink-0" />
                  <span>{staff.homeBranch.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Info Pill Card & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-start md:self-center">
            <Link
              to="/staff/my-services"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-xs transition-all"
            >
              <Scissors size={14} />
              My Services & Skills
            </Link>

            <div className="flex items-center gap-3 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-2xl px-5 py-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">My Employee Info</div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Since {formatDate(staff.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-color)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-[var(--text-muted)]'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Content Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Personal Information */}
            <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    Personal Information
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit2}
                  onClick={() => setIsEditProfileOpen(true)}
                  className="rounded-xl text-xs"
                >
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pt-5">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Full Name</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">
                    {staff.fullName || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Employee ID</span>
                  <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400 mt-0.5 block">
                    {staff.employeeCode || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Designation</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">
                    {designation}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Department</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">
                    {department}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Date of Joining</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">
                    {formatDate(staff.createdAt || currentEmployment.joiningDate)}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Employment Status</span>
                  <div className="mt-1">
                    <StaffStatusBadge status={staff.employmentStatus} />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Gender</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] capitalize mt-0.5 block">
                    {staff.gender ? staff.gender.replace(/_/g, ' ') : '—'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">Date of Birth</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">
                    {staff.dateOfBirth
                      ? `${formatDate(staff.dateOfBirth)}${age ? ` (Age: ${age})` : ''}`
                      : '—'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 2: Contact Details */}
            <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Phone size={16} />
                  </div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    Contact Details
                  </h3>
                </div>
                {staff.contacts?.personalEmail && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    <CheckCircle2 size={12} />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              <div className="space-y-3.5 pt-5 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
                    <Phone size={14} className="text-primary-500" /> Mobile
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">{phone}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-[var(--border-color)] pt-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
                    <Mail size={14} className="text-primary-500" /> Email
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">{email}</span>
                </div>

                <div className="flex items-start justify-between py-1 border-t border-[var(--border-color)] pt-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2 shrink-0">
                    <MapPin size={14} className="text-primary-500" /> Address
                  </span>
                  <span className="font-bold text-[var(--text-primary)] text-right max-w-xs">
                    {displayAddress}
                  </span>
                </div>

                {staff.contacts?.bloodGroup && (
                  <div className="flex items-center justify-between py-1 border-t border-[var(--border-color)] pt-3">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Blood Group</span>
                    <span className="font-bold text-[var(--text-primary)]">{staff.contacts.bloodGroup}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Row with Emergency Contact & Account Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Emergency Contact */}
              <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                      Emergency Contact
                    </h3>
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={Edit2}
                    onClick={() => setIsEmergencyModalOpen(true)}
                    className="text-xs text-primary-600"
                  >
                    {primaryEmergency ? 'Edit' : 'Add'}
                  </Button>
                </div>

                {primaryEmergency ? (
                  <div className="space-y-2.5 pt-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] font-medium">Name</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {primaryEmergency.contactName || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] font-medium">Relationship</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {primaryEmergency.relationship || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] font-medium">Phone</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {primaryEmergency.phoneNumber || primaryEmergency.phone || '—'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-[var(--text-muted)] italic">
                    No emergency contact recorded
                  </div>
                )}
              </Card>

              {/* Account Information */}
              <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                      Account Info
                    </h3>
                  </div>
                  <Badge variant={staff.userId || staff.user ? 'success' : 'secondary'} size="xs">
                    {staff.userId || staff.user ? 'Linked' : 'Unlinked'}
                  </Badge>
                </div>

                <div className="space-y-2.5 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-medium">Login User</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {user?.email || staff.user?.email || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-medium">System Role</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {user?.role || 'Service Staff'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-medium">Last Login</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {staff.user?.lastLoginAt ? formatDate(staff.user.lastLoginAt) : 'Active now'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Profile Summary Sidecard */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)] text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                {staff.profilePhotoUrl ? (
                  <img
                    src={staff.profilePhotoUrl}
                    alt={staff.fullName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-500/20 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold text-3xl shadow-md ring-4 ring-primary-500/20 mx-auto">
                    {userInitials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-md border-2 border-[var(--bg-card)] transition-transform hover:scale-110 cursor-pointer"
                  title="Edit Profile Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
                {staff.fullName}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">
                {designation}
              </p>

              <div className="flex justify-center mt-2.5">
                <StaffStatusBadge status={staff.employmentStatus} />
              </div>

              <div className="border-t border-[var(--border-color)] my-5 pt-4 text-left space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                  <Calendar size={15} className="text-primary-500 shrink-0" />
                  <span>Joined: <strong className="text-[var(--text-primary)]">{formatDate(staff.createdAt)}</strong></span>
                </div>

                {staff.homeBranch?.name && (
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <Building2 size={15} className="text-primary-500 shrink-0" />
                    <span>Branch: <strong className="text-[var(--text-primary)]">{staff.homeBranch.name}</strong></span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2 font-semibold">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Skills & Specialties:</span>
                  </div>
                  {qualifications.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {qualifications.map((q) => (
                        <span
                          key={q.id || q.title}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-primary)]"
                        >
                          {q.title}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                icon={Edit2}
                className="w-full rounded-2xl py-2.5 font-bold shadow-xs flex items-center justify-center gap-2"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <span>Edit Profile</span>
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Details */}
      {activeTab === 'contacts' && (
        <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Contact Details</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Your direct communication channels and verified contact addresses.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={Edit2}
              onClick={() => setIsEditProfileOpen(true)}
              className="rounded-xl text-xs"
            >
              Update Contacts
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-3">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-wider">
                <Phone size={14} /> Mobile Phone
              </div>
              <p className="text-base font-extrabold text-[var(--text-primary)]">{phone}</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-3">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-wider">
                <Mail size={14} /> Email Address
              </div>
              <p className="text-base font-extrabold text-[var(--text-primary)]">{email}</p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-wider">
                <MapPin size={14} /> Residential / Postal Address
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{displayAddress}</p>
            </div>

            {staff.contacts?.bloodGroup && (
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] block">Blood Group</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{staff.contacts.bloodGroup}</span>
              </div>
            )}

            {staff.contacts?.maritalStatus && (
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] block">Marital Status</span>
                <span className="text-sm font-bold text-[var(--text-primary)] capitalize">
                  {staff.contacts.maritalStatus.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Emergency Contacts */}
      {activeTab === 'emergency' && (
        <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Emergency Contacts</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Contacts reached during an urgent medical or workplace emergency.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsEmergencyModalOpen(true)}
              className="rounded-xl text-xs"
            >
              Add Contact
            </Button>
          </div>

          {emergencyContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[var(--text-primary)]">
                        {contact.contactName}
                      </span>
                      {contact.relationship && (
                        <Badge variant="primary" size="xs">
                          {contact.relationship}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-mono font-semibold">
                      {contact.phoneNumber || contact.phone || '—'}
                    </p>
                    {contact.email && (
                      <p className="text-xs text-[var(--text-muted)]">{contact.email}</p>
                    )}
                  </div>
                  {contact.priority && (
                    <Badge variant="secondary" size="xs">
                      {contact.priority}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] italic">
              No emergency contacts recorded yet. Click 'Add Contact' to add one.
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Employment History */}
      {activeTab === 'employment' && (
        <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
          <div className="pb-4 border-b border-[var(--border-color)] mb-6">
            <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Employment History</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Career progression, internal designations, and department placements.
            </p>
          </div>

          {employmentHistory.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-color)]">
              {employmentHistory.map((hist, idx) => (
                <div key={hist.id || idx} className="relative">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-500/20" />
                  <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                        {hist.designation || 'Staff Member'}
                      </h4>
                      {hist.employmentType && (
                        <Badge variant="primary" size="xs">
                          {hist.employmentType.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    {hist.department && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Department: {hist.department}
                      </p>
                    )}
                    <p className="text-xs font-mono text-primary-600 dark:text-primary-400 mt-2">
                      Effective From: {formatDate(hist.effectiveFrom || hist.joiningDate || hist.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] italic">
              No employment history records found.
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Skills & Qualifications */}
      {activeTab === 'skills' && (
        <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Skills & Qualifications</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Certified credentials, styling diplomas, and verified professional skills.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsQualificationModalOpen(true)}
              className="rounded-xl text-xs"
            >
              Add Credential
            </Button>
          </div>

          {qualifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualifications.map((qual, idx) => (
                <div
                  key={qual.id || idx}
                  className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{qual.title}</h4>
                    {qual.recordType && (
                      <Badge variant="secondary" size="xs">
                        {qual.recordType.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  {qual.issuingInstitution && (
                    <p className="text-xs text-[var(--text-muted)]">{qual.issuingInstitution}</p>
                  )}
                  {qual.certificateNumber && (
                    <p className="text-xs font-mono text-[var(--text-secondary)]">
                      Cert #: {qual.certificateNumber}
                    </p>
                  )}
                  {qual.documentUrl && (
                    <a
                      href={qual.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline pt-1 font-semibold"
                    >
                      <ExternalLink size={12} />
                      <span>View Credential Document</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] italic">
              No qualifications or skills on record. Click 'Add Credential' to add one.
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Documents */}
      {activeTab === 'documents' && (
        <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Employee Documents</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Uploaded identity proofs, employment agreements, and credential attachments.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsDocumentModalOpen(true)}
              className="rounded-xl text-xs"
            >
              Upload Document
            </Button>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                        {doc.fileName || doc.title || 'Document'}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        Category: {(doc.category || doc.documentType || 'general').replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 inline-flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>View</span>
                    </a>
                  ) : (
                    <Badge variant="secondary" size="xs">{doc.status || 'Active'}</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] italic">
              No documents uploaded yet. Click 'Upload Document' to add one.
            </div>
          )}
        </Card>
      )}

      {/* Tab 7: My Branches */}
      {activeTab === 'branches' && (
        <Card className="p-6 border border-[var(--border-color)] shadow-xs rounded-3xl bg-[var(--bg-card)]">
          <div className="pb-4 border-b border-[var(--border-color)] mb-6">
            <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Assigned Salon Branches</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Your registered home branch and any permitted multi-branch assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Branch */}
            {staff.homeBranch ? (
              <div className="p-5 rounded-2xl border-2 border-primary-500/30 bg-[var(--bg-input)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-primary-600" />
                    <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                      {staff.homeBranch.name}
                    </h4>
                  </div>
                  <Badge variant="primary" size="xs">Home Branch</Badge>
                </div>
                {staff.homeBranch.code && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Branch Code: {staff.homeBranch.code}
                  </p>
                )}
                <p className="text-xs text-[var(--text-secondary)]">
                  Primary station for salon operations and roster appointments.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-muted)] italic">
                No home branch assigned.
              </div>
            )}

            {/* Secondary Branch Assignments */}
            {branchAssignments.map((assignment, idx) => (
              <div
                key={assignment.id || idx}
                className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[var(--text-muted)]" />
                    <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                      {assignment.branch?.name || 'Assigned Branch'}
                    </h4>
                  </div>
                  <Badge variant="secondary" size="xs">Secondary</Badge>
                </div>
                {assignment.branch?.code && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Code: {assignment.branch.code}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <Modal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          title="Edit My Profile"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                loading={savingEdit}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
            {editErrors.general && (
              <div className="p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-xs text-danger-500 font-semibold">
                {editErrors.general}
              </div>
            )}

            <div>
              <MediaUpload
                label="Profile Photo"
                helperText="Upload employee headshot • PNG, JPG up to 5 MB"
                value={editFormData.profilePhotoUrl}
                onChange={(url) => setEditFormData((prev) => ({ ...prev, profilePhotoUrl: url }))}
                folder="staff"
                aspectRatio="square"
              />
            </div>

            <Input
              label="Full Name"
              value={editFormData.fullName}
              onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              error={editErrors.fullName}
            />

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Gender
              </label>
              <CustomSelector
                options={[
                  { label: 'Female', value: 'female' },
                  { label: 'Male', value: 'male' },
                  { label: 'Non Binary', value: 'non_binary' },
                  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
                ]}
                value={editFormData.gender}
                onChange={(val) => setEditFormData({ ...editFormData, gender: val })}
              />
            </div>

            <Input
              label="Mobile Phone"
              value={editFormData.personalPhone}
              onChange={(e) => setEditFormData({ ...editFormData, personalPhone: e.target.value })}
              placeholder="e.g. +91 81237 02812"
            />

            <Input
              label="Personal Email"
              type="email"
              value={editFormData.personalEmail}
              onChange={(e) => setEditFormData({ ...editFormData, personalEmail: e.target.value })}
              placeholder="name@example.com"
            />

            <Input
              label="Address"
              value={editFormData.addressLine1}
              onChange={(e) => setEditFormData({ ...editFormData, addressLine1: e.target.value })}
              placeholder="Street or house address"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                placeholder="City"
              />
              <Input
                label="Postal Code"
                value={editFormData.postalCode}
                onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                placeholder="PIN / Postal Code"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Reusable Modals */}
      {isEmergencyModalOpen && (
        <AddEmergencyContactModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          staffId={staff.id}
          onSuccess={loadProfile}
        />
      )}

      {isQualificationModalOpen && (
        <AddQualificationModal
          isOpen={isQualificationModalOpen}
          onClose={() => setIsQualificationModalOpen(false)}
          staffId={staff.id}
          onSuccess={loadProfile}
        />
      )}

      {isDocumentModalOpen && (
        <UploadDocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          staffId={staff.id}
          onSuccess={loadProfile}
        />
      )}
    </div>
  );
}
