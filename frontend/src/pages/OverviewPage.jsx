/**
 * VigiRail — Overview page.
 * Role-adapted: operators get a plain-language operational view; engineers,
 * admins and inspectors get the full telemetry workspace.
 */
import React from 'react';
import { useSensor } from '../context/SensorContext';
import { useAuth } from '../context/AuthContext';
import { can } from '../lib/nav';
import RoleStrip from '../components/common/RoleStrip';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import TrainSelector from '../components/dashboard/TrainSelector';
import TrainRoute from '../components/dashboard/TrainRoute';
import StatusHero from '../components/dashboard/StatusHero';
import SensorCard from '../components/dashboard/SensorCard';
import BogieCard from '../components/dashboard/BogieCard';
import PredictionCard from '../components/dashboard/PredictionCard';
import MaintenanceCard from '../components/dashboard/MaintenanceCard';
import EventLog from '../components/dashboard/EventLog';
import SimulatePanel from '../components/dashboard/SimulatePanel';
import { VibrationChart, TempChart } from '../components/charts/TrendCharts';

const ACTIONS = [
  { state: 'good', label: 'Green — normal operation', desc: 'Continue the schedule. No action required.', color: 'var(--green)' },
  { state: 'warn', label: 'Amber — advisory', desc: 'Report to your control engineer within 24 hours.', color: 'var(--amber)' },
  { state: 'danger', label: 'Red — critical', desc: 'Stop the service and call maintenance immediately.', color: 'var(--red)' },
];

function StatRow() {
  const { data } = useSensor();
  const risk = data?.failure_probability;
  return (
    <div className="grid grid-4">
      <StatCard
        label="Health score"
        value={data ? `${data.health_score}%` : '—'}
        tone={data?.state === 'danger' ? 'danger' : data?.state === 'warn' ? 'warn' : 'good'}
        sub="Overall asset health"
        icon="gauge"
      />
      <StatCard
        label="Failure risk"
        value={data ? `${risk}%` : '—'}
        tone={risk >= 70 ? 'danger' : risk >= 35 ? 'warn' : 'good'}
        sub="Next 24 hours"
        icon="zap"
      />
      <StatCard
        label="Alerts today"
        value={data?.alerts_today ?? '—'}
        tone={(data?.alerts_today ?? 0) > 0 ? 'danger' : undefined}
        sub="Server-side count"
        icon="alertTriangle"
      />
      <StatCard
        label="Next service"
        value={data ? `${data.days_until_service} d` : '—'}
        tone="accent"
        sub="Model-recommended"
        icon="calendar"
      />
    </div>
  );
}

function OperatorGuide() {
  const { data } = useSensor();
  const state = data?.state || 'good';
  return (
    <section className="card">
      <header className="card-header">
        <h3 className="card-title">Quick action guide</h3>
      </header>
      {ACTIONS.map((action) => (
        <div key={action.label} className="maint-item">
          <span
            className={`maint-icon ${state === action.state ? (action.state === 'good' ? 'ok' : action.state === 'warn' ? 'soon' : 'urgent') : 'planned'}`}
            style={state === action.state ? undefined : { opacity: 0.45 }}
          >
            <span className="dot" style={{ width: 10, height: 10, background: action.color }} />
          </span>
          <div>
            <div className="maint-title" style={{ color: state === action.state ? action.color : undefined }}>
              {action.label}
            </div>
            <div className="maint-detail">{action.desc}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { updateCount } = useSensor();
  const isOperator = user?.role === 'Operator';
  const isInspector = user?.role === 'Inspector';
  const showAdvanced = can(user?.role, 'fullTelemetry');

  return (
    <>
      <RoleStrip />
      <TrainSelector />
      <TrainRoute />
      <AlertBanner />
      <StatusHero />
      <StatRow />

      {isOperator && (
        <>
          <div className="grid grid-2">
            <SensorCard />
            <MaintenanceCard />
          </div>
          <OperatorGuide />
        </>
      )}

      {isInspector && (
        <>
          <div className="grid grid-2">
            <SensorCard />
            <BogieCard />
          </div>
          <div className="grid grid-2">
            <MaintenanceCard />
            <EventLog />
          </div>
        </>
      )}

      {showAdvanced && (
        <>
          <div className="grid grid-2">
            <SensorCard />
            <BogieCard />
          </div>
          <div className="grid grid-2">
            <VibrationChart />
            <TempChart />
          </div>
          <div className="grid grid-2">
            <PredictionCard />
            <MaintenanceCard />
          </div>
          <div className="grid grid-2">
            <EventLog />
            <section className="card">
              <header className="card-header">
                <h3 className="card-title">Simulation control</h3>
                <span className="badge badge-neutral">poll #{updateCount}</span>
              </header>
              <SimulatePanel />
            </section>
          </div>
        </>
      )}
    </>
  );
}
