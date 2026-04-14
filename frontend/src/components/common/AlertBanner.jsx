/** Full-width alert banner that changes with sensor state */
import React from 'react';
import { useSensor } from '../../context/SensorContext';

export default function AlertBanner() {
  const { data, simMode } = useSensor();
  const state = simMode ? 'danger' : (data?.state || 'good');

  const cfg = {
    good:   { bg: 'var(--bluedim)', bdr: 'rgba(65,153,255,.3)', col: 'var(--blue)', ico: 'ℹ️',  txt: `✅ All systems normal. Train ${data?.train_id || '—'} is in good health. Sensors updating every 2 seconds.` },
    warn:   { bg: 'var(--ybg)',     bdr: 'var(--ybd)',           col: 'var(--y)',    ico: '⚠️', txt: '⚠️ Attention: Elevated readings detected. Schedule maintenance within 48 hours.' },
    danger: { bg: 'var(--rbg)',     bdr: 'var(--rbd)',           col: '#ff9090',     ico: '🚨', txt: simMode ? '🚨 FAILURE SIMULATION ACTIVE — All sensors are in danger zone. Immediate inspection required!' : `🚨 CRITICAL: Sensors exceeded safe limits. Vibration=${data?.sensors?.vibration} mm/s, Temp=${data?.sensors?.temperature}°C` },
  };
  const c = cfg[state] || cfg.good;

  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.bdr}`,
      borderRadius: 12, padding: '14px 20px',
      marginBottom: 18, display: 'flex',
      alignItems: 'flex-start', gap: 12,
      fontSize: 15, fontWeight: 500, color: c.col,
      lineHeight: 1.5,
      animation: state === 'danger' ? 'danger .5s ease' : 'none',
      transition: 'all .4s',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{c.ico}</span>
      <span>{c.txt}</span>
    </div>
  );
}
