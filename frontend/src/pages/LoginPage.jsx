/**
 * RailGuard AI — Login Page
 * Split-screen: left branding panel + right login form with demo accounts.
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { username: 'admin',    password: 'admin123', role: 'Admin',    color: '#1a5ef5', initials: 'AD' },
  { username: 'engineer', password: 'eng456',   role: 'Engineer', color: '#10d978', initials: 'EN' },
  { username: 'operator', password: 'ops789',   role: 'Operator', color: '#f5a623', initials: 'OP' },
  { username: 'inspector',password: 'insp321',  role: 'Inspector',color: '#a855f7', initials: 'IN' },
];

/* ── Inline styles ── */
const S = {
  screen:    { minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: 'var(--bg)', overflow: 'hidden', position: 'relative' },
  left:      { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', background: 'rgba(10,17,31,.95)', borderRight: '1px solid var(--bdr)', position: 'relative' },
  right:     { width: 460, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 44px', background: 'var(--s1)' },
  logoRow:   { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 },
  logoIco:   { width: 62, height: 62, borderRadius: 18, background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 8px 32px rgba(26,94,245,.45)' },
  brand:     { fontFamily: 'var(--fh)', fontSize: 28, fontWeight: 800, color: 'var(--tx)' },
  brandSub:  { fontSize: 11, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 2 },
  headline:  { fontFamily: 'var(--fh)', fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 20, maxWidth: 400, color: 'var(--tx)' },
  desc:      { fontSize: 15, color: 'var(--mt)', lineHeight: 1.7, maxWidth: 380, marginBottom: 36 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, maxWidth: 360, marginBottom: 28 },
  statCard:  { background: 'rgba(255,255,255,.04)', border: '1px solid var(--bdr)', borderRadius: 13, padding: '14px 17px' },
  statVal:   { fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 800, color: 'var(--blue)', marginBottom: 3 },
  statLbl:   { fontSize: 11, color: 'var(--mt)' },
  badges:    { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badge:     { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,217,120,.08)', border: '1px solid rgba(16,217,120,.2)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: 'var(--g)', fontWeight: 600 },
  formHdr:   { textAlign: 'center', marginBottom: 32 },
  lockIco:   { fontSize: 42, marginBottom: 12 },
  formTitle: { fontFamily: 'var(--fh)', fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--tx)' },
  formSub:   { fontSize: 13, color: 'var(--mt)' },
  sslBadge:  { display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, background: 'rgba(16,217,120,.1)', border: '1px solid rgba(16,217,120,.22)', borderRadius: 20, padding: '4px 13px', fontSize: 11, color: 'var(--g)', fontWeight: 600 },
  errBox:    { background: 'var(--rbg)', border: '1px solid var(--rbd)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#ff9090', marginBottom: 14, textAlign: 'center', animation: 'fadeIn .3s ease' },
  fieldGrp:  { marginBottom: 16 },
  label:     { display: 'block', fontSize: 11, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 },
  inputWrap: { position: 'relative' },
  icoLeft:   { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--mt)', pointerEvents: 'none' },
  input:     { width: '100%', background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 11, padding: '13px 15px 13px 40px', fontSize: 16, color: 'var(--tx)', fontFamily: 'var(--fb)', outline: 'none' },
  loginBtn:  { width: '100%', padding: 15, background: 'var(--acc)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--fh)', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 4px 20px rgba(26,94,245,.3)', letterSpacing: '.02em' },
  divider:   { display: 'flex', alignItems: 'center', gap: 11, margin: '22px 0', color: 'var(--dim)', fontSize: 12 },
  divLine:   { flex: 1, height: 1, background: 'var(--bdr)' },
  demoGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 },
  demoBtn:   { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 11, cursor: 'pointer', transition: 'all .2s', textAlign: 'left' },
  dAvatar:   { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 },
  dName:     { fontSize: 13, fontWeight: 600, color: 'var(--tx)' },
  dPass:     { fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--fm)' },
  dRole:     { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 },
};

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username.trim().toLowerCase(), password);
  };

  const quickFill = (u, p) => { setUsername(u); setPassword(p); };

  return (
    <div style={S.screen}>
      {/* ── LEFT BRANDING PANEL ── */}
      <div style={S.left}>
        <div style={S.logoRow}>
          <div style={S.logoIco}>🚆</div>
          <div>
            <div style={S.brand}>RailGuard AI</div>
            <div style={S.brandSub}>Predictive Maintenance System</div>
          </div>
        </div>
        <div style={S.headline}>
          AI-Powered Safety for<br />
          <span style={{ color: 'var(--blue)' }}>Indian Railways</span>
        </div>
        <div style={S.desc}>
          Monitor train bogies, track sensors, and predict component failures before they
          happen — across any route in real time, using machine learning.
        </div>
        <div style={S.statsGrid}>
          {[['13,000+','Daily trains tracked'],['6/train','Bogies monitored'],['2s','Sensor update speed'],['99.2%','ML model accuracy']].map(([v,l]) => (
            <div key={l} style={S.statCard}>
              <div style={S.statVal}>{v}</div>
              <div style={S.statLbl}>{l}</div>
            </div>
          ))}
        </div>
        <div style={S.badges}>
          {['✅ RDSO Standards','✅ Random Forest ML','✅ JWT Auth','✅ Role-Based Access'].map(b => (
            <span key={b} style={S.badge}>{b}</span>
          ))}
        </div>
      </div>

      {/* ── RIGHT LOGIN FORM ── */}
      <div style={S.right}>
        <div style={S.formHdr}>
          <div style={S.lockIco}>🔐</div>
          <div style={S.formTitle}>Secure Login</div>
          <div style={S.formSub}>Indian Railways Control Portal</div>
          <div style={S.sslBadge}>🔒 SSL Encrypted · JWT Authenticated</div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={S.errBox}>❌ {error}</div>}

          <div style={S.fieldGrp}>
            <label style={S.label}>Username</label>
            <div style={S.inputWrap}>
              <span style={S.icoLeft}>👤</span>
              <input style={S.input} value={username} placeholder="Enter username"
                onChange={e => setUsername(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--bdh)'}
                onBlur={e  => e.target.style.borderColor = 'var(--bdr)'}
              />
            </div>
          </div>

          <div style={S.fieldGrp}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <span style={S.icoLeft}>🔑</span>
              <input style={S.input} type="password" value={password} placeholder="Enter password"
                onChange={e => setPassword(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--bdh)'}
                onBlur={e  => e.target.style.borderColor = 'var(--bdr)'}
              />
            </div>
          </div>

          <button type="submit" style={S.loginBtn} disabled={loading}>
            {loading ? '⏳  Logging in…' : '🚆  Log In to Dashboard'}
          </button>
        </form>

        <div style={S.divider}>
          <span style={S.divLine} />
          <span>Quick Demo Login</span>
          <span style={S.divLine} />
        </div>

        <div style={S.demoGrid}>
          {DEMO_ACCOUNTS.map(a => (
            <div key={a.username} style={S.demoBtn}
              onClick={() => quickFill(a.username, a.password)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bdh)'; e.currentTarget.style.background = 'var(--s3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bdr)'; e.currentTarget.style.background = 'var(--s2)'; }}
            >
              <div style={{ ...S.dAvatar, background: a.color }}>{a.initials}</div>
              <div>
                <div style={S.dName}>{a.username}</div>
                <div style={S.dPass}>{a.password}</div>
                <div style={{ ...S.dRole, color: a.color }}>{a.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
