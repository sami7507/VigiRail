/**
 * Inspector Dashboard — Read-Only Inspection Access
 * All trains (view only), bogie inspection, history logs, report download.
 */
import React, { useState, useEffect } from 'react';
import { useSensor } from '../context/SensorContext';
import Topbar        from '../components/common/Topbar';
import RoleBanner    from '../components/common/RoleBanner';
import TrainSelector from '../components/dashboard/TrainSelector';
import BogieCard     from '../components/dashboard/BogieCard';
import StatCard      from '../components/common/StatCard';
import Card          from '../components/common/Card';
import { fetchHistory } from '../utils/api';
import { stateColor, fmtTime } from '../utils/helpers';

const BOGIE_LABELS = ['Bogie 1 (Front)','Bogie 2','Bogie 3','Bogie 4','Bogie 5','Bogie 6 (Rear)'];
const RL = [
  { lbl: 'Good',    col: '#10d978', bg: 'rgba(16,217,120,.1)', bdr: 'rgba(16,217,120,.25)' },
  { lbl: 'Monitor', col: '#f5a623', bg: 'rgba(245,166,35,.1)', bdr: 'rgba(245,166,35,.25)' },
  { lbl: 'URGENT',  col: '#ff3c3c', bg: 'rgba(255,60,60,.1)',  bdr: 'rgba(255,60,60,.25)'  },
];

const TABS = [
  { id: 'inspection', label: '🔍 Inspection Report' },
  { id: 'history',    label: '📜 History Log'       },
];

export default function InspectorDashboard() {
  const [tab, setTab]         = useState('inspection');
  const [history, setHistory] = useState([]);
  const { data, selectedTrain, updateCount } = useSensor();

  useEffect(() => {
    fetchHistory(50).then(d => setHistory(d.records || [])).catch(() => {});
  }, [updateCount]);

  const bogies = data?.bogies || BOGIE_LABELS.map((l, i) => ({ id: `B${i+1}`, label: l, status: i === 4 ? 'warn' : 'good', temp: 52 }));
  const STATE_IDX = { good: 0, warn: 1, danger: 2 };

  return (
    <div>
      <Topbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 48px' }}>
        <RoleBanner />
        <TrainSelector />

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
          {TABS.map(tb => (
            <div key={tb.id} onClick={() => setTab(tb.id)}
              style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: `1px solid ${tab === tb.id ? 'rgba(65,153,255,.35)' : 'var(--bdr)'}`, background: tab === tb.id ? 'rgba(65,153,255,.12)' : 'var(--s1)', color: tab === tb.id ? 'var(--blue)' : 'var(--mt)', transition: 'all .2s' }}>
              {tb.label}
            </div>
          ))}
        </div>

        {/* ── INSPECTION REPORT ── */}
        {tab === 'inspection' && (
          <>
            {/* Report meta */}
            <Card title={`Inspection Report — Train ${selectedTrain}`} icon="📄" style={{ marginBottom: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 14 }}>
                {[
                  ['Inspection Date', new Date().toLocaleDateString('en-IN')],
                  ['Inspector',       'Inspector (logged in)'],
                  ['Train No.',       selectedTrain],
                  ['Overall Status',  (data?.state || 'GOOD').toUpperCase()],
                  ['Health Score',    `${data?.health_score ?? '—'}%`],
                  ['Report ID',       `RG-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 9, padding: '11px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--fm)', color: 'var(--tx)' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Bogie-by-bogie inspection */}
              <div style={{ fontSize: 10, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10, fontWeight: 700 }}>Bogie-by-Bogie Status</div>
              {bogies.map((b, i) => {
                const ri = STATE_IDX[b.status] ?? 0;
                const r  = RL[ri];
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--s2)', border: `1px solid ${r.bdr}`, borderRadius: 9, marginBottom: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: r.col, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--tx)' }}>{b.label || BOGIE_LABELS[i]}</div>
                    <div style={{ fontSize: 11, color: 'var(--mt)', fontFamily: 'var(--fm)' }}>Temp: {b.temp}°C</div>
                    <div style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 7, background: r.bg, color: r.col }}>{r.lbl}</div>
                  </div>
                );
              })}

              {/* Download button */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <button onClick={() => alert('📄 PDF report — connect to /api/report endpoint in production')}
                  style={{ padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--fb)', background: 'rgba(168,85,247,.12)', border: '1px solid rgba(168,85,247,.28)', color: 'var(--purple)' }}>
                  📥 Download Inspection Report (PDF)
                </button>
                <button onClick={() => alert('📊 CSV export — connect to /api/history?format=csv in production')}
                  style={{ padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--fb)', background: 'var(--gbg)', border: '1px solid var(--gbd)', color: 'var(--g)' }}>
                  📊 Export Data (CSV)
                </button>
              </div>
            </Card>

            <BogieCard />
          </>
        )}

        {/* ── HISTORY LOG ── */}
        {tab === 'history' && (
          <Card title="Failure History Log" icon="📜">
            {history.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--dim)', padding: '12px 0', textAlign: 'center' }}>No history records yet. Sensors are live — records appear every scan.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bdr)' }}>
                      {['Time','Train','State','Vib (mm/s)','Temp (°C)','Sound (dB)','Wear (%)','Risk %'].map(h => (
                        <th key={h} style={{ padding: '8px 11px', fontSize: 10, color: 'var(--mt)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 50).map((rec, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(48,130,255,.05)' }}>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--dim)' }}>{fmtTime(rec.timestamp)}</td>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', color: 'var(--blue)' }}>{rec.train_id}</td>
                        <td style={{ padding: '8px 11px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 7, background: rec.state === 'danger' ? 'var(--rbg)' : rec.state === 'warn' ? 'var(--ybg)' : 'var(--gbg)', color: rec.state === 'danger' ? 'var(--r)' : rec.state === 'warn' ? 'var(--y)' : 'var(--g)' }}>
                            {rec.state?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', color: stateColor(rec.state) }}>{rec.vib}</td>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', color: 'var(--mt)' }}>{rec.temp}</td>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', color: 'var(--mt)' }}>{rec.acou}</td>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', color: 'var(--mt)' }}>{rec.wear}</td>
                        <td style={{ padding: '8px 11px', fontFamily: 'var(--fm)', color: stateColor(rec.state), fontWeight: 600 }}>{rec.risk_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
