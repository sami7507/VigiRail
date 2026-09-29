/**
 * VigiRail — Reports page (Admin / Inspector).
 * Inspection summary preview + real CSV download + print view.
 */
import React, { useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadReport, errMsg } from '../lib/api';
import Card from '../components/common/Card';
import Icon from '../components/Icon';
import {
  cx,
  fmtDateTime,
  roleInitials,
  stateColor,
  stateLabel,
} from '../lib/helpers';

const STATE_TEXT = { good: 'GOOD', warn: 'ADVISORY', danger: 'CRITICAL' };

export default function ReportsPage() {
  const { data, selectedTrain, selectTrain } = useSensor();
  const { user } = useAuth();
  const { push } = useToast();
  const [downloading, setDownloading] = useState(false);

  const bogies = data?.bogies || [];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReport(selectedTrain, 'csv');
      push({
        type: 'success',
        title: 'Report downloaded',
        message: `CSV inspection report for train ${selectedTrain}.`,
      });
    } catch (err) {
      push({ type: 'error', title: 'Download failed', message: errMsg(err) });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Inspection reports</h1>
        <p className="page-sub">
          Generate a signed CSV inspection snapshot from the live model output, or print
          this page to PDF for the paper file.
        </p>
      </div>

      {/* Toolbar */}
      <section className="train-bar no-print">
        <div className="train-bar-left">
          <div className="train-select">
            <label className="label" htmlFor="report-train" style={{ marginBottom: 5 }}>
              Target service
            </label>
            <select
              id="report-train"
              className="select"
              value={selectedTrain}
              onChange={(e) => selectTrain(e.target.value)}
            >
              {['12951', '12301', '12002', '22691', '12627', '20501', '12429'].map((no) => (
                <option key={no} value={no}>
                  Train {no}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <Icon name="printer" size={16} />
            Print / PDF
          </button>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            <Icon name="download" size={16} />
            {downloading ? 'Preparing…' : 'Download CSV'}
          </button>
        </div>
      </section>

      {/* Report preview */}
      <Card title={`Inspection report — train ${selectedTrain}`} icon="fileText">
        <div className="grid grid-3">
          {[
            ['Report ID', `VR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-…`],
            ['Generated', fmtDateTime(new Date().toISOString())],
            ['Inspector', `${user?.full_name || user?.username} (${user?.role})`],
            ['Service', data ? `${data.train.name}` : '—'],
            ['Overall status', STATE_TEXT[data?.state] || '—'],
            ['Health / risk', data ? `${data.health_score}% / ${data.failure_probability}%` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="bogie-cell" style={{ textAlign: 'left' }}>
              <div className="bogie-id">{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 5 }}>{v}</div>
            </div>
          ))}
        </div>

        <h3 className="card-title" style={{ margin: '20px 0 10px' }}>
          <Icon name="layers" size={14} /> Bogie-by-bogie status
        </h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Position</th>
                <th>Status</th>
                <th>Bearing temp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bogies.map((bogie) => (
                <tr key={bogie.id}>
                  <td className="num">{bogie.id}</td>
                  <td>{bogie.label}</td>
                  <td>
                    <span
                      className={cx(
                        'badge',
                        bogie.status === 'good'
                          ? 'badge-good'
                          : bogie.status === 'warn'
                            ? 'badge-warn'
                            : 'badge-danger'
                      )}
                    >
                      <span className="dot" style={{ background: stateColor(bogie.status) }} />
                      {STATE_TEXT[bogie.status]}
                    </span>
                  </td>
                  <td className="num">{bogie.temp} °C</td>
                  <td className="muted">
                    {bogie.status === 'danger'
                      ? 'Stop inspection'
                      : bogie.status === 'warn'
                        ? 'Inspect within 48 h'
                        : 'Monitor'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <>
            <h3 className="card-title" style={{ margin: '20px 0 10px' }}>
              <Icon name="wrench" size={14} /> Recommended actions
            </h3>
            {data.maintenance.map((item) => (
              <div key={item.title} className="maint-item">
                <span className={`maint-icon ${item.urgency}`}>
                  <Icon
                    name={
                      item.urgency === 'urgent'
                        ? 'alertTriangle'
                        : item.urgency === 'ok'
                          ? 'checkCircle'
                          : item.urgency === 'soon'
                            ? 'wrench'
                            : 'calendar'
                    }
                    size={15}
                  />
                </span>
                <div>
                  <div className="maint-title">{item.title}</div>
                  <div className="maint-detail">{item.detail}</div>
                </div>
              </div>
            ))}
          </>
        )}

        <p className="card-sub" style={{ marginTop: 14 }}>
          Conclusion: {stateLabel(data?.state)} · signed by {user?.full_name} · this
          report reflects the snapshot at generation time.
        </p>
      </Card>
    </>
  );
}
