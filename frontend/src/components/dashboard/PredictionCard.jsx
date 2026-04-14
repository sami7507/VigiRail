/** AI failure prediction probability bars */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';

function PredBar({ label, value }) {
  const pct = Math.round(value ?? 0);
  const col = pct >= 70 ? '#ff3c3c' : pct >= 40 ? '#f5a623' : '#10d978';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: 'var(--tx)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: col, fontFamily: 'var(--fm)', fontSize: 12, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--s3)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 5, transition: 'width 1s cubic-bezier(.4,0,.2,1), background .6s' }} />
      </div>
    </div>
  );
}

export default function PredictionCard() {
  const { data } = useSensor();
  const p  = data?.predictions || {};
  const mc = data?.model_confidence ?? 0;

  return (
    <Card title="AI Failure Prediction" icon="🧠">
      <PredBar label="Wheel Bearing Failure" value={p.wheel_bearing_failure} />
      <PredBar label="Track Damage Risk"     value={p.track_damage_risk} />
      <PredBar label="Overheating Risk"      value={p.overheating_risk} />
      <PredBar label="Brake System Wear"     value={p.brake_wear} />
      <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--bdr)' }}>
        <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>AI Model Confidence</div>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{mc}%</div>
        <div style={{ fontSize: 11, color: 'var(--dim)' }}>Random Forest · 100 trees · scikit-learn</div>
      </div>
    </Card>
  );
}
