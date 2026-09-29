/**
 * VigiRail — History page (Admin / Inspector).
 * Paginated readings table + recent alert stream.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { errMsg, fetchAlerts, fetchHistory } from '../lib/api';
import Card from '../components/common/Card';
import Icon from '../components/Icon';
import { cx, fmtDateTime, fmtTime, severityClass, stateColor } from '../lib/helpers';

const STATE_TEXT = { good: 'Normal', warn: 'Advisory', danger: 'Critical' };
const PAGE = 25;

export default function HistoryPage() {
  const { data: live, selectedTrain, updateCount } = useSensor();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchHistory({
        limit: PAGE,
        offset,
        train: filter || undefined,
      });
      setRecords(page.records);
      setTotal(page.total);
      setError(null);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [offset, filter]);

  // Initial load + refresh every 10th live poll (~20 s).
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (updateCount > 0 && updateCount % 10 === 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateCount]);

  useEffect(() => {
    fetchAlerts(15)
      .then((body) => setAlerts(body.alerts))
      .catch(() => {});
  }, [updateCount]);

  const changeFilter = (value) => {
    setFilter(value);
    setOffset(0);
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Telemetry history</h1>
        <p className="page-sub">
          Newest-first reading log from the in-memory ring buffer — filterable by service.
        </p>
      </div>

      <div className="grid grid-2">
        <Card
          title="Readings"
          icon="history"
          flush
          action={
            <select
              className="select"
              style={{ width: 'auto', minHeight: 34, padding: '4px 34px 4px 10px', fontSize: 12.5 }}
              value={filter}
              onChange={(e) => changeFilter(e.target.value)}
              aria-label="Filter by train"
            >
              <option value="">All trains</option>
              {[selectedTrain, '12951', '12002', '12301'].filter(
                (v, i, arr) => v && arr.indexOf(v) === i
              ).map((no) => (
                <option key={no} value={no}>
                  Train {no}
                </option>
              ))}
            </select>
          }
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Train</th>
                  <th>State</th>
                  <th>Vib</th>
                  <th>Temp</th>
                  <th>Acoustic</th>
                  <th>Wear</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row, index) => (
                  <tr key={`${row.timestamp}-${index}`}>
                    <td className="num muted">{fmtDateTime(row.timestamp)}</td>
                    <td className="num">{row.train_id}</td>
                    <td>
                      <span
                        className={cx(
                          'badge',
                          row.state === 'good'
                            ? 'badge-good'
                            : row.state === 'warn'
                              ? 'badge-warn'
                              : 'badge-danger'
                        )}
                      >
                        <span className="dot" style={{ background: stateColor(row.state) }} />
                        {STATE_TEXT[row.state]}
                      </span>
                    </td>
                    <td className="num">{row.vibration}</td>
                    <td className="num">{row.temperature}</td>
                    <td className="num">{row.acoustic}</td>
                    <td className="num">{row.wear}</td>
                    <td className="num" style={{ color: row.risk_pct >= 70 ? 'var(--red)' : row.risk_pct >= 35 ? 'var(--amber)' : 'var(--green)' }}>
                      {row.risk_pct}%
                    </td>
                  </tr>
                ))}
                {!records.length && !loading && (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty">
                        <div className="empty-title">No readings yet</div>
                        History fills as the dashboard polls live telemetry.
                      </div>
                    </td>
                  </tr>
                )}
                {loading && !records.length && (
                  <tr>
                    <td colSpan={8}>
                      <div className="skeleton" style={{ height: 120 }} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pager" style={{ padding: '0 12px 13px' }}>
            <span className="pager-info">
              {total ? `${offset + 1}–${Math.min(offset + PAGE, total)} of ${total}` : '0 records'}
            </span>
            <div className="pager-controls">
              <button
                className="btn btn-ghost btn-sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE))}
              >
                <Icon name="chevronLeft" size={14} /> Prev
              </button>
              <button
                className="btn btn-ghost btn-sm"
                disabled={offset + PAGE >= total}
                onClick={() => setOffset(offset + PAGE)}
              >
                Next <Icon name="chevronRight" size={14} />
              </button>
            </div>
          </div>
          {error && (
            <div className="banner banner-danger" style={{ margin: '0 12px 13px' }}>
              <Icon name="alertTriangle" size={16} />
              <span className="banner-text">{error}</span>
            </div>
          )}
        </Card>

        <Card title="Recent alerts" icon="alertTriangle" action={<span className="card-sub">{alerts.length}</span>}>
          {alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.id} className="maint-item">
                <span
                  className={`maint-icon ${alert.severity === 'danger' ? 'urgent' : alert.severity === 'warn' ? 'soon' : 'planned'}`}
                >
                  <Icon name={alert.severity === 'info' ? 'info' : 'alertTriangle'} size={15} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="maint-detail" style={{ color: 'var(--text)' }}>
                    {alert.message}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <span className={cx('badge', severityClass(alert.severity))}>
                      {alert.severity}
                    </span>
                    <span className="event-time">{fmtTime(alert.timestamp)}</span>
                    {alert.train_id !== '—' && (
                      <span className="event-time">train {alert.train_id}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              <Icon name="checkCircle" size={30} />
              <div className="empty-title">No alerts recorded</div>
              State transitions will appear here as they happen.
            </div>
          )}
        </Card>
      </div>

      {live && (
        <p className="card-sub" style={{ textAlign: 'center' }}>
          Auto-refreshes roughly every 20 seconds while this tab is open.
        </p>
      )}
    </>
  );
}
