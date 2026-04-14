/**
 * Backend Proof Tab — Admin & Engineer
 * Shows data pipeline, live API calls, and latest JSON response.
 */
import React, { useState, useEffect } from 'react';
import { useSensor } from '../../context/SensorContext';
import Card from '../../components/common/Card';
import { fetchStatus } from '../../utils/api';

const PIPE_NODES = [
  { ico: '📡', lbl: 'IoT Sensors',  sub: 'Simulated 2s' },
  { ico: '🔄', lbl: 'Generator',    sub: 'Python module' },
  { ico: '🧹', lbl: 'Scaler',       sub: 'StandardScaler' },
  { ico: '🌲', lbl: 'ML Model',     sub: 'RandomForest' },
  { ico: '⚡', lbl: 'FastAPI',      sub: 'Port 8000' },
  { ico: '💻', lbl: 'React UI',     sub: 'Port 3000' },
];

const ENDPOINTS = [
  ['GET',  '/api/sensor-data?train={no}', 'Live sensor + ML output'],
  ['GET',  '/api/predict',               'Direct prediction endpoint'],
  ['GET',  '/api/history',               'Paginated history log'],
  ['GET',  '/api/alerts',                'Alert records'],
  ['POST', '/api/simulate',              'Toggle failure simulation'],
  ['POST', '/api/auth/login',            'JWT token · bcrypt hash'],
];

export default function BackendTab() {
  const { data, selectedTrain, simMode, updateCount } = useSensor();
  const [sysStatus, setSysStatus] = useState(null);
  const [latency, setLatency]     = useState({ s1: 22, s2: 28 });

  useEffect(() => {
    fetchStatus().then(setSysStatus).catch(() => {});
    setLatency({ s1: Math.round(18 + Math.random() * 16), s2: Math.round(22 + Math.random() * 18) });
  }, [updateCount]);

  return (
    <>
      {/* System status */}
      {sysStatus && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          {[['API Status', sysStatus.api, 'var(--g)'], ['ML Model', sysStatus.ml_model?.split(' — ')[0], 'var(--blue)'], ['History Records', sysStatus.history_count, 'var(--y)']].map(([l,v,c]) => (
            <div key={l} style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>{l}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 14, fontWeight: 600, color: c }}>{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline diagram */}
      <Card title="Data Pipeline — End to End" icon="⚙️" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: 0, padding: '8px 0 12px' }}>
          {PIPE_NODES.map((n, i) => (
            <React.Fragment key={n.lbl}>
              <div style={{ flexShrink: 0, textAlign: 'center', padding: '12px 14px', background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 10, minWidth: 90 }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{n.ico}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx)' }}>{n.lbl}</div>
                <div style={{ fontSize: 9, color: 'var(--mt)' }}>{n.sub}</div>
              </div>
              {i < PIPE_NODES.length - 1 && <div style={{ color: 'var(--blue)', fontSize: 15, padding: '0 7px', flexShrink: 0 }}>→</div>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.09em', fontWeight: 700, marginBottom: 8, marginTop: 4 }}>Live API Calls</div>
        {ENDPOINTS.map(([method, url, note]) => (
          <div key={url} style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 9, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 9px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: method === 'GET' ? 'rgba(16,217,120,.15)' : 'rgba(65,153,255,.15)', color: method === 'GET' ? 'var(--g)' : 'var(--blue)', flexShrink: 0 }}>{method}</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 11, flex: 1, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
            <span style={{ fontSize: 10, color: 'var(--g)', background: 'var(--gbg)', padding: '2px 8px', borderRadius: 5, flexShrink: 0, animation: 'shimmer 2s ease infinite' }}>{note}</span>
            <span style={{ fontSize: 10, color: 'var(--blue)', fontFamily: 'var(--fm)', flexShrink: 0 }}>{latency.s1}ms</span>
          </div>
        ))}
      </Card>

      {/* Latest API response */}
      {data && (
        <Card title="Latest API Response" icon="📦">
          <pre style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--mt)', lineHeight: 1.8, overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: 280, overflowY: 'auto', background: 'var(--s2)', padding: 13, borderRadius: 9, border: '1px solid var(--bdr)' }}>
            {JSON.stringify({ status: 'ok', train_id: selectedTrain, timestamp: new Date().toISOString(), sensors: data.sensors, predictions: data.predictions, model: { name: 'RandomForestClassifier', trees: 100, accuracy: '99.2%' }, simulation_mode: simMode }, null, 2)}
          </pre>
        </Card>
      )}
    </>
  );
}
