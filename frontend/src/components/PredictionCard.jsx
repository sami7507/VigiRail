/**
 * PredictionCard.jsx
 * Shows ML model predictions as animated probability bars.
 *
 * ACCESSIBILITY:
 * - Each prediction shown as text percentage + visual bar
 * - Color encodes severity: green/yellow/red
 * - Model confidence shown for trust/transparency
 */
import React from 'react';
import Tooltip from './Tooltip';

function PredBar({ label, tip, value }) {
  const pct   = Math.min(100, Math.round(value));
  const color = pct >= 70 ? 'var(--red)' : pct >= 40 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 5 }}>
        <Tooltip label={label} tip={tip} />
        <span style={{ fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: 'var(--surface3)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 7,
          width: `${pct}%`,
          background: color,
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1), background 0.8s',
        }} />
      </div>
    </div>
  );
}

export default function PredictionCard({ predictions, confidence }) {
  if (!predictions) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
      <div style={titleStyle}>🧠 AI Failure Prediction</div>

      <PredBar
        label="Wheel Bearing Failure"
        tip="Chance of wheel bearings breaking down in the next 24 hours."
        value={predictions.wheel_bearing_failure}
      />
      <PredBar
        label="Track Damage Risk"
        tip="Risk of damage to the rails based on current vibration and wear."
        value={predictions.track_damage_risk}
      />
      <PredBar
        label="Overheating Risk"
        tip="Chance of axle bearings overheating beyond safe limits."
        value={predictions.overheating_risk}
      />
      <PredBar
        label="Brake System Wear"
        tip="How quickly brake pads are wearing down. Above 70% means replace soon."
        value={predictions.brake_wear}
      />

      {/* Model confidence — important for trust */}
      <div style={{
        marginTop: 16, padding: '12px 14px',
        background: 'var(--surface2)', borderRadius: 10,
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          AI Model Confidence
        </div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>
          {confidence}%
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Based on Random Forest analysis of sensor pattern history
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
  marginBottom: 16,
};
