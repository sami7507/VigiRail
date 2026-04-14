/** Live temperature history chart */
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { useSensor } from '../../context/SensorContext';
import Card from '../common/Card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const MAX = 30;

export default function TempChart() {
  const { data } = useSensor();
  const [hist, setHist] = useState(Array.from({ length: MAX }, () => Math.round(50 + Math.random() * 15)));

  useEffect(() => {
    if (data?.sensors?.temperature == null) return;
    setHist(prev => { const n = [...prev, data.sensors.temperature]; if (n.length > MAX) n.shift(); return n; });
  }, [data?.sensors?.temperature]);

  const chartData = {
    labels: hist.map((_, i) => i + 1),
    datasets: [
      { label: 'Temperature', data: hist, borderColor: '#f5a623', backgroundColor: 'rgba(245,166,35,.07)', borderWidth: 2, pointRadius: 2, tension: .4, fill: true },
      { label: 'Warn',   data: Array(MAX).fill(70), borderColor: 'rgba(245,166,35,.4)', borderWidth: 1.5, borderDash: [6,4], pointRadius: 0 },
      { label: 'Danger', data: Array(MAX).fill(90), borderColor: 'rgba(255,60,60,.4)',  borderWidth: 1.5, borderDash: [6,4], pointRadius: 0 },
    ],
  };

  return (
    <Card title="Temperature History" icon="🌡️">
      <div style={{ position: 'relative', height: 180 }}>
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 400 }, plugins: { legend: { display: false } }, scales: { y: { min: 30, max: 110, grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#5080a0', font: { size: 11 } } }, x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#5080a0', font: { size: 10 }, maxTicksLimit: 8 } } } }} />
      </div>
    </Card>
  );
}
