/**
 * Tooltip.jsx
 * Accessible tooltip for elderly users.
 * Hover over any term to see a plain-English explanation.
 * Uses CSS-only reveal (no JS state) for performance.
 */
import React from 'react';

const styles = {
  wrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'help',
  },
  icon: {
    width: 16, height: 16,
    borderRadius: '50%',
    background: 'var(--surface3)',
    border: '1px solid var(--border)',
    fontSize: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted)',
    flexShrink: 0,
  },
};

// Inject hover CSS once
const css = `
.tip-wrap { position: relative; display: inline-flex; align-items: center; gap: 4px; cursor: help; }
.tip-box { display:none; position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%);
  background:var(--surface3); border:1px solid var(--border-bright); border-radius:8px;
  padding:8px 12px; font-size:13px; color:var(--text); width:210px; z-index:200;
  line-height:1.5; font-weight:400; text-align:center; pointer-events:none;
  white-space:normal; font-family:var(--font-body); }
.tip-wrap:hover .tip-box { display:block; }
`;

let injected = false;
function injectCSS() {
  if (injected) return;
  injected = true;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

export default function Tooltip({ label, tip }) {
  injectCSS();
  return (
    <span className="tip-wrap">
      {label}
      <span style={styles.icon}>?</span>
      <span className="tip-box">{tip}</span>
    </span>
  );
}
