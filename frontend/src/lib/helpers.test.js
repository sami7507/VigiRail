import { describe, expect, it } from 'vitest';
import {
  fmtTime,
  fmtUptime,
  pct,
  roleInitials,
  severityClass,
  stateColor,
  stateLabel,
  thresholdColor,
} from './helpers';

describe('state helpers', () => {
  it('maps states to colours and labels', () => {
    expect(stateColor('good')).toBe('var(--green)');
    expect(stateColor('warn')).toBe('var(--amber)');
    expect(stateColor('danger')).toBe('var(--red)');
    expect(stateColor('unknown')).toBe('var(--text-dim)');
    expect(stateLabel('danger')).toMatch(/Critical/);
  });

  it('maps thresholds to colours', () => {
    expect(thresholdColor(2, 5, 8)).toBe('var(--green)');
    expect(thresholdColor(6, 5, 8)).toBe('var(--amber)');
    expect(thresholdColor(9, 5, 8)).toBe('var(--red)');
  });

  it('maps severities to badge classes', () => {
    expect(severityClass('danger')).toBe('badge-danger');
    expect(severityClass('info')).toBe('badge-info');
    expect(severityClass('other')).toBe('badge-neutral');
  });
});

describe('formatters', () => {
  it('formats percentages defensively', () => {
    expect(pct(42.4)).toBe('42%');
    expect(pct(null)).toBe('—');
    expect(pct(undefined)).toBe('—');
    expect(pct(12.34, 1)).toBe('12.3%');
  });

  it('formats uptime', () => {
    expect(fmtUptime(9)).toBe('9s');
    expect(fmtUptime(125)).toBe('2m 5s');
    expect(fmtUptime(3725)).toBe('1h 2m');
    expect(fmtUptime(NaN)).toBe('—');
  });

  it('formats timestamps to HH:MM:SS', () => {
    expect(fmtTime('2026-09-29T10:05:03Z')).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(fmtTime('garbage')).toBe('garbage');
  });
});

describe('roleInitials', () => {
  it('takes up to two initials', () => {
    expect(roleInitials('admin')).toBe('AD');
    expect(roleInitials('Priya Singh')).toBe('PS');
    expect(roleInitials('')).toBe('??');
  });
});
