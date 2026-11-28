import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  ArrowLeft,
  ShieldCheck,
  Sun,
  Moon,
  Palette,
  LogOut,
  ChevronDown,
  Search,
  X,
  CornerDownLeft,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useAuthorizedNavigation } from '../../../hooks/useAuthorizedNavigation';
import ThemeSettingsModal from '../../shared/ThemeSettingsModal';
import Tooltip from '../../shared/Tooltip';
import BranchSwitcher from '../../../features/branch/components/BranchSwitcher';
import OrganisationPicker from '../../../features/organisation/components/OrganisationPicker';

export const ModernFloatingNavbar = ({
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenSecurityModal,
}) => {
  const { isDark, toggleTheme, openThemeModal } = useTheme();
  const { user, role, logout } = useAuth();
  const { isOwner, isSuperAdmin } = usePermission();
  const { searchableNavItems } = useAuthorizedNavigation();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        document.activeElement?.isContentEditable;
      if (!isEditable && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const filteredNavResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchableNavItems.slice(0, 6);
    return searchableNavItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q) ||
          item.path.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchQuery, searchableNavItems]);

  const handleSelectNavResult = (item) => {
    if (!item?.path) return;
    setSearchQuery('');
    setSearchFocused(false);
    navigate(item.path);
  };

  const handleSearchKeyDown = (e) => {
    if (!searchFocused || filteredNavResults.length === 0) {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredNavResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredNavResults.length) % filteredNavResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredNavResults[highlightedIndex] || filteredNavResults[0];
      handleSelectNavResult(target);
    } else if (e.key === 'Escape') {
      setSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const displayRole = user?.designation || user?.role || role || 'Owner';

  return (
    <>
      <header className="h-[56px] shrink-0 px-3.5 sm:px-4 lg:px-5 flex items-center justify-between gap-2.5 sticky top-0 z-20 select-none bg-[var(--mf-surface)]/95 backdrop-blur-md border-b border-[var(--mf-border)] lg:rounded-tl-[26px]">
        {/* Left: Mobile Menu Trigger, Sidebar Collapse, Go Back, Search Input */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-xl">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden w-8 h-8 rounded-full bg-[var(--mf-surface-subtle)] border border-[var(--mf-border)] text-[var(--text-primary)] hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-600 transition-all flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={16} />
          </button>

          {/* Desktop Sidebar Collapse Button */}
          <Tooltip
            content={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            position="bottom"
          >
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex w-8 h-8 rounded-full bg-[var(--mf-surface-subtle)] border border-[var(--mf-border)] text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all items-center justify-center cursor-pointer shrink-0"
              aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </Tooltip>

          <Tooltip content="Go Back" position="bottom">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden sm:flex w-8 h-8 rounded-full bg-[var(--mf-surface-subtle)] border border-[var(--mf-border)] text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all items-center justify-center cursor-pointer shrink-0"
              aria-label="Go Back"
            >
              <ArrowLeft size={15} />
            </button>
          </Tooltip>

          {/* Clean Minimal Search Bar matching Branch Switcher size */}
          <div className="relative w-48 sm:w-56 shrink-0" ref={searchRef}>
            <div
              className={`relative flex items-center rounded-xl px-2.5 h-9 border transition-all duration-200 ${
                searchFocused
                  ? 'border-primary-500 bg-[var(--mf-surface)] ring-2 ring-primary-500/20 shadow-sm'
                  : 'border-primary-500/30 bg-[var(--mf-surface-subtle)]/70 hover:border-primary-500/50 hover:bg-[var(--mf-surface-subtle)]'
              }`}
            >
              <Search
                size={14}
                className={`shrink-0 transition-colors ${
                  searchFocused ? 'text-primary-500' : 'text-primary-500/70 dark:text-primary-400/80'
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => {
                  setSearchFocused(true);
                  setHighlightedIndex(0);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search..."
                aria-label="Quick navigation search"
                aria-expanded={searchFocused}
                className="w-full h-full pl-2 pr-5 bg-transparent text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Authorized Module Quick Jump Popover */}
            {searchFocused && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[var(--mf-surface)] border border-[var(--mf-border-strong)] shadow-2xl overflow-hidden z-50 mf-dropdown-enter">
                <div className="px-3.5 py-2 border-b border-[var(--mf-border)] bg-[var(--mf-surface-subtle)] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Quick Navigation</span>
                  <span>Press Enter</span>
                </div>
                <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredNavResults.length === 0 ? (
                    <div className="py-6 px-3 text-center text-xs text-[var(--text-muted)]">
                      No matching authorized modules found.
                    </div>
                  ) : (
                    filteredNavResults.map((item, idx) => {
                      const Icon = item.icon;
                      const isHighlighted = idx === highlightedIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onClick={() => handleSelectNavResult(item)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isHighlighted
                              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300'
                              : 'text-[var(--text-primary)] hover:bg-[var(--mf-surface-subtle)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isHighlighted
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-[var(--mf-surface-subtle)] text-[var(--text-secondary)]'
                              }`}
                            >
                              {Icon && <Icon size={14} />}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.label}</div>
                              <div className="text-[10px] text-[var(--text-muted)] truncate">
                                {item.group}
                              </div>
                            </div>
                          </div>
                          <CornerDownLeft size={13} className="text-[var(--text-muted)] shrink-0 opacity-60" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tenant Context + Circular Tools with Equal Gap + Notification after Dark/Light + Avatar First Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden xl:flex items-center gap-2">
            <OrganisationPicker />
            {(isOwner || isSuperAdmin) && <BranchSwitcher />}
          </div>

          {/* Theme Customizer with Circle Background */}
          <Tooltip content="Theme Customizer" position="bottom">
            <button
              type="button"
              onClick={openThemeModal}
              className="w-8 h-8 rounded-full bg-[var(--mf-surface-subtle)] border border-[var(--mf-border)] text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Open Theme Customizer"
            >
              <Palette size={15} />
            </button>
          </Tooltip>

          {/* Dark / Light Toggle with Circle Background */}
          <Tooltip content={`Switch to ${isDark ? 'light' : 'dark'} mode`} position="bottom">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-[var(--mf-surface-subtle)] border border-[var(--mf-border)] text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all flex items-center justify-center cursor-pointer shrink-0"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
            </button>
          </Tooltip>

          {/* Notification Bell (placed after Dark/Light) with Circle Background */}
          <Tooltip content="Notifications" position="bottom">
            <button
              type="button"
              className="relative w-8 h-8 rounded-full bg-[var(--mf-surface-subtle)] border border-[var(--mf-border)] text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--mf-surface)]" />
            </button>
          </Tooltip>

          {/* User Profile: Avatar First, then Name & Role */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-expanded={profileDropdownOpen}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[var(--mf-surface-subtle)] border border-transparent hover:border-[var(--mf-border)] transition-all cursor-pointer select-none"
            >
              {/* Avatar Circle First */}
              <div className="w-8 h-8 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold text-xs border border-primary-500/30 shrink-0 shadow-sm">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <ShieldCheck size={14} />}
              </div>

              {/* Name & Role */}
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-[12.5px] font-semibold text-[var(--text-primary)] max-w-[130px] truncate">
                  {user?.displayName || 'User Profile'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium capitalize truncate">
                  {displayRole}
                </span>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={13}
                className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
                  profileDropdownOpen ? 'rotate-180 text-primary-500' : ''
                }`}
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-[var(--mf-surface)] border border-[var(--mf-border-strong)] rounded-2xl shadow-2xl p-2 z-50 text-[var(--text-primary)] mf-dropdown-enter">
                <div className="px-3.5 py-3 bg-[var(--mf-surface-subtle)] rounded-xl mb-1.5 border border-[var(--mf-border)]">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {user?.displayName || 'User Profile'}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate font-mono mt-0.5">
                    {user?.email || user?.phoneNumber || ''}
                  </div>
                  <div className="inline-block px-2.5 py-0.5 mt-2 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-300 text-[10px] font-bold uppercase tracking-wider">
                    {displayRole}
                  </div>
                </div>

                {/* Tenant Pickers for smaller viewports */}
                <div className="xl:hidden px-2 py-2 space-y-2 border-b border-[var(--mf-border)] mb-1">
                  <OrganisationPicker />
                  {(isOwner || isSuperAdmin) && <BranchSwitcher />}
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openThemeModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--mf-surface-subtle)] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles size={15} className="text-primary-500" />
                    <span>Dashboard Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onOpenSecurityModal) onOpenSecurityModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--mf-surface-subtle)] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <ShieldCheck size={15} className="text-primary-500" />
                    <span>Security & Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Theme Customizer Modal */}
      <ThemeSettingsModal />
    </>
  );
};

export default ModernFloatingNavbar;
