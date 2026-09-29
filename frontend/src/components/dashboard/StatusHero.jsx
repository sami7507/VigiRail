/** Hero status banner with animated health ring. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Icon from '../Icon';
import { stateDesc, stateLabel } from '../../lib/helpers';

const TONE = { good: 'var(--green)', warn: 'var(--amber)', danger: 'var(--red)' };
const ICON = { good: 'checkCircle', warn: 'alertTriangle', danger: 'alertTriangle' };

function HealthRing({ value, tone }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value / 100)));
  return (
    <div className="health-ring" aria-label={`Health ${value}%`}>
      <svg viewBox="0 0 116 116">
        <circle className="ring-bg" cx="58" cy="58" r={radius} />
        <circle
          className="ring-fg"
          cx="58"
          cy="58"
          r={radius}
          stroke={tone}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="health-ring-label">
        <span className="health-ring-value" style={{ color: tone }}>
          {value}
        </span>
        <span className="health-ring-cap">Health</span>
      </div>
    </div>
  );
}

export default function StatusHero() {
  const { data, simulating } = useSensor();
  const state = simulating ? 'danger' : data?.state || 'good';
  const tone = TONE[state];
  const health = data?.health_score ?? 0;

  return (
    <section className={`hero is-${state}`}>
      <div style={{ minWidth: 0, flex: '1 1 320px' }}>
        <div className="hero-kicker">
          <Icon name="train" size={14} />
          Train {data?.train_id || '—'} · {data?.train?.name || 'Connecting'}
        </div>
        <h2 className="hero-title" style={{ color: tone }}>
          <Icon name={ICON[state]} size={26} />
          {stateLabel(state)}
        </h2>
        <p className="hero-desc">
          {simulating
            ? 'Failure simulation engaged — the sensor stream is being driven past critical thresholds for training purposes.'
            : data?.alert_message || 'Waiting for the first telemetry reading…'}
        </p>
        <div className="hero-meta">
          <span className="hero-meta-item">
            Failure risk <b style={{ color: tone }}>{data?.failure_probability ?? '—'}%</b>
          </span>
          <span className="hero-meta-item">
            Confidence <b>{data?.model_confidence ?? '—'}%</b>
          </span>
          <span className="hero-meta-item">
            Service in <b>{data?.days_until_service ?? '—'} d</b>
          </span>
        </div>
      </div>
      <HealthRing value={health} tone={tone} />
    </section>
  );
}
