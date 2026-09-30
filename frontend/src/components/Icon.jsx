/**
 * VigiRail — inline SVG icon set (stroke, 24px grid).
 * Single source for every glyph in the UI — no emoji, no icon fonts.
 */
import React from 'react';

const PATHS = {
  gauge: ['M12 14l4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
  cpu: [
    'M9 9h6v6H9z',
    'M4 4h16v16H4z',
    'M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2',
  ],
  server: ['M3 3h18v8H3zM3 13h18v8H3zM7 7h.01M7 17h.01'],
  history: ['M3 12a9 9 0 1 0 2.6-6.3L3 8', 'M3 3v5h5', 'M12 7v5l3.5 2'],
  fileText: [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    'M8 13h8M8 17h6M8 9h2',
  ],
  train: [
    'M6 17h12a2 2 0 0 0 2-2V7a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2z',
    'M4 11h16',
    'M8 7h8',
    'M8 20l-2 2M16 20l2 2',
    'M8 15h.01M16 15h.01',
  ],
  activity: ['M3 12h4l2.5-7 4 14 2.5-7h5'],
  thermometer: [
    'M14 14.76V5a2 2 0 0 0-4 0v9.76a4.5 4.5 0 1 0 4 0z',
  ],
  waves: ['M3 10v4M7 7v10M11 4v16M15 7v10M19 10v4'],
  target: ['M12 3a9 9 0 1 0 9 9', 'M12 8a4 4 0 1 0 4 4', 'M12 12h.01'],
  alertTriangle: [
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    'M12 9v4.5M12 17.2h.01',
  ],
  checkCircle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'm8.2 12.3 2.6 2.6 5-5.4'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16v-4.5M12 8h.01'],
  play: ['M7 4.5v15l13-7.5z'],
  stopSquare: ['M6 6h12v12H6z'],
  refresh: ['M21 12a9 9 0 1 1-2.6-6.3', 'M21 3v6h-6'],
  download: ['M12 3v12', 'm7 10.5 5 5 5-5', 'M4 21h16'],
  printer: [
    'M6 9V3h12v6',
    'M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2',
    'M6 14h12v7H6z',
  ],
  user: ['M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3.2 2'],
  chevronRight: ['m9 5.5 6.5 6.5L9 18.5'],
  chevronLeft: ['M15 5.5 8.5 12 15 18.5'],
  chevronDown: ['m5.5 9 6.5 6.5L18.5 9'],
  wifi: ['M5 12.6a10 10 0 0 1 14 0', 'M8.5 16.2a5.5 5.5 0 0 1 7 0', 'M12 20h.01', 'M2 9a15 15 0 0 1 20 0'],
  wifiOff: ['M2 2l20 20', 'M8.5 16.2a5.5 5.5 0 0 1 7 0', 'M12 20h.01', 'M5 12.6a10 10 0 0 1 5-2.6', 'M19.7 13.4A10 10 0 0 0 15 9.9'],
  shield: ['M12 3l8 3v5.5c0 4.8-3.4 7.9-8 9.5-4.6-1.6-8-4.7-8-9.5V6z'],
  eye: ['M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  wrench: [
    'M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
  ],
  calendar: ['M4 5.5h16a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z', 'M8 3v4M16 3v4M3 10.5h18'],
  database: [
    'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3z',
    'M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5',
    'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  ],
  layers: ['M12 3 2 8.5l10 5.5 10-5.5z', 'm2 15.5 10 5.5 10-5.5'],
  zap: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  x: ['M6 6l12 12M18 6 6 18'],
  flask: [
    'M10 3v6.2L4.6 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3L14 9.2V3',
    'M9 3h6',
    'M7.5 15h9',
  ],
  route: ['M6 21V9a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3', 'M6 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  gauge2: ['M12 15.5 16 10', 'M3.5 18a10 10 0 1 1 17 0'],
  building: ['M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M16 9h2a2 2 0 0 1 2 2v10', 'M8 7h4M8 11h4M8 15h4M3 21h18'],
};

const FILLED = new Set(['play', 'stopSquare', 'zap']);

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.8, ...rest }) {
  const paths = PATHS[name];
  if (!paths) return null;
  const filled = FILLED.has(name);
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
