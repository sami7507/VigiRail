/** Train selection grid — respects Operator's 2-train limit */
import React, { useEffect, useState } from 'react';
import { useSensor } from '../../context/SensorContext';
import { useAuth } from '../../context/AuthContext';
import { fetchTrains } from '../../utils/api';

const OPERATOR_TRAINS = ['12951', '12002'];

export default function TrainSelector() {
  const { selectedTrain, setSelectedTrain } = useSensor();
  const { user } = useAuth();
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    fetchTrains().then(d => {
      let list = d.trains || [];
      if (user?.role === 'Operator') {
        list = list.filter(t => OPERATOR_TRAINS.includes(t.no));
      }
      setTrains(list);
    }).catch(() => {});
  }, [user]);

  const TYPE_COLORS = { Rajdhani: '#3b82f6', Shatabdi: '#f59e0b', Express: '#ec4899', 'Garib Rath': '#6366f1', 'Vande Bharat': '#22c55e' };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--mt)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        {user?.role === 'Operator' ? `Your Assigned Trains (${trains.length})` : 'Select Train to Monitor'}
        <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 9 }}>
        {trains.map((t, i) => {
          const col = TYPE_COLORS[t.type] || '#4199ff';
          const sel = selectedTrain === t.no;
          return (
            <div key={t.no}
              onClick={() => setSelectedTrain(t.no)}
              style={{
                background: sel ? `${col}12` : 'var(--s1)',
                border: `1px solid ${sel ? col + '55' : 'var(--bdr)'}`,
                borderRadius: 12, padding: '13px 15px', cursor: 'pointer',
                transition: 'all .22s', display: 'flex', alignItems: 'center', gap: 11,
                animationDelay: `${i * .04}s`, animation: 'fadeUp .3s ease both',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--bdh)'; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--bdr)'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${col}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>🚆</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: col, fontFamily: 'var(--fm)', marginBottom: 1 }}>{t.no}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 148 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--mt)', marginTop: 1 }}>{t.zone} Zone</div>
              </div>
              <div style={{ padding: '3px 8px', borderRadius: 7, fontSize: 9, fontWeight: 700, background: `${col}22`, color: col, textTransform: 'uppercase', letterSpacing: '.04em', flexShrink: 0 }}>{t.type}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
