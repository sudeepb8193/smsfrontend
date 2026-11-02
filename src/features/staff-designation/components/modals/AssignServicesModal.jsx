import React, { useState, useMemo } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import Badge from '../../../../components/shared/Badge';
import { Search, Sparkles, Check, Clock, Tag } from 'lucide-react';

export default function AssignServicesModal({
  isOpen,
  onClose,
  onAssignBulk,
  catalogServices = [],
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [defaultDurationOverride, setDefaultDurationOverride] = useState('');

  // Extract unique categories from catalog
  const categories = useMemo(() => {
    const map = new Map();
    catalogServices.forEach((s) => {
      if (s.categoryId && s.categoryName) {
        map.set(s.categoryId, s.categoryName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [catalogServices]);

  // Filter unassigned or available services
  const availableServices = useMemo(() => {
    return catalogServices.filter((s) => {
      if (s.isAssigned && s.isActive) return false;
      const matchSearch =
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === 'ALL' || s.categoryId === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [catalogServices, searchTerm, selectedCategory]);

  const toggleSelect = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = availableServices.map((s) => s.id);
    setSelectedServiceIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedServiceIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) return;

    const overrideMins =
      defaultDurationOverride !== '' && defaultDurationOverride !== null
        ? parseInt(defaultDurationOverride, 10)
        : undefined;

    onAssignBulk({
      serviceIds: selectedServiceIds,
      defaultDurationOverrideMinutes: overrideMins,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Services to Employee"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search catalog services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick select helpers */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-[var(--text-muted)] font-medium">
            {selectedServiceIds.length} service(s) selected
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-primary-600 hover:underline font-semibold"
            >
              Select All Shown
            </button>
            <span className="text-[var(--text-muted)]">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[var(--text-muted)] hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Services Checklist */}
        <div className="max-h-72 overflow-y-auto space-y-2 border border-[var(--border-color)] rounded-2xl p-2 bg-[var(--bg-main)]">
          {availableServices.length > 0 ? (
            availableServices.map((srv) => {
              const isChecked = selectedServiceIds.includes(srv.id);

              return (
                <div
                  key={srv.id}
                  onClick={() => toggleSelect(srv.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[var(--text-primary)]">
                          {srv.name}
                        </span>
                        {srv.isSuggested && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/20"
                            title={srv.suggestionReason}
                          >
                            <Sparkles size={10} />
                            Suggested
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Tag size={11} />
                          {srv.categoryName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {srv.baseDurationMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs font-bold text-[var(--text-primary)]">
                    ₹{srv.basePriceAmount}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No unassigned services matching the filter criteria.
            </div>
          )}
        </div>

        {/* Optional Duration Override */}
        <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Optional Default Duration Override (Minutes)
          </label>
          <Input
            type="number"
            min={1}
            max={720}
            placeholder="Leave blank to use catalog duration"
            value={defaultDurationOverride}
            onChange={(e) => setDefaultDurationOverride(e.target.value)}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            If this staff member consistently needs more or less time across these services.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={selectedServiceIds.length === 0 || loading}
            loading={loading}
          >
            Assign {selectedServiceIds.length} Service(s)
          </Button>
        </div>
      </form>
    </Modal>
  );
}

