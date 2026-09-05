import React from 'react';
import { Crown, Bell, Menu, ShieldCheck, Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import ThemeSettingsModal from '../../common/ThemeSettingsModal/ThemeSettingsModal';

export const Navbar = ({ onToggleSidebar, onOpenSecurityModal }) => {
  const { isDark, toggleTheme, openThemeModal } = useTheme();
  const { user, role } = useAuth();

  return (
    <>
      <header className="h-16 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-20 select-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md">
              <Crown size={18} />
            </div>
            <span className="font-bold text-base text-[var(--text-primary)] tracking-tight hidden sm:inline-block">
              SalonFlow Pro
            </span>
          </div>
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

          {/* User Profile Info */}
          <div
            onClick={onOpenSecurityModal}
            className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-color)] cursor-pointer hover:opacity-90 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                {user?.displayName || 'Super Admin'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">
                {role || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Theme Customizer Modal */}
      <ThemeSettingsModal />
    </>
  );
};

export default Navbar;
