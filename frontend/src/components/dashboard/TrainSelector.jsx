/** Train picker + at-a-glance service facts. */
import React, { useEffect, useState } from 'react';
import { useSensor } from '../../context/SensorContext';
import { fetchTrains } from '../../lib/api';
import Icon from '../Icon';

export default function TrainSelector() {
  const { selectedTrain, selectTrain, data } = useSensor();
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    fetchTrains()
      .then((res) => setTrains(res.trains || []))
      .catch(() => setTrains([]));
  }, []);

  const current = trains.find((t) => t.number === selectedTrain) || data?.train;
  const facts = current
    ? [
        { icon: 'route', label: `${current.from} → ${current.to}` },
        { icon: 'building', label: current.zone_code || current.zone },
        { icon: 'train', label: current.rake_type || current.type },
        { icon: 'clock', label: `${current.avg_speed_kmh} km/h avg` },
      ]
    : [];

  return (
    <div className="train-bar">
      <div className="train-bar-left">
        <div className="train-select">
          <label className="label" htmlFor="train-select" style={{ marginBottom: 5 }}>
            Service under monitoring
          </label>
          <select
            id="train-select"
            className="select"
            value={selectedTrain}
            onChange={(e) => selectTrain(e.target.value)}
          >
            {(trains.length ? trains : [{ number: selectedTrain, name: 'Loading fleet…' }]).map((train) => (
              <option key={train.number} value={train.number}>
                {train.number} · {train.name}
              </option>
            ))}
          </select>
        </div>
        <div className="train-facts">
          {facts.map((fact) => (
            <span key={fact.label} className="fact">
              <Icon name={fact.icon} size={12} />
              <b>{fact.label}</b>
            </span>
          ))}
        </div>
      </div>
      <span className="badge badge-good">
        <span className="dot dot-live" />
        Live · 2 s
      </span>
    </div>
  );
}
