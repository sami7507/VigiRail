/** Sticky topbar: logo, live clock, user chip, logout */
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClock, useDate } from '../../hooks/useClock';
import { roleColor, roleInitials } from '../../utils/helpers';

export default function Topbar() {
  const { user, logout } = useAuth();
  const clock = useClock();
  const date  = useDate();
  const color = roleColor(user?.role);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', background: 'var(--s1)',
      borderBottom: '1px solid var(--bdr)',
      position: 'sticky', top: 0, zIndex: 100,
      flexWrap: 'wrap', gap: 10,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚆</div>
        <div>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 17, fontWeight: 800 }}>RailGuard AI</div>
          <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Indian Railways · Predictive Maintenance</div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
        {/* Live clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--s2)', border: '1px solid var(--gbd)', borderRadius: 10, padding: '6px 14px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--g)', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div>
            <div style={{ fontSize: 9, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.08em' }}>LIVE</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 14, fontWeight: 600, color: 'var(--g)', minWidth: 100 }}>{clock}</div>
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--mt)', borderLeft: '1px solid var(--bdr)', paddingLeft: 9 }}>{date}</div>
        </div>

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '6px 13px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {roleInitials(user?.username || '')}
          </div>
          <span style={{ fontWeight: 500, fontSize: 13 }}>{user?.username}</span>
          <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 7, background: `${color}22`, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            {user?.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{ background: 'var(--rbg)', border: '1px solid var(--rbd)', borderRadius: 9, padding: '6px 13px', fontSize: 12, color: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--fb)', fontWeight: 500 }}
        >
          ⏏ Logout
        </button>
      </div>
    </div>
  );
}
