/**
 * VibrationChart.jsx
 * Live scrolling line chart of the last 30 vibration readings.
 * Draws reference lines at warning (5) and danger (8) levels.
 *
 * Uses Chart.js via react-chartjs-2.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip as CJSTooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, CJSTooltip, Legend);

const MAX_POINTS = 30;

export default function VibrationChart({ vibration }) {
  const [history, setHistory] = useState(
    Array.from({ length: MAX_POINTS }, () => +(Math.random() * 2 + 1.5).toFixed(2))
  );

  // Append new reading, drop oldest
  useEffect(() => {
    if (vibration == null) return;
    setHistory(prev => {
      const next = [...prev, vibration];
      if (next.length > MAX_POINTS) next.shift();
      return next;
    });
  }, [vibration]);

  const labels = history.map((_, i) => i + 1);

  const data = {
    labels,
    datasets: [
      {
        label: 'Vibration (mm/s)',
        data: history,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.07)',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Warning Zone',
        data: Array(MAX_POINTS).fill(5),
        borderColor: 'rgba(245,158,11,0.55)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
      {
        label: 'Danger Zone',
        data: Array(MAX_POINTS).fill(8),
        borderColor: 'rgba(239,68,68,0.55)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c1829',
        borderColor: 'rgba(99,160,255,0.28)',
        borderWidth: 1,
        titleColor: '#e8f0fe',
        bodyColor: '#7a9cc8',
      },
    },
    scales: {
      y: {
        min: 0, max: 12,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#7a9cc8', font: { size: 11 } },
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#7a9cc8', font: { size: 10 }, maxTicksLimit: 8 },
      },
    },
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
      <div style={titleStyle}>📈 Vibration History — Last 30 Updates</div>

      <div style={{ position: 'relative', height: 200 }}>
        <Line data={data} options={options} />
      </div>

      {/* Custom legend — Chart.js default is ugly */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
        <LegendItem color="#60a5fa" label="Vibration" />
        <LegendItem color="rgba(245,158,11,0.8)" label="Warning (5+ mm/s)" />
        <LegendItem color="rgba(239,68,68,0.8)" label="Danger (8+ mm/s)" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 14, height: 3, background: color, borderRadius: 2, display: 'inline-block' }} />
      {label}
    </span>
  );
}

const titleStyle = {
  fontFamily: 'var(--font-head)',
  fontSize: 14, fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--muted)',
  marginBottom: 14,
};
