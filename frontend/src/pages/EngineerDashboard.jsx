/**
 * Engineer Dashboard — Technical Access
 * Full sensor + ML + backend proof + dataset. Can simulate failure.
 * No pitch tab, no all-user activity logs.
 */
import React, { useState } from 'react';
import { useSensor } from '../context/SensorContext';
import Topbar        from '../components/common/Topbar';
import RoleBanner    from '../components/common/RoleBanner';
import AlertBanner   from '../components/common/AlertBanner';
import TrainSelector from '../components/dashboard/TrainSelector';
import StatusHero    from '../components/dashboard/StatusHero';
import SensorCard    from '../components/dashboard/SensorCard';
import BogieCard     from '../components/dashboard/BogieCard';
import PredictionCard from '../components/dashboard/PredictionCard';
import MaintenanceCard from '../components/dashboard/MaintenanceCard';
import SimulatePanel  from '../components/dashboard/SimulatePanel';
import StatCard      from '../components/common/StatCard';
import VibrationChart from '../components/charts/VibrationChart';
import TempChart     from '../components/charts/TempChart';
import MLTab         from './tabs/MLTab';
import BackendTab    from './tabs/BackendTab';
import DatasetTab    from './tabs/DatasetTab';

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard'        },
  { id: 'ml',        label: '🧠 ML Explainability' },
  { id: 'backend',   label: '⚙️ Backend Proof'    },
  { id: 'dataset',   label: '📋 Dataset Info'     },
];

export default function EngineerDashboard() {
  const [tab, setTab] = useState('dashboard');
  const { data, alertCount, updateCount, selectedTrain } = useSensor();
  const t = data;

  return (
    <div>
      <Topbar />
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px 24px 48px' }}>
        <RoleBanner />

        <div style={{ background: 'var(--s1)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '15px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>Now Monitoring</div>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 800, marginBottom: 2 }}>🚆 {t?.train_id || selectedTrain}</div>
            <div style={{ fontSize: 12, color: 'var(--mt)' }}>{t?.alert_message || 'Connecting…'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--gbg)', border: '1px solid var(--gbd)', borderRadius: 18, padding: '5px 13px', fontSize: 11, fontWeight: 700, color: 'var(--g)', fontFamily: 'var(--fm)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--g)', animation: 'pulse 1.4s ease-in-out infinite' }} />
              LIVE · #{updateCount}
            </div>
          </div>
        </div>

        <AlertBanner />

        <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
          {TABS.map(tb => (
            <div key={tb.id} onClick={() => setTab(tb.id)}
              style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: `1px solid ${tab === tb.id ? 'rgba(65,153,255,.35)' : 'var(--bdr)'}`, background: tab === tb.id ? 'rgba(65,153,255,.12)' : 'var(--s1)', color: tab === tb.id ? 'var(--blue)' : 'var(--mt)', transition: 'all .2s' }}
            >
              {tb.label}
            </div>
          ))}
        </div>

        {tab === 'dashboard' && (
          <>
            <TrainSelector />
            <StatusHero />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 11, marginBottom: 18 }}>
              <StatCard label="Track Health"   value={`${t?.health_score ?? '—'}%`}        color={t?.state === 'danger' ? 'var(--r)' : t?.state === 'warn' ? 'var(--y)' : 'var(--g)'} sub="Overall" />
              <StatCard label="Failure Risk"   value={`${t?.failure_probability ?? '—'}%`} color="var(--y)" sub="24 hours" />
              <StatCard label="Active Alerts"  value={alertCount}                            color={alertCount > 0 ? 'var(--r)' : 'var(--y)'} sub="Today" />
              <StatCard label="Model Conf."    value={`${t?.model_confidence ?? '—'}%`}    color="var(--blue)" sub="RandomForest" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <SensorCard /><BogieCard />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <VibrationChart /><PredictionCard />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <TempChart /><MaintenanceCard />
            </div>
            <SimulatePanel />
          </>
        )}
        {tab === 'ml'      && <MLTab />}
        {tab === 'backend' && <BackendTab />}
        {tab === 'dataset' && <DatasetTab />}
      </div>
    </div>
  );
}
