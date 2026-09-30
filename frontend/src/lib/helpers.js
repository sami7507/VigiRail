/**
 * VigiRail — shared UI helpers (pure functions, no emoji).
 */

/** Mapped colours for a health state. */
export const stateColor = (state) =>
  ({ good: 'var(--green)', warn: 'var(--amber)', danger: 'var(--red)' }[state] || 'var(--text-dim)');

export const stateClass = (state) =>
  ({ good: 'is-good', warn: 'is-warn', danger: 'is-danger' }[state] || '');

export const stateLabel = (state) =>
  ({
    good: 'Operational',
    warn: 'Advisory — inspection advised',
    danger: 'Critical — stop and inspect',
  }[state] || 'Awaiting data');

export const stateDesc = {
  good: 'All monitored parameters are within RDSO operating limits.',
  warn: 'One or more readings are approaching advisory thresholds. Schedule an inspection within 48 hours.',
  danger: 'Multiple readings exceed critical limits. Halt the service and carry out an emergency inspection.',
};

/** Colour for a value against warn/danger thresholds. */
export const thresholdColor = (value, warn, danger) =>
  value >= danger ? 'var(--red)' : value >= warn ? 'var(--amber)' : 'var(--green)';

/** Bar colour as a fraction of max. */
export const ratioColor = (ratio) =>
  ratio >= 0.75 ? 'var(--red)' : ratio >= 0.5 ? 'var(--amber)' : 'var(--green)';

/** Severity → badge class. */
export const severityClass = (severity) =>
  ({ info: 'badge-info', warn: 'badge-warn', danger: 'badge-danger' }[severity] || 'badge-neutral');

/** Role accent colours (consistent across chips, avatars, banners). */
export const roleColor = (role) =>
  ({
    Admin: '#3b82f6',
    Engineer: '#34d399',
    Operator: '#fbbf24',
    Inspector: '#a78bfa',
  }[role] || '#60a5fa');

export const roleInitials = (name = '') => {
  const parts = name.split(/[\s_-]+/).filter(Boolean);
  if (!parts.length) return '??';
  // Multi-word: first letter of the first two words.
  // Single word: first two letters (usernames like "admin" → "AD").
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/** Formatting */
export const pct = (value, digits = 0) =>
  value === null || value === undefined || Number.isNaN(value)
    ? '—'
    : `${Number(value).toFixed(digits)}%`;

export const fmtTime = (iso) => {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return String(iso ?? '—');
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(iso ?? '—');
  }
};

export const fmtDateTime = (iso) => {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return String(iso ?? '—');
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(iso ?? '—');
  }
};

export const fmtUptime = (seconds) => {
  if (!Number.isFinite(seconds)) return '—';
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const cx = (...parts) => parts.filter(Boolean).join(' ');
