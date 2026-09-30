/** Contextual maintenance work orders derived from live readings. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';
import Icon from '../Icon';

const ICON = { urgent: 'alertTriangle', soon: 'wrench', planned: 'calendar', ok: 'checkCircle' };

export default function MaintenanceCard() {
  const { data } = useSensor();
  const items = data?.maintenance || [];

  return (
    <Card title="Recommended actions" icon="wrench"
      action={<span className="card-sub">{items.length} items</span>}>
      {items.map((item) => (
        <div key={item.title} className="maint-item">
          <span className={`maint-icon ${item.urgency}`}>
            <Icon name={ICON[item.urgency] || 'info'} size={16} />
          </span>
          <div>
            <div className="maint-title">{item.title}</div>
            <div className="maint-detail">{item.detail}</div>
          </div>
        </div>
      ))}
      {!items.length && (
        <div className="empty">
          <div className="empty-title">No recommendations yet</div>
          Actions appear once the first reading is scored.
        </div>
      )}
    </Card>
  );
}
