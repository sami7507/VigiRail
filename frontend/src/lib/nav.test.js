import { describe, expect, it } from 'vitest';
import { can, navForRole } from './nav';

describe('navigation permissions', () => {
  it('gives operators only the overview', () => {
    expect(navForRole('Operator').map((i) => i.path)).toEqual(['/']);
  });

  it('gives engineers telemetry + model + system', () => {
    expect(navForRole('Engineer').map((i) => i.path)).toEqual(['/', '/model', '/system']);
  });

  it('gives inspectors overview + history + reports', () => {
    expect(navForRole('Inspector').map((i) => i.path)).toEqual(['/', '/history', '/reports']);
  });

  it('admins see everything', () => {
    expect(navForRole('Admin')).toHaveLength(5);
  });
});

describe('capability gates', () => {
  it('restricts simulation to admin/engineer', () => {
    expect(can('Engineer', 'simulate')).toBe(true);
    expect(can('Admin', 'simulate')).toBe(true);
    expect(can('Operator', 'simulate')).toBe(false);
    expect(can('Inspector', 'simulate')).toBe(false);
  });

  it('restricts reports to admin/inspector', () => {
    expect(can('Inspector', 'reports')).toBe(true);
    expect(can('Admin', 'reports')).toBe(true);
    expect(can('Engineer', 'reports')).toBe(false);
  });
});
