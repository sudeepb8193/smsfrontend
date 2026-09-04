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
      className={`fixed lg:sticky top-0 z-30 h-screen bg-[#21141A] border-r border-white/10 flex flex-col transition-all duration-300 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Floating Collapse Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-[#331D27] border border-white/15 text-white items-center justify-center shadow-lg z-40 hover:bg-[#8A4A52] transition-all"
        aria-label="Toggle sidebar width"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-[#8A4A52] to-[#6E363E] text-white flex items-center justify-center shadow-md">
          <Crown size={22} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-extrabold text-lg text-white tracking-tight">SalonFlow Pro</h1>
            <span className="text-[10px] text-[#8A4A52] font-bold tracking-widest block">ENTERPRISE</span>
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
                      ? 'bg-gradient-to-r from-[#8A4A52] to-[#6E363E] text-white shadow-md'
                      : 'text-[#C4B5BE] hover:bg-white/5 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <IconComponent size={20} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{mod.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-white/60">
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
                        ? 'bg-gradient-to-r from-[#8A4A52] to-[#6E363E] text-white shadow-md'
                        : 'text-[#C4B5BE] hover:bg-white/5 hover:text-white'
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
                <div className="ml-6 pl-3 border-l border-white/10 my-1 space-y-1">
                  {mod.subtasks.map((st) => (
                    <NavLink
                      key={st.id}
                      to={st.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#8A4A52]/25 text-[#E86575] font-bold'
                            : 'text-[#9E8895] hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <Circle
                        size={6}
                        className={
                          location.pathname.startsWith(st.path)
                            ? 'fill-[#8A4A52] text-[#8A4A52]'
                            : 'text-[#9E8895]'
                        }
                      />
                      <span className="truncate">{st.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Hover Popover Tree View (Collapsed Mode) */}
              {isCollapsed && hoveredModule === mod.id && mod.subtasks && (
                <div className="absolute left-16 top-0 w-60 bg-[#271820] border border-white/15 rounded-xl shadow-2xl p-3.5 z-50">
                  <div className="font-bold text-sm text-white mb-2">{mod.label}</div>
                  <div className="border-l border-white/10 pl-2.5 space-y-1">
                    {mod.subtasks.map((st) => (
                      <NavLink
                        key={st.id}
                        to={st.path}
                        onClick={() => setHoveredModule(null)}
                        className="block px-2 py-1 rounded text-xs text-[#C4B5BE] hover:text-white hover:bg-white/10"
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
      <div className="p-4 border-t border-white/10 bg-[#190E14] flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 min-w-[32px] rounded-full bg-[#8A4A52]/25 text-[#8A4A52] flex items-center justify-center">
          <ShieldCheck size={18} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#8E7A86] font-semibold block">ACTIVE SESSION</span>
            <span className="font-bold text-xs text-white truncate block">
              {user?.displayName || 'Super Admin'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
