/** Failure-injection controls — Admin / Engineer only. */
import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/nav';
import Icon from '../Icon';

export default function SimulatePanel() {
  const { simulating, handleSimulate } = useSensor();
  const { user } = useAuth();
  const allowed = can(user?.role, 'simulate');

  if (!allowed) {
    return (
      <div className="banner banner-info" style={{ marginBottom: 0 }}>
        <Icon name="shield" size={17} />
        <span className="banner-text">
          Failure simulation is restricted to Admin and Engineer roles.
          <span className="banner-sub">
            Your {user?.role} session has read-only access to this control.
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-2" style={{ marginBottom: 0 }}>
      <button
        className={`btn btn-lg ${simulating ? 'btn-ghost' : 'btn-danger'}`}
        onClick={() => handleSimulate(!simulating)}
      >
        <Icon name={simulating ? 'stopSquare' : 'play'} size={16} />
        {simulating ? 'Stop failure simulation' : 'Engage failure simulation'}
      </button>
      <button
        className="btn btn-lg btn-ghost"
        onClick={() => handleSimulate(false)}
        disabled={!simulating}
      >
        <Icon name="refresh" size={16} />
        Reset to normal
      </button>
    </div>
  );
}
