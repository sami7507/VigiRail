/** 6-bogie health grid with color-coded status */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';

const RL = [
  { lbl: 'Good Condition', col: '#10d978', bg: 'rgba(16,217,120,.1)', bdr: 'rgba(16,217,120,.25)' },
  { lbl: 'Check Required',  col: '#f5a623', bg: 'rgba(245,166,35,.1)',  bdr: 'rgba(245,166,35,.25)'  },
  { lbl: 'HIGH RISK',       col: '#ff3c3c', bg: 'rgba(255,60,60,.1)',   bdr: 'rgba(255,60,60,.25)'   },
];
const STATUS_IDX = { good: 0, warn: 1, danger: 2 };

export default function BogieCard() {
  const { data } = useSensor();
  const bogies = data?.bogies || [];

  return (
    <Card title="Bogie Health Map — All 6 Units" icon="⚙️">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 10 }}>
        {bogies.map((b, i) => {
          const ri = STATUS_IDX[b.status] ?? 0;
          const r  = RL[ri];
          const hp = ri === 2 ? 78 : ri === 1 ? 52 : 88;
          return (
            <div key={b.id} style={{ background: 'var(--s2)', border: `1px solid ${r.bdr}`, borderRadius: 10, padding: '11px 12px', position: 'relative', transition: 'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: '50%', background: r.col }} />
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--mt)', marginBottom: 3, letterSpacing: '.06em' }}>{b.id}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', marginBottom: 3 }}>{b.label}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: r.col, marginBottom: 3 }}>{r.lbl}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--mt)' }}>Temp: {b.temp}°C</div>
              <div style={{ height: 3, background: 'var(--s3)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${hp}%`, background: r.col, borderRadius: 2, transition: 'width .8s' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 9, borderTop: '1px solid var(--bdr)' }}>
        {RL.map(r => (
          <span key={r.lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--mt)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.col, display: 'inline-block' }} />
            {r.lbl}
          </span>
        ))}
      </div>
    </Card>
  );
}
