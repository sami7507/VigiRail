/**
 * VigiRail — login screen.
 * Split layout: product panel (desktop) + sign-in card with demo accounts.
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { roleColor } from '../lib/helpers';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'engineer', password: 'eng456', role: 'Engineer' },
  { username: 'operator', password: 'ops789', role: 'Operator' },
  { username: 'inspector', password: 'insp321', role: 'Inspector' },
];

function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="vg-login-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#vg-login-logo)" />
      <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
        <path d="M17 9 14.5 39" />
        <path d="M31 9l2.5 30" />
        <path d="M16.4 17h15.4M15.9 24.5h16.4M15.4 32h17.4" opacity="0.92" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (username.trim() && password) login(username, password);
  };

  const quickFill = (account) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div className="login">
      {/* Product panel */}
      <aside className="login-hero">
        <div className="login-brand">
          <Logo />
          <div>
            <div className="brand-name" style={{ fontSize: 19 }}>VigiRail</div>
            <div className="brand-sub">Railway asset health platform</div>
          </div>
        </div>

        <h1 className="login-headline">
          Predict failures before they <span className="accent">happen</span>.
        </h1>
        <p className="login-desc">
          VigiRail streams rolling-stock sensor telemetry, scores component
          failure risk with a Random Forest model, and gives every role —
          operator, engineer, inspector — exactly the view it needs.
        </p>

        <div className="login-stats">
          {[
            ['7 services', 'in the monitored fleet'],
            ['4 sensors', 'per snapshot, 2 s cadence'],
            ['200 trees', 'Random Forest ensemble'],
            ['4 roles', 'granular access control'],
          ].map(([value, label]) => (
            <div key={label} className="login-stat">
              <div className="login-stat-value">{value}</div>
              <div className="login-stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="login-badges">
          {[
            { icon: 'shield', text: 'JWT + RBAC' },
            { icon: 'activity', text: 'RDSO thresholds' },
            { icon: 'cpu', text: 'Hold-out evaluated' },
          ].map((badge) => (
            <span key={badge.text} className="badge badge-info">
              <Icon name={badge.icon} size={12} />
              {badge.text}
            </span>
          ))}
        </div>
      </aside>

      {/* Sign-in panel */}
      <main className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand">
            <Logo size={36} />
            <div>
              <div className="brand-name" style={{ fontSize: 17 }}>VigiRail</div>
              <div className="brand-sub">Asset health platform</div>
            </div>
          </div>

          <h2 className="login-title">Sign in to your workspace</h2>
          <p className="login-sub">Use your operator credentials to continue.</p>

          <form className="login-form" onSubmit={submit}>
            {error && (
              <div className="login-error" role="alert">
                <Icon name="alertTriangle" size={16} />
                {error}
              </div>
            )}

            <div className="field">
              <label className="label" htmlFor="username">Username</label>
              <div className="input-wrap">
                <Icon name="user" size={16} />
                <input
                  id="username"
                  className="input"
                  value={username}
                  autoComplete="username"
                  placeholder="e.g. engineer"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <Icon name="shield" size={16} />
                <input
                  id="password"
                  className="input"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  <Icon name="logout" size={16} style={{ transform: 'scaleX(-1)' }} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="divider">Demo accounts — tap to fill</div>

          <div className="demo-grid">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.username}
                type="button"
                className="demo-btn"
                onClick={() => quickFill(account)}
              >
                <span className="avatar" style={{ background: roleColor(account.role), width: 30, height: 30, fontSize: 11 }}>
                  {account.username.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="demo-name">{account.username}</span>
                  <br />
                  <span className="demo-pass">{account.password}</span>
                  <br />
                  <span className="demo-role" style={{ color: roleColor(account.role) }}>
                    {account.role}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="login-foot">
            VigiRail demo environment · data is simulated for evaluation
          </p>
        </div>
      </main>
    </div>
  );
}
