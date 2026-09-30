/**
 * VigiRail — live trend charts (Chart.js).
 * Shared dark theme + rolling 30-sample window that survives tab switches.
 */
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSensor } from '../../context/SensorContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const GRID = 'rgba(148, 163, 184, 0.10)';
const TICK = '#94a5be';
const MAX_POINTS = 30;

ChartJS.defaults.color = TICK;
ChartJS.defaults.font.family = "'IBM Plex Mono', monospace";
ChartJS.defaults.font.size = 10;
ChartJS.defaults.borderColor = GRID;

/* Module-level rolling buffers: switching routes does not erase history.
   Each entry stores { values, lastCount } so a remount never double-records
   the same poll cycle. */
const BUFFERS = new Map();

function useSeries(key, readValue) {
  const { data, updateCount } = useSensor();
  const trainId = data?.train_id || '?';
  const bufferKey = `${key}:${trainId}`;

  let entry = BUFFERS.get(bufferKey);
  if (!entry) {
    entry = { values: [], lastCount: -1 };
    BUFFERS.set(bufferKey, entry);
  }

  if (data && entry.lastCount !== updateCount) {
    entry.values.push(readValue(data));
    while (entry.values.length > MAX_POINTS) entry.values.shift();
    entry.lastCount = updateCount;
  }

  return entry.values;
}

function chartOptions(unit, threshold) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      tooltip: {
        backgroundColor: '#15213a',
        borderColor: 'rgba(148,163,184,0.25)',
        borderWidth: 1,
        titleColor: '#e6edf7',
        bodyColor: '#94a5be',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const suffix = ctx.datasetIndex === 1 ? ` (limit ${threshold})` : ` ${unit}`;
            return `${ctx.parsed.y}${suffix}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
      y: {
        grid: { color: GRID },
        border: { display: false },
        suggestedMin: 0,
        ticks: { maxTicksLimit: 5, callback: (v) => `${v}${unit}` },
      },
    },
    elements: {
      point: { radius: 0, hitRadius: 12, hoverRadius: 4 },
      line: { borderWidth: 2, tension: 0.35 },
    },
  };
}

function TimeSeries({ seriesKey, title, readValue, color, unit, threshold }) {
  const values = useSeries(seriesKey, readValue);

  const data = {
    labels: values.map((_, i) => (i === values.length - 1 ? 'now' : `-${values.length - 1 - i}`)),
    datasets: [
      {
        data: values,
        borderColor: color,
        backgroundColor: `${color}22`,
        fill: true,
        spanGaps: true,
      },
      ...(threshold != null
        ? [
            {
              data: values.map(() => threshold),
              borderColor: 'rgba(251, 191, 36, 0.5)',
              borderDash: [5, 5],
              borderWidth: 1.2,
              pointRadius: 0,
              fill: false,
            },
          ]
        : []),
    ],
  };

  return (
    <section className="card">
      <header className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="badge badge-neutral">
          {threshold != null ? `dashed: ${threshold} ${unit}` : unit}
        </span>
      </header>
      <div className="chart-box">
        {values.length > 1 ? (
          <Line data={data} options={chartOptions(unit, threshold)} />
        ) : (
          <div className="empty" style={{ paddingTop: 64 }}>
            <div className="empty-title">Collecting samples…</div>
            The trend appears after a few seconds of polling.
          </div>
        )}
      </div>
    </section>
  );
}

export function VibrationChart() {
  return (
    <TimeSeries
      seriesKey="vibration"
      title="Vibration trend"
      readValue={(d) => d.sensors.vibration}
      color="#60a5fa"
      unit="mm/s"
      threshold={5}
    />
  );
}

export function TempChart() {
  return (
    <TimeSeries
      seriesKey="temperature"
      title="Bearing temperature trend"
      readValue={(d) => d.sensors.temperature}
      color="#fbbf24"
      unit="°C"
      threshold={70}
    />
  );
}
