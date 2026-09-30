/** Context strip explaining the signed-in role's scope. */
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DESC } from '../../lib/nav';
import { roleColor, roleInitials } from '../../lib/helpers';

export default function RoleStrip() {
  const { user } = useAuth();
  if (!user) return null;
  const color = roleColor(user.role);

  return (
    <div
      className="role-strip"
      style={{ background: `${color}12`, borderColor: `${color}44` }}
    >
      <span className="avatar" style={{ background: color }}>
        {roleInitials(user.username)}
      </span>
      <div>
        <div className="role-strip-title" style={{ color }}>
          {user.role} workspace
        </div>
        <div className="role-strip-desc">{ROLE_DESC[user.role]}</div>
      </div>
    </div>
  );
}
