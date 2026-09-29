/** Per-bogie bearing status grid. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';
import { cx, stateColor } from '../../lib/helpers';

const LABEL = { good: 'Normal', warn: 'Advisory', danger: 'Critical' };

export default function BogieCard() {
  const { data } = useSensor();
  const bogies = data?.bogies || [];

  return (
    <Card title="Bogie bearing status" icon="layers"
      action={<span className="card-sub">6 monitored</span>}>
      <div className="bogie-grid">
        {bogies.map((bogie) => (
          <div key={bogie.id} className={cx('bogie-cell', `is-${bogie.status}`)}>
            <div className="bogie-id">{bogie.id}</div>
            <div className="bogie-temp" style={{ color: stateColor(bogie.status) }}>
              {bogie.temp}°
            </div>
            <div className="bogie-status" style={{ color: stateColor(bogie.status) }}>
              {LABEL[bogie.status]}
            </div>
            <div className="bogie-label">{bogie.label.replace(/ *\(.*\)/, '')}</div>
          </div>
        ))}
      </div>
      {!bogies.length && (
        <div className="empty">
          <div className="empty-title">Awaiting telemetry</div>
          Bogie data appears with the first sensor poll.
        </div>
      )}
    </Card>
  );
}
