/** Client-side event stream (polls, state changes, operator actions). */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';
import Icon from '../Icon';

const TONE = {
  danger: 'var(--red)',
  warn: 'var(--amber)',
  ok: 'var(--green)',
  neutral: 'var(--accent-2)',
};

export default function EventLog() {
  const { events } = useSensor();

  return (
    <Card
      title="Event log"
      icon="history"
      action={<span className="card-sub">{events.length} entries</span>}
    >
      {events.length ? (
        <div className="event-list">
          {events.map((event) => (
            <div key={event.id} className="event-row">
              <span className="event-time">{event.ts}</span>
              <span className="event-text" style={{ color: TONE[event.tone] || TONE.neutral }}>
                {event.text}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Icon name="history" size={30} />
          <div className="empty-title">No events yet</div>
          Scan results and operator actions will stream in here.
        </div>
      )}
    </Card>
  );
}
