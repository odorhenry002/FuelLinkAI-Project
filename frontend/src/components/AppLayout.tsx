import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (() => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() ?? '?';
  })();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">FuelLink AI</div>
            <div className="brand-tagline">Commerce OS</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/copilot">AI Copilot</NavLink>
          <NavLink to="/agents">AI Agents</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">
                {user?.firstName || user?.lastName
                  ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                  : 'User'}
              </div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button type="button" className="logout-btn" onClick={handleLogout} aria-label="Sign out">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="page-header">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}