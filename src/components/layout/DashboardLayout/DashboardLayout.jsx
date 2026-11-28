import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import ModernFloatingSidebar from '../ModernFloating/ModernFloatingSidebar';
import ModernFloatingNavbar from '../ModernFloating/ModernFloatingNavbar';
import ModernFloatingBackground from '../ModernFloating/ModernFloatingBackground';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

export const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { refreshUser } = useAuth();
  const { layoutTheme, smoothAnimations } = useTheme();
  const lastRefreshRef = useRef(0);
  const contentWrapperRef = useRef(null);

  const isModernFloating = layoutTheme === 'modern-floating';

  useEffect(() => {
    window.dispatchEvent(new Event('sms:layout-change'));
    return () => {
      window.dispatchEvent(new Event('sms:layout-change'));
    };
  }, [layoutTheme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsMobileOpen(false);
  }

  useEffect(() => {
    // Keep permissions freshly synced on page navigation without reload
    const now = Date.now();
    if (now - lastRefreshRef.current > 15000) {
      lastRefreshRef.current = now;
      refreshUser();
    }
  }, [location.pathname, refreshUser]);

  // Subtle non-remounting page transition on route navigation in Modern Floating theme
  useEffect(() => {
    const el = contentWrapperRef.current;
    if (!el || !isModernFloating || !smoothAnimations) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    el.classList.remove('mf-page-enter');
    void el.offsetWidth;
    el.classList.add('mf-page-enter');
  }, [location.pathname, isModernFloating, smoothAnimations]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div
      className={
        isModernFloating
          ? 'relative h-screen max-h-screen overflow-hidden bg-[var(--mf-outer-bg)] text-[var(--text-primary)] font-sans transition-colors duration-200'
          : 'flex min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans transition-colors duration-200'
      }
    >
      {isModernFloating && <ModernFloatingBackground />}

      {/* Primary-Colored Framed Outer Shell (wraps Sidebar + Rounded White Sheet) */}
      <div
        className={
          isModernFloating
            ? 'relative z-10 flex h-full max-h-screen w-full lg:p-0 shadow-[var(--mf-shell-shadow)] overflow-hidden'
            : 'flex flex-1 min-h-screen w-full'
        }
        style={
          isModernFloating
            ? {
                background:
                  'linear-gradient(175deg, var(--mf-sidebar-start, #C2410C) 0%, var(--mf-sidebar-end, #7C2D12) 100%)',
              }
            : undefined
        }
      >
        {isModernFloating ? (
          <ModernFloatingSidebar
            isCollapsed={isSidebarCollapsed}
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        ) : (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        )}

        <div
          data-sms-content-area="true"
          className={
            isModernFloating
              ? 'flex-1 flex flex-col min-w-0 bg-[var(--mf-surface)] lg:rounded-tl-[26px] lg:rounded-tr-none lg:rounded-b-none shadow-[var(--mf-sheet-shadow)] h-full max-h-full overflow-hidden'
              : 'flex-1 flex flex-col min-w-0'
          }
        >
          {isModernFloating ? (
            <ModernFloatingNavbar
              onToggleSidebar={handleToggleSidebar}
              isSidebarCollapsed={isSidebarCollapsed}
              isMobileOpen={isMobileOpen}
            />
          ) : (
            <Navbar
              onToggleSidebar={handleToggleSidebar}
              isSidebarCollapsed={isSidebarCollapsed}
              isMobileOpen={isMobileOpen}
            />
          )}

          <main
            className={
              isModernFloating
                ? 'flex-1 min-h-0 pt-3.5 sm:pt-4 lg:pt-4 px-3.5 sm:px-4 lg:px-5 pb-5 sm:pb-6 overflow-y-auto overflow-x-hidden'
                : 'flex-1 p-3 sm:p-5 md:p-6 overflow-x-hidden'
            }
          >
            <div ref={contentWrapperRef}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
