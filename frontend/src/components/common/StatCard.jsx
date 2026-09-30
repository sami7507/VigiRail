/** KPI tile: label + large value + optional subtitle. */
import React from 'react';
import Icon from '../Icon';
import { cx } from '../../lib/helpers';

export default function StatCard({ label, value, sub, tone, icon }) {
  return (
    <div className="stat">
      <div className="stat-label">
        {icon && <Icon name={icon} size={13} />}
        {label}
      </div>
      <div className={cx('stat-value', tone && `is-${tone}`)}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
