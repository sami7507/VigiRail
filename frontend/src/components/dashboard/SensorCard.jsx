/** Live sensor readings with threshold-aware meters. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';
import { thresholdColor } from '../../lib/helpers';

const SENSORS = [
  { key: 'vibration', name: 'Vibration', desc: 'Wheel bearing shake', unit: 'mm/s', max: 12, warn: 5, danger: 8, digits: 2 },
  { key: 'temperature', name: 'Bearing temperature', desc: 'Axle-box heat', unit: '°C', max: 120, warn: 70, danger: 90, digits: 1 },
  { key: 'acoustic', name: 'Acoustic emission', desc: 'Abnormal noise level', unit: 'dB', max: 100, warn: 60, danger: 80, digits: 1 },
  { key: 'wear', name: 'Component wear', desc: 'Rail / pad condition', unit: '%', max: 100, warn: 50, danger: 75, digits: 1 },
];

function SensorRow({ config, value }) {
  const raw = value ?? 0;
  const color = thresholdColor(raw, config.warn, config.danger);
  const ratio = Math.min(100, (raw / config.max) * 100);

  return (
    <div className="meter">
      <div className="meter-head">
        <div>
          <div className="meter-name">{config.name}</div>
          <div className="meter-desc">{config.desc}</div>
        </div>
        <div className="meter-value" style={{ color }}>
          {value ?? '—'}
          <span className="meter-unit">{config.unit}</span>
        </div>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${ratio}%`, background: color }} />
      </div>
      <div className="meter-scale">
        <span>0</span>
        <span className="warn">advisory {config.warn}</span>
        <span className="danger">critical {config.danger}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
}

export default function SensorCard() {
  const { data } = useSensor();
  const sensors = data?.sensors || {};

  return (
    <Card title="Live sensor readings" icon="activity">
      {SENSORS.map((config) => (
        <SensorRow key={config.key} config={config} value={sensors[config.key]} />
      ))}
    </Card>
  );
}
