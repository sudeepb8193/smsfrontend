import React, { useState, useEffect } from 'react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import Loader from '../../../components/shared/Loader';
import { fetchMyProfile } from '../api/staffApi';
import { Calendar, Clock, Coffee } from 'lucide-react';

export default function StaffSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [scheduleDays, setScheduleDays] = useState([]);

  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true);
        const data = await fetchMyProfile();
        // Extract real weekly schedules if configured on the staff object
        const realSchedules = data?.weeklySchedules || [];
        setScheduleDays(realSchedules);
      } catch (err) {
        console.error('Failed to load schedule:', err);
        setScheduleDays([]);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader size="lg" message="Loading your schedule..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-500/15 via-primary-500/8 to-transparent p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            My Schedule & Shifts
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Weekly roster, operational branch hours, and scheduled break intervals.
          </p>
        </div>
        <Badge variant="primary">Current Roster</Badge>
      </div>

      {/* Days Grid or Clean Empty State */}
      {scheduleDays.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scheduleDays.map((item) => (
            <div
              key={item.day || item.dayOfWeek}
              className={`p-5 rounded-3xl border shadow-xs transition-all ${
                item.isOff
                  ? 'bg-[var(--bg-input)] border-[var(--border-color)] opacity-70'
                  : 'bg-[var(--bg-card)] border-primary-500/30 ring-1 ring-primary-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{item.day}</h3>
                <Badge variant={item.isOff ? 'secondary' : 'primary'} size="xs">
                  {item.status || (item.isOff ? 'Off' : 'Working')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] mt-3">
                {item.isOff ? (
                  <Coffee size={14} className="text-[var(--text-muted)]" />
                ) : (
                  <Clock size={14} className="text-primary-500" />
                )}
                <span>{item.hours}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs">
          <EmptyState
            icon={Clock}
            title="No Weekly Shifts Configured"
            description="Your branch manager has not yet published an active weekly shift schedule for your staff profile. Once published, your scheduled working hours and off days will appear here."
          />
        </Card>
      )}
    </div>
  );
}
