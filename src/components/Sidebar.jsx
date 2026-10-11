import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthorizedNavModules } from '../config/sidebar.config';
import Tooltip from './shared/Tooltip';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Crown,
  Circle,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = ({ currentModule: propsCurrentModule, activeSubtask: propsActiveSubtask, onSelectModule, onSelectSubtask }) => {
  const { role, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = role || user?.role || user?.roleSlug || user?.roleName || '';
  const normUserRole = String(userRole).toUpperCase().replace(/[\s_-]+/g, '_');
  const isSuperAdmin = normUserRole === 'SUPER_ADMIN' || normUserRole === 'SUPERADMIN';

  const displayLogoUrl = !isSuperAdmin
    ? user?.organization?.logoUrl || user?.organizationLogo || user?.logoUrl
    : null;
  const displayName = !isSuperAdmin
    ? user?.organization?.name || user?.organizationName || 'SalonFlow Pro'
    : 'SalonFlow Pro';
  const displayType = !isSuperAdmin
    ? user?.organization?.businessType || user?.organizationType || 'ENTERPRISE PLATFORM'
    : 'ENTERPRISE PLATFORM';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState({
    users: true,
    staff: false,
    audit: false,
  });
  const [hoveredModule, setHoveredModule] = useState(null);

  const modules = getAuthorizedNavModules(role);

  // Determine current active module and subtask from location URL if not explicitly passed
  const currentPath = location.pathname;

  const activeModuleItem = modules.find((mod) => {
    if (mod.path && mod.path === currentPath) return true;
    if (currentPath.startsWith(`/${mod.id}`)) return true;
    if (mod.subtasks) {
      return mod.subtasks.some((st) => st.path === currentPath);
    }
    return false;
  });

  const activeModuleName = propsCurrentModule || (activeModuleItem ? activeModuleItem.id : 'users');

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleModuleClick = (mod) => {
    const targetPath = mod.path || (mod.subtasks && mod.subtasks.length > 0 ? mod.subtasks[0].path : `/${mod.id}`);
    if (targetPath) {
      navigate(targetPath);
    }
    if (onSelectModule) {
      onSelectModule(mod.id);
    }
    if (mod.subtasks && mod.subtasks.length > 0 && onSelectSubtask) {
      onSelectSubtask(mod.subtasks[0].id);
    }
    if (!isCollapsed) {
      toggleModuleExpand(mod.id);
    }
  };

  const handleSubtaskClick = (modId, st) => {
    if (st.path) {
      navigate(st.path);
    }
    if (onSelectModule) {
      onSelectModule(modId);
    }
    if (onSelectSubtask) {
      onSelectSubtask(st.id);
    }
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 z-30 h-screen bg-[#21141A] text-white border-r border-white/10 flex flex-col transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse / Expand Toggle Floating Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3.5 w-7 h-7 rounded-full bg-[#331D27] border border-white/15 text-gray-100 flex items-center justify-center cursor-pointer shadow-lg z-40 hover:bg-[#442735] transition-all"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label="Toggle sidebar collapse"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand Header */}
      <div className={`border-b border-white/10 flex items-center gap-3 overflow-hidden shrink-0 ${isCollapsed ? 'p-4 justify-center' : 'p-5'}`}>
        <Tooltip content={`${displayName} (${displayType})`} position="right">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer">
            <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-[#8A4A52] to-[#6E363E] text-white flex items-center justify-center shadow-md overflow-hidden">
              {displayLogoUrl ? (
                <img
                  src={displayLogoUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Crown size={22} />
              )}
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="font-extrabold text-base text-white tracking-tight truncate max-w-[160px]">
                  {displayName}
                </div>
                <div className="text-[10px] text-[#8A4A52] font-bold tracking-widest uppercase truncate max-w-[160px]">
                  {displayType}
                </div>
              </div>
            )}
          </div>
        </Tooltip>
      </div>

      {/* Navigation Modules & Sub-tasks */}
      <nav className="p-3 flex-1 overflow-y-auto space-y-1.5 scrollbar-none">
        {modules.map((mod) => {
          const IconComponent = mod.icon;
          const isSelectedModule = activeModuleName === mod.id;
          const isExpanded = expandedModules[mod.id];

          return (
            <div
              key={mod.id}
              className="relative"
              onMouseEnter={() => isCollapsed && setHoveredModule(mod.id)}
              onMouseLeave={() => isCollapsed && setHoveredModule(null)}
            >
              {/* Parent Module Row Button */}
              <Tooltip content={isCollapsed ? mod.label : null} position="right">
                <button
                  type="button"
                  onClick={() => handleModuleClick(mod)}
                  className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-sm font-semibold cursor-pointer ${
                    isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 justify-between'
                  } ${
                    isSelectedModule
                      ? 'bg-gradient-to-r from-[#8A4A52] to-[#6E363E] text-white font-bold shadow-lg shadow-[#8A4A52]/40'
                      : 'text-rose-100/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <IconComponent size={20} className={`shrink-0 ${isSelectedModule ? 'text-white' : 'text-rose-200/70'}`} />
                    {!isCollapsed && (
                      <span className="truncate">
                        {mod.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {mod.badge && !isSelectedModule && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#8A4A52]/25 text-[#8A4A52]">
                          {mod.badge}
                        </span>
                      )}
                      {mod.subtasks && (
                        <span className={isSelectedModule ? 'text-white' : 'text-rose-200/60'}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </Tooltip>

              {/* Expanded Sub-tasks Tree View */}
              {!isCollapsed && isExpanded && mod.subtasks && (
                <div className="ml-6 pl-3.5 border-l border-white/10 my-1.5 flex flex-col gap-1">
                  {mod.subtasks.map((st) => {
                    const isSubtaskActive = st.path === currentPath || propsActiveSubtask === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSubtaskClick(mod.id, st)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                          isSubtaskActive
                            ? 'bg-[#8A4A52]/25 text-[#E598A4] font-bold'
                            : 'text-rose-200/60 hover:text-white hover:bg-white/5 font-medium'
                        }`}
                      >
                        <Circle
                          size={6}
                          className={isSubtaskActive ? 'fill-[#E598A4] text-[#E598A4]' : 'text-rose-200/40'}
                        />
                        <span className="truncate">
                          {st.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hover Popover Tree View (Collapsed Mode) */}
              {isCollapsed && hoveredModule === mod.id && mod.subtasks && (
                <div className="absolute left-16 top-0 w-60 bg-[#271820] border border-white/15 rounded-2xl shadow-2xl p-3.5 z-50 animate-fadeIn">
                  <div className="font-bold text-sm text-white mb-2.5">
                    {mod.label}
                  </div>
                  <div className="border-l border-white/10 pl-2.5 flex flex-col gap-1.5">
                    {mod.subtasks.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          handleSubtaskClick(mod.id, st);
                          setHoveredModule(null);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-rose-100/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      >
                        • {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className={`border-t border-white/10 bg-[#190E14] flex items-center gap-2.5 overflow-hidden shrink-0 ${isCollapsed ? 'p-3 justify-center' : 'p-4'}`}>
        <Tooltip content={user?.displayName || 'User Profile'} position="right">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 min-w-[36px] rounded-full bg-[#8A4A52]/25 text-[#E598A4] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden text-left">
                <div className="text-[10px] text-rose-200/50 font-semibold">Active Session</div>
                <div className="font-bold text-xs text-white truncate max-w-[140px]">
                  {user?.displayName || 'Super Admin'}
                </div>
              </div>
            )}
          </div>
        </Tooltip>
      </div>
    </aside>
  );
};

export default Sidebar;
