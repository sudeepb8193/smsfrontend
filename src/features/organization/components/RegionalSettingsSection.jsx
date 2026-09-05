import { useState, useEffect } from 'react';
import {
  Globe,
  DollarSign,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { CurrencyChangeConfirmModal } from './CurrencyChangeConfirmModal';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { Button } from '../../../components/common/Button/Button';
import { Loader } from '../../../components/common/Loader/Loader';

export const RegionalSettingsSection = ({ organizationId, isReadOnly }) => {
  const [formData, setFormData] = useState({
    defaultCurrencyCode: 'USD',
    currencySymbolPosition: 'prefix',
    currencyDecimalPlaces: 2,
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '12h',
    firstDayOfWeek: 'monday',
    languageCode: 'en',
    fiscalYearStartMonth: 1,
  });

  const [initialCurrency, setInitialCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetCurrency: '' });

  const loadSettings = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await organizationApi.getSettings(organizationId);
      if (data) {
        setFormData({
          defaultCurrencyCode: data.defaultCurrencyCode || 'USD',
          currencySymbolPosition: data.currencySymbolPosition || 'prefix',
          currencyDecimalPlaces: data.currencyDecimalPlaces ?? 2,
          timezone: data.timezone || 'UTC',
          dateFormat: data.dateFormat || 'YYYY-MM-DD',
          timeFormat: data.timeFormat || '12h',
          firstDayOfWeek: data.firstDayOfWeek || 'monday',
          languageCode: data.languageCode || 'en',
          fiscalYearStartMonth: data.fiscalYearStartMonth || 1,
        });
        setInitialCurrency(data.defaultCurrencyCode || 'USD');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load regional settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) loadSettings();
  }, [organizationId]);

  const executeSave = async (payload, hasTx = false) => {
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await organizationApi.updateSettings(organizationId, payload, hasTx);
      setInitialCurrency(updated.defaultCurrencyCode);
      setFeedback({ type: 'success', message: 'Regional settings updated successfully!' });
    } catch (err) {
      if (err.data?.requiresConfirmation || err.message?.includes('requires explicit confirmation')) {
        setConfirmModal({ isOpen: true, targetCurrency: payload.defaultCurrencyCode });
      } else {
        setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSave(formData, false);
  };

  const handleConfirmedCurrencyChange = (confirmCode) => {
    setConfirmModal({ isOpen: false, targetCurrency: '' });
    const payload = {
      ...formData,
      confirmCurrencyChange: true,
      confirmCurrencyCode: confirmCode,
    };
    executeSave(payload, true);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-xs">
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {loading ? (
        <Loader text="Loading regional settings..." size="large" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency Settings Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Currency & Financial Formatting</h3>
                <p className="text-xs text-[var(--text-muted)]">Default transaction currency, decimal precision, and symbol position</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Default Currency (ISO 4217)"
                disabled={isReadOnly}
                value={formData.defaultCurrencyCode}
                onChange={(e) => setFormData({ ...formData, defaultCurrencyCode: e.target.value })}
                options={[
                  { value: 'USD', label: 'USD ($ - US Dollar)' },
                  { value: 'EUR', label: 'EUR (€ - Euro)' },
                  { value: 'GBP', label: 'GBP (£ - British Pound)' },
                  { value: 'INR', label: 'INR (₹ - Indian Rupee)' },
                  { value: 'CAD', label: 'CAD ($ - Canadian Dollar)' },
                  { value: 'AUD', label: 'AUD ($ - Australian Dollar)' },
                  { value: 'AED', label: 'AED (د.إ - UAE Dirham)' },
                  { value: 'SAR', label: 'SAR (﷼ - Saudi Riyal)' },
                ]}
              />

              <Select
                label="Symbol Placement"
                disabled={isReadOnly}
                value={formData.currencySymbolPosition}
                onChange={(e) => setFormData({ ...formData, currencySymbolPosition: e.target.value })}
                options={[
                  { value: 'prefix', label: 'Prefix (e.g. $100.00)' },
                  { value: 'suffix', label: 'Suffix (e.g. 100.00 $)' },
                ]}
              />

              <Input
                label="Decimal Places (0-3)"
                type="number"
                min="0"
                max="3"
                disabled={isReadOnly}
                value={formData.currencyDecimalPlaces}
                onChange={(e) => setFormData({ ...formData, currencyDecimalPlaces: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          {/* Timezone & Localization Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Timezone & Localization</h3>
                <p className="text-xs text-[var(--text-muted)]">Display timezone, date/time format, and fiscal calendar year</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Display Timezone (IANA)"
                disabled={isReadOnly}
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                options={[
                  { value: 'UTC', label: 'UTC (Universal Time Coordinated)' },
                  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
                  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                ]}
              />

              <Select
                label="Date Display Format"
                disabled={isReadOnly}
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                options={[
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO standard)' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK/EU)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                ]}
              />

              <Select
                label="Time Format"
                disabled={isReadOnly}
                value={formData.timeFormat}
                onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                options={[
                  { value: '12h', label: '12-Hour (09:30 AM)' },
                  { value: '24h', label: '24-Hour (17:30)' },
                ]}
              />

              <Select
                label="First Day of Calendar Week"
                disabled={isReadOnly}
                value={formData.firstDayOfWeek}
                onChange={(e) => setFormData({ ...formData, firstDayOfWeek: e.target.value })}
                options={[
                  { value: 'monday', label: 'Monday' },
                  { value: 'sunday', label: 'Sunday' },
                ]}
              />

              <Select
                label="Fiscal Year Start Month"
                disabled={isReadOnly}
                value={formData.fiscalYearStartMonth}
                onChange={(e) => setFormData({ ...formData, fiscalYearStartMonth: parseInt(e.target.value, 10) })}
                options={[
                  { value: 1, label: 'January (Month 1)' },
                  { value: 4, label: 'April (Month 4)' },
                  { value: 7, label: 'July (Month 7)' },
                  { value: 10, label: 'October (Month 10)' },
                ]}
              />
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                icon={Sparkles}
                size="large"
              >
                Save Regional Preferences
              </Button>
            </div>
          )}
        </form>
      )}

      <CurrencyChangeConfirmModal
        isOpen={confirmModal.isOpen}
        targetCurrency={confirmModal.targetCurrency}
        onClose={() => setConfirmModal({ isOpen: false, targetCurrency: '' })}
        onConfirm={handleConfirmedCurrencyChange}
      />
    </div>
  );
};
