/** Global health banner — mirrors the current telemetry state. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Icon from '../Icon';
import { stateClass, stateDesc } from '../../lib/helpers';

const TONE = {
  good: { icon: 'checkCircle', label: 'All systems nominal' },
  warn: { icon: 'alertTriangle', label: 'Attention required' },
  danger: { icon: 'alertTriangle', label: 'Critical condition' },
};

export default function AlertBanner() {
  const { data, simulating, error } = useSensor();

  if (error) {
    return (
      <div className="banner banner-danger">
        <Icon name="wifiOff" size={18} />
        <span className="banner-text">
          Backend unreachable
          <span className="banner-sub">{error} — retrying every 2 seconds.</span>
        </span>
      </div>
    );
  }

  const state = simulating ? 'danger' : data?.state || 'good';
  const tone = TONE[state];
  const detail = simulating
    ? 'Failure simulation is active — sensor values are being driven into the danger zone.'
    : stateDesc[state];

  return (
    <div className={`banner banner-${state} ${stateClass(state)}`}>
      <Icon name={tone.icon} size={18} />
      <span className="banner-text">
        {tone.label}
        <span className="banner-sub">
          {detail}
          {data ? ` Train ${data.train_id} · updated just now.` : ''}
        </span>
      </span>
    </div>
  );
}
