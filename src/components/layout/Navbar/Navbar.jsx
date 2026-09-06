import React, { useState, useRef, useEffect } from 'react';
import { Bell, PanelLeftClose, PanelLeftOpen, ArrowLeft, ShieldCheck, Sun, Moon, Palette, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ThemeSettingsModal from '../../common/ThemeSettingsModal/ThemeSettingsModal';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed, isMobileOpen, onOpenSecurityModal }) => {
  const { isDark, toggleTheme, openThemeModal } = useTheme();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="h-16 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-20 select-none transition-colors duration-200">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sidebar Toggle Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center focus:outline-none"
            aria-label="Toggle Sidebar Navigation"
            title="Toggle Sidebar"
          >
            {isMobileOpen || !isSidebarCollapsed ? (
              <PanelLeftClose size={22} className="text-primary-500 hover:scale-105 transition-transform" />
            ) : (
              <PanelLeftOpen size={22} className="text-[var(--text-secondary)] hover:scale-105 transition-transform" />
            )}
          </button>

          {/* Back Navigation Button (Goes 1 Step Back in History) */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center focus:outline-none"
            aria-label="Go Back"
            title="Go Back 1 Step"
          >
            <ArrowLeft size={20} className="hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher / Customizer Trigger */}
          <button
            type="button"
            onClick={openThemeModal}
            className="p-2 px-3 text-[var(--text-secondary)] hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 font-semibold text-xs border border-[var(--border-color)] bg-primary-500/10 text-primary-400 hover:bg-primary-500/20"
            title="Open Visual Theme Customizer"
          >
            <Palette size={16} className="text-primary-500 animate-pulse" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Quick Dark/Light Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-2 font-medium text-xs border border-[var(--border-color)]"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Notifications Icon */}
          <button
            type="button"
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
          </button>

          {/* User Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-color)] cursor-pointer hover:opacity-90 transition-all select-none focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold text-xs shadow-sm border border-primary-500/30">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <ShieldCheck size={18} />}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text-primary)] leading-tight flex items-center gap-1">
                  {user?.displayName || 'Super Admin'}
                  <ChevronDown size={12} className="text-[var(--text-muted)]" />
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium">
                  {role || 'SUPER_ADMIN'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 z-50 text-[var(--text-primary)] animate-fadeIn">
                <div className="px-3.5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-input)] rounded-xl mb-1">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {user?.displayName || 'Super Admin'}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate font-mono mt-0.5">
                    {user?.email || user?.phoneNumber || 'admin@salon.com'}
                  </div>
                  <div className="inline-block px-2 py-0.5 mt-1.5 rounded-md bg-primary-500/15 text-primary-500 text-[10px] font-bold uppercase tracking-wider">
                    {role || 'SUPER_ADMIN'}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onOpenSecurityModal) onOpenSecurityModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition flex items-center gap-2.5"
                  >
                    <ShieldCheck size={16} className="text-primary-500" />
                    <span>Security & Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-2.5"
                  >
                    <LogOut size={16} />
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

export default Navbar;
