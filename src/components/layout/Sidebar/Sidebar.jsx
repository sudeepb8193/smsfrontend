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
  PanelLeftClose,
  X,
} from 'lucide-react';

export const Sidebar = ({
  isCollapsed: propsIsCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role } = useAuth();
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

  const handleNavItemClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
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
    <>
      {/* Mobile Backdrop Overlay (Auto Closes Mobile Sidebar) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-label="Close Navigation Overlay"
        />
      )}

      {/* Main Sidebar Aside Container */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen bg-[var(--bg-sidebar)] text-white border-r border-white/10 flex flex-col transition-all duration-300 select-none ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-18' : 'lg:w-72'}`}
      >
        {/* Brand Header (Matches Navbar h-16 / 64px Height Exactly) */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between overflow-hidden shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md">
              <Crown size={22} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-extrabold text-lg text-white tracking-tight">SalonFlow Pro</h1>
                <span className="text-[10px] text-primary-400 font-bold tracking-widest block">ENTERPRISE</span>
              </div>
            )}
          </div>
        </div>

        {/* Modules & Subtasks Navigation List */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1.5 scrollbar-none">
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isModuleActive
                        ? 'bg-white/10 text-white font-bold border border-white/10'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <IconComponent size={20} className="shrink-0 text-primary-400" />
                      {!isCollapsed && <span className="truncate">{mod.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-current opacity-80">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={mod.path}
                    onClick={handleNavItemClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 font-bold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  <div className="ml-5 pl-2.5 border-l border-white/15 my-1 space-y-1">
                    {mod.subtasks.map((st) => (
                      <NavLink
                        key={st.id}
                        to={st.path}
                        onClick={handleNavItemClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isActive
                              ? 'bg-primary-500 text-white font-bold shadow-md'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`
                        }
                      >
                        <Circle
                          size={5}
                          className={
                            location.pathname.startsWith(st.path)
                              ? 'fill-white text-white'
                              : 'text-white/40'
                          }
                        />
                        <span className="truncate">{st.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}

                {/* Hover Popover Tree View (Collapsed Mode) */}
                {isCollapsed && hoveredModule === mod.id && mod.subtasks && (
                  <div className="absolute left-16 top-0 w-60 bg-[var(--bg-sidebar)] border border-white/20 rounded-xl shadow-2xl p-3.5 z-50 text-white">
                    <div className="font-bold text-sm text-white mb-2">{mod.label}</div>
                    <div className="border-l border-white/15 pl-2.5 space-y-1">
                      {mod.subtasks.map((st) => (
                        <NavLink
                          key={st.id}
                          to={st.path}
                          onClick={() => {
                            setHoveredModule(null);
                            handleNavItemClick();
                          }}
                          className={({ isActive }) =>
                            `block px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`
                          }
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

        {/* Sidebar Copyright Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/10 bg-black/20 text-[10px] text-white/60 text-center font-medium leading-tight select-none">
            © {new Date().getFullYear()} <span className="font-bold text-white">SalonFlow Pro</span>. All rights reserved.
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
