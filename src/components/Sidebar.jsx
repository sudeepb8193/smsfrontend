import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthorizedNavModules } from '../config/sidebar.config';
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
      style={{
        width: isCollapsed ? '72px' : '260px',
        backgroundColor: '#21141A', // Deep plum wine dark background matching specification image
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxSizing: 'border-box',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
      }}
    >
      {/* Collapse / Expand Toggle Floating Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '24px',
          right: '-14px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#331D27',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#F9FAFB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          zIndex: 40,
          transition: 'all 0.2s ease',
        }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label="Toggle sidebar collapse"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '20px 14px' : '22px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            minWidth: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8A4A52 0%, #6E363E 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(138, 74, 82, 0.45)',
          }}
        >
          <Crown size={22} />
        </div>

        {!isCollapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              SalonFlow Pro
            </div>
            <div style={{ fontSize: '0.68rem', color: '#8A4A52', fontWeight: '700', letterSpacing: '0.06em' }}>
              ENTERPRISE PLATFORM
            </div>
          </div>
        )}
      </div>

      {/* Navigation Modules & Sub-tasks */}
      <nav style={{ padding: '18px 12px', flex: 1, overflowY: 'auto' }}>
        {modules.map((mod) => {
          const IconComponent = mod.icon;
          const isSelectedModule = activeModuleName === mod.id;
          const isExpanded = expandedModules[mod.id];

          return (
            <div
              key={mod.id}
              style={{ position: 'relative', marginBottom: '8px' }}
              onMouseEnter={() => isCollapsed && setHoveredModule(mod.id)}
              onMouseLeave={() => isCollapsed && setHoveredModule(null)}
            >
              {/* Parent Module Row Button */}
              <button
                onClick={() => handleModuleClick(mod)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isCollapsed ? '12px' : '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isSelectedModule
                    ? 'linear-gradient(135deg, #8A4A52 0%, #6E363E 100%)' // Exact Burgundy Rose active pill
                    : 'transparent',
                  color: isSelectedModule ? '#FFFFFF' : '#C4B5BE',
                  fontWeight: isSelectedModule ? '700' : '600',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  boxShadow: isSelectedModule ? '0 4px 16px rgba(138, 74, 82, 0.4)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <IconComponent size={20} style={{ minWidth: '20px', color: isSelectedModule ? '#FFFFFF' : '#C4B5BE' }} />
                  {!isCollapsed && (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mod.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {mod.badge && !isSelectedModule && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(138, 74, 82, 0.25)',
                          color: '#8A4A52',
                        }}
                      >
                        {mod.badge}
                      </span>
                    )}
                    {mod.subtasks && (
                      <span style={{ color: isSelectedModule ? '#FFFFFF' : '#8E7A86' }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Expanded Sub-tasks Tree View */}
              {!isCollapsed && isExpanded && mod.subtasks && (
                <div
                  style={{
                    marginLeft: '26px',
                    paddingLeft: '14px',
                    borderLeft: '1.5px solid rgba(255, 255, 255, 0.1)',
                    marginTop: '6px',
                    marginBottom: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {mod.subtasks.map((st) => {
                    const isSubtaskActive = st.path === currentPath || propsActiveSubtask === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => handleSubtaskClick(mod.id, st)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isSubtaskActive
                            ? 'rgba(138, 74, 82, 0.22)'
                            : 'transparent',
                          color: isSubtaskActive ? '#8A4A52' : '#9E8895',
                          fontWeight: isSubtaskActive ? '700' : '500',
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Circle
                          size={6}
                          fill={isSubtaskActive ? '#8A4A52' : 'none'}
                          color={isSubtaskActive ? '#8A4A52' : '#9E8895'}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {st.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hover Popover Tree View (Collapsed Mode) */}
              {isCollapsed && hoveredModule === mod.id && mod.subtasks && (
                <div
                  style={{
                    position: 'absolute',
                    left: '68px',
                    top: 0,
                    width: '240px',
                    backgroundColor: '#271820',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    padding: '14px',
                    zIndex: 100,
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '10px' }}>
                    {mod.label}
                  </div>
                  <div
                    style={{
                      borderLeft: '1.5px solid rgba(255, 255, 255, 0.1)',
                      paddingLeft: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {mod.subtasks.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          handleSubtaskClick(mod.id, st);
                          setHoveredModule(null);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#C4B5BE',
                          fontSize: '0.82rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
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
      <div
        style={{
          padding: isCollapsed ? '16px 12px' : '16px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#190E14',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(138, 74, 82, 0.22)',
            color: '#8A4A52',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={18} />
        </div>
        {!isCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.7rem', color: '#8E7A86', fontWeight: '600' }}>Active Session</div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF', truncate: true }}>
              {user?.displayName || 'Super Admin'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
