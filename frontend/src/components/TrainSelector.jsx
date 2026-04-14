/**
 * TrainSelector.jsx
 * Lets the user pick any real Indian train to monitor.
 * Shows train number, name, route, zone, and type.
 *
 * ACCESSIBILITY:
 * - Large dropdown text (16px+)
 * - Clear labels — "Train Number", "Route", "Zone"
 * - Color badge for train type (Rajdhani / Shatabdi / Express / Mail)
 */
import React, { useState, useEffect } from 'react';

const TYPE_COLORS = {
  Rajdhani: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  Shatabdi: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  Express:  { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: 'rgba(34,197,94,0.3)'  },
  Mail:     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
};

export default function TrainSelector({ onSelect, currentTrain }) {
  const [trains, setTrains] = useState([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(r => r.json())
      .then(d => { setTrains(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSelect(train) {
    setOpen(false);
    await fetch('http://localhost:8000/api/select-train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ train_number: train.number }),
    });
    onSelect(train);
  }

  const tc = TYPE_COLORS[currentTrain?.type] || TYPE_COLORS.Express;

  return (
    <div style={{ marginBottom: 20, position: 'relative', zIndex: 50 }}>
      {/* Selector trigger button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-bright)',
          borderRadius: 14,
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          transition: 'border-color 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 28 }}>🚆</div>
          <div>
            {currentTrain ? (
              <>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>
                  {currentTrain.number} — {currentTrain.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {currentTrain.from} → {currentTrain.to} &nbsp;|&nbsp; {currentTrain.distance_km} km &nbsp;|&nbsp; {currentTrain.stations} stations
                </div>
              </>
            ) : (
              <div style={{ fontSize: 16, color: 'var(--muted)' }}>Select a train to monitor...</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {currentTrain && (
            <>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
              }}>{currentTrain.type}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                {currentTrain.zone}
              </span>
            </>
          )}
          <span style={{ color: 'var(--muted)', fontSize: 18, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border-bright)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 100,
        }}>
          <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>
            Select Train to Monitor
          </div>
          {loading ? (
            <div style={{ padding: 20, color: 'var(--muted)', fontSize: 14 }}>Loading trains...</div>
          ) : (
            trains.map(train => {
              const c = TYPE_COLORS[train.type] || TYPE_COLORS.Express;
              const isActive = currentTrain?.number === train.number;
              return (
                <div
                  key={train.number}
                  onClick={() => handleSelect(train)}
                  style={{
                    padding: '14px 20px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: isActive ? 'var(--surface2)' : 'transparent',
                    transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = isActive ? 'var(--surface2)' : 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {isActive && <span style={{ color: 'var(--green)', marginRight: 6 }}>●</span>}
                      {train.number} — {train.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                      {train.from} → {train.to} &nbsp;·&nbsp; {train.distance_km} km &nbsp;·&nbsp; {train.stations} stations
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
                      {train.type}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
