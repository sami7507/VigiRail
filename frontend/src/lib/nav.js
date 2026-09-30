/**
 * VigiRail — role-aware navigation.
 * Single source of truth for routes, labels, icons and access rules.
 */

export const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: 'gauge', roles: ['Admin', 'Engineer', 'Operator', 'Inspector'] },
  { path: '/model', label: 'Model', icon: 'cpu', roles: ['Admin', 'Engineer'] },
  { path: '/system', label: 'System', icon: 'server', roles: ['Admin', 'Engineer'] },
  { path: '/history', label: 'History', icon: 'history', roles: ['Admin', 'Inspector'] },
  { path: '/reports', label: 'Reports', icon: 'fileText', roles: ['Admin', 'Inspector'] },
];

export const navForRole = (role) => NAV_ITEMS.filter((item) => item.roles.includes(role));

export const pageMeta = (pathname) =>
  NAV_ITEMS.find((item) => item.path === pathname) || { label: 'VigiRail', icon: 'gauge' };

export const can = (role, capability) =>
  ({
    simulate: ['Admin', 'Engineer'],
    predict: ['Admin', 'Engineer'],
    reports: ['Admin', 'Inspector'],
    fullTelemetry: ['Admin', 'Engineer'],
  }[capability] || []).includes(role);

/** Role-facing copy for the dashboard context strip. */
export const ROLE_DESC = {
  Admin: 'Full system access — fleet overview, model insights, system health and reports.',
  Engineer: 'Technical access — telemetry, model insights, system health and failure simulation.',
  Operator: 'Operational view — live status for assigned services with plain-language guidance.',
  Inspector: 'Read-only inspection access — history logs, alerts and downloadable reports.',
};
