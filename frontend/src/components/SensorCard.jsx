/**
 * SensorCard.jsx
 * Displays 4 live sensor readings with animated progress bars.
 *
 * ACCESSIBILITY:
 * - Each sensor has a plain-English name AND description
 * - Progress bar color changes: green → yellow → red based on thresholds
 * - Values use large monospace font for easy reading
 * - Tooltip explains what each sensor measures
 */
import React from 'react';
import Tooltip from './Tooltip';

function getColor(val, warn, danger) {
  if (val >= danger) return 'var(--red)';
  if (val >= warn)   return 'var(--yellow)';
  return 'var(--green)';
}

function SensorRow({ label, tip, desc, value, unit, max, warn, danger }) {
  const pct   = Math.min(100, (value / max) * 100);
  const color = getColor(value, warn, danger);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            <Tooltip label={label} tip={tip} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'Courier New, monospace', fontSize: 22, fontWeight: 600, color }}>
            {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 3 }}>{unit}</span>
        </div>
      </div>
      {/* Animated progress bar */}
      <div style={{ height: 8, borderRadius: 4, background: 'var(--surface3)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${pct}%`,
          background: color,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1), background 0.5s',
        }} />
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
    </div>
  );
}

export default function SensorCard({ sensors }) {
  if (!sensors) return null;

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>📡 Live Sensor Readings</div>

      <SensorRow
        label="Vibration Level"
        tip="How much the train shakes. High vibration means the wheels or tracks may be worn out."
        desc="Wheel bearing shake"
        value={sensors.vibration}
        unit="mm/s"
        max={12} warn={5} danger={8}
      />
      <SensorRow
        label="Temperature"
        tip="Heat of the wheel bearings. Above 85°C can cause fire risk or sudden breakdown."
        desc="Axle bearing heat"
        value={sensors.temperature}
        unit="°C"
        max={120} warn={70} danger={90}
      />
      <SensorRow
        label="Sound Level"
        tip="Unusual sounds from under the train. Grinding or squealing means worn metal parts."
        desc="Unusual noise detection"
        value={sensors.acoustic}
        unit="dB"
        max={100} warn={60} danger={80}
      />
      <SensorRow
        label="Track Wear"
        tip="How much the rails and wheels have worn down. Measured from vibration patterns over time."
        desc="Rail surface condition"
        value={sensors.wear}
        unit="%"
        max={100} warn={50} danger={75}
      />
    </div>
  );
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 20,
  transition: 'border-color 0.3s',
};

const titleStyle = {
  fontFamily: 'var(--font-head)',
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--muted)',
  marginBottom: 16,
};
