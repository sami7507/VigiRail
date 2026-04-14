/**
 * RailGuard AI — Root Component
 * Routes to correct role-based dashboard after login.
 */
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SensorProvider }        from './context/SensorContext';
import LoginPage          from './pages/LoginPage';
import AdminDashboard     from './pages/AdminDashboard';
import EngineerDashboard  from './pages/EngineerDashboard';
import OperatorDashboard  from './pages/OperatorDashboard';
import InspectorDashboard from './pages/InspectorDashboard';

function RoleDashboard() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'Admin':     return <AdminDashboard />;
    case 'Engineer':  return <EngineerDashboard />;
    case 'Operator':  return <OperatorDashboard />;
    case 'Inspector': return <InspectorDashboard />;
    default:          return <AdminDashboard />;
  }
}

function AppInner() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <SensorProvider>
      <RoleDashboard />
    </SensorProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
