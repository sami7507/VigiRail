/**
 * VigiRail — authenticated app shell.
 * Sidebar (desktop) + sticky topbar + bottom nav (mobile) around the routed page.
 * Owns the SensorProvider so telemetry only polls while authenticated.
 */
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { SensorProvider, useSensor } from '../context/SensorContext';
import { useAuth } from '../context/AuthContext';
import { useClock, useDate, useOnline } from '../hooks/useClock';
import { navForRole, pageMeta } from '../lib/nav';
import { roleColor, roleInitials } from '../lib/helpers';
import Icon from './Icon';

function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="vg-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#vg-logo)" />
      <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
        <path d="M17 9 14.5 39" />
        <path d="M31 9l2.5 30" />
        <path d="M16.4 17h15.4M15.9 24.5h16.4M15.4 32h17.4" opacity="0.92" />
      </g>
    </svg>
  );
}

function ConnectionBanners() {
  const online = useOnline();
  const { error } = useSensor();
  return (
    <>
      {!online && (
        <div className="conn-banner">You are offline — showing the last known state.</div>
      )}
      {online && error && (
        <div className="conn-banner" style={{ background: '#7f1d1d' }}>
          API unreachable — retrying automatically.
        </div>
      )}
    </>
  );
}

function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={32} />
        <div>
          <div className="brand-name">VigiRail</div>
          <div className="brand-sub">Asset Health</div>
        </div>
      </div>
      <nav className="side-nav" aria-label="Primary">
        <div className="side-nav-label">Monitor</div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span>VigiRail v3.0</span>
        <span className="mono">MIT</span>
      </div>
    </aside>
  );
}

function Topbar({ title }) {
  const { user, logout } = useAuth();
  const clock = useClock();
  const date = useDate();
  const color = roleColor(user?.role);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <Logo size={30} />
          <div className="brand-text">
            <div className="brand-name" style={{ fontSize: 14.5 }}>VigiRail</div>
          </div>
        </div>
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-crumb">Railway asset health</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="clock-chip">
          <span className="dot dot-live" style={{ color: 'var(--green)' }} />
          <span className="clock-time">{clock}</span>
          <span className="clock-date">{date}</span>
        </div>

        <div className="user-chip">
          <span className="avatar" style={{ background: color }}>
            {roleInitials(user?.username || '')}
          </span>
          <span className="who">
            <span className="user-chip-name">{user?.full_name || user?.username}</span>
            <br />
            <span className="user-chip-role" style={{ color }}>
              {user?.role}
            </span>
          </span>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
        >
          <Icon name="logout" size={15} />
          <span className="logout-label">Sign out</span>
        </button>
      </div>
    </header>
  );
}

function BottomNav({ items }) {
  return (
    <nav className="bottom-nav" aria-label="Primary mobile">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
        >
          <Icon name={item.icon} size={19} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Shell() {
  const { user } = useAuth();
  const location = useLocation();
  const items = navForRole(user?.role);
  const meta = pageMeta(location.pathname);
  const title = location.pathname === '/' ? 'Overview' : meta.label;

  return (
    <div className="app">
      <ConnectionBanners />
      <Sidebar items={items} />
      <div className="app-main">
        <Topbar title={title} />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <BottomNav items={items} />
    </div>
  );
}

export default function AppShell() {
  return (
    <SensorProvider>
      <Shell />
    </SensorProvider>
  );
}
