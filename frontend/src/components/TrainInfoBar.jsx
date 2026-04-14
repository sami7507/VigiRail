/**
 * TrainInfoBar.jsx
 * A compact info strip that shows the selected train's key details:
 * train number, zone, rake type, speed, total distance, current station.
 *
 * Sits just below the TrainSelector and above the StatusHero.
 */
import React from 'react';

export default function TrainInfoBar({ train, currentStation }) {
  if (!train) return null;

  const items = [
    { label: 'Train No.',       value: train.number },
    { label: 'Zone',            value: train.zone },
    { label: 'Rake Type',       value: train.rake_type, tip: 'LHB = modern anti-derailment coaches. ICF = older design.' },
    { label: 'Avg Speed',       value: `${train.avg_speed_kmh} km/h` },
    { label: 'Total Distance',  value: `${train.distance_km} km` },
    { label: 'Now Near',        value: currentStation ? `${currentStation.name} (${currentStation.code})` : '—', highlight: true },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0,
      marginBottom: 20,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          flex: '1 1 160px',
          padding: '12px 18px',
          borderRight: i < items.length - 1 ? '1px solid var(--border)' : 'none',
          background: item.highlight ? 'rgba(59,130,246,0.07)' : 'transparent',
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            {item.label}
          </div>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: item.highlight ? 'var(--blue)' : 'var(--text)',
            fontFamily: item.highlight ? 'var(--font-head)' : 'inherit',
          }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
