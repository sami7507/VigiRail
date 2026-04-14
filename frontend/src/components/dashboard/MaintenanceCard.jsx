/** Maintenance action items from the backend */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';

const URGENCY = {
  urgent:  { bg: 'var(--rbg)', col: 'var(--r)',    lbl: 'URGENT' },
  today:   { bg: 'var(--rbg)', col: 'var(--r)',    lbl: 'Today'  },
  soon:    { bg: 'var(--ybg)', col: 'var(--y)',    lbl: 'Soon'   },
  planned: { bg: 'rgba(65,153,255,.1)', col: 'var(--blue)', lbl: 'Planned' },
  done:    { bg: 'var(--gbg)', col: 'var(--g)',    lbl: 'Done'   },
};

export default function MaintenanceCard() {
  const { data } = useSensor();
  const items = data?.maintenance || [
    { icon: '🔩', title: 'Lubricate Axle Bearings', detail: 'Mild friction detected — within 7 days', urgency: 'soon' },
    { icon: '✅', title: 'Wheel Inspection',         detail: 'All wheels within safe limits',           urgency: 'done' },
    { icon: '🔍', title: 'Brake Pad Check',          detail: 'Pads at ~69% life',                       urgency: 'planned' },
  ];

  return (
    <Card title="Maintenance Actions" icon="🔧">
      {items.map((item, i) => {
        const u = URGENCY[item.urgency] || URGENCY.planned;
        return (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid var(--bdr)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: u.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--tx)', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--mt)' }}>{item.detail}</div>
            </div>
            <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: u.bg, color: u.col, flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
              {u.lbl}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
