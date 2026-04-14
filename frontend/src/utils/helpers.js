/**
 * RailGuard AI — Shared Utility Helpers
 */

/** Return CSS color variable string for a given state */
export const stateColor = (state) => ({
  good:   'var(--g)',
  warn:   'var(--y)',
  danger: 'var(--r)',
}[state] || 'var(--mt)');

/** Return background color for a given state */
export const stateBg = (state) => ({
  good:   'var(--gbg)',
  warn:   'var(--ybg)',
  danger: 'var(--rbg)',
}[state] || 'var(--s2)');

/** Return border color for a given state */
export const stateBorder = (state) => ({
  good:   'var(--gbd)',
  warn:   'var(--ybd)',
  danger: 'var(--rbd)',
}[state] || 'var(--bdr)');

/** Human-readable state label */
export const stateLabel = (state) => ({
  good:   'GOOD CONDITION',
  warn:   'CHECK REQUIRED',
  danger: 'HIGH RISK — STOP TRAIN',
}[state] || '—');

/** Emoji for state */
export const stateEmoji = (state) => ({
  good:   '🟢',
  warn:   '🟡',
  danger: '🔴',
}[state] || '⚪');

/** Sensor bar color: green → yellow → red */
export const sensorColor = (val, warn, danger) =>
  val >= danger ? 'var(--r)' : val >= warn ? 'var(--y)' : 'var(--g)';

/** Format percentage safely */
export const pct = (v) => `${Math.round(v ?? 0)}%`;

/** Format a timestamp to locale time string */
export const fmtTime = (iso) => {
  try { return new Date(iso).toLocaleTimeString('en-IN', { hour12: true }); }
  catch { return iso; }
};

/** Format a timestamp to locale date string */
export const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
  catch { return iso; }
};

/** Role accent colors */
export const roleColor = (role) => ({
  Admin:    '#1a5ef5',
  Engineer: '#10d978',
  Operator: '#f5a623',
  Inspector:'#a855f7',
}[role] || '#4199ff');

/** Role initials */
export const roleInitials = (username) => username.slice(0, 2).toUpperCase();
