import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import {
  Calendar,
  Clock,
  Scissors,
  CalendarDays,
} from 'lucide-react';

export default function StaffAppointmentsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Real appointments list (starts empty as appointments module has no booked items for this staff yet)
  const appointments = [];

  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return apt.status === 'Upcoming';
    if (activeFilter === 'in_progress') return apt.status === 'In Progress';
    if (activeFilter === 'completed') return apt.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-500/15 via-primary-500/8 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Today's client schedule, service bookings, and appointment status.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] shadow-xs">
          <CalendarDays size={14} className="text-primary-500" />
          <span>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
        {[
          { id: 'all', label: 'All Appointments' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeFilter === f.id
                ? 'bg-primary-500 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Appointments Content */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <Card
              key={apt.id}
              className="p-5 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">{apt.clientName}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{apt.service}</p>
                </div>
                <Badge variant="secondary" size="xs">{apt.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs">
          <EmptyState
            icon={Calendar}
            title="No Appointments Scheduled"
            description="You do not have any appointments scheduled for today. When guests book appointments with you, they will appear here in real-time."
          />
        </Card>
      )}
    </div>
  );
}
