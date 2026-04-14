/**
 * RouteMap.jsx
 * Visual route map showing all stations on the selected train's route.
 * Each station shows its health status and the train's current position.
 *
 * Features:
 *  - Horizontal scrollable route timeline
 *  - Color-coded station health dots
 *  - Current station highlighted with a pulsing indicator
 *  - Click any station to jump monitoring to that point
 *  - Distance labels between stations
 *
 * ACCESSIBILITY:
 *  - Station names large and clear
 *  - Status in text, not just color
 *  - High contrast on dark background
 */
import React from 'react';

const STATUS_COLOR = {
  good:   '#22c55e',
  warn:   '#f59e0b',
  danger: '#ef4444',
};

export default function RouteMap({ route, currentStation, onStationClick }) {
  if (!route || route.length === 0) return null;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 20,
      marginBottom: 20,
      overflowX: 'auto',
    }}>
      <div style={{ fontFamily:'var(--font-head)', fontSize:14, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--muted)', marginBottom:20 }}>
        🗺️ Route Map — Station Health Overview
      </div>

      {/* Route track */}
      <div style={{ minWidth: route.length * 130, position: 'relative', paddingBottom: 10 }}>

        {/* Connecting line */}
        <div style={{
          position: 'absolute',
          top: 22, left: 40,
          right: 40, height: 3,
          background: 'var(--surface3)',
          borderRadius: 2,
          zIndex: 0,
        }} />

        {/* Progress fill — up to current station */}
        <div style={{
          position: 'absolute',
          top: 22, left: 40,
          width: `${(currentStation?.index / (route.length - 1)) * (100 - (80 / route.length))}%`,
          height: 3,
          background: 'var(--accent)',
          borderRadius: 2,
          zIndex: 1,
          transition: 'width 1s ease',
        }} />

        {/* Stations */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {route.map((station, idx) => {
            const isCurrent = station.is_current;
            const isPast    = idx < (currentStation?.index || 0);
            const col       = STATUS_COLOR[station.status] || '#22c55e';

            return (
              <div
                key={station.code}
                onClick={() => onStationClick && onStationClick(idx)}
                title={`Click to monitor from ${station.name}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  width: 120, cursor: 'pointer', flexShrink: 0,
                }}
              >
                {/* Station dot */}
                <div style={{
                  width: isCurrent ? 30 : 22,
                  height: isCurrent ? 30 : 22,
                  borderRadius: '50%',
                  background: isCurrent ? col : isPast ? col : 'var(--surface3)',
                  border: `3px solid ${col}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.4s',
                  animation: isCurrent ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  boxShadow: isCurrent ? `0 0 0 6px ${col}22` : 'none',
                  marginBottom: 10,
                }}>
                  {isCurrent && <span style={{ fontSize: 12 }}>🚆</span>}
                  {isPast && !isCurrent && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✓</span>}
                </div>

                {/* Station name */}
                <div style={{
                  fontSize: isCurrent ? 13 : 12,
                  fontWeight: isCurrent ? 700 : 400,
                  color: isCurrent ? 'var(--text)' : isPast ? 'var(--muted)' : 'var(--muted)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  marginBottom: 4,
                }}>
                  {station.name}
                </div>

                {/* Station code */}
                <div style={{ fontSize: 10, color: 'rgba(122,156,200,0.6)', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {station.code}
                </div>

                {/* Health score pill */}
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 20,
                  background: `${col}18`,
                  color: col,
                  border: `1px solid ${col}44`,
                }}>
                  {station.health}%
                </div>

                {/* KM label */}
                <div style={{ fontSize: 10, color: 'rgba(122,156,200,0.4)', marginTop: 4 }}>
                  {station.km} km
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:20, marginTop:16, flexWrap:'wrap', fontSize:13, color:'var(--muted)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
          Route covered
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>🚆 Current position</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
          Good
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:'#f59e0b', display:'inline-block' }} />
          Check Required
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} />
          High Risk
        </span>
        <span style={{ marginLeft:'auto', fontSize:12, color:'rgba(122,156,200,0.5)' }}>
          Click any station to jump monitoring there
        </span>
      </div>
    </div>
  );
}
