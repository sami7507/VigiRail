/** Metric mini-card: label + big number + subtitle */
import React from 'react';

export default function StatCard({ label, value, sub, color = 'var(--blue)', style = {} }) {
  return (
    <div style={{
      background: 'var(--s2)', border: '1px solid var(--bdr)',
      borderRadius: 12, padding: '16px 18px',
      transition: 'all .3s', animation: 'fadeUp .4s ease both', ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bdh)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bdr)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--fh)', fontSize: 26, fontWeight: 800, color, marginBottom: 3, transition: 'color .4s' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--dim)' }}>{sub}</div>}
    </div>
  );
}
