/** Component-level risk decomposition from the model output. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';
import { ratioColor } from '../../lib/helpers';

const ROWS = [
  { key: 'wheel_bearing_failure', label: 'Wheel bearing failure' },
  { key: 'track_damage_risk', label: 'Track / rail damage' },
  { key: 'overheating_risk', label: 'Bearing overheating' },
  { key: 'brake_wear', label: 'Brake wear' },
];

export default function PredictionCard() {
  const { data } = useSensor();
  const predictions = data?.predictions || {};

  return (
    <Card
      title="Failure risk by component"
      icon="zap"
      action={
        <span className="badge badge-info">
          Model {data?.model_confidence ?? '—'}% conf.
        </span>
      }
    >
      {ROWS.map((row) => {
        const value = predictions[row.key] ?? 0;
        const color = ratioColor(value / 100);
        return (
          <div key={row.key} className="risk-row">
            <div className="risk-head">
              <span className="risk-name">{row.label}</span>
              <span className="risk-val" style={{ color }}>
                {value}%
              </span>
            </div>
            <div className="risk-track">
              <div className="risk-fill" style={{ width: `${value}%`, background: color }} />
            </div>
          </div>
        );
      })}
      <p className="card-sub" style={{ marginTop: 12 }}>
        Scores are a decomposition of the Random Forest output over the current
        sensor snapshot — deterministic, no randomised jitter.
      </p>
    </Card>
  );
}
