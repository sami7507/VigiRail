/**
 * BogieCard.jsx
 * Shows health status of all 6 bogies (wheel-axle units) in a grid.
 *
 * ACCESSIBILITY:
 * - Every status uses color + icon + plain-English text
 * - Large enough touch targets for elderly users
 * - Legend always visible at bottom
 */
import React from 'react';

const STATUS = {
  good:   { color: 'var(--green)',  bg: 'var(--green-bg)',  label: 'Good Condition' },
  warn:   { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Check Required' },
  danger: { color: 'var(--red)',    bg: 'var(--red-bg)',    label: 'HIGH RISK' },
};

function BogieItem({ bogie }) {
  const s = STATUS[bogie.status] || STATUS.good;
  return (
    <div style={{
      background: 'var(--surface2)',
      border: `1px solid ${s.bg}`,
      borderRadius: 10,
      padding: 14,
      position: 'relative',
      transition: 'transform 0.25s, border-color 0.3s',
      cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Status dot badge */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        width: 10, height: 10, borderRadius: '50%',
        background: s.color,
      }} />
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{bogie.label}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: s.color }}>{s.label}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Temp: {bogie.temp}°C</div>
    </div>
  );
}

export default function BogieCard({ bogies }) {
  if (!bogies) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
      <div style={titleStyle}>⚙️ Bogie Health Map — All 6 Units</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {bogies.map(b => <BogieItem key={b.id} bogie={b} />)}
      </div>

      {/* Always-visible legend for accessibility */}
      <div style={{
        marginTop: 14, padding: '10px 14px',
        background: 'var(--surface2)', borderRadius: 10,
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legend</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Object.entries(STATUS).map(([key, s]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const titleStyle = {
  fontFamily: 'var(--font-head)',
  fontSize: 14, fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--muted)',
  marginBottom: 14,
};
