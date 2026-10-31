import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Check,
  Search,
  Plus,
  Store,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../../../hooks/useAuth';
import BranchStatusBadge from './BranchStatusBadge';
import { usePermission } from '../../../hooks/usePermission';
import { toast } from 'sonner';

export const BranchSwitcher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreate, isSuperAdmin } = usePermission();
  const { branches, currentBranch, setCurrentBranch, loading } = useBranch();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const isOwner = userRole === 'owner' || userRole === 'super-admin';
  const canCreateBranch = isSuperAdmin || canCreate('branches');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return branches;
    const term = searchTerm.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.code.toLowerCase().includes(term) ||
        (b.branchAddress?.city && b.branchAddress.city.toLowerCase().includes(term)),
    );
  }, [branches, searchTerm]);

  const handleSelectBranch = (branch) => {
    setCurrentBranch(branch);
    setIsOpen(false);
    toast.success(`Active context switched to ${branch.name}.`);
  };

  if (!user?.organizationId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        id="branch-switcher-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all text-xs focus:outline-none cursor-pointer ${
          isOpen
            ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-300 ring-2 ring-primary-500/20'
            : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] hover:border-primary-500/30'
        }`}
        aria-expanded={isOpen}
        aria-label="Branch context switcher"
      >
        <div className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-mono shadow-xs">
          {currentBranch ? currentBranch.code.slice(0, 3) : <Building2 size={13} />}
        </div>

        <div className="text-left hidden sm:block max-w-[140px] md:max-w-[180px]">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-[11px] truncate block text-[var(--text-primary)]">
              {currentBranch ? currentBranch.name : 'Select Branch'}
            </span>
          </div>
          {currentBranch && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono block truncate">
              {currentBranch.code} • {currentBranch.branchType}
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-primary-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="branch-switcher-dropdown"
          className="absolute left-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Header */}
          <div className="p-3 border-b border-[var(--border-color)] space-y-2 bg-[var(--bg-input)]/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Branch Context
              </span>
              <span className="text-[11px] font-semibold text-primary-500">
                {branches.length} {branches.length === 1 ? 'Location' : 'Locations'}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search branches..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Branch Items List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border-color)] p-1">
            {filteredBranches.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-muted)]">
                <Store size={24} className="mx-auto mb-1.5 opacity-50 text-primary-500" />
                <p className="text-xs">No branches found.</p>
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const isSelected = currentBranch?.id === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleSelectBranch(branch)}
                    className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'
                        }`}
                      >
                        {branch.code.slice(0, 3)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate block">
                            {branch.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                          <span className="font-mono">{branch.code}</span>
                          <span>•</span>
                          <span className="capitalize">{branch.branchType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <BranchStatusBadge status={branch.status} size="sm" />
                      {isSelected && (
                        <Check size={16} className="text-primary-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with Manage All / Add New links */}
          <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-input)]/50 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/branches');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-primary-500 transition-colors p-1"
            >
              <ExternalLink size={12} />
              <span>Manage All</span>
            </button>

            {canCreateBranch && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/branches/create');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-xs"
              >
                <Plus size={12} />
                <span>Add Branch</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSwitcher;
