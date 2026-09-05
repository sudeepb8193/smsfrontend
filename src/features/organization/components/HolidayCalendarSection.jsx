import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Repeat,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Slash,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { AddHolidayModal } from './AddHolidayModal';
import { Input } from '../../../components/common/Input/Input';
import { Button } from '../../../components/common/Button/Button';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const HolidayCalendarSection = ({ organizationId, isReadOnly }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [dateChecker, setDateChecker] = useState({ date: '', result: null, checking: false });

  const loadHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationApi.getHolidays(organizationId);
      setHolidays(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) loadHolidays();
  }, [organizationId]);

  const handleCancelHoliday = async (holidayId) => {
    if (!window.confirm('Cancel this holiday? Historical record will be preserved.')) return;
    try {
      await organizationApi.cancelHoliday(organizationId, holidayId);
      loadHolidays();
    } catch (err) {
      alert(err.message || 'Failed to cancel holiday');
    }
  };

  const handleSingleYearOverride = async (holidayId) => {
    const yearStr = window.prompt('Enter the year to cancel this recurring holiday for (e.g. 2027):');
    if (!yearStr) return;
    const year = parseInt(yearStr, 10);
    if (isNaN(year)) return;
    try {
      await organizationApi.overrideHolidayYear(organizationId, holidayId, year, true);
      loadHolidays();
    } catch (err) {
      alert(err.message || 'Failed to cancel recurring holiday for single year');
    }
  };

  const handleCheckDate = async (e) => {
    e.preventDefault();
    if (!dateChecker.date) return;
    setDateChecker((prev) => ({ ...prev, checking: true, result: null }));
    try {
      const res = await organizationApi.checkHolidayDate(organizationId, dateChecker.date);
      setDateChecker((prev) => ({ ...prev, checking: false, result: res }));
    } catch (err) {
      setDateChecker((prev) => ({ ...prev, checking: false, result: { isHoliday: false, reason: 'Error checking date' } }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary-500" />
            Organization Holiday Calendar
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Configure recurring annual holidays, branch-specific closures, and single-year overrides
          </p>
        </div>
        {!isReadOnly && (
          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
            size="medium"
          >
            Add Holiday
          </Button>
        )}
      </div>

      {/* Date Checker Helper Tool */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
        <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Search size={14} className="text-primary-500" />
          Effective Holiday Resolution Date Inspector
        </h4>
        <form onSubmit={handleCheckDate} className="flex gap-3 items-end">
          <Input
            type="date"
            required
            value={dateChecker.date}
            onChange={(e) => setDateChecker({ ...dateChecker, date: e.target.value })}
          />
          <Button
            type="submit"
            variant="secondary"
            loading={dateChecker.checking}
            size="medium"
          >
            Inspect Date
          </Button>
        </form>

        {dateChecker.result && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              dateChecker.result.isHoliday
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
            }`}
          >
            {dateChecker.result.isHoliday ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>
              {dateChecker.result.isHoliday
                ? `CLOSED for Holiday: ${dateChecker.result.reason}`
                : 'OPEN (No active holiday closure)'}
            </span>
          </div>
        )}
      </div>

      {/* Upcoming Holidays List */}
      {loading ? (
        <Loader text="Loading holiday calendar..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : holidays.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No holidays configured"
          description="Add organization-wide or branch holidays to block booking slots."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holidays.map((h) => (
            <div
              key={h.id}
              className={`p-5 rounded-2xl bg-[var(--bg-card)] border transition space-y-4 ${
                h.status === 'cancelled'
                  ? 'border-rose-500/20 opacity-50'
                  : 'border-[var(--border-color)] hover:border-primary-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{h.name}</h4>
                    {h.isRecurringAnnually && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Repeat size={10} /> Recurring Annually
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    {new Date(h.holidayDate).toISOString().split('T')[0]}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    h.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {h.status}
                </span>
              </div>

              {h.description && <p className="text-xs text-[var(--text-secondary)]">{h.description}</p>}

              {h.overrides && h.overrides.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-amber-600 dark:text-amber-300">
                  Single-year cancellations: {h.overrides.filter((o) => o.isCancelled).map((o) => o.year).join(', ')}
                </div>
              )}

              {!isReadOnly && h.status === 'active' && (
                <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
                  {h.isRecurringAnnually && (
                    <button
                      type="button"
                      onClick={() => handleSingleYearOverride(h.id)}
                      className="flex-1 py-1.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Slash size={12} /> Override Single Year
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCancelHoliday(h.id)}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <XCircle size={12} /> Cancel Holiday
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddHolidayModal
        orgId={organizationId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadHolidays}
      />
    </div>
  );
};
