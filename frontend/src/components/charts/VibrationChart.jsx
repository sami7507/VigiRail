/** Live scrolling vibration line chart using Chart.js */
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const MAX = 30;

export default function VibrationChart() {
  const { data } = useSensor();
  const [hist, setHist] = useState(Array.from({ length: MAX }, () => +(Math.random() * 2 + 1.5).toFixed(2)));

  useEffect(() => {
    if (data?.sensors?.vibration == null) return;
    setHist(prev => {
      const next = [...prev, data.sensors.vibration];
      if (next.length > MAX) next.shift();
      return next;
    });
  }, [data?.sensors?.vibration]);

  const chartData = {
    labels: hist.map((_, i) => i + 1),
    datasets: [
      { label: 'Vibration', data: hist, borderColor: '#4199ff', backgroundColor: 'rgba(65,153,255,.07)', borderWidth: 2, pointRadius: 2, tension: .4, fill: true },
      { label: 'Warn',   data: Array(MAX).fill(5), borderColor: 'rgba(245,166,35,.5)',  borderWidth: 1.5, borderDash: [6,4], pointRadius: 0 },
      { label: 'Danger', data: Array(MAX).fill(8), borderColor: 'rgba(255,60,60,.5)',   borderWidth: 1.5, borderDash: [6,4], pointRadius: 0 },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 13, grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#5080a0', font: { size: 11 } } },
      x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#5080a0', font: { size: 10 }, maxTicksLimit: 8 } },
    },
  };

  return (
    <Card title="Vibration History — Last 30 Readings" icon="📈">
      <div style={{ position: 'relative', height: 180 }}>
        <Line data={chartData} options={options} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--mt)' }}>
        {[['#4199ff', 'Vibration'], ['rgba(245,166,35,.8)', '⚠ Warning (5+)'], ['rgba(255,60,60,.8)', '🚨 Danger (8+)']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 13, height: 3, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
    </Card>
  );
}
