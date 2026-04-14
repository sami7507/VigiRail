/**
 * Operator Dashboard — Simplified Operational View
 * Large readable text, colour-coded status, 2 assigned trains only.
 * No ML details, no simulation, no backend/dataset tabs.
 */
import React from 'react';
import { useSensor } from '../context/SensorContext';
import Topbar      from '../components/common/Topbar';
import RoleBanner  from '../components/common/RoleBanner';
import TrainSelector from '../components/dashboard/TrainSelector';
import MaintenanceCard from '../components/dashboard/MaintenanceCard';
import { stateColor, stateBg, stateBorder, stateEmoji } from '../utils/helpers';

const ACTION_GUIDE = [
  { icon: '🟢', label: 'GREEN — Good Condition:', desc: 'Continue normal operations. No action needed.' },
  { icon: '🟡', label: 'YELLOW — Check Required:', desc: 'Report to your engineer within 24 hours.' },
  { icon: '🔴', label: 'RED — High Risk:',         desc: 'Stop the train immediately and call maintenance!' },
];

export default function OperatorDashboard() {
  const { data, selectedTrain } = useSensor();
  const state  = data?.state || 'good';
  const health = data?.health_score ?? 0;
  const fp     = data?.failure_probability ?? 0;
  const col    = stateColor(state);

  const statusText = {
    good:   'MACHINE HEALTH: GOOD',
    warn:   'ATTENTION: CHECK REQUIRED',
    danger: 'WARNING: HIGH RISK',
  }[state];

  const statusDesc = {
    good:   'Everything is running normally. No action needed.',
    warn:   'Some readings are slightly high. Contact your engineer.',
    danger: 'Danger detected! Stop the train and call maintenance NOW.',
  }[state];

  return (
    <div>
      <Topbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 48px' }}>
        <RoleBanner />
        <TrainSelector />

        {/* Big status card — large text for non-technical operators */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px',
          borderRadius: 18, border: `1px solid ${stateBorder(state)}`,
          background: stateBg(state), textAlign: 'center',
          marginBottom: 18, minHeight: 220,
          transition: 'all .5s', animation: 'fadeUp .4s ease',
          boxShadow: state === 'danger' ? '0 0 0 6px rgba(255,60,60,.1)' : 'none',
        }}>
          <div style={{ fontSize: 62, marginBottom: 16 }}>{stateEmoji(state)}</div>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 30, fontWeight: 800, color: col, marginBottom: 10 }}>
            {statusText}
          </div>
          <div style={{ fontSize: 17, color: 'var(--tx)', lineHeight: 1.5, maxWidth: 420, marginBottom: 18 }}>
            {statusDesc}
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 15, color: col }}>
            Health: {health}% &nbsp;·&nbsp; Risk: {fp}%
          </div>
        </div>

        {/* 3 simple stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Your Train 1</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 20, fontWeight: 700, color: 'var(--blue)', marginBottom: 3 }}>12951</div>
            <div style={{ fontSize: 12, color: 'var(--mt)' }}>Mumbai Rajdhani</div>
          </div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Your Train 2</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 20, fontWeight: 700, color: 'var(--blue)', marginBottom: 3 }}>12002</div>
            <div style={{ fontSize: 12, color: 'var(--mt)' }}>Bhopal Shatabdi</div>
          </div>
          <div style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Last Check</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 20, fontWeight: 700, color: 'var(--g)', marginBottom: 3 }}>Now</div>
            <div style={{ fontSize: 12, color: 'var(--mt)' }}>2 seconds ago</div>
          </div>
        </div>

        {/* Maintenance actions */}
        <div style={{ marginBottom: 18 }}><MaintenanceCard /></div>

        {/* Simple action guide */}
        <div style={{ background: 'var(--s1)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--mt)', marginBottom: 14 }}>📋 Quick Action Guide</div>
          {ACTION_GUIDE.map((g, i) => (
            <div key={i} style={{ fontSize: 15, color: 'var(--mt)', lineHeight: 2 }}>
              {g.icon} <b style={{ color: 'var(--tx)' }}>{g.label}</b> {g.desc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
