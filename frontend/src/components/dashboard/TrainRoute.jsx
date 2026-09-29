/** Horizontal route progress strip (past / current / upcoming stops). */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';
import { cx } from '../../lib/helpers';

export default function TrainRoute() {
  const { data } = useSensor();
  const route = data?.route || [];
  const state = data?.state || 'good';

  return (
    <Card
      title="Route progress"
      icon="route"
      action={
        <span className="card-sub">
          {data?.current_station ? `Now: ${data.current_station.name}` : '—'}
        </span>
      }
      className="route-card"
    >
      <div className="route-strip">
        {route.map((stop) => (
          <div
            key={stop.code}
            className={cx(
              'route-stop',
              `is-${stop.status}`,
              stop.status === 'current' && `is-${state}`
            )}
            title={`${stop.name} — ${stop.status}`}
          >
            <div className="route-node" />
            <div className="route-code">{stop.code}</div>
            <div className="route-name">{stop.name}</div>
            <div className="route-km">{stop.km} km</div>
          </div>
        ))}
      </div>
      {!route.length && (
        <div className="empty">
          <div className="empty-title">No route loaded</div>
        </div>
      )}
    </Card>
  );
}
