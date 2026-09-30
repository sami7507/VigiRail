/** Reusable card shell: label header + body. */
import React from 'react';
import Icon from '../Icon';

export default function Card({ title, icon, action, children, className = '', flush = false, ...rest }) {
  return (
    <section className={`card ${flush ? 'card-flush' : ''} ${className}`} {...rest}>
      {title && (
        <header className="card-header">
          <h3 className="card-title">
            {icon && <Icon name={icon} size={15} />}
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}
