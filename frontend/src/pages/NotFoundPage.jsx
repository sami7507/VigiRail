/** VigiRail — 404. */
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFoundPage() {
  return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <Icon name="train" size={40} />
      <div className="empty-title">Page not found</div>
      <p style={{ marginBottom: 18 }}>That route doesn't exist in this workspace.</p>
      <Link className="btn btn-primary" to="/">
        Back to overview
      </Link>
    </div>
  );
}
