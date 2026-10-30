import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { SIDEBAR_MODULE_CONFIG } from '../../../config/sidebar.config';
import { useAuth } from '../../../hooks/useAuth';
import { hasPermission } from '../../../utils/permissionUtils';
import Tooltip from '../../shared/Tooltip';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Crown,
  Circle,
  PanelLeftClose,
  X,
} from 'lucide-react';

/**
 * Animated Module Item using GSAP for buttery-smooth height accordion,
 * staggered subtask entrance, and chevron rotation.
 */
const SidebarModuleItem = ({
  mod,
  isCollapsed,
  isExpanded,
  onToggleExpand,
  onNavItemClick,
  hoveredModule,
  setHoveredModule,
  location,
}) => {
  const chevronRef = useRef(null);
  const contentRef = useRef(null);
  const isFirstRender = useRef(true);

  const IconComponent = mod.icon;
  const currentFullPath = location.pathname + (location.search || '');
  const isSubtaskActive = mod.subtasks?.some(
    (st) =>
      location.pathname === st.path ||
      currentFullPath === st.path ||
      (st.path.includes('?') && (!location.search && st.path.endsWith('tab=overview') && location.pathname === st.path.split('?')[0])) ||
      (location.pathname.startsWith(st.path + '/') && st.path !== '/')
  );
  const isDirectPathActive = mod.path && (location.pathname === mod.path || currentFullPath === mod.path);
  const isModuleActive = isDirectPathActive || isSubtaskActive;

  // GSAP Accordion Animation
  useEffect(() => {
    const el = contentRef.current;
    const chevron = chevronRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isExpanded && !isCollapsed) {
        gsap.set(el, { height: 'auto', opacity: 1, display: 'block' });
        if (chevron) gsap.set(chevron, { rotation: 0 });
      } else {
        gsap.set(el, { height: 0, opacity: 0, display: 'none' });
        if (chevron) gsap.set(chevron, { rotation: -90 });
      }
      return;
    }

    // Animate Chevron Rotation
    if (chevron) {
      gsap.to(chevron, {
        rotation: isExpanded && !isCollapsed ? 0 : -90,
        duration: 0.32,
        ease: 'power2.out',
      });
    }

    // Animate Accordion Body
    if (isExpanded && !isCollapsed) {
      gsap.killTweensOf(el);
      gsap.set(el, { display: 'block' });
      const targetHeight = el.scrollHeight;

      gsap.fromTo(
        el,
        { height: el.offsetHeight || 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(el, { height: 'auto' });
          },
        }
      );

      // Stagger Subtasks for modern real-time fluidity
      const items = el.querySelectorAll('.gsap-subtask-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -8 },
          {
            opacity: 1,
            x: 0,
            duration: 0.22,
            stagger: 0.04,
            ease: 'power2.out',
            delay: 0.04,
          }
        );
      }
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(el, { display: 'none' });
        },
      });
    }

    return () => {
      gsap.killTweensOf(el);
      if (chevron) gsap.killTweensOf(chevron);
    };
  }, [isExpanded, isCollapsed]);

  return (
    <div
      className="relative"
      onMouseEnter={() => isCollapsed && setHoveredModule(mod.id)}
      onMouseLeave={() => isCollapsed && setHoveredModule(null)}
    >
      {/* Module Nav Item */}
      {mod.subtasks && mod.subtasks.length > 0 ? (
        <button
          type="button"
          onClick={() => !isCollapsed && onToggleExpand(mod.id)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
            isModuleActive
              ? 'bg-white/10 text-white font-bold border border-white/10 shadow-sm'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <IconComponent
              size={20}
              className={`shrink-0 transition-colors duration-200 ${
                isModuleActive ? 'text-primary-400' : 'text-primary-400/80'
              }`}
            />
            {!isCollapsed && <span className="truncate">{mod.label}</span>}
          </div>
          {!isCollapsed && (
            <span
              ref={chevronRef}
              className="text-white/70 flex items-center justify-center p-0.5 inline-block origin-center"
            >
              <ChevronDown size={16} />
            </span>
          )}
        </button>
      ) : (
        <NavLink
          to={mod.path}
          onClick={onNavItemClick}
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

      {/* Sub-tasks Tree View (GSAP Animated Accordion) */}
      {!isCollapsed && mod.subtasks && (
        <div
          ref={contentRef}
          className="overflow-hidden"
          style={{ display: isExpanded && !isCollapsed ? 'block' : 'none' }}
        >
          <div className="ml-5 pl-2.5 border-l border-white/15 my-1.5 space-y-1 py-0.5">
            {mod.subtasks.map((st) => (
              <NavLink
                key={st.id}
                to={st.path}
                end
                onClick={onNavItemClick}
                className={({ isActive }) => {
                  const isQueryMatched = st.path.includes('?') && (
                    currentFullPath === st.path ||
                    (!location.search && st.path.endsWith('tab=overview') && location.pathname === st.path.split('?')[0])
                  );
                  const isCurrent = isQueryMatched || (!st.path.includes('?') && isActive);
                  return `gsap-subtask-item group/sub flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-primary-500 text-white font-bold shadow-md shadow-primary-500/25 translate-x-0.5'
                      : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                  }`;
                }}
              >
                {({ isActive }) => {
                  const isQueryMatched = st.path.includes('?') && (
                    currentFullPath === st.path ||
                    (!location.search && st.path.endsWith('tab=overview') && location.pathname === st.path.split('?')[0])
                  );
                  const isCurrent = isQueryMatched || (!st.path.includes('?') && isActive);
                  return (
                    <>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${
                          isCurrent
                            ? 'bg-white ring-2 ring-white/30 scale-110'
                            : 'border border-white/40 bg-transparent group-hover/sub:border-white'
                        }`}
                      />
                      <span className="truncate">{st.label}</span>
                    </>
                  );
                }}
              </NavLink>
            ))}
          </div>
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
                  onNavItemClick();
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
};

export const Sidebar = ({
  isCollapsed: propsIsCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, role: contextRole } = useAuth();
  const location = useLocation();

  const userRole = contextRole || user?.role || user?.roleSlug || user?.roleName || '';

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = propsIsCollapsed !== undefined ? propsIsCollapsed : internalCollapsed;

  const [expandedModules, setExpandedModules] = useState(() => {
    const initial = {};
    const fullPath = location.pathname + (location.search || '');
    SIDEBAR_MODULE_CONFIG.forEach((mod) => {
      if (
        mod.subtasks?.some(
          (st) =>
            location.pathname === st.path ||
            fullPath === st.path ||
            (st.path.includes('?') && (!location.search && st.path.endsWith('tab=overview') && location.pathname === st.path.split('?')[0])) ||
            (location.pathname.startsWith(st.path + '/') && st.path !== '/')
        )
      ) {
        initial[mod.id] = true;
      }
    });
    return initial;
  });
  const [hoveredModule, setHoveredModule] = useState(null);

  // Auto-expand module if the active path matches any subtask
  useEffect(() => {
    const fullPath = location.pathname + (location.search || '');
    SIDEBAR_MODULE_CONFIG.forEach((mod) => {
      if (
        mod.subtasks?.some(
          (st) =>
            location.pathname === st.path ||
            fullPath === st.path ||
            (st.path.includes('?') && (!location.search && st.path.endsWith('tab=overview') && location.pathname === st.path.split('?')[0])) ||
            (location.pathname.startsWith(st.path + '/') && st.path !== '/')
        )
      ) {
        setExpandedModules((prev) => {
          if (prev[mod.id]) return prev;
          return { ...prev, [mod.id]: true };
        });
      }
    });
  }, [location.pathname, location.search]);

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

  const normUserRole = String(userRole).toUpperCase().replace(/[\s_-]+/g, '_');
  const isSuperAdmin = normUserRole === 'SUPER_ADMIN' || normUserRole === 'SUPERADMIN';

  const displayLogoUrl = null;
  const displayName = 'SalonFlow Pro';


  const filteredModules = SIDEBAR_MODULE_CONFIG.filter((module) => {
    // Super Admin and Owner have access to their respective dashboard sections
    if (isSuperAdmin || normUserRole === 'OWNER') {
      if (module.id === 'organisations' || module.id === 'super-admin-roles') {
        return isSuperAdmin;
      }
      if (module.id === 'my-organisation') {
        return normUserRole === 'OWNER';
      }
      return true;
    }

    // 1. If module defines requiredPermission, verify user has that permission
    if (module.requiredPermission) {
      if (!hasPermission(user, module.requiredPermission)) {
        return false;
      }
    }

    // 2. Role-based fallback
    if (!module.allowedRoles || module.allowedRoles.length === 0) return true;
    if (!userRole) return false;
    return module.allowedRoles.some(
      (r) => r.toUpperCase().replace(/[\s_-]+/g, '_') === normUserRole
    );
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
          <Tooltip content={displayName} position="right">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer">
              <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md overflow-hidden">
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
                  <h1 className="font-extrabold text-lg text-white tracking-tight truncate max-w-[170px]">
                    {displayName}
                  </h1>
                  <span className="text-[10px] text-primary-400 font-bold tracking-widest block uppercase truncate">
                    ENTERPRISE
                  </span>
                </div>
              )}
            </div>
          </Tooltip>
        </div>

        {/* Modules & Subtasks Navigation List */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1.5 scrollbar-none">
          {filteredModules.map((mod) => (
            <SidebarModuleItem
              key={mod.id}
              mod={mod}
              isCollapsed={isCollapsed}
              isExpanded={!!expandedModules[mod.id]}
              onToggleExpand={toggleModuleExpand}
              onNavItemClick={handleNavItemClick}
              hoveredModule={hoveredModule}
              setHoveredModule={setHoveredModule}
              location={location}
            />
          ))}
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
