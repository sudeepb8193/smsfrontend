import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import Card from '../components/shared/Card';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import DatePicker from '../components/shared/DatePicker';
import TimePicker from '../components/shared/TimePicker';
import CustomSelector from '../components/shared/CustomSelector';  
import Input from '../components/shared/Input';
import DataTable from '../components/tables/DataTable/DataTable';
import { useAuth } from '../hooks/useAuth';
import {
  Calendar,
  DollarSign,
  Users,
  Scissors,
  Plus,
  Filter,
  Globe,
  Store,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { user } = useAuth();

  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Operating Mode context
  const organization = user?.organization;
  const operatingMode = organization?.operatingMode || 'INDIVIDUAL_WEBSITE';
  const isIndividualWebsite = operatingMode === 'INDIVIDUAL_WEBSITE';
  const isCentralMarketplace = operatingMode === 'CENTRAL_MARKETPLACE';
  const listingStatus = organization?.marketplaceListingStatus || 'draft';
  const orgCode = organization?.code?.toLowerCase() || 'salon';
  const directBookingUrl = `https://${orgCode}.salonflowpro.com/book`;
  const marketplaceUrl = `https://salons.salonflowpro.com/explore/${orgCode}`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // New Appointment Form state
  const [form, setForm] = useState({
    customerName: '',
    serviceId: '',
    staffId: '',
    appointmentDate: '',
    appointmentTime: '',
  });

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });


  const recentAppointments = [
    { id: '1', customer: 'Emma Watson', service: 'Hair Styling & Color', staff: 'Sarah Jenkins', time: '10:30 AM', amount: '$120.00', status: 'Completed' },
    { id: '2', customer: 'Liam Hemsworth', service: 'Beard Trim & Facial', staff: 'David Miller', time: '11:45 AM', amount: '$65.00', status: 'In Progress' },
    { id: '3', customer: 'Olivia Rodrigo', service: 'Manicure & Pedicure', staff: 'Jessica Alba', time: '01:15 PM', amount: '$85.00', status: 'Scheduled' },
    { id: '4', customer: 'Noah Centineo', service: 'Men Haircut', staff: 'David Miller', time: '02:30 PM', amount: '$45.00', status: 'Scheduled' },
  ];

  const serviceOptions = [
    { value: '1', label: 'Haircut & Styling', badge: '$50' },
    { value: '2', label: 'Beard Trim & Grooming', badge: '$35' },
    { value: '3', label: 'Manicure & Spa Pedicure', badge: '$75' },
    { value: '4', label: 'Full Hair Coloring & Wash', badge: '$120' },
  ];

  const staffOptions = [
    { value: '1', label: 'Sarah Jenkins (Master Stylist)' },
    { value: '2', label: 'David Miller (Barber Specialist)' },
    { value: '3', label: 'Jessica Alba (Nail Technician)' },
  ];

  const statusOptions = [
    { value: 'Completed', label: 'Completed' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Scheduled', label: 'Scheduled' },
  ];

  const columns = [
    { header: 'Customer', accessor: 'customer' },
    { header: 'Service', accessor: 'service' },
    { header: 'Stylist', accessor: 'staff' },
    { header: 'Time', accessor: 'time' },
    { header: 'Amount', accessor: 'amount' },
    {
      header: 'Status',
      cell: (row) => {
        const variant =
          row.status === 'Completed'
            ? 'success'
            : row.status === 'In Progress'
            ? 'warning'
            : 'primary';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      <PageHeader
        title={`Hello, ${user?.displayName || 'Admin'}! 👋`}
        description={`Welcome to SalonFlow Pro Dashboard — ${todayDisplay}`}
        action={
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Appointment
          </Button>
        }
      />

      {/* Mode-Aware Operational Channels Banner */}
      {organization ? (
        <div
          className={`rounded-2xl border p-5 shadow-sm transition-all ${
            isIndividualWebsite
              ? 'bg-[var(--bg-card)] border-indigo-500/20'
              : 'bg-[var(--bg-card)] border-emerald-500/20'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl border shrink-0 ${
                  isIndividualWebsite
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isIndividualWebsite ? (
                  <Globe className="w-6 h-6" />
                ) : (
                  <Store className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {organization.name}
                  </h2>
                  {isIndividualWebsite ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Globe className="w-3 h-3" />
                      Individual Website Mode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Store className="w-3 h-3" />
                      Central Marketplace Mode
                    </span>
                  )}

                  {isCentralMarketplace && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        listingStatus === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : listingStatus === 'suspended'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {listingStatus === 'published' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Marketplace Listing: Published
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> Marketplace Listing: {listingStatus.toUpperCase()}
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                  {isIndividualWebsite
                    ? 'Operating under dedicated branding with a direct salon booking portal. Central marketplace discovery is completely disabled for this organisation, maintaining total brand exclusivity.'
                    : 'Operating under multi-channel discovery. Clients can discover and book your services both directly through your website and via the central marketplace directory.'}
                </p>
              </div>
            </div>

            {/* Quick Channel Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => copyToClipboard(directBookingUrl, 'Direct Booking Link')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-primary-500/40 transition-colors"
                title="Copy Direct Website Booking URL"
              >
                <Copy className="w-3.5 h-3.5 text-primary-400" />
                Direct Website Link
              </button>

              {isCentralMarketplace && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(marketplaceUrl, 'Marketplace Listing Link')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                  title="Copy Central Marketplace Profile URL"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  Marketplace Listing
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold mb-2">
            <span>Today's Revenue</span>
            <DollarSign size={18} className="text-primary-500" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">$2,590.00</div>
          <div className="text-xs text-emerald-500 font-bold mt-1">+12.5% from yesterday</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold mb-2">
            <span>Appointments</span>
            <Calendar size={18} className="text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">24</div>
          <div className="text-xs text-emerald-500 font-bold mt-1">+8 new today</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold mb-2">
            <span>Total Customers</span>
            <Users size={18} className="text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">1,254</div>
          <div className="text-xs text-emerald-500 font-bold mt-1">+25 this week</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold mb-2">
            <span>Active Staff</span>
            <Scissors size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">18</div>
          <div className="text-xs text-[var(--text-muted)] font-medium mt-1">On duty today</div>
        </Card>
      </div>

      {/* Interactive Filters Bar */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            <Filter size={16} className="text-primary-500" />
            <span>Filter Queue:</span>
          </div>

          <div className="w-48">
            <DatePicker
              placeholder="Filter by Date"
              value={filterDate}
              onChange={setFilterDate}
            />
          </div>

          <div className="w-56">
            <CustomSelector
              placeholder="Filter by Status"
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              isSearchable={false}
            />
          </div>

          {(filterDate || filterStatus) && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setFilterDate('');
                setFilterStatus('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Recent Appointments Table */}
      <Card
        title="Today's Appointments Queue"
        subtitle="Live queue of scheduled and completed client visits"
      >
        <DataTable
          columns={columns}
          data={recentAppointments.filter((item) => {
            if (filterStatus && item.status !== filterStatus) return false;
            return true;
          })}
        />
      </Card>

      {/* New Appointment Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Appointment"
        subtitle="Book a new service appointment for a salon client"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success('Appointment created successfully!');
            setIsModalOpen(false);
          }}
          className="space-y-4"
        >
          <Input
            label="Customer Name"
            placeholder="e.g. Selena Gomez"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />

          <CustomSelector
            label="Select Service"
            options={serviceOptions}
            placeholder="Choose salon service..."
            value={form.serviceId}
            onChange={(val) => setForm({ ...form, serviceId: val })}
          />

          <CustomSelector
            label="Assigned Stylist"
            options={staffOptions}
            placeholder="Assign staff member..."
            value={form.staffId}
            onChange={(val) => setForm({ ...form, staffId: val })}
          />

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Date"
              value={form.appointmentDate}
              onChange={(val) => setForm({ ...form, appointmentDate: val })}
            />
            <TimePicker
              label="Time Slot"
              value={form.appointmentTime}
              onChange={(val) => setForm({ ...form, appointmentTime: val })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
