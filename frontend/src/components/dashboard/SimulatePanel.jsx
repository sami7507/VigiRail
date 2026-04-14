/** Simulate failure / reset buttons — Admin and Engineer only */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { useAuth } from '../../context/AuthContext';

export default function SimulatePanel() {
  const { simMode, handleSimulate, alertCount } = useSensor();
  const { user } = useAuth();
  const canSim      = ['Admin', 'Engineer'].includes(user?.role);
  const canDownload = ['Admin', 'Inspector'].includes(user?.role);

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
      {canSim ? (
        <>
          <button
            onClick={() => handleSimulate(!simMode)}
            style={{
              flex: 1, minWidth: 200, padding: 14, border: 'none', borderRadius: 11,
              fontFamily: 'var(--fh)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              transition: 'all .2s',
              background: simMode ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' : 'linear-gradient(135deg,#c71f1f,#9b1c1c)',
              color: '#fff',
              boxShadow: simMode ? '0 0 0 6px rgba(255,60,60,.12)' : '0 4px 18px rgba(255,60,60,.25)',
              animation: simMode ? 'danger 1s ease-in-out infinite' : 'none',
            }}
          >
            {simMode ? '🔴   Failure Mode ACTIVE — Click to Stop' : '⚠️   Simulate Section Failure'}
          </button>
          <button
            onClick={() => handleSimulate(false)}
            style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 11, padding: '14px 20px', fontSize: 14, color: 'var(--mt)', cursor: 'pointer', fontFamily: 'var(--fb)', fontWeight: 500, transition: 'all .2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--bdh)'; e.target.style.color = 'var(--tx)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--bdr)'; e.target.style.color = 'var(--mt)'; }}
          >
            ↺ Reset Normal
          </button>
        </>
      ) : (
        <div style={{ flex: 1, minWidth: 200, padding: 14, borderRadius: 11, fontSize: 13, color: 'var(--dim)', background: 'var(--s2)', border: '1px solid rgba(48,130,255,.07)', textAlign: 'center', fontStyle: 'italic' }}>
          🔒 Failure simulation locked for {user?.role} role
        </div>
      )}

      {canDownload && (
        <button
          onClick={() => alert('📄 Report generation — connect to /api/report endpoint in production')}
          style={{ background: 'rgba(168,85,247,.12)', border: '1px solid rgba(168,85,247,.28)', borderRadius: 11, padding: '14px 20px', fontSize: 14, color: 'var(--purple)', cursor: 'pointer', fontFamily: 'var(--fb)', fontWeight: 600 }}
        >
          📥 Download Report
        </button>
      )}

      {alertCount > 0 && (
        <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--r)', background: 'var(--rbg)', border: '1px solid var(--rbd)', borderRadius: 8, padding: '6px 12px' }}>
          🚨 {alertCount} alert{alertCount !== 1 ? 's' : ''} today
        </div>
      )}
    </div>
  );
}
