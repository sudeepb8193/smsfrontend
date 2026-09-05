import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_MODULE_CONFIG } from '../../../config/sidebar.config';
import { useAuth } from '../../../hooks/useAuth';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Crown,
  Circle,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed: propsIsCollapsed, onToggleCollapse }) => {
  const { role, user } = useAuth();
  const location = useLocation();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = propsIsCollapsed !== undefined ? propsIsCollapsed : internalCollapsed;

  const [expandedModules, setExpandedModules] = useState({
    users: true,
    organization: true,
    staff: false,
    audit: false,
  });
  const [hoveredModule, setHoveredModule] = useState(null);

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const filteredModules = SIDEBAR_MODULE_CONFIG.filter((module) => {
    if (!module.allowedRoles || module.allowedRoles.length === 0) return true;
    return module.allowedRoles.includes(role || 'SUPER_ADMIN');
  });

  return (
    <aside
      className={`fixed lg:sticky top-0 z-30 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Floating Collapse Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] items-center justify-center shadow-lg z-40 hover:bg-primary-500 hover:text-white transition-all"
        aria-label="Toggle sidebar width"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand Header */}
      <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md">
          <Crown size={22} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-extrabold text-lg text-[var(--text-primary)] tracking-tight">SalonFlow Pro</h1>
            <span className="text-[10px] text-primary-500 font-bold tracking-widest block">ENTERPRISE</span>
          </div>
        )}
      </div>

      {/* Modules & Subtasks Navigation List */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1.5">
        {filteredModules.map((mod) => {
          const IconComponent = mod.icon;
          const isSubtaskActive = mod.subtasks?.some((st) => location.pathname.startsWith(st.path));
          const isDirectPathActive = mod.path && location.pathname === mod.path;
          const isModuleActive = isDirectPathActive || isSubtaskActive;
          const isExpanded = expandedModules[mod.id];

          return (
            <div
              key={mod.id}
              className="relative"
              onMouseEnter={() => isCollapsed && setHoveredModule(mod.id)}
              onMouseLeave={() => isCollapsed && setHoveredModule(null)}
            >
              {/* Module Nav Item */}
              {mod.subtasks && mod.subtasks.length > 0 ? (
                <button
                  type="button"
                  onClick={() => !isCollapsed && toggleModuleExpand(mod.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isModuleActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <IconComponent size={20} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{mod.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-current opacity-70">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                </button>
              ) : (
                <NavLink
                  to={mod.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? mod.label : undefined}
                >
                  <IconComponent size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{mod.label}</span>}
                </NavLink>
              )}

              {/* Sub-tasks Tree View (Expanded Mode) */}
              {!isCollapsed && isExpanded && mod.subtasks && (
                <div className="ml-6 pl-3 border-l border-[var(--border-color)] my-1 space-y-1">
                  {mod.subtasks.map((st) => (
                    <NavLink
                      key={st.id}
                      to={st.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-primary-500/20 text-primary-500 font-bold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                        }`
                      }
                    >
                      <Circle
                        size={6}
                        className={
                          location.pathname.startsWith(st.path)
                            ? 'fill-primary-500 text-primary-500'
                            : 'text-[var(--text-muted)]'
                        }
                      />
                      <span className="truncate">{st.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Hover Popover Tree View (Collapsed Mode) */}
              {isCollapsed && hoveredModule === mod.id && mod.subtasks && (
                <div className="absolute left-16 top-0 w-60 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3.5 z-50">
                  <div className="font-bold text-sm text-[var(--text-primary)] mb-2">{mod.label}</div>
                  <div className="border-l border-[var(--border-color)] pl-2.5 space-y-1">
                    {mod.subtasks.map((st) => (
                      <NavLink
                        key={st.id}
                        to={st.path}
                        onClick={() => setHoveredModule(null)}
                        className="block px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                      >
                        • {st.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-input)] flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 min-w-[32px] rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center">
          <ShieldCheck size={18} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <span className="text-[10px] text-[var(--text-muted)] font-semibold block">ACTIVE SESSION</span>
            <span className="font-bold text-xs text-[var(--text-primary)] truncate block">
              {user?.displayName || 'Super Admin'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
