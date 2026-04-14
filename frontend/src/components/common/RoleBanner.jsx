/** Contextual welcome banner that explains the user's role */
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { roleColor, roleInitials } from '../../utils/helpers';

const ROLE_MSGS = {
  Admin:    { icon: '⚙️', desc: 'Full system access — monitor all trains, ML insights, simulation controls, and all user logs.' },
  Engineer: { icon: '🛠️', desc: 'Technical access — sensor graphs, ML explainability, backend proof, and failure simulation.' },
  Operator: { icon: '🖥️', desc: 'Operational view — live status for your 2 assigned trains with simple, clear indicators.' },
  Inspector:{ icon: '📋', desc: 'Read-only inspection access — history logs, failure reports, and downloadable inspection records.' },
};

export default function RoleBanner() {
  const { user } = useAuth();
  const role  = user?.role || 'Admin';
  const color = roleColor(role);
  const msg   = ROLE_MSGS[role] || ROLE_MSGS.Admin;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 13,
      padding: '12px 18px', borderRadius: 12,
      background: `${color}11`, border: `1px solid ${color}33`,
      marginBottom: 18, animation: 'fadeUp .4s ease',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {roleInitials(user?.username || '')}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.07em' }}>
          {msg.icon} {role} Dashboard
        </div>
        <div style={{ fontSize: 13, color: 'var(--mt)', marginTop: 2 }}>{msg.desc}</div>
      </div>
    </div>
  );
}
