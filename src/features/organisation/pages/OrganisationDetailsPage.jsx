import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Building2,
  Edit,
  Settings2,
  Power,
  Trash2,
  Layers,
  Users,
  UserCheck,
  UsersRound,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Globe,
  MapPin,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchOrganisationDetails,
  updateOrganisationStatus,
  deleteOrganisation,
} from '../api/organisationApi';
import StatusChangeModal from '../components/StatusChangeModal';
import DeleteOrganisationModal from '../components/DeleteOrganisationModal';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';

const getLogoUrl = (logoUrl) => {
  if (!logoUrl || logoUrl.includes('key=undefined') || logoUrl.endsWith('undefined')) return '';
  if (
    logoUrl.startsWith('http://') ||
    logoUrl.startsWith('https://') ||
    logoUrl.startsWith('data:') ||
    logoUrl.startsWith('blob:')
  ) {
    return logoUrl;
  }
  const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
  const API_BASE = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;
  return `${API_BASE}/storage/file?key=${encodeURIComponent(logoUrl)}`;
};

export const OrganisationDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organisationId } = useParams();

  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | branches | users

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    targetStatus: null,
    loading: false,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    loading: false,
  });

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchOrganisationDetails(organisationId);
      setOrganisation(data);
    } catch (err) {
      console.error('Failed to fetch organisation details:', err);
      toast.error(err.message || 'Failed to fetch organisation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organisationId) {
      loadData();
    }
  }, [organisationId]);

  const handleConfirmStatusChange = async (newStatus) => {
    setStatusModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await updateOrganisationStatus(organisationId, newStatus);
      toast.success(res.message || `Organisation ${newStatus} successfully.`);
      setStatusModal({ isOpen: false, targetStatus: null, loading: false });
      loadData();
    } catch (err) {
      console.error('Failed status change:', err);
      toast.error(err.message || 'Failed to update status');
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteModal({ isOpen: true, loading: true });
    try {
      await deleteOrganisation(organisationId);
      toast.success('Organisation deleted successfully.');
      setDeleteModal({ isOpen: false, loading: false });
      navigate('/super-admin/organisations');
    } catch (err) {
      console.error('Failed to delete organisation:', err);
      toast.error(err.message || 'Failed to delete organisation');
      setDeleteModal({ isOpen: false, loading: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-3" />
        <p className="text-sm font-semibold tracking-wide uppercase text-[var(--text-muted)]">
          Loading Organisation Profile...
        </p>
      </div>
    );
  }

  if (!organisation) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-12 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Organisation Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          The requested organisation could not be retrieved or has been removed.
        </p>
        <button
          onClick={() => navigate('/super-admin/organisations')}
          className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
        >
          Back to Organisations
        </button>
      </div>
    );
  }

  const owner = organisation.users?.[0];
  const address = organisation.organizationAddresses?.[0];
  const sub = organisation.subscription;
  const stats = organisation.stats || {
    totalBranches: organisation.branches?.length || 0,
    totalUsers: organisation.users?.length || 0,
    totalStaff: 0,
    totalCustomers: 0,
    totalAppointments: 0,
  };

  return (
    <div className="space-y-8 pb-16">

      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <div className="flex items-center gap-3">
            {(organisation.logoSquareUrl || organisation.logoUrl) ? (
              <img
                src={getLogoUrl(organisation.logoSquareUrl || organisation.logoUrl)}
                alt={organisation.name}
                className="w-12 h-12 rounded-xl object-cover border border-[var(--border-color)] bg-[var(--bg-input)] shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 items-center justify-center font-bold text-lg shrink-0 ${
                organisation.logoUrl ? 'hidden' : 'flex'
              }`}
            >
              {organisation.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  {organisation.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-md border border-[var(--border-color)]">
                  {organisation.code}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                    organisation.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : organisation.status === 'suspended'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  ● {organisation.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5">
                {organisation.businessType?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/super-admin/organisations/${organisationId}/setup`)}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Complete Setup
          </button>
          <button
            onClick={() => navigate(`/super-admin/organisations/${organisationId}/edit`)}
            className="px-4 py-2 bg-[var(--bg-input)] hover:bg-white/10 text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-4 h-4 text-amber-500" />
            Edit Organisation
          </button>

          {organisation.status === 'active' ? (
            <button
              onClick={() => setStatusModal({ isOpen: true, targetStatus: 'inactive', loading: false })}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => setStatusModal({ isOpen: true, targetStatus: 'active', loading: false })}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              Activate
            </button>
          )}

          <button
            onClick={() => setDeleteModal({ isOpen: true, loading: false })}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Organisation
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Branches</span>
            <Layers className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalBranches}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Users</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalUsers}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff</span>
            <UsersRound className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalStaff}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalCustomers}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Appointments</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalAppointments}
          </div>
        </div>
      </div>

      {/* MAIN GRID OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Underline Tabs */}
          <UnderlineTabs
            tabs={[
              { id: 'overview', label: 'Overview & Contact', icon: Building2 },
              { id: 'branches', label: 'Branches', icon: Layers, count: organisation.branches?.length || 0 },
              { id: 'users', label: 'Users & Roles', icon: Users, count: organisation.users?.length || 0 },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-4"
          />

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-500" />
                  Organisation Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl">
                    <span className="text-xs text-[var(--text-muted)] block mb-0.5">Business Type</span>
                    <span className="font-semibold text-[var(--text-primary)] capitalize">
                      {organisation.businessType?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl">
                    <span className="text-xs text-[var(--text-muted)] block mb-0.5">Created Date</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {new Date(organisation.createdAt).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                    <div>
                      <span className="text-xs text-[var(--text-muted)] block">Email</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {organisation.email || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                    <div>
                      <span className="text-xs text-[var(--text-muted)] block">Phone</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {organisation.phone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {organisation.website && (
                    <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl flex items-center gap-3 md:col-span-2">
                      <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                      <div>
                        <span className="text-xs text-[var(--text-muted)] block">Website</span>
                        <a
                          href={organisation.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-primary-500 hover:underline"
                        >
                          {organisation.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {address && (
                    <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                      <div>
                        <span className="text-xs text-[var(--text-muted)] block mb-0.5">Registered Address</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {address.addressLine1}, {address.city}, {address.state}, {address.country} - {address.postalCode}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHES */}
          {activeTab === 'branches' && (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">
                Organisation Branches
              </h3>

              {!organisation.branches || organisation.branches.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No branches created yet for this organisation.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {organisation.branches.map((b) => (
                    <div key={b.id} className="py-3.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">
                          {b.name} <span className="font-mono text-xs text-[var(--text-muted)]">({b.code})</span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] capitalize">
                          Type: {b.branchType || 'standard'}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {b.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 'users' && (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">
                Users & Roles
              </h3>

              {!organisation.users || organisation.users.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found for this organisation.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {organisation.users.map((u) => {
                    const roleName = u.userRolesAssignedToMe?.[0]?.role?.name || 'Staff';
                    return (
                      <div key={u.id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">
                            {u.displayName}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {u.email} {u.phoneNumber ? `• ${u.phoneNumber}` : ''}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary-500/10 text-primary-500 border border-primary-500/20">
                          {roleName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Owner & Subscription Cards */}
        <div className="space-y-6">
          {/* Owner Account Card */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              Organisation Owner
            </h3>

            {owner ? (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl">
                  <span className="text-xs text-[var(--text-muted)] block">Owner Name</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {owner.displayName}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  <div>
                    <span className="text-xs text-[var(--text-muted)] block">Email</span>
                    <span className="font-semibold text-[var(--text-primary)] text-xs">
                      {owner.email}
                    </span>
                  </div>
                </div>

                {owner.phoneNumber && (
                  <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                    <div>
                      <span className="text-xs text-[var(--text-muted)] block">Phone</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {owner.phoneNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No owner assigned</p>
            )}
          </div>

          {/* Subscription Card */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              Subscription Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-primary-400 font-semibold block">Plan Name</span>
                  <span className="font-bold text-primary-400 text-base">
                    {sub?.planName || 'Basic Plan'}
                  </span>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-primary-500 text-white uppercase">
                  {sub?.status || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl">
                  <span className="text-[var(--text-muted)] block">Max Branches</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm">
                    {sub?.maxBranches || 1}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl">
                  <span className="text-[var(--text-muted)] block">Max Users</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm">
                    {sub?.maxUsers || 5}
                  </span>
                </div>
              </div>

              {sub?.startDate && (
                <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs">
                  <span className="text-[var(--text-muted)] block mb-0.5">Start Date</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, targetStatus: null, loading: false })}
        onConfirm={handleConfirmStatusChange}
        organisation={organisation}
        targetStatus={statusModal.targetStatus}
        loading={statusModal.loading}
      />

      <DeleteOrganisationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, loading: false })}
        onConfirm={handleConfirmDelete}
        organisation={organisation}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default OrganisationDetailsPage;
