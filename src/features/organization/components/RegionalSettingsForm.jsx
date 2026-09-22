import React, { useState, useEffect } from 'react';
import { Save, Globe } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Button from '../../../components/common/Button/Button';

export const RegionalSettingsForm = ({ settings, onSave, saving = false }) => {
  const [formData, setFormData] = useState({
    baseCurrencyCode: 'USD',
    baseCurrencySymbol: '$',
    currencySymbolPosition: 'prefix',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'h12',
    timeZone: 'UTC',
    firstDayOfWeek: 'monday',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        baseCurrencyCode: settings.baseCurrencyCode || 'USD',
        baseCurrencySymbol: settings.baseCurrencySymbol || '$',
        currencySymbolPosition: settings.currencySymbolPosition || 'prefix',
        dateFormat: settings.dateFormat || 'YYYY-MM-DD',
        timeFormat: settings.timeFormat || 'h12',
        timeZone: settings.timeZone || 'UTC',
        firstDayOfWeek: settings.firstDayOfWeek || 'monday',
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const currencyOptions = [
    { value: 'USD', label: 'USD - United States Dollar ($)' },
    { value: 'INR', label: 'INR - Indian Rupee (₹)' },
    { value: 'GBP', label: 'GBP - British Pound (£)' },
    { value: 'EUR', label: 'EUR - Euro (€)' },
    { value: 'AED', label: 'AED - United Arab Emirates Dirham (AED)' },
    { value: 'CAD', label: 'CAD - Canadian Dollar ($)' },
    { value: 'AUD', label: 'AUD - Australian Dollar ($)' },
  ];

  const positionOptions = [
    { value: 'prefix', label: 'Prefix ($100.00)' },
    { value: 'suffix', label: 'Suffix (100.00 $)' },
  ];

  const dateFormatOptions = [
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-10-02)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (02/10/2026)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (10/02/2026)' },
    { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (02-Oct-2026)' },
  ];

  const timeFormatOptions = [
    { value: 'h12', label: '12-Hour Clock (09:00 AM / 06:00 PM)' },
    { value: 'h24', label: '24-Hour Clock (09:00 / 18:00)' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT -5:00)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT -8:00)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST +0:00)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST +10:00)' },
  ];

  const firstDayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  return (
    <Card
      title="Currency & Regional Settings"
      subtitle="Configure default system currency, symbol positioning, date/time formats, timezone, and calendar preferences."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Base Currency Code"
            name="baseCurrencyCode"
            value={formData.baseCurrencyCode}
            onChange={handleChange}
            options={currencyOptions}
            required
          />

          <Input
            label="Currency Symbol"
            name="baseCurrencySymbol"
            value={formData.baseCurrencySymbol}
            onChange={handleChange}
            placeholder="$"
            required
          />

          <Select
            label="Symbol Position"
            name="currencySymbolPosition"
            value={formData.currencySymbolPosition}
            onChange={handleChange}
            options={positionOptions}
            required
          />

          <Select
            label="Date Format"
            name="dateFormat"
            value={formData.dateFormat}
            onChange={handleChange}
            options={dateFormatOptions}
            required
          />

          <Select
            label="Time Format"
            name="timeFormat"
            value={formData.timeFormat}
            onChange={handleChange}
            options={timeFormatOptions}
            required
          />

          <Select
            label="System Timezone"
            name="timeZone"
            value={formData.timeZone}
            onChange={handleChange}
            options={timezoneOptions}
            required
          />

          <Select
            label="First Day of the Week"
            name="firstDayOfWeek"
            value={formData.firstDayOfWeek}
            onChange={handleChange}
            options={firstDayOptions}
            required
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
          <Button type="submit" variant="primary" icon={Save} loading={saving}>
            Save Regional Settings
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RegionalSettingsForm;
