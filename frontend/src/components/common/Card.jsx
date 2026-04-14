/** Reusable dark card wrapper */
import React from 'react';

const s = {
  card: {
    background: 'var(--s1)',
    border: '1px solid var(--bdr)',
    borderRadius: 14,
    padding: '18px 20px',
    transition: 'border-color .3s',
    animation: 'fadeUp .4s ease both',
  },
  title: {
    fontFamily: 'var(--fh)',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    color: 'var(--mt)',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
};

export default function Card({ title, icon, children, style = {} }) {
  return (
    <div style={{ ...s.card, ...style }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bdh)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bdr)'}
    >
      {title && (
        <div style={s.title}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
