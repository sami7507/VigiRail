/**
 * VigiRail — Model page (Admin / Engineer).
 * Real training metrics, feature importances, live class probabilities
 * and the RDSO threshold reference.
 */
import React, { useEffect, useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { errMsg, fetchModelInfo } from '../lib/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Icon from '../components/Icon';

const THRESHOLDS = [
  ['Vibration', '0 – 5 mm/s', '5 – 8 mm/s', '> 8 mm/s', 'RDSO/2019/CG-06'],
  ['Bearing temperature', '< 70 °C', '70 – 90 °C', '> 90 °C', 'IS 3073 / Railway Board'],
  ['Acoustic emission', '< 60 dB', '60 – 80 dB', '> 80 dB', 'IEC 60721'],
  ['Component wear', '< 50 %', '50 – 75 %', '> 75 %', 'RDSO Track Maintenance Manual'],
];

const CLASS_COPY = {
  normal: 'Within limits',
  warning: 'Approaching limits',
  critical: 'Beyond limits',
};

function FeatureImportance({ importances }) {
  const rows = Object.entries(importances || {}).sort((a, b) => b[1] - a[1]);
  const colors = ['#60a5fa', '#fbbf24', '#a78bfa', '#34d399'];
  return (
    <>
      {rows.map(([name, value], index) => {
        const pctValue = (value * 100).toFixed(1);
        return (
          <div key={name} className="risk-row">
            <div className="risk-head">
              <span className="risk-name">{name}</span>
              <span className="risk-val" style={{ color: colors[index % colors.length] }}>
                {pctValue}%
              </span>
            </div>
            <div className="risk-track">
              <div
                className="risk-fill"
                style={{ width: `${pctValue}%`, background: colors[index % colors.length] }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

function CurrentSample() {
  const { data } = useSensor();
  const probs = data?.class_probabilities || {};
  const tone = { normal: 'var(--green)', warning: 'var(--amber)', critical: 'var(--red)' };

  if (!data) return null;

  return (
    <Card title="Current sample — class probabilities" icon="activity">
      <div className="grid grid-3" style={{ marginBottom: 0 }}>
        {Object.entries(CLASS_COPY).map(([key, label]) => (
          <div key={key} className="bogie-cell">
            <div className="bogie-id">{label}</div>
            <div className="bogie-temp" style={{ color: tone[key] }}>
              {probs[key] ?? '—'}%
            </div>
            <div className="bogie-label">P({key})</div>
          </div>
        ))}
      </div>
      <p className="card-sub" style={{ marginTop: 12 }}>
        Live snapshot: vib {data.sensors.vibration} mm/s · temp {data.sensors.temperature} °C ·
        acoustic {data.sensors.acoustic} dB · wear {data.sensors.wear}%
      </p>
    </Card>
  );
}

export default function ModelPage() {
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchModelInfo()
      .then((info) => !cancelled && setModel(info))
      .catch((err) => !cancelled && setError(errMsg(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="banner banner-danger">
        <Icon name="alertTriangle" size={17} />
        <span className="banner-text">Could not load model metadata — {error}</span>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="grid grid-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 96 }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Failure-risk model</h1>
        <p className="page-sub">
          StandardScaler → RandomForestClassifier, trained at API startup on synthetic
          RDSO-calibrated telemetry with a stratified 80/20 hold-out.
        </p>
      </div>

      <div className="grid grid-4">
        <StatCard
          label="Hold-out accuracy"
          value={`${(model.test_accuracy * 100).toFixed(1)}%`}
          tone="good"
          sub={`${model.test_samples} unseen samples`}
          icon="checkCircle"
        />
        <StatCard
          label="Macro F1"
          value={model.test_macro_f1.toFixed(3)}
          tone="accent"
          sub="Balanced across 3 classes"
          icon="gauge"
        />
        <StatCard
          label="Trees"
          value={model.trees}
          sub={`max depth 10 · ${model.train_samples} rows`}
          icon="layers"
        />
        <StatCard
          label="Features"
          value={model.features.length}
          sub={model.features.join(', ')}
          icon="database"
        />
      </div>

      <div className="grid grid-2">
        <Card title="Feature importance (fitted forest)" icon="cpu">
          <FeatureImportance importances={model.feature_importances} />
          <p className="card-sub" style={{ marginTop: 12 }}>
            Read directly from <span className="mono">feature_importances_</span> of the
            trained estimator — not hard-coded.
          </p>
        </Card>
        <CurrentSample />
      </div>

      <div className="grid grid-2">
        <Card title="Decision thresholds (RDSO reference)" icon="fileText">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Normal</th>
                  <th>Advisory</th>
                  <th>Critical</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {THRESHOLDS.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td style={{ color: 'var(--green)' }}>{row[1]}</td>
                    <td style={{ color: 'var(--amber)' }}>{row[2]}</td>
                    <td style={{ color: 'var(--red)' }}>{row[3]}</td>
                    <td className="muted">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Training & evaluation" icon="flask">
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {[
                  ['Algorithm', model.name],
                  ['Pipeline', model.pipeline],
                  ['Classes', model.classes.join(' · ')],
                  ['Train rows', model.train_samples.toLocaleString()],
                  ['Test rows', `${model.test_samples.toLocaleString()} (held out)`],
                  ['Train accuracy', `${(model.train_accuracy * 100).toFixed(1)}%`],
                  ['Hold-out accuracy', `${(model.test_accuracy * 100).toFixed(1)}%`],
                  ['Hold-out macro F1', model.test_macro_f1.toFixed(3)],
                  ['Inference', 'Deterministic — identical inputs give identical scores'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="muted">{k}</td>
                    <td className="num">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="card-sub" style={{ marginTop: 12 }}>
            Reported accuracy is measured on the held-out split — never on training rows.
            In production this generator is replaced by logged wayside sensor data.
          </p>
        </Card>
      </div>
    </>
  );
}
