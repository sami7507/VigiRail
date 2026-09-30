/**
 * VigiRail — System page (Admin / Engineer).
 * Live API status, data pipeline, endpoint reference, response inspector.
 */
import React, { useEffect, useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { errMsg, fetchStatus } from '../lib/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Icon from '../components/Icon';
import { fmtUptime } from '../lib/helpers';

const PIPELINE = [
  { icon: 'activity', name: 'Sensors', sub: 'simulator' },
  { icon: 'cpu', name: 'Scaler', sub: 'StandardScaler' },
  { icon: 'layers', name: 'Forest', sub: '200 trees' },
  { icon: 'server', name: 'FastAPI', sub: 'uvicorn' },
  { icon: 'gauge', name: 'React', sub: '2 s poll' },
];

const ENDPOINTS = [
  ['POST', '/api/auth/login', 'JWT issue (rate-limited)'],
  ['GET', '/api/auth/me', 'Token identity'],
  ['GET', '/api/sensor-data?train=', 'Live snapshot + ML output'],
  ['POST', '/api/predict', 'Arbitrary snapshot scoring'],
  ['GET', '/api/model', 'Training metrics'],
  ['GET', '/api/history', 'Paginated readings'],
  ['GET', '/api/alerts', 'Alert stream'],
  ['GET', '/api/trains', 'Fleet catalogue'],
  ['POST', '/api/simulate', 'Failure injection'],
  ['GET', '/api/reports/inspection', 'CSV / JSON report'],
  ['GET', '/api/status', 'Service status'],
  ['GET', '/healthz', 'Readiness probe'],
];

export default function SystemPage() {
  const { data, latency, updateCount, refresh } = useSensor();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchStatus()
      .then((body) => !cancelled && setStatus(body))
      .catch((err) => !cancelled && setError(errMsg(err)));
    return () => {
      cancelled = true;
    };
  }, [updateCount]);

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">System status</h1>
        <p className="page-sub">
          Runtime health of the API, the model pipeline and the client connection.
        </p>
      </div>

      {error && (
        <div className="banner banner-danger">
          <Icon name="wifiOff" size={17} />
          <span className="banner-text">Status endpoint unreachable — {error}</span>
        </div>
      )}

      <div className="grid grid-4">
        <StatCard label="API" value={status ? 'Online' : '…'} tone="good" sub="GET /api/status" icon="server" />
        <StatCard
          label="Latency"
          value={latency != null ? `${latency} ms` : '—'}
          tone="accent"
          sub="Last sensor-data round-trip"
          icon="zap"
        />
        <StatCard
          label="Uptime"
          value={status ? fmtUptime(status.uptime_seconds) : '—'}
          sub="Since process start"
          icon="clock"
        />
        <StatCard
          label="History"
          value={status?.history_count ?? '—'}
          sub="In-memory ring buffer"
          icon="database"
        />
      </div>

      <Card title="Data pipeline" icon="route" style={{ marginBottom: 14 }}>
        <div className="pipeline">
          {PIPELINE.map((node, index) => (
            <React.Fragment key={node.name}>
              <div className="pipeline-node">
                <Icon name={node.icon} size={19} />
                <div className="pipeline-node-name">{node.name}</div>
                <div className="pipeline-node-sub">{node.sub}</div>
              </div>
              {index < PIPELINE.length - 1 && (
                <span className="pipeline-arrow">
                  <Icon name="chevronRight" size={15} />
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="card-sub">
          The browser never talks to the simulator directly — every reading is scored
          server-side before it reaches the dashboard.
        </p>
      </Card>

      <div className="grid grid-2">
        <Card
          title="API reference"
          icon="fileText"
          action={
            <a className="btn btn-ghost btn-sm" href="/docs" target="_blank" rel="noreferrer">
              <Icon name="eye" size={14} /> OpenAPI docs
            </a>
          }
        >
          {ENDPOINTS.map(([method, path, note]) => (
            <div key={path + method} className="endpoint">
              <span className={`method method-${method.toLowerCase()}`}>{method}</span>
              <span className="endpoint-path">{path}</span>
              <span className="endpoint-note">{note}</span>
            </div>
          ))}
        </Card>

        <Card
          title="Live response inspector"
          icon="database"
          action={
            <button className="btn btn-ghost btn-sm" onClick={refresh}>
              <Icon name="refresh" size={14} /> Refresh
            </button>
          }
        >
          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table className="table">
              <tbody>
                {[
                  ['Environment', status?.environment ?? '—'],
                  ['Version', status?.version ?? '—'],
                  ['Model', status?.ml_model ?? '—'],
                  ['Failure mode', status ? String(status.failure_mode) : '—'],
                  ['Poll cycle', `#${updateCount}`],
                  ['Simulation ticks', status?.uptime_ticks ?? '—'],
                  ['Alerts today', status?.alerts_today ?? '—'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="muted">{k}</td>
                    <td className="num">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="code-block">
            {data
              ? JSON.stringify(
                  {
                    train_id: data.train_id,
                    state: data.state,
                    health_score: data.health_score,
                    failure_probability: data.failure_probability,
                    sensors: data.sensors,
                    class_probabilities: data.class_probabilities,
                    model_confidence: data.model_confidence,
                  },
                  null,
                  2
                )
              : '// Waiting for the first sensor-data response…'}
          </div>
        </Card>
      </div>
    </>
  );
}
