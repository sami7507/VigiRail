/**
 * Big top status panel — most important component.
 * Shows current train, state (GOOD/WARN/DANGER), health ring.
 */
import React, { useEffect, useRef } from 'react';
import { useSensor } from '../../context/SensorContext';
import { stateColor, stateBg, stateBorder, stateLabel, stateEmoji } from '../../utils/helpers';

function drawRing(canvas, pct, col) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 110, 110);
  ctx.beginPath(); ctx.arc(55, 55, 46, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 9; ctx.stroke();
  const ang = (pct / 100) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.arc(55, 55, 46, -Math.PI / 2, ang);
  ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
}

export default function StatusHero() {
  const { data, simMode, selectedTrain } = useSensor();
  const ringRef = useRef(null);

  const state   = simMode ? 'danger' : (data?.state || 'good');
  const health  = data?.health_score ?? 0;
  const col     = stateColor(state);
  const fp      = data?.failure_probability ?? 0;

  useEffect(() => { drawRing(ringRef.current, health, col); }, [health, col]);

  const msgMap = {
    good:   'All systems operating normally. No immediate action required.',
    warn:   '⚠️ Elevated readings detected. Schedule maintenance within 48 hours.',
    danger: '🚨 CRITICAL: Multiple sensors in danger zone. Immediate stop required!',
  };

  return (
    <div style={{
      borderRadius: 16, padding: '26px 30px', marginBottom: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 18, flexWrap: 'wrap',
      background: stateBg(state), border: `1px solid ${stateBorder(state)}`,
      transition: 'all .6s',
      animation: state === 'danger' ? 'danger 2s ease-in-out infinite' : 'fadeUp .4s ease',
    }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
          🚆 TRAIN {selectedTrain} STATUS:
        </div>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 30, fontWeight: 800, color: col, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span>{stateEmoji(state)}</span>
          <span>{stateLabel(state)}</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 520, color: 'var(--tx)' }}>
          {simMode ? '🔴 Failure simulation is active — sensors are reading danger-zone values.' : msgMap[state]}
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--mt)' }}>
            Failure Probability: <b style={{ color: col }}>{fp}%</b>
          </span>
          <span style={{ fontSize: 13, color: 'var(--mt)' }}>
            Health Score: <b style={{ color: col }}>{health}%</b>
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
        <canvas ref={ringRef} width={110} height={110} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 800, color: col }}>{health}%</div>
          <div style={{ fontSize: 9, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Health</div>
        </div>
      </div>
    </div>
  );
}
