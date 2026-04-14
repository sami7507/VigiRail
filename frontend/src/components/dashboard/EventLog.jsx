/** Scrollable event log showing timestamped system events */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';

export default function EventLog() {
  const { events } = useSensor();
  const { user }   = useAuth();
  const isAdmin = user?.role === 'Admin';

  return (
    <Card title={isAdmin ? 'All User Activity Log' : 'Event Log'} icon="📋">
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {events.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--dim)', padding: '8px 0' }}>Waiting for events…</div>
        )}
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, padding: '5px 0', borderBottom: '1px solid rgba(48,130,255,.05)', animation: 'slideIn .3s ease' }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--dim)', flexShrink: 0, minWidth: 82 }}>{e.ts}</span>
            <span style={{ fontSize: 12, color: 'var(--mt)' }}>{e.txt}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
