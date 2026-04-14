/** Live sensor readings with animated progress bars */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { sensorColor } from '../../utils/helpers';
import Card from '../common/Card';

function SensorRow({ label, desc, value, unit, max, warn, dng }) {
  const col = sensorColor(value ?? 0, warn, dng);
  const pct = Math.min(100, ((value ?? 0) / max) * 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--mt)' }}>{desc}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: 20, fontWeight: 600, color: col }}>
            {value ?? '—'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--mt)', marginLeft: 3 }}>{unit}</span>
        </div>
      </div>
      <div style={{ height: 9, background: 'var(--s3)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 5, transition: 'width .8s cubic-bezier(.4,0,.2,1), background .5s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--dim)', marginTop: 3, fontFamily: 'var(--fm)' }}>
        <span>Safe</span><span>⚠ {warn}</span><span>🚨 {dng}</span><span>{max}</span>
      </div>
      <div style={{ height: 1, background: 'var(--bdr)', margin: '8px 0 0' }} />
    </div>
  );
}

export default function SensorCard() {
  const { data } = useSensor();
  const s = data?.sensors || {};
  return (
    <Card title="Live Sensor Readings" icon="📡">
      <SensorRow label="Vibration"    desc="Wheel bearing shake"      value={s.vibration}   unit="mm/s" max={12}  warn={5}  dng={8} />
      <SensorRow label="Temperature"  desc="Axle bearing heat"        value={s.temperature} unit="°C"   max={120} warn={70} dng={90} />
      <SensorRow label="Sound Level"  desc="Unusual noise detection"  value={s.acoustic}    unit="dB"   max={100} warn={60} dng={80} />
      <SensorRow label="Track Wear"   desc="Rail surface condition"   value={s.wear}        unit="%"    max={100} warn={50} dng={75} />
    </Card>
  );
}
