import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  ChevronDown,
  Crown,
  X,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  useAuthorizedNavigation,
  isModulePathActive,
  isSubtaskPathActive,
} from '../../../hooks/useAuthorizedNavigation';
import Tooltip from '../../shared/Tooltip';

const FloatingSidebarModuleItem = ({
  mod,
  isCollapsed,
  isExpanded,
  onToggleExpand,
  onNavItemClick,
  hoveredModule,
  setHoveredModule,
  location,
  smoothAnimations,
}) => {
  const chevronRef = useRef(null);
  const contentRef = useRef(null);
  const isFirstRender = useRef(true);

  const IconComponent = mod.icon;
  const isModuleActive = isModulePathActive(mod, location.pathname, location.search);

  useEffect(() => {
    const el = contentRef.current;
    const chevron = chevronRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = smoothAnimations && !prefersReduced;

    if (isFirstRender.current || !shouldAnimate) {
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

    if (chevron) {
      gsap.to(chevron, {
        rotation: isExpanded && !isCollapsed ? 0 : -90,
        duration: 0.28,
        ease: 'power2.out',
      });
    }

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
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => gsap.set(el, { height: 'auto' }),
        },
      );

      const items = el.querySelectorAll('.mf-subtask-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -6 },
          { opacity: 1, x: 0, duration: 0.2, stagger: 0.035, ease: 'power2.out', delay: 0.03 },
        );
      }
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.inOut',
        onComplete: () => gsap.set(el, { display: 'none' }),
      });
    }

    return () => {
      gsap.killTweensOf(el);
      if (chevron) gsap.killTweensOf(chevron);
    };
  }, [isExpanded, isCollapsed, smoothAnimations]);

  const hasSubtasks = Array.isArray(mod.subtasks) && mod.subtasks.length > 0;

  return (
    <div
      className={isCollapsed ? 'relative z-10 w-full h-11 flex items-center justify-center' : 'relative z-10'}
      onMouseEnter={() => isCollapsed && setHoveredModule(mod.id)}
      onMouseLeave={() => isCollapsed && setHoveredModule(null)}
    >
      {hasSubtasks ? (
        <Tooltip content={isCollapsed ? mod.label : null} position="right" variant="primary">
          <button
            type="button"
            onClick={(e) => {
              if (isCollapsed) {
                onNavItemClick?.(e, mod);
              } else {
                onToggleExpand(mod.id);
              }
            }}
            data-nav-item="true"
            data-active-pill={isModuleActive ? 'true' : undefined}
            aria-expanded={isExpanded}
            className={`group flex items-center py-2.5 text-[13.5px] font-medium transition-all duration-200 cursor-pointer relative z-20 ${
              isCollapsed
                ? 'w-11 h-11 justify-center rounded-2xl transition-all'
                : isModuleActive
                ? 'w-full justify-between pl-4 pr-3 mr-3 rounded-2xl bg-white/15 text-white font-semibold'
                : 'w-full justify-between pl-4 pr-3 mr-3 rounded-2xl text-white/85 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
            }`}
          >
            <div className={`mf-tab-content flex items-center gap-3 overflow-hidden origin-left ${isCollapsed ? 'w-11 h-11 justify-center origin-center' : ''}`}>
              <IconComponent
                size={20}
                className={`shrink-0 transition-transform duration-200 ${
                  isModuleActive
                    ? isCollapsed
                      ? 'text-[var(--mf-sidebar-active-text)] dark:text-primary-300 scale-105'
                      : 'text-white scale-105'
                    : 'text-white/85 group-hover:scale-110 group-hover:text-white'
                }`}
              />
              {!isCollapsed && <span className="truncate">{mod.label}</span>}
            </div>
            {!isCollapsed && (
              <span
                ref={chevronRef}
                className="text-white/75 flex items-center justify-center p-0.5 inline-block origin-center"
              >
                <ChevronDown size={15} />
              </span>
            )}
          </button>
        </Tooltip>
      ) : (
        <Tooltip content={isCollapsed ? mod.label : null} position="right" variant="primary">
          <NavLink
            to={mod.path}
            onClick={(e) => onNavItemClick?.(e, mod)}
            data-nav-item="true"
            data-active-pill={isModuleActive ? 'true' : undefined}
            className={({ isActive }) => {
              const active = isActive || isModuleActive;
              if (isCollapsed) {
                return `mf-nav-item group w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 relative z-20 ${
                  active
                    ? 'font-bold'
                    : 'text-white/85 hover:text-white'
                }`;
              }
              return `mf-nav-item group flex items-center gap-3 py-2.5 pl-4 pr-4 text-[13.5px] transition-all duration-200 relative z-20 ${
                active
                  ? 'mf-nav-active-pill font-semibold'
                  : 'mr-3 rounded-2xl text-white/85 hover:bg-white/10 hover:text-white hover:translate-x-0.5 font-medium'
              }`;
            }}
          >
            {({ isActive }) => {
              const active = isActive || isModuleActive;
              return (
                <div className={`mf-tab-content flex items-center gap-3 overflow-hidden origin-left ${isCollapsed ? 'w-11 h-11 justify-center origin-center' : 'w-full'}`}>
                  <IconComponent
                    size={20}
                    className={`shrink-0 transition-transform duration-200 ${
                      active
                        ? 'text-[var(--mf-sidebar-active-text)] dark:text-primary-300 scale-105'
                        : 'text-white/85 group-hover:scale-110 group-hover:text-white'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{mod.label}</span>}
                </div>
              );
            }}
          </NavLink>
        </Tooltip>
      )}

      {/* Sub-tasks Tree View */}
      {!isCollapsed && hasSubtasks && (
        <div
          ref={contentRef}
          className="overflow-hidden mr-3"
          style={{ display: isExpanded && !isCollapsed ? 'block' : 'none' }}
        >
          <div className="ml-5 pl-3 border-l border-white/20 my-1.5 space-y-1 py-0.5">
            {mod.subtasks.map((st) => (
              <NavLink
                key={st.id}
                to={st.path}
                end
                onClick={onNavItemClick}
                className={({ isActive }) => {
                  const isCurrent =
                    isSubtaskPathActive(st.path, location.pathname, location.search) ||
                    (!st.path.includes('?') && isActive);
                  return `mf-subtask-item group/sub flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-[var(--mf-surface)] text-[var(--mf-sidebar-active-text)] dark:text-primary-300 font-semibold shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                  }`;
                }}
              >
                {({ isActive }) => {
                  const isCurrent =
                    isSubtaskPathActive(st.path, location.pathname, location.search) ||
                    (!st.path.includes('?') && isActive);
                  return (
                    <>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${
                          isCurrent
                            ? 'bg-current scale-110'
                            : 'border border-white/50 bg-transparent group-hover/sub:border-white'
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

      {/* Hover Popover for Collapsed Mode */}
      {isCollapsed && hoveredModule === mod.id && hasSubtasks && (
        <div
          className="absolute left-[72px] top-0 w-60 rounded-2xl border border-white/20 shadow-2xl p-3.5 z-50 text-white mf-dropdown-enter"
          style={{
            background:
              'linear-gradient(165deg, var(--mf-sidebar-start, #C2410C) 0%, var(--mf-sidebar-end, #7C2D12) 100%)',
          }}
        >
          <div className="font-bold text-sm text-white mb-2 px-1">{mod.label}</div>
          <div className="border-l border-white/20 pl-2.5 space-y-1">
            {mod.subtasks.map((st) => {
              const isCurrent = isSubtaskPathActive(st.path, location.pathname, location.search);
              return (
                <NavLink
                  key={st.id}
                  to={st.path}
                  onClick={() => {
                    setHoveredModule(null);
                    onNavItemClick();
                  }}
                  className={`block px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isCurrent
                      ? 'bg-[var(--mf-surface)] text-[var(--mf-sidebar-active-text)] dark:text-primary-300 font-semibold shadow-sm'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  • {st.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ModernFloatingSidebar = ({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const { smoothAnimations } = useTheme();
  const location = useLocation();
  const { authorizedModules, isSuperAdmin } = useAuthorizedNavigation();

  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const isFirstRender = useRef(true);

  const [expandedModules, setExpandedModules] = useState(() => {
    const initial = {};
    authorizedModules.forEach((mod) => {
      if (
        mod.subtasks?.some((st) =>
          isSubtaskPathActive(st.path, location.pathname, location.search),
        )
      ) {
        initial[mod.id] = true;
      }
    });
    return initial;
  });
  const [hoveredModule, setHoveredModule] = useState(null);

  useEffect(() => {
    authorizedModules.forEach((mod) => {
      if (
        mod.subtasks?.some((st) =>
          isSubtaskPathActive(st.path, location.pathname, location.search),
        )
      ) {
        setExpandedModules((prev) => (prev[mod.id] ? prev : { ...prev, [mod.id]: true }));
      }
    });
  }, [authorizedModules, location.pathname, location.search]);

  // Spring animation engine for active sidebar tab
  const updateSpringIndicator = (animate = true, overrideTargetEl = null) => {
    const navEl = navRef.current;
    const indicatorEl = indicatorRef.current;
    if (!navEl || !indicatorEl) return;

    const targetEl =
      overrideTargetEl ||
      navEl.querySelector('[data-active-pill="true"]');

    if (!targetEl) {
      gsap.to(indicatorEl, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
      });
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const targetY = targetRect.top - navRect.top + navEl.scrollTop;
    const targetHeight = targetRect.height;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = smoothAnimations && !prefersReduced && animate;

    gsap.killTweensOf(indicatorEl);

    if (isFirstRender.current || !shouldAnimate) {
      isFirstRender.current = false;
      gsap.set(indicatorEl, {
        y: targetY,
        height: targetHeight,
        opacity: 1,
      });
      return;
    }

    // High performance GSAP spring physics with tactile overshoot & rebound
    gsap.to(indicatorEl, {
      y: targetY,
      height: targetHeight,
      opacity: 1,
      duration: 0.46,
      ease: 'elastic.out(1, 0.75)',
      overwrite: 'auto',
    });

    // Tactile micro-spring on tab content
    const tabContent = targetEl.querySelector('.mf-tab-content');
    if (tabContent) {
      gsap.killTweensOf(tabContent);
      gsap.fromTo(
        tabContent,
        { scale: 0.94 },
        {
          scale: 1,
          duration: 0.36,
          ease: 'back.out(2)',
          clearProps: 'scale',
        },
      );
    }
  };

  // Trigger spring animation whenever location / active tab changes
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      updateSpringIndicator(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [location.pathname, location.search]);

  // Snap instantly without spring lag when toggling sidebar collapsed/expanded
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      updateSpringIndicator(false);
    });
    return () => cancelAnimationFrame(frameId);
  }, [isCollapsed]);

  // Update position if an accordion item expands/collapses
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSpringIndicator(true);
    }, 120);
    return () => clearTimeout(timer);
  }, [expandedModules]);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => {
      updateSpringIndicator(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleNavItemClick = (e, mod) => {
    if (e?.currentTarget) {
      updateSpringIndicator(true, e.currentTarget);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const displayLogoUrl = !isSuperAdmin
    ? user?.organization?.logoUrl || user?.organizationLogo || user?.logoUrl
    : null;
  const displayName = !isSuperAdmin
    ? user?.organization?.name || user?.organizationName || 'SalonFlow Pro'
    : 'SalonFlow Pro';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-label="Close Navigation Overlay"
        />
      )}

      {/* Seamless Primary-Framed Sidebar (Flush against the white rounded content sheet) */}
      <aside
        aria-label="Primary Sidebar Navigation"
        className={`fixed lg:relative top-0 z-50 lg:z-30 flex flex-col text-white select-none transition-all duration-300 ease-out shrink-0 h-full ${
          isMobileOpen
            ? 'left-0 top-0 bottom-0 w-[264px] translate-x-0 rounded-r-[26px] shadow-2xl'
            : 'left-0 top-0 bottom-0 -translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[74px]' : 'lg:w-[244px]'}`}
        style={
          isMobileOpen
            ? {
                background:
                  'linear-gradient(175deg, var(--mf-sidebar-start, #C2410C) 0%, var(--mf-sidebar-end, #7C2D12) 100%)',
              }
            : undefined
        }
      >
        {/* Brand Header */}
        <div
          className={`h-[56px] flex items-center shrink-0 transition-all duration-200 ${
            isCollapsed ? 'pl-2 pr-0 justify-center' : 'pl-4 pr-3 justify-between'
          }`}
        >
          <Tooltip content={displayName} position="right">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 min-w-[36px] rounded-xl bg-white/15 border border-white/25 text-white flex items-center justify-center overflow-hidden">
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Crown size={18} strokeWidth={2.2} />
                )}
              </div>

              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <div className="font-bold text-[15.5px] text-white tracking-tight truncate max-w-[138px] leading-tight">
                    {displayName}
                  </div>
                </div>
              )}
            </div>
          </Tooltip>

          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links (Left-padded, zero right padding so active carved pill touches the white sheet seamlessly) */}
        <nav
          ref={navRef}
          className={`relative flex-1 ${
            isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-visible'
          } py-3 space-y-1 ${
            isCollapsed ? 'pl-2 pr-0' : 'pl-3 pr-0'
          }`}
        >
          {/* Spring Floating Active Tab Indicator */}
          <div
            ref={indicatorRef}
            aria-hidden="true"
            className={`mf-nav-spring-indicator pointer-events-none absolute ${
              isCollapsed ? 'is-collapsed' : 'is-expanded'
            }`}
            style={{ opacity: 0 }}
          />

          {authorizedModules.map((mod) => (
            <FloatingSidebarModuleItem
              key={mod.id}
              mod={mod}
              isCollapsed={isCollapsed}
              isExpanded={!!expandedModules[mod.id]}
              onToggleExpand={toggleModuleExpand}
              onNavItemClick={handleNavItemClick}
              hoveredModule={hoveredModule}
              setHoveredModule={setHoveredModule}
              location={location}
              smoothAnimations={smoothAnimations}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default ModernFloatingSidebar;
