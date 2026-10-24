import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Check,
  Search,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useOrganisation } from '../context/OrganisationContext';
import { toast } from 'sonner';

export const OrganisationPicker = () => {
  const navigate = useNavigate();
  const {
    organisations,
    selectedOrganisation,
    setSelectedOrganisation,
    isSuperAdmin,
    loading,
  } = useOrganisation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSuperAdmin) {
    return null;
  }

  const filtered = organisations.filter(
    (org) =>
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (org) => {
    setSelectedOrganisation(org);
    setIsOpen(false);
    toast.success(`Active organisation context switched to "${org.name}".`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="organisation-picker-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 h-9 px-3 rounded-xl border border-primary-500/30 bg-primary-500/10 hover:bg-primary-500/15 text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Super Admin Organisation Selector"
      >
        <Building2 size={15} className="text-primary-500 shrink-0" />
        <div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-[200px] truncate text-left">
          <span className="truncate">
            {selectedOrganisation?.name || (loading ? 'Loading...' : 'Select Organisation')}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-500 text-white shrink-0">
            Org
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-primary-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-input)]/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1">
                <ShieldAlert size={12} /> Super Admin Scope
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/super-admin/organisations');
                }}
                className="text-[11px] text-[var(--text-secondary)] hover:text-primary-500 flex items-center gap-1 transition"
              >
                <span>View all</span>
                <ExternalLink size={10} />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search organisations..."
                className="w-full h-8 pl-8 pr-2.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-primary-500 transition"
                autoFocus
              />
            </div>
          </div>

          {/* List of Organisations */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {loading ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                Loading organisations...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                No organisations found
              </div>
            ) : (
              filtered.map((org) => {
                const isSelected = selectedOrganisation?.id === org.id;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelect(org)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-primary-500/10 text-primary-500 font-bold'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{org.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">
                        {org.slug ? `@${org.slug}` : org.id.slice(0, 8)} •{' '}
                        <span className="capitalize">{org.status || 'active'}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-primary-500 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganisationPicker;
