import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  ChevronDown,
  Key,
  LogOut,
} from 'lucide-react';

export const Topbar = ({ onOpenSecurityModal }) => {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'New User Invited', time: '10 mins ago', read: false },
    { id: 2, title: 'Security Audit Event', time: '1 hour ago', read: false },
    { id: 3, title: 'System Setup Complete', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxSizing: 'border-box',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Left: Search Anything Input Bar (Matching Reference Screenshot) */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '360px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px', // Rounded pill shape as seen in reference image
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Right Actions: Theme Toggle, Notifications Icons, Profile Avatar Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Dark / Light Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          aria-label="Toggle Theme Mode"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Notification Icon 1 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 100,
                color: 'var(--text-primary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: '#E86575', fontWeight: '700' }}>
                  {unreadCount} New
                </span>
              </div>

              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: n.read
                      ? 'transparent'
                      : 'var(--primary-light)',
                    marginBottom: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {n.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Icon 2 */}
        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          aria-label="Messages"
        >
          <MessageSquare size={18} />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#EF4444',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
            }}
          />
        </button>

        {/* User Profile Area (Matching Reference Screenshot: Avatar + Name + Subtitle + Chevron) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '4px',
            }}
          >
            {/* User Avatar Circle */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {(user?.displayName || 'Admin').charAt(0).toUpperCase()}
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.displayName || 'Admin'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                {role === 'SUPER_ADMIN' ? 'Super Admin' : role}
              </div>
            </div>

            <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '52px',
                width: '220px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenSecurityModal();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Key size={16} /> Security & Password
              </button>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: '#EF4444',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
