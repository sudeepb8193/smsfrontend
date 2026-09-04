import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import Card from '../components/common/Card/Card';
import Badge from '../components/common/Badge/Badge';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import DatePicker from '../components/common/DatePicker/DatePicker';
import TimePicker from '../components/common/TimePicker/TimePicker';
import CustomSelector from '../components/common/CustomSelector/CustomSelector';
import Input from '../components/common/Input/Input';
import DataTable from '../components/tables/DataTable/DataTable';
import { useAuth } from '../hooks/useAuth';
import { Calendar, DollarSign, Users, Scissors, Plus, Filter } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold mb-2">
            <span>Today's Revenue</span>
            <DollarSign size={18} className="text-[#8A4A52]" />
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
            <Filter size={16} className="text-[#8A4A52]" />
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
            alert('Appointment created successfully!');
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
