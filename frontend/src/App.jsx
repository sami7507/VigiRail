/**
 * VigiRail — application root: providers + routing.
 *
 * Routes
 *   /login           public
 *   /  /model /system /history /reports   guarded, role-filtered
 *   *                404
 */
import React, { Component } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import ModelPage from './pages/ModelPage';
import SystemPage from './pages/SystemPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import Icon from './components/Icon';

/* ── Error boundary ────────────────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center', minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
          <div className="card" style={{ maxWidth: 440 }}>
            <div className="empty">
              <Icon name="alertTriangle" size={34} />
              <div className="empty-title">Something went wrong</div>
              <p style={{ marginBottom: 16 }}>
                The interface hit an unexpected error. Reloading usually fixes it.
              </p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Reload application
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Route guards ──────────────────────────────────────────────── */
function RequireAuth({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) {
    return (
      <div className="empty" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <div className="empty-title">Loading VigiRail…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function LoginRoute() {
  const { user, booting } = useAuth();
  if (booting) return null;
  return user ? <Navigate to="/" replace /> : <LoginPage />;
}

/* ── App routes (role-filtered) ────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route
          path="/model"
          element={<RequireRole roles={['Admin', 'Engineer']}><ModelPage /></RequireRole>}
        />
        <Route
          path="/system"
          element={<RequireRole roles={['Admin', 'Engineer']}><SystemPage /></RequireRole>}
        />
        <Route
          path="/history"
          element={<RequireRole roles={['Admin', 'Inspector']}><HistoryPage /></RequireRole>}
        />
        <Route
          path="/reports"
          element={<RequireRole roles={['Admin', 'Inspector']}><ReportsPage /></RequireRole>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
