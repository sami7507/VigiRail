/**
 * StatusHero.jsx
 * The BIG top panel showing overall train status.
 *
 * ACCESSIBILITY: Very large text (38px train ID, 28px status) so elderly users
 * can read it at a glance from across a room.
 * Uses color + icon + text — never color alone.
 */
import React, { useEffect, useRef } from 'react';

const STATE_CONFIG = {
  good:   { cls: 'good',   dot: '🟢', label: 'MACHINE HEALTH: GOOD CONDITION',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  warn:   { cls: 'warn',   dot: '🟡', label: 'MACHINE HEALTH: CHECK REQUIRED',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  danger: { cls: 'danger', dot: '🔴', label: 'MACHINE HEALTH: HIGH RISK — STOP TRAIN',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
};

function drawRing(canvas, pct, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 120, 120);
  const [cx, cy, r, lw] = [60, 60, 48, 10];

  // Background track
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = lw; ctx.stroke();

  // Colored fill arc
  const angle = (pct / 100) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
}

export default function StatusHero({ state = 'good', trainId, healthScore, message }) {
  const canvasRef = useRef(null);
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.good;

  useEffect(() => {
    drawRing(canvasRef.current, healthScore, cfg.color);
  }, [healthScore, cfg.color]);

  return (
    <div style={{
      borderRadius: 16,
      padding: '28px 32px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 20,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      animation: state === 'danger' ? 'dangerPulse 2s ease-in-out infinite' : 'fadeUp 0.5s ease both',
      transition: 'background 0.6s, border-color 0.6s',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Left side: text info */}
      <div>
        <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Currently Monitoring
        </div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 38, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>
          🚆 TRAIN {trainId}
        </div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: cfg.color }}>
          <span>{cfg.dot}</span>
          <span>{cfg.label}</span>
        </div>
        {/* VOICE-LIKE alert message — plain English, large enough for elderly users */}
        <div style={{ fontSize: 16, marginTop: 10, maxWidth: 520, lineHeight: 1.5 }}>
          {message}
        </div>
      </div>

      {/* Right side: health ring gauge */}
      <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <canvas ref={canvasRef} width={120} height={120} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: cfg.color }}>
            {Math.round(healthScore)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Health
          </div>
        </div>
      </div>
    </div>
  );
}
